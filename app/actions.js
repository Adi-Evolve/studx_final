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

        return {
            id: sellerId,
            name: profile?.name || authUser?.user_metadata?.full_name || 'Anonymous Seller',
            avatar_url: profile?.avatar_url || authUser?.user_metadata?.avatar_url || null,
            phone: profile?.phone || authUser?.phone || null,
            email: authUser?.email || null,
        };
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
            supabase.from('products').select('*').eq('seller_id', sellerId),
            supabase.from('notes').select('*').eq('seller_id', sellerId),
            supabase.from('rooms').select('*').eq('seller_id', sellerId)
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
        query = supabase.from(tableName)
            .select('*')
            .eq('category', category);
    } else if (type === 'room') {
        if (!college) return [];
        query = supabase.from('rooms')
            .select('*')
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
        console.error('[Actions] Error updating profile:', error);
        return { error };
    }

    revalidatePath('/profile'); // Revalidate the profile page to show new data
    return { data };
}

// Action to fetch sponsored listings
export async function fetchSponsoredListings() {
    const supabase = createSupabaseAdminClient();

    try {
        // 1. Fetch all sponsored item definitions, ordered by their slot.
        const { data: sequenceItems, error: sequenceError } = await supabase
            .from('sponsorship_sequences')
            .select('item_id, item_type, slot')
            .order('slot', { ascending: true });

        if (sequenceError) {
            console.error('Error fetching sponsorship sequence:', sequenceError);
            throw sequenceError;
        }

        if (!sequenceItems || sequenceItems.length === 0) {
            return []; // No sponsored items are configured
        }

        // 2. Create a map of promises to fetch the full details for each item.
        const listingPromises = sequenceItems.map(item => {
            // The item_type is singular ('product'), but the table name is plural ('products').
            const tableName = `${item.item_type}s`;

            // Validate the constructed table name against a list of known tables.
            const validTables = ['products', 'notes', 'rooms'];
            if (!validTables.includes(tableName)) {
                console.warn(`Skipping sponsorship item due to invalid type. Type: '${item.item_type}', constructed table: '${tableName}'`);
                // Return a resolved promise with a value that can be filtered out later.
                return Promise.resolve(null);
            }

            return supabase
                .from(tableName)
                .select('*')
                .eq('id', item.item_id)
                .single();
        });

        const results = await Promise.all(listingPromises);

        // 3. Process the results, filtering out any errors or nulls.
        const sponsoredListings = results
            .map((result, index) => {
                // First, check if the promise was skipped earlier.
                if (result === null) {
                    return null;
                }

                // Now check for Supabase errors.
                if (result.error || !result.data) {
                    if (result.error) {
                         console.error(`Error fetching sponsored item details for item_id ${sequenceItems[index].item_id} from table ${sequenceItems[index].item_type}s:`, result.error.message);
                    }
                    return null;
                }
                
                // The type for the client needs to be singular, which it already is.
                const type = sequenceItems[index].item_type;

                return { ...result.data, type };
            })
            .filter(Boolean); // Removes any null entries from the final array

        return sponsoredListings;

    } catch (error) {
        console.error('A critical error occurred in fetchSponsoredListings:', error.message);
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
                .select('*')
                .order('created_at', { ascending: false }),
            supabase
                .from('notes')
                .select('*')
                .order('created_at', { ascending: false }),
            supabase
                .from('rooms')
                .select('*')
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

        // Combine all listings and add type information
        const allListings = [
            ...(productsRes.data || []).map(item => ({ ...item, type: 'regular' })),
            ...(notesRes.data || []).map(item => ({ ...item, type: 'note' })),
            ...(roomsRes.data || []).map(item => ({ ...item, type: 'room' }))
        ];

        // Sort by created_at date (most recent first)
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

// Action to search listings across all tables
export async function searchListings({ query }) {
    if (!query || query.trim().length === 0) return [];

    const supabase = createSupabaseServerClient();
    const searchTerm = `%${query.trim()}%`;

    try {
        // Search in all three tables
        const [productsRes, notesRes, roomsRes] = await Promise.all([
            supabase
                .from('products')
                .select('*')
                .or(`name.ilike.${searchTerm},description.ilike.${searchTerm},category.ilike.${searchTerm}`)
                .order('created_at', { ascending: false }),
            supabase
                .from('notes')
                .select('*')
                .or(`title.ilike.${searchTerm},description.ilike.${searchTerm},category.ilike.${searchTerm}`)
                .order('created_at', { ascending: false }),
            supabase
                .from('rooms')
                .select('*')
                .or(`title.ilike.${searchTerm},description.ilike.${searchTerm},college.ilike.${searchTerm}`)
                .order('created_at', { ascending: false })
        ]);

        // Combine all search results and add type information
        const allResults = [
            ...(productsRes.data || []).map(item => ({ ...item, type: 'regular' })),
            ...(notesRes.data || []).map(item => ({ ...item, type: 'note' })),
            ...(roomsRes.data || []).map(item => ({ ...item, type: 'room' }))
        ];

        // Sort by created_at date (most recent first)
        allResults.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        return allResults;

    } catch (error) {
        console.error('[Action: searchListings] Error searching listings:', error.message);
        return [];
    }
}