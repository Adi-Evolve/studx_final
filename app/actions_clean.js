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
