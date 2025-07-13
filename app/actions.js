'use server';

import { createClient } from '@supabase/supabase-js';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// Centralized function to create an admin client for privileged operations
function createSupabaseAdminClient() {
    // Note: This uses the service role key and should only be used in secure, server-side environments.
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SECRET_KEY,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        }
    );
}

// Action to fetch detailed seller information
export async function getSellerInfo(sellerId) {
    if (!sellerId) return null;
    
    const supabaseAdmin = createSupabaseAdminClient();

    try {
        const [profileResult, authUserResult] = await Promise.all([
            supabaseAdmin.from('users').select('*').eq('id', sellerId).single(),
            supabaseAdmin.auth.admin.getUserById(sellerId)
        ]);

        const profile = profileResult.data;
        const authUser = authUserResult.data?.user;

        if (!profile && !authUser) {
            return { id: sellerId, name: 'Anonymous Seller', avatar_url: null, phone: null, email: null };
        }

        // Prioritize Google/Gmail profile picture from authentication
        const avatarUrl = authUser?.user_metadata?.picture // Google profile picture
            || authUser?.user_metadata?.avatar_url // Generic OAuth avatar
            || authUser?.user_metadata?.photo // Alternative Google field
            || profile?.avatar_url // Database stored avatar
            || authUser?.user_metadata?.avatar  // Alternative field
            || null;

        const sellerInfo = {
            id: sellerId,
            name: profile?.name || authUser?.user_metadata?.full_name || authUser?.user_metadata?.name || 'Anonymous Seller',
            avatar_url: avatarUrl,
            phone: profile?.phone || authUser?.phone || null,
            email: authUser?.email || null,
        };

        // Debug logging
        // console.log('[Actions] Seller info fetched:', {
        //     sellerId,
        //     hasProfile: !!profile,
        //     hasAuthUser: !!authUser,
        //     googlePicture: authUser?.user_metadata?.picture,
        //     authAvatar: authUser?.user_metadata?.avatar_url,
        //     profileAvatar: profile?.avatar_url,
        //     finalAvatar: avatarUrl,
        //     sellerName: sellerInfo.name,
        //     userMetadata: authUser?.user_metadata
        // });

        return sellerInfo;
    } catch (error) {
        // console.error(`[Actions] Error fetching seller info for ID ${sellerId}:`, error.message);
        return null;
    }
}

// Action to fetch all listings by a specific seller
export async function fetchSellerListings({ sellerId, excludeId, excludeType }) {
    if (!sellerId) return [];

    const supabase = createSupabaseServerClient(); // Use the server client for RLS

    try {
        const [products, notes, rooms] = await Promise.all([
            supabase.from('products').select(`
                id, title, description, price, category, condition, college, 
                location, images, is_sold, seller_id, created_at
            `).eq('seller_id', sellerId),
            supabase.from('notes').select(`
                id, title, description, price, category, college, 
                academic_year, course_subject, images, pdf_urls, pdfUrl, 
                seller_id, created_at
            `).eq('seller_id', sellerId),
            supabase.from('rooms').select(`
                id, title, description, price, category, college, location, 
                images, room_type, occupancy, distance, deposit, fees_include_mess, 
                mess_fees, owner_name, contact1, contact2, amenities, seller_id, created_at
            `).eq('seller_id', sellerId)
        ]);

        const allListings = [
            ...(products.data || []).map(p => ({ ...p, type: 'product' })),
            ...(notes.data || []).map(n => ({ ...n, type: 'note' })),
            ...(rooms.data || []).map(r => ({ ...r, type: 'room' }))
        ];

        // Filter out the currently viewed item
        return allListings.filter(item => !(item.id === excludeId && item.type === excludeType));

    } catch (error) {
        // console.error(`[Actions] Error fetching listings for seller ID ${sellerId}:`, error.message);
        return [];
    }
}

// Action to fetch similar listings based on category (for products/notes) or college (for rooms)
export async function fetchSimilarListings({ type, category, college, excludeId, page = 1, pageSize = 10 }) {
    if (!type) return [];

    const supabase = createSupabaseServerClient();
    const offset = (page - 1) * pageSize;

    let query;

    // Determine the table and filter column based on the type
    if (type === 'product' || type === 'note') {
        if (!category) return [];
        const tableName = type === 'product' ? 'products' : 'notes';
        
        let selectColumns;
        if (tableName === 'products') {
            selectColumns = `
                id, title, description, price, category, condition, college, 
                location, images, is_sold, seller_id, created_at
            `;
        } else {
            selectColumns = `
                id, title, description, price, category, college, 
                academic_year, course_subject, images, pdf_urls, pdfUrl, 
                seller_id, created_at
            `;
        }
        
        query = supabase.from(tableName)
            .select(selectColumns)
            .eq('category', category);
    } else if (type === 'room') {
        if (!college) return [];
        query = supabase.from('rooms')
            .select(`
                id, title, description, price, category, college, location, 
                images, room_type, occupancy, distance, deposit, fees_include_mess, 
                mess_fees, owner_name, contact1, contact2, amenities, seller_id, created_at
            `)
            .eq('college', college);
    } else {
        return []; // Invalid type
    }

    try {
        // Exclude the current item and apply pagination
        const { data, error } = await query
            .neq('id', excludeId)
            .range(offset, offset + pageSize - 1);

        if (error) {
            // console.error(`[Actions] Supabase error fetching similar listings for type ${type}:`, error.message);
            throw error;
        }

        // Add the 'type' to each item so the client knows how to render it
        return data.map(item => ({ ...item, type }));

    } catch (error) {
        // console.error(`[Actions] General error fetching similar listings for type ${type}:`, error.message);
        return [];
    }
}

// Action to update user profile
export async function updateUserProfile(formData) {
    const supabase = createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: { message: 'You must be logged in to update your profile.' } };
    }

    const name = formData.get('name');
    const phone = formData.get('phone');

    const { data, error } = await supabase
        .from('users')
        .update({ name, phone, updated_at: new Date().toISOString() })
        .eq('id', user.id)
        .select()
        .single();
    
    if (error) {
        // console.error('[Actions] Error updating profile:', error);
        return { error };
    }

    revalidatePath('/profile'); // Revalidate the profile page to show new data
    return { data };
}

// Helper function to ensure data is serializable for client components
function serializeDataForClient(data) {
    if (data === null || data === undefined) return data;
    
    if (typeof data === 'string' || typeof data === 'number' || typeof data === 'boolean') {
        return data;
    }
    
    if (data instanceof Date) {
        return data.toISOString();
    }
    
    if (Array.isArray(data)) {
        return data.map(item => serializeDataForClient(item));
    }
    
    if (typeof data === 'object') {
        const serialized = {};
        for (const [key, value] of Object.entries(data)) {
            serialized[key] = serializeDataForClient(value);
        }
        return serialized;
    }
    
    // For any other type, convert to string
    return String(data);
}

// Re-implemented to fix home page crash.
export async function fetchListings({ page = 1, limit = 12 } = {}) {
    const supabase = createSupabaseServerClient();
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    try {
        // Fetch from all three tables since the 'listings' view might not exist
        const [productsRes, notesRes, roomsRes] = await Promise.all([
            supabase
                .from('products')
                .select(`
                    id, title, description, price, category, condition, college, 
                    location, images, is_sold, seller_id, created_at
                `)
                .order('created_at', { ascending: false }),
            supabase
                .from('notes')
                .select(`
                    id, title, description, price, category, college, 
                    academic_year, course_subject, images, pdf_urls, pdfUrl, 
                    seller_id, created_at
                `)
                .order('created_at', { ascending: false }),
            supabase
                .from('rooms')
                .select(`
                    id, title, description, price, category, college, location, 
                    images, room_type, occupancy, distance, deposit, fees_include_mess, 
                    mess_fees, owner_name, contact1, contact2, amenities, seller_id, created_at
                `)
                .order('created_at', { ascending: false })
        ]);

        // Check for errors
        if (productsRes.error) {
            // console.error('[Action: fetchListings] Error fetching products:', productsRes.error.message);
        }
        if (notesRes.error) {
            // console.error('[Action: fetchListings] Error fetching notes:', notesRes.error.message);
        }
        if (roomsRes.error) {
            // console.error('[Action: fetchListings] Error fetching rooms:', roomsRes.error.message);
        }

        // Combine all listings and add type information with proper serialization
        const allListings = [
            ...(productsRes.data || []).map(item => serializeDataForClient({ ...item, type: 'regular' })),
            ...(notesRes.data || []).map(item => serializeDataForClient({ ...item, type: 'note' })),
            ...(roomsRes.data || []).map(item => serializeDataForClient({ ...item, type: 'room' }))
        ];

        // Sort by created_at date (most recent first) - now using ISO strings
        allListings.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        // Apply pagination
        const paginatedListings = allListings.slice(from, to + 1);

        return { 
            listings: paginatedListings || [], 
            hasMore: paginatedListings.length === limit && allListings.length > to + 1
        };

    } catch (error) {
        // console.error('[Action: fetchListings] A critical error occurred:', error.message);
        return { listings: [], hasMore: false };
    }
}

// Action to search listings across all tables
export async function searchListings({ query }) {
    if (!query || query.trim().length === 0) return [];

    const supabase = createSupabaseServerClient();
    // console.log(`[searchListings] Starting search for: "${query}"`);
    
    try {
        // 1. Get featured items that match the search
        const featuredItems = await fetchSponsoredListings();
        const searchTerm = `%${query.trim()}%`;
        const lowerQuery = query.toLowerCase().trim();
        
        // Filter featured items that match the search query
        const matchingFeatured = featuredItems.filter(item => {
            const title = (item.title || '').toLowerCase();
            const description = (item.description || '').toLowerCase();
            const category = (item.category || '').toLowerCase();
            const courseSubject = (item.course_subject || '').toLowerCase();
            
            return title.includes(lowerQuery) || 
                   description.includes(lowerQuery) || 
                   category.includes(lowerQuery) ||
                   courseSubject.includes(lowerQuery);
        });

        // 2. Regular search in all three tables
        // Simple, direct search approach - case insensitive
        // (searchTerm already defined above)
        
        // Search in all three tables directly with ilike (case-insensitive)
        const [productsRes, notesRes, roomsRes] = await Promise.all([
            // Products table - search title, description, category
            supabase
                .from('products')
                .select(`
                    id, title, description, price, category, condition, college, 
                    location, images, is_sold, seller_id, created_at
                `)
                .or(`title.ilike.${searchTerm},description.ilike.${searchTerm},category.ilike.${searchTerm}`)
                .order('created_at', { ascending: false }),
            
            // Notes table - search title, description, category, course_subject
            supabase
                .from('notes')
                .select(`
                    id, title, description, price, category, college, 
                    academic_year, course_subject, images, pdf_urls, pdfUrl, 
                    seller_id, created_at
                `)
                .or(`title.ilike.${searchTerm},description.ilike.${searchTerm},category.ilike.${searchTerm},course_subject.ilike.${searchTerm}`)
                .order('created_at', { ascending: false }),
            
            // Rooms table - search title, description, category
            supabase
                .from('rooms')
                .select(`
                    id, title, description, price, category, college, location, 
                    images, room_type, occupancy, distance, deposit, fees_include_mess, 
                    mess_fees, owner_name, contact1, contact2, amenities, seller_id, created_at
                `)
                .or(`title.ilike.${searchTerm},description.ilike.${searchTerm},category.ilike.${searchTerm}`)
                .order('created_at', { ascending: false })
        ]);

        // Log search results for debugging
        // console.log(`[searchListings] Products found: ${productsRes.data?.length || 0}`);
        // console.log(`[searchListings] Notes found: ${notesRes.data?.length || 0}`);
        // console.log(`[searchListings] Rooms found: ${roomsRes.data?.length || 0}`);

        // Check for errors and log them
        if (productsRes.error) {
            // console.error('[searchListings] Products search error:', productsRes.error);
        }
        if (notesRes.error) {
            // console.error('[searchListings] Notes search error:', notesRes.error);
        }
        if (roomsRes.error) {
            // console.error('[searchListings] Rooms search error:', roomsRes.error);
        }

        // Combine all search results and add type information
        const allResults = [
            ...(productsRes.data || []).map(item => ({ ...item, type: 'regular' })),
            ...(notesRes.data || []).map(item => ({ ...item, type: 'note' })),
            ...(roomsRes.data || []).map(item => ({ ...item, type: 'room' }))
        ];

        // Remove featured items from regular results to avoid duplicates
        const featuredIds = new Set(matchingFeatured.map(item => `${item.type}-${item.id}`));
        const regularResults = allResults.filter(item => 
            !featuredIds.has(`${item.type}-${item.id}`)
        );

        // Simple relevance scoring for regular results
        const scoredResults = regularResults.map(item => {
            let score = 0;
            const lowerQuery = query.toLowerCase().trim();
            
            // Get searchable text based on item type
            const title = (item.title || item.hostel_name || '').toLowerCase();
            const description = (item.description || '').toLowerCase();
            const category = (item.category || '').toLowerCase();
            
            // Title matches get highest score
            if (title.includes(lowerQuery)) score += 50;
            
            // Category matches get high score
            if (category.includes(lowerQuery)) score += 30;
            
            // Description matches get medium score
            if (description.includes(lowerQuery)) score += 20;
            
            // Word-by-word matching
            const queryWords = lowerQuery.split(' ').filter(word => word.length > 1);
            queryWords.forEach(word => {
                if (title.includes(word)) score += 10;
                if (category.includes(word)) score += 8;
                if (description.includes(word)) score += 5;
            });
            
            // Recency bonus
            const daysSinceCreated = (new Date() - new Date(item.created_at)) / (1000 * 60 * 60 * 24);
            if (daysSinceCreated < 7) score += 5;
            
            return { ...item, relevanceScore: score };
        });

        // Sort by relevance score first, then by created_at date
        scoredResults.sort((a, b) => {
            if (b.relevanceScore !== a.relevanceScore) {
                return b.relevanceScore - a.relevanceScore;
            }
            return new Date(b.created_at) - new Date(a.created_at);
        });

        // Add featured flag to matching featured items and give them top priority
        const featuredWithFlag = matchingFeatured.map(item => ({
            ...item,
            isFeatured: true,
            relevanceScore: 1000 // Featured items always get top relevance
        }));

        // Combine: Featured items first, then regular results
        const finalResults = [
            ...featuredWithFlag,
            ...scoredResults
        ];

        // console.log(`[searchListings] Total results: ${finalResults.length} (${featuredWithFlag.length} featured, ${scoredResults.length} regular)`);
        return finalResults;

    } catch (error) {
        // console.error('[searchListings] Critical error:', error);
        return [];
    }
}

// Chat System Actions
export async function createOrGetConversation({ listingId, sellerId, listingType = 'product' }) {
    const supabase = createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error('User not authenticated');
    
    try {
        // Check if conversation already exists
        const { data: existingConversation, error: fetchError } = await supabase
            .from('conversations')
            .select('*')
            .eq('listing_id', listingId)
            .eq('buyer_id', user.id)
            .eq('seller_id', sellerId)
            .single();

        if (existingConversation) {
            return existingConversation;
        }

        // Create new conversation
        const { data: newConversation, error: createError } = await supabase
            .from('conversations')
            .insert({
                listing_id: listingId,
                buyer_id: user.id,
                seller_id: sellerId,
                listing_type: listingType
            })
            .select()
            .single();

        if (createError) throw createError;
        return newConversation;
    } catch (error) {
        // console.error('Error creating/getting conversation:', error);
        throw error;
    }
}

export async function sendMessage({ conversationId, content, messageType = 'text' }) {
    const supabase = createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error('User not authenticated');
    
    try {
        const { data: message, error } = await supabase
            .from('messages')
            .insert({
                conversation_id: conversationId,
                sender_id: user.id,
                content,
                message_type: messageType
            })
            .select()
            .single();

        if (error) throw error;
        return message;
    } catch (error) {
        // console.error('Error sending message:', error);
        throw error;
    }
}

export async function getConversations() {
    const supabase = createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return [];
    
    try {
        const { data: conversations, error } = await supabase
            .from('conversations')
            .select(`
                *,
                messages(
                    content,
                    created_at,
                    sender_id,
                    is_read
                )
            `)
            .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
            .order('last_message_at', { ascending: false });

        if (error) throw error;

        // Get the latest message for each conversation
        const conversationsWithLatestMessage = conversations.map(conv => {
            const latestMessage = conv.messages
                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];
            
            return {
                ...conv,
                latest_message: latestMessage,
                unread_count: conv.messages.filter(msg => 
                    msg.sender_id !== user.id && !msg.is_read
                ).length
            };
        });

        return conversationsWithLatestMessage;
    } catch (error) {
        // console.error('Error fetching conversations:', error);
        return [];
    }
}

export async function getMessages(conversationId) {
    const supabase = createSupabaseServerClient();
    
    try {
        const { data: messages, error } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: true });

        if (error) throw error;
        return messages;
    } catch (error) {
        // console.error('Error fetching messages:', error);
        return [];
    }
}

export async function markMessagesAsRead(conversationId) {
    const supabase = createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return;
    
    try {
        const { error } = await supabase
            .from('messages')
            .update({ is_read: true })
            .eq('conversation_id', conversationId)
            .neq('sender_id', user.id);

        if (error) throw error;
    } catch (error) {
        // console.error('Error marking messages as read:', error);
    }
}

export async function getUnreadMessagesCount() {
    const supabase = createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return 0;
    
    try {
        const { data, error } = await supabase
            .rpc('get_unread_messages_count', { user_uuid: user.id });

        if (error) throw error;
        return data || 0;
    } catch (error) {
        // console.error('Error getting unread count:', error);
        return 0;
    }
}

// Action to fetch newest products from all tables (for homepage)
export async function fetchNewestProducts(limit = 4) {
    const supabase = createSupabaseServerClient();

    try {
        const [productsRes, notesRes, roomsRes] = await Promise.all([
            supabase
                .from('products')
                .select(`
                    id, title, description, price, category, condition, college, 
                    location, images, is_sold, seller_id, created_at
                `)
                .order('created_at', { ascending: false })
                .limit(limit),
            supabase
                .from('notes')
                .select(`
                    id, title, description, price, category, college, 
                    academic_year, course_subject, images, pdf_urls, pdfUrl, 
                    seller_id, created_at
                `)
                .order('created_at', { ascending: false })
                .limit(limit),
            supabase
                .from('rooms')
                .select(`
                    id, title, description, price, category, college, location, 
                    images, room_type, occupancy, distance, deposit, fees_include_mess, 
                    mess_fees, owner_name, contact1, contact2, amenities, seller_id, created_at
                `)
                .order('created_at', { ascending: false })
                .limit(limit)
        ]);

        // Combine all and get the newest across all tables
        const allNewest = [
            ...(productsRes.data || []).map(item => serializeDataForClient({ ...item, type: 'regular' })),
            ...(notesRes.data || []).map(item => serializeDataForClient({ ...item, type: 'note' })),
            ...(roomsRes.data || []).map(item => serializeDataForClient({ ...item, type: 'room' }))
        ];

        // Sort by created_at (now ISO strings) and return the newest items
        allNewest.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        
        return allNewest.slice(0, limit * 3); // Return more for slider

    } catch (error) {
        // console.error('[Action: fetchNewestProducts] Error:', error.message);
        return [];
    }
}

// Action to fetch quick stats for homepage
export async function fetchQuickStats() {
    const supabase = createSupabaseServerClient();

    try {
        const [productsCount, notesCount, roomsCount] = await Promise.all([
            supabase
                .from('products')
                .select('id', { count: 'exact', head: true }),
            supabase
                .from('notes')
                .select('id', { count: 'exact', head: true }),
            supabase
                .from('rooms')
                .select('id', { count: 'exact', head: true })
        ]);

        const totalProducts = productsCount.count || 0;
        const totalNotes = notesCount.count || 0;
        const totalRooms = roomsCount.count || 0;

        return {
            totalListings: totalProducts + totalNotes + totalRooms,
            totalProducts,
            totalNotes,
            totalRooms
        };

    } catch (error) {
        // console.error('[Action: fetchQuickStats] Error:', error.message);
        return {
            totalListings: 0,
            totalProducts: 0,
            totalNotes: 0,
            totalRooms: 0
        };
    }
}

// Action to fetch recent items by category
export async function fetchRecentByCategory(limit = 4) {
    const supabase = createSupabaseServerClient();

    try {
        const [productsRes, notesRes, roomsRes] = await Promise.all([
            supabase
                .from('products')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(limit),
            supabase
                .from('notes')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(limit),
            supabase
                .from('rooms')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(limit)
        ]);

        return {
            products: (productsRes.data || []).map(item => ({ ...item, type: 'regular' })),
            notes: (notesRes.data || []).map(item => ({ ...item, type: 'note' })),
            rooms: (roomsRes.data || []).map(item => ({ ...item, type: 'room' }))
        };

    } catch (error) {
        // console.error('[Action: fetchRecentByCategory] Error:', error.message);
        return {
            products: [],
            notes: [],
            rooms: []
        };
    }
}

// Action to fetch trending listings (based on recent activity)
export async function fetchTrendingListings(limit = 6) {
    const supabase = createSupabaseServerClient();

    try {
        // Get recent listings from the last 7 days
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const [productsRes, notesRes, roomsRes] = await Promise.all([
            supabase
                .from('products')
                .select('*')
                .gte('created_at', oneWeekAgo.toISOString())
                .order('created_at', { ascending: false }),
            supabase
                .from('notes')
                .select('*')
                .gte('created_at', oneWeekAgo.toISOString())
                .order('created_at', { ascending: false }),
            supabase
                .from('rooms')
                .select('*')
                .gte('created_at', oneWeekAgo.toISOString())
                .order('created_at', { ascending: false })
        ]);

        const allTrending = [
            ...(productsRes.data || []).map(item => ({ ...item, type: 'regular' })),
            ...(notesRes.data || []).map(item => ({ ...item, type: 'note' })),
            ...(roomsRes.data || []).map(item => ({ ...item, type: 'room' }))
        ];

        // Sort by created_at and return the most recent
        allTrending.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        
        return allTrending.slice(0, limit);

    } catch (error) {
        // console.error('[Action: fetchTrendingListings] Error:', error.message);
        return [];
    }
}

// Action to fetch category statistics for homepage
export async function fetchCategoryStats() {
    const supabase = createSupabaseServerClient();

    try {
        const [productsCount, notesCount, roomsCount] = await Promise.all([
            supabase
                .from('products')
                .select('id', { count: 'exact', head: true }),
            supabase
                .from('notes')
                .select('id', { count: 'exact', head: true }),
            supabase
                .from('rooms')
                .select('id', { count: 'exact', head: true })
        ]);

        return {
            products: productsCount.count || 0,
            notes: notesCount.count || 0,
            rooms: roomsCount.count || 0,
            total: (productsCount.count || 0) + (notesCount.count || 0) + (roomsCount.count || 0)
        };

    } catch (error) {
        // console.error('[Action: fetchCategoryStats] Error:', error.message);
        return { products: 0, notes: 0, rooms: 0, total: 0 };
    }
}