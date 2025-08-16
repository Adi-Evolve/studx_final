'use server';

import { createClient } from '@supabase/supabase-js';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { calculateDistance, isValidLocation } from '@/lib/locationUtils';

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

        return sellerInfo;
    } catch (error) {
        console.error(`[Actions] Error fetching seller info for ID ${sellerId}:`, error.message);
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
                academic_year, course_subject, images, pdf_urls, pdf_url,
                seller_id, created_at
            `).eq('seller_id', sellerId),
            supabase.from('rooms').select(`
                id, title, description, price, category, college, location,
                images, room_type, occupancy, distance, deposit, fees_include_mess,
                mess_fees, owner_name, contact1, contact2, amenities, duration, seller_id, created_at
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
        console.error(`[Actions] Error fetching listings for seller ID ${sellerId}:`, error.message);
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
                academic_year, course_subject, images, pdf_urls, pdf_url,
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
                mess_fees, owner_name, contact1, contact2, amenities, duration, seller_id, created_at
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
            console.error(`[Actions] Supabase error fetching similar listings for type ${type}:`, error.message);
            throw error;
        }

        // Add the 'type' to each item so the client knows how to render it
        return data.map(item => ({ ...item, type }));

    } catch (error) {
        console.error(`[Actions] General error fetching similar listings for type ${type}:`, error.message);
        return [];
    }
}

// //
// // // Action to update user profile
// // export async function updateUserProfile(formData) {
    // // const supabase = createSupabaseServerClient();
    // // const { data: { user } } = await supabase.auth.getUser();

// //
    // // if (!user) {
        // // return { error: { message: 'You must be logged in to update your profile.' } };
    // // }

// //
    // // const name = formData.get('name');
    // // const phone = formData.get('phone');

// //
    // // const { data, error } = await supabase
        // // .from('users')
        // // .update({ name, phone, updated_at: new Date().toISOString() })
        // // .eq('id', user.id)
        // // .select()
        // // .single();
    
// //
    // // if (error) {
        // // // console.error('[Actions] Error updating profile:', error);
        // // return { error };
    // // }

// //
    // // revalidatePath('/profile'); // Revalidate the profile page to show new data
    // // return { data };
// // }

// //
// // // Helper function to ensure data is serializable for client components
// // function serializeDataForClient(data) {
    // // if (data === null || data === undefined) return data;
    
// //
    // // if (typeof data === 'string' || typeof data === 'number' || typeof data === 'boolean') {
        // // return data;
    // // }
    
// //
    // // if (data instanceof Date) {
        // // return data.toISOString();
    // // }
    
// //
    // // if (Array.isArray(data)) {
        // // return data.map(item => serializeDataForClient(item));
    // // }
    
// //
    // // if (typeof data === 'object') {
        // // const serialized = {};
        // // for (const [key, value] of Object.entries(data)) {
            // // serialized[key] = serializeDataForClient(value);
        // // }
        // // return serialized;
    // // }
    
// //
    // // // For any other type, convert to string
    // // return String(data);
// // }

// //
// // // Fetch sponsored/featured listings from sponsorship_sequences table
// // export async function fetchSponsoredListings() {
    // // const supabase = createSupabaseServerClient();
    
// //
    // // try {
        // // // Get the sequence of sponsored items
        // // const { data: sequenceItems, error: sequenceError } = await supabase
            // // .from('sponsorship_sequences')
            // // .select('item_id, item_type, slot')
            // // .order('slot', { ascending: true });

// //
        // // if (sequenceError) {
            // // // console.error('Error fetching sponsorship sequence:', sequenceError);
            // // return [];
        // // }

// //
        // // if (!sequenceItems || sequenceItems.length === 0) {
            // // return [];
        // // }

// //
        // // // Group items by type for efficient fetching
        // // const productIds = sequenceItems.filter(item => item.item_type === 'product').map(item => item.item_id);
        // // const noteIds = sequenceItems.filter(item => item.item_type === 'note').map(item => item.item_id);
        // // const roomIds = sequenceItems.filter(item => item.item_type === 'room').map(item => item.item_id);

// //
        // // // Fetch all items in parallel
        // // const [productsRes, notesRes, roomsRes] = await Promise.all([
            // // productIds.length > 0 ? supabase
                // // .from('products')
                // // .select(`
                    // // id, title, description, price, category, condition, college,
                    // // location, images, is_sold, seller_id, created_at
                // // `)
                // // .in('id', productIds) : { data: [], error: null },
            
// //
            // // noteIds.length > 0 ? supabase
                // // .from('notes')
                // // .select(`
                    // // id, title, description, price, category, college,
                    // // academic_year, course_subject, images, pdf_urls,
                    // // seller_id, created_at
                // // `)
                // // .in('id', noteIds) : { data: [], error: null },
            
// //
            // // roomIds.length > 0 ? supabase
                // // .from('rooms')
                // // .select(`
                    // // id, title, description, price, category, college, location,
                    // // images, room_type, occupancy, distance, deposit, fees_include_mess,
                    // // mess_fees, owner_name, contact1, contact2, amenities, duration, seller_id, created_at
                // // `)
                // // .in('id', roomIds) : { data: [], error: null }
        // // ]);

// //
        // // // Check for errors
        // // if (productsRes.error) console.error('Error fetching products:', productsRes.error);
        // // if (notesRes.error) console.error('Error fetching notes:', notesRes.error);
        // // if (roomsRes.error) console.error('Error fetching rooms:', roomsRes.error);

// //
        // // // Create maps for quick lookup
        // // const productsMap = new Map((productsRes.data || []).map(item => [item.id, { ...item, type: 'regular' }]));
        // // const notesMap = new Map((notesRes.data || []).map(item => [item.id, { ...item, type: 'note' }]));
        // // const roomsMap = new Map((roomsRes.data || []).map(item => [item.id, { ...item, type: 'room' }]));

// //
        // // // Build the final ordered array
        // // const sponsoredItems = [];
        // // for (const sequenceItem of sequenceItems) {
            // // let item = null;
            
// //
            // // if (sequenceItem.item_type === 'product') {
                // // item = productsMap.get(sequenceItem.item_id);
            // // } else if (sequenceItem.item_type === 'note') {
                // // item = notesMap.get(sequenceItem.item_id);
            // // } else if (sequenceItem.item_type === 'room') {
                // // item = roomsMap.get(sequenceItem.item_id);
            // // }

// //
            // // if (item) {
                // // sponsoredItems.push(serializeDataForClient(item));
            // // }
        // // }

// //
        // // return sponsoredItems;
    // // } catch (error) {
        // // // console.error('Error in fetchSponsoredListings:', error);
        // // return [];
    // // }
// // }

// //
// // // Re-implemented to fix home page crash.
// // export async function fetchListings({ page = 1, limit = 12 } = {}) {
    // // const supabase = createSupabaseServerClient();
    // // const from = (page - 1) * limit;
    // // const to = from + limit - 1;

// //
    // // try {
        // // // Fetch from all three tables since the 'listings' view might not exist
        // // const [productsRes, notesRes, roomsRes] = await Promise.all([
            // // supabase
                // // .from('products')
                // // .select(`
                    // // id, title, description, price, category, condition, college,
                    // // location, images, is_sold, seller_id, created_at
                // // `)
                // // .order('created_at', { ascending: false }),
            // // supabase
                // // .from('notes')
                // // .select(`
                    // // id, title, description, price, category, college,
                    // // academic_year, course_subject, images, pdf_urls, pdf_url,
                    // // seller_id, created_at
                // // `)
                // // .order('created_at', { ascending: false }),
                // // supabase
                    // // .from('rooms')
                    // // .select(`
                        // // id, title, description, price, category, college, location,
                        // // images, room_type, occupancy, distance, deposit, fees_include_mess,
                        // // mess_fees, owner_name, contact1, contact2, amenities, duration, seller_id, created_at
                    // // `)
                    // // .order('created_at', { ascending: false })
        // // ]);

// //
        // // // Check for errors
        // // if (productsRes.error) {
            // // // console.error('[Action: fetchListings] Error fetching products:', productsRes.error.message);
        // // }
        // // if (notesRes.error) {
            // // // console.error('[Action: fetchListings] Error fetching notes:', notesRes.error.message);
        // // }
        // // if (roomsRes.error) {
            // // // console.error('[Action: fetchListings] Error fetching rooms:', roomsRes.error.message);
        // // }

// //
        // // // Combine all listings and add type information with proper serialization
        // // const allListings = [
            // // ...(productsRes.data || []).map(item => serializeDataForClient({ ...item, type: 'regular' })),
            // // ...(notesRes.data || []).map(item => serializeDataForClient({ ...item, type: 'note' })),
            // // ...(roomsRes.data || []).map(item => serializeDataForClient({ ...item, type: 'room' }))
        // // ];

// //
        // // // Sort by created_at date (most recent first) - now using ISO strings
        // // allListings.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

// //
        // // // Apply pagination
        // // const paginatedListings = allListings.slice(from, to + 1);

// //
        // // return {
            // // listings: paginatedListings || [],
            // // hasMore: paginatedListings.length === limit && allListings.length > to + 1
        // // };

// //
    // // } catch (error) {
        // // // console.error('[Action: fetchListings] A critical error occurred:', error.message);
        // // return { listings: [], hasMore: false };
    // // }
// // }

// //
// // // Action to search listings across all tables (including sponsored items)
// // export async function searchListings({ query }) {
    // // if (!query || query.trim().length === 0) return [];

// //
    // // const supabase = createSupabaseServerClient();
    // // // console.log(`[searchListings] Starting enhanced search for: "${query}"`);
    
// //
    // // try {
        // // const searchTerm = `%${query.trim()}%`;
        // // const lowerQuery = query.toLowerCase().trim();
        // // const searchWords = lowerQuery.split(' ').filter(word => word.length > 0);
        
// //
        // // // Step 1: Search in sponsored items first (PRIORITY)
        // // const sponsoredRes = await supabase
            // // .from('sponsorship_sequences')
            // // .select('*')
            // // .or(`title.ilike.${searchTerm},description.ilike.${searchTerm},category.ilike.${searchTerm}`)
            // // .eq('is_sold', false)
            // // .order('created_at', { ascending: false });

// //
        // // // console.log(`[searchListings] Sponsored items found: ${sponsoredRes.data?.length || 0}`);
        
// //
        // // // Get sponsored item IDs to avoid duplicates in regular search
        // // const sponsoredIds = (sponsoredRes.data || []).map(item => item.id);
        
// //
        // // // Step 2: Enhanced search in all three regular tables with duplicate exclusion
        // // const [productsRes, notesRes, roomsRes] = await Promise.all([
            // // // Products table - comprehensive search (excluding sponsored items)
            // // supabase
                // // .from('products')
                // // .select(`
                    // // id, title, description, price, category, condition, college,
                    // // location, images, is_sold, seller_id, created_at
                // // `)
                // // .or(`title.ilike.${searchTerm},description.ilike.${searchTerm},category.ilike.${searchTerm}`)
                // // .eq('is_sold', false)
                // // .not('id', 'in', sponsoredIds.length > 0 ? `(${sponsoredIds.join(',')})` : '()')
                // // .order('created_at', { ascending: false }),
            
// //
            // // // Notes table - enhanced search including course subjects (excluding sponsored items)
            // // supabase
                // // .from('notes')
                // // .select(`
                    // // id, title, description, price, category, college,
                    // // academic_year, course_subject, images, pdf_urls,
                    // // seller_id, created_at
                // // `)
                // // .or(`title.ilike.${searchTerm},description.ilike.${searchTerm},category.ilike.${searchTerm},course_subject.ilike.${searchTerm},academic_year.ilike.${searchTerm}`)
                // // .not('id', 'in', sponsoredIds.length > 0 ? `(${sponsoredIds.join(',')})` : '()')
                // // .order('created_at', { ascending: false }),
            
// //
            // // // Rooms table - comprehensive search including amenities (excluding sponsored items)
            // // supabase
                // // .from('rooms')
                // // .select(`
                    // // id, title, description, price, category, college, location,
                    // // images, room_type, occupancy, distance, deposit, fees_include_mess,
                    // // mess_fees, owner_name, contact1, contact2, amenities, duration, seller_id, created_at,
                    // // hostel_name
                // // `)
                // // .or(`title.ilike.${searchTerm},description.ilike.${searchTerm},category.ilike.${searchTerm},room_type.ilike.${searchTerm},location.ilike.${searchTerm},hostel_name.ilike.${searchTerm}`)
                // // .not('id', 'in', sponsoredIds.length > 0 ? `(${sponsoredIds.join(',')})` : '()')
                // // .order('created_at', { ascending: false })
        // // ]);

// //
        // // // console.log(`[searchListings] Products found: ${productsRes.data?.length || 0}`);
        // // // console.log(`[searchListings] Notes found: ${notesRes.data?.length || 0}`);
        // // // console.log(`[searchListings] Rooms found: ${roomsRes.data?.length || 0}`);

// //
        // // // Check for errors
        // // if (sponsoredRes.error) {
            // // // console.error('[searchListings] Sponsored search error:', sponsoredRes.error);
        // // }
        // // if (productsRes.error) {
            // // // console.error('[searchListings] Products search error:', productsRes.error);
        // // }
        // // if (notesRes.error) {
            // // // console.error('[searchListings] Notes search error:', notesRes.error);
        // // }
        // // if (roomsRes.error) {
            // // // console.error('[searchListings] Rooms search error:', roomsRes.error);
        // // }

// //
        // // // Step 3: Combine sponsored and regular results with priority
        // // const sponsoredResults = (sponsoredRes.data || []).map(item => ({
            // // ...item,
            // // type: 'sponsored',
            // // is_sponsored: true
        // // }));
        
// //
        // // const regularResults = [
            // // ...(productsRes.data || []).map(item => ({ ...item, type: 'product', is_sponsored: false })),
            // // ...(notesRes.data || []).map(item => ({ ...item, type: 'note', is_sponsored: false })),
            // // ...(roomsRes.data || []).map(item => ({ ...item, type: 'room', is_sponsored: false }))
        // // ];

// //
        // // // Combine all search results with enhanced type information
        // // const allResults = [...sponsoredResults, ...regularResults];

// //
        // // // Enhanced relevance scoring algorithm
        // // const scoredResults = allResults.map(item => {
            // // let score = 0;
            
// //
            // // // PRIORITY BOOST: Sponsored items get huge priority boost
            // // if (item.is_sponsored) {
                // // score += 1000; // Sponsored items always appear first
            // // }
            
// //
            // // // Get searchable text based on item type
            // // const title = (item.title || item.hostel_name || '').toLowerCase();
            // // const description = (item.description || '').toLowerCase();
            // // const category = (item.category || '').toLowerCase();
            // // const courseSubject = (item.course_subject || '').toLowerCase();
            // // const location = (item.location || '').toLowerCase();
            // // const roomType = (item.room_type || '').toLowerCase();
            // // const academicYear = (item.academic_year || '').toLowerCase();
            
// //
            // // // Multi-field relevance scoring
            // // searchWords.forEach(word => {
                // // // Exact title match gets highest score
                // // if (title === word) score += 100;
                // // else if (title.includes(word)) score += 50;
                
// //
                // // // Category matches are highly relevant
                // // if (category === word) score += 80;
                // // else if (category.includes(word)) score += 40;
                
// //
                // // // Description matches
                // // if (description.includes(word)) score += 20;
                
// //
                // // // Course/subject matches for notes
                // // if (courseSubject.includes(word)) score += 60;
                // // if (academicYear.includes(word)) score += 30;
                
// //
                // // // Location and room type for rooms
                // // if (location.includes(word)) score += 40;
                // // if (roomType.includes(word)) score += 35;
            // // });
            
// 
            // // Boost score for exact phrase matches
            // if (title.includes(lowerQuery)) score += 75;
            // if (description.includes(lowerQuery)) score += 30;
            // if (category.includes(lowerQuery)) score += 60;
            
// 
            // // Boost recent items slightly
            // const daysSinceCreated = (Date.now() - new Date(item.created_at).getTime()) / (1000 * 60 * 60 * 24);
            // if (daysSinceCreated < 7) score += 10; // Recent items get small boost
            // if (daysSinceCreated < 1) score += 20; // Very recent items get bigger boost
            
// 
            // // Price-based relevance (items with reasonable prices get slight boost)
            // const price = item.price || item.fees || 0;
            // if (price > 0 && price < 50000) score += 5; // Reasonable price range
            
// 
            // return { ...item, relevance_score: score };
        // });

        // Sort by relevance score (highest first) - sponsored items will be at top due to +1000 boost
        const sortedResults = scoredResults
            .filter(item => item.relevance_score > 0) // Only items with matches
            .sort((a, b) => {
                // Primary sort: relevance score (sponsored items have +1000 boost)
                if (b.relevance_score !== a.relevance_score) {
                    return b.relevance_score - a.relevance_score;
                }
                // Secondary sort: creation date (newer first)
                return new Date(b.created_at) - new Date(a.created_at);
            });

        // console.log(`[searchListings] Total relevant results: ${sortedResults.length}`);
        // console.log(`[searchListings] Sponsored results: ${sponsoredResults.length}`);
        // console.log(`[searchListings] Regular results: ${regularResults.length}`);
        
        return sortedResults;

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

        if (fetchError && fetchError.code !== 'PGRST116') {
            // PGRST116 is "not found" error, which is expected if no conversation exists
            throw fetchError;
        }

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
        let productsRes, notesRes, roomsRes;
        try {
            [productsRes, notesRes, roomsRes] = await Promise.all([
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
                    academic_year, course_subject, images, pdf_urls, pdf_url, 
                    seller_id, created_at
                `)
                .order('created_at', { ascending: false })
                .limit(limit),
            supabase
                .from('rooms')
                .select(`
                    id, title, description, price, category, college, location, 
                    images, room_type, occupancy, distance, deposit, fees_include_mess, 
                    mess_fees, owner_name, contact1, contact2, amenities, duration, seller_id, created_at
                `)
                .order('created_at', { ascending: false })
                .limit(limit)
        ]);
        } catch (err) {
            // console.error('[fetchNewestProducts] DB fetch error:', err);
            return { error: 'Database fetch error', details: err.message };
        }

        // Enhanced error handling for notes
        if (notesRes.error) {
            // console.error('[fetchNewestProducts] Notes fetch error:', notesRes.error);
            return { error: 'Notes fetch error', details: notesRes.error.message };
        }
        const notes = (notesRes.data || []).map(item => serializeDataForClient({ ...item, type: 'note' }));
        // console.log('[DEBUG] fetchNewestProducts notes:', notes);

        const allNewest = [
            ...(productsRes.data || []).map(item => serializeDataForClient({ ...item, type: 'regular' })),
            ...notes,
            ...(roomsRes.data || []).map(item => serializeDataForClient({ ...item, type: 'room' }))
        ];

        allNewest.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        return allNewest.slice(0, limit * 3);

    } catch (error) {
        // console.error('[Action: fetchNewestProducts] Error:', error.message);
        return [];
    }
}

// Action to fetch newest products with location-based sorting
export async function fetchNewestProductsWithLocation(userLat, userLng, limit = 4) {
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
                .limit(limit * 2), // Get more to filter and sort by distance
            supabase
                .from('notes')
                .select(`
                    id, title, description, price, category, college, 
                    academic_year, course_subject, images, pdf_urls, pdfUrl, 
                    seller_id, created_at
                `)
                .order('created_at', { ascending: false })
                .limit(limit * 2),
            supabase
                .from('rooms')
                .select(`
                    id, title, description, price, category, college, location, 
                    images, room_type, occupancy, distance, deposit, fees_include_mess, 
                    mess_fees, owner_name, contact1, contact2, amenities, duration, seller_id, created_at
                `)
                .order('created_at', { ascending: false })
                .limit(limit * 2)
        ]);

        // Combine all and get the newest across all tables
        const allNewest = [
            ...(productsRes.data || []).map(item => serializeDataForClient({ ...item, type: 'regular' })),
            ...(notesRes.data || []).map(item => serializeDataForClient({ ...item, type: 'note' })),
            ...(roomsRes.data || []).map(item => serializeDataForClient({ ...item, type: 'room' }))
        ];

        // Add distance calculations
        const { calculateDistance } = await import('@/lib/locationUtils');
        const itemsWithDistance = allNewest.map(item => {
            let distance = null;
            
            // Try to parse location for distance calculation
            if (item.location && userLat && userLng) {
                try {
                    const coords = parseLocationString(item.location);
                    if (coords) {
                        distance = calculateDistance(userLat, userLng, coords.lat, coords.lng);
                    }
                } catch (e) {
                    // If parsing fails, distance remains null
                }
            }
            
            return { ...item, distance };
        });

        // Sort by creation date first, then by distance (closer items get priority among recent ones)
        itemsWithDistance.sort((a, b) => {
            const dateA = new Date(a.created_at);
            const dateB = new Date(b.created_at);
            const timeDiff = dateB - dateA;
            
            // If items are created within 24 hours of each other, prioritize by distance
            if (Math.abs(timeDiff) < 24 * 60 * 60 * 1000) {
                if (a.distance !== null && b.distance !== null) {
                    return a.distance - b.distance;
                }
                if (a.distance !== null) return -1;
                if (b.distance !== null) return 1;
            }
            
            return timeDiff;
        });
        
        return itemsWithDistance.slice(0, limit * 3); // Return more for slider

    } catch (error) {
        // console.error('[Action: fetchNewestProductsWithLocation] Error:', error.message);
        // Fallback to regular newest products
        return await fetchNewestProducts(limit);
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

// ============================================================================
// LOCATION-BASED FUNCTIONS
// ============================================================================

/**
 * Fetch listings with location-based sorting
 * @param {Object} params - Parameters object
 * @param {number} params.userLat - User's latitude
 * @param {number} params.userLng - User's longitude  
 * @param {number} params.maxDistance - Maximum distance in km (optional)
 * @param {number} params.page - Page number
 * @param {number} params.limit - Items per page
 * @returns {Object} Listings with distance information
 */
export async function fetchListingsWithLocation({ 
    userLat, 
    userLng, 
    maxDistance = null, 
    page = 1, 
    limit = 12 
} = {}) {
    // If no user location provided, fall back to regular fetch
    if (!userLat || !userLng) {
        return await fetchListings({ page, limit });
    }

    const { listings } = await fetchListings({ page: 1, limit: 1000 }); // Get more items for distance calculation
    
    // Calculate distances and filter
    const listingsWithDistance = listings
        .map(item => {
            if (!isValidLocation(item.location)) {
                return { ...item, distance: null };
            }
            
            const distance = calculateDistance(
                userLat,
                userLng,
                item.location.lat,
                item.location.lng
            );
            
            return { ...item, distance };
        })
        .filter(item => {
            // Keep items without location or within distance
            if (item.distance === null) return true;
            if (maxDistance === null) return true;
            return item.distance <= maxDistance;
        })
        .sort((a, b) => {
            // Sort by distance (items without location go to end)
            if (a.distance === null && b.distance === null) return 0;
            if (a.distance === null) return 1;
            if (b.distance === null) return -1;
            return a.distance - b.distance;
        });

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    const paginatedListings = listingsWithDistance.slice(from, to + 1);

    return { 
        listings: paginatedListings, 
        hasMore: paginatedListings.length === limit && listingsWithDistance.length > to + 1
    };
}

/**
 * Fetch sponsored listings with location-based sorting
 * @param {Object} params - Parameters object
 * @param {number} params.userLat - User's latitude
 * @param {number} params.userLng - User's longitude
 * @returns {Array} Featured items with distance information
 */
export async function fetchSponsoredListingsWithLocation({ userLat, userLng } = {}) {
    // If no user location provided, fall back to regular fetch
    if (!userLat || !userLng) {
        return await fetchSponsoredListings();
    }

    const featuredItems = await fetchSponsoredListings();
    
    // Add distance information to featured items
    const featuredWithDistance = featuredItems.map(item => {
        if (!isValidLocation(item.location)) {
            return { ...item, distance: null };
        }
        
        const distance = calculateDistance(
            userLat,
            userLng,
            item.location.lat,
            item.location.lng
        );
        
        return { ...item, distance };
    });

    // Sort by distance but keep featured items prioritized
    featuredWithDistance.sort((a, b) => {
        // Both have distances - sort by distance
        if (a.distance !== null && b.distance !== null) {
            return a.distance - b.distance;
        }
        // Items without location go to end
        if (a.distance === null && b.distance === null) return 0;
        if (a.distance === null) return 1;
        if (b.distance === null) return -1;
        return 0;
    });

    return featuredWithDistance;
}

/**
 * Search listings with location-based sorting
 * @param {Object} params - Parameters object
 * @param {string} params.query - Search query
 * @param {number} params.userLat - User's latitude
 * @param {number} params.userLng - User's longitude
 * @param {number} params.maxDistance - Maximum distance in km (optional)
 * @returns {Array} Search results with distance information
 */
export async function searchListingsWithLocation({ 
    query, 
    userLat, 
    userLng, 
    maxDistance = null 
} = {}) {
    // If no user location provided, fall back to regular search
    if (!userLat || !userLng) {
        return await searchListings({ query });
    }

    const searchResults = await searchListings({ query });
    
    // Add distance information and filter by distance
    const resultsWithDistance = searchResults
        .map(item => {
            if (!isValidLocation(item.location)) {
                return { ...item, distance: null };
            }
            
            const distance = calculateDistance(
                userLat,
                userLng,
                item.location.lat,
                item.location.lng
            );
            
            return { ...item, distance };
        })
        .filter(item => {
            // Keep items without location or within distance
            if (item.distance === null) return true;
            if (maxDistance === null) return true;
            return item.distance <= maxDistance;
        })
        .sort((a, b) => {
            // First sort by relevance score (if exists), then by distance
            if (a.score !== b.score) {
                return (b.score || 0) - (a.score || 0);
            }
            
            // Then sort by distance
            if (a.distance === null && b.distance === null) return 0;
            if (a.distance === null) return 1;
            if (b.distance === null) return -1;
            return a.distance - b.distance;
        });

    return resultsWithDistance;
}

// Helper function to parse location strings
function parseLocationString(locationString) {
    if (!locationString || typeof locationString !== 'string') return null;
    
    try {
        // Try to parse as JSON first
        const parsed = JSON.parse(locationString);
        if (parsed && typeof parsed.lat === 'number' && typeof parsed.lng === 'number') {
            return { lat: parsed.lat, lng: parsed.lng };
        }
    } catch (e) {
        // Not JSON, try other formats
    }
    
    // Try comma-separated format: "lat,lng"
    const parts = locationString.split(',');
    if (parts.length === 2) {
        const lat = parseFloat(parts[0].trim());
        const lng = parseFloat(parts[1].trim());
        if (!isNaN(lat) && !isNaN(lng)) {
            return { lat, lng };
        }
    }
    
    return null;
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

// Fetch sponsored/featured listings from sponsorship_sequences table
export async function fetchSponsoredListings() {
    const supabase = createSupabaseServerClient();
    
    try {
        // Get the sequence of sponsored items
        const { data: sequenceItems, error: sequenceError } = await supabase
            .from('sponsorship_sequences')
            .select('item_id, item_type, slot')
            .order('slot', { ascending: true });

        if (sequenceError) {
            console.error('Error fetching sponsorship sequence:', sequenceError);
            return [];
        }

        if (!sequenceItems || sequenceItems.length === 0) {
            return [];
        }

        // Group items by type for efficient fetching
        const productIds = sequenceItems.filter(item => item.item_type === 'product').map(item => item.item_id);
        const noteIds = sequenceItems.filter(item => item.item_type === 'note').map(item => item.item_id);
        const roomIds = sequenceItems.filter(item => item.item_type === 'room').map(item => item.item_id);

        // Fetch all items in parallel
        const [productsRes, notesRes, roomsRes] = await Promise.all([
            productIds.length > 0 ? supabase
                .from('products')
                .select(`
                    id, title, description, price, category, condition, college,
                    location, images, is_sold, seller_id, created_at
                `)
                .in('id', productIds) : { data: [], error: null },
            
            noteIds.length > 0 ? supabase
                .from('notes')
                .select(`
                    id, title, description, price, category, college,
                    academic_year, course_subject, images, pdf_urls,
                    seller_id, created_at
                `)
                .in('id', noteIds) : { data: [], error: null },
            
            roomIds.length > 0 ? supabase
                .from('rooms')
                .select(`
                    id, title, description, price, category, college, location,
                    images, room_type, occupancy, distance, deposit, fees_include_mess,
                    mess_fees, owner_name, contact1, contact2, amenities, duration, seller_id, created_at
                `)
                .in('id', roomIds) : { data: [], error: null }
        ]);

        // Check for errors
        if (productsRes.error) console.error('Error fetching products:', productsRes.error);
        if (notesRes.error) console.error('Error fetching notes:', notesRes.error);
        if (roomsRes.error) console.error('Error fetching rooms:', roomsRes.error);

        // Create maps for quick lookup
        const productsMap = new Map((productsRes.data || []).map(item => [item.id, { ...item, type: 'regular' }]));
        const notesMap = new Map((notesRes.data || []).map(item => [item.id, { ...item, type: 'note' }]));
        const roomsMap = new Map((roomsRes.data || []).map(item => [item.id, { ...item, type: 'room' }]));

        // Build the final ordered array
        const sponsoredItems = [];
        for (const sequenceItem of sequenceItems) {
            let item = null;
            
            if (sequenceItem.item_type === 'product') {
                item = productsMap.get(sequenceItem.item_id);
            } else if (sequenceItem.item_type === 'note') {
                item = notesMap.get(sequenceItem.item_id);
            } else if (sequenceItem.item_type === 'room') {
                item = roomsMap.get(sequenceItem.item_id);
            }

            if (item) {
                sponsoredItems.push(serializeDataForClient(item));
            }
        }

        return sponsoredItems;
    } catch (error) {
        console.error('Error in fetchSponsoredListings:', error);
        return [];
    }
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
                    academic_year, course_subject, images, pdf_urls, pdf_url,
                    seller_id, created_at
                `)
                .order('created_at', { ascending: false }),
                supabase
                    .from('rooms')
                    .select(`
                        id, title, description, price, category, college, location,
                        images, room_type, occupancy, distance, deposit, fees_include_mess,
                        mess_fees, owner_name, contact1, contact2, amenities, duration, seller_id, created_at
                    `)
                    .order('created_at', { ascending: false })
        ]);

        // Check for errors
        if (productsRes.error) {
            console.error('[Action: fetchListings] Error fetching products:', productsRes.error.message);
        }
        if (notesRes.error) {
            console.error('[Action: fetchListings] Error fetching notes:', notesRes.error.message);
        }
        if (roomsRes.error) {
            console.error('[Action: fetchListings] Error fetching rooms:', roomsRes.error.message);
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
        console.error('[Action: fetchListings] A critical error occurred:', error.message);
        return { listings: [], hasMore: false };
    }
}