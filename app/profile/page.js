import { createSupabaseServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { syncUserData } from '@/lib/syncUserData';
import ProfileClientPage from './ProfileClientPage';
import ErrorBoundary from '@/components/ErrorBoundary';

// Helper to augment data with a 'type' for consistent client-side handling
const augmentData = (data, type) => {
    if (!data) return [];
    return data.map(item => ({ ...item, type }));
};

export default async function ProfilePage() {
    const supabase = createSupabaseServerClient();

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
        return redirect('/login');
    }

    // console.log('🔍 Profile page - Loading for user:', user.email);

    // Sync user data to ensure all fields are populated
    try {
        const syncResult = await syncUserData();
        // console.log('📝 Profile page - User sync result:', syncResult.success ? 'success' : 'failed');
    } catch (syncError) {
        // console.warn('⚠️ Profile page - User sync error:', syncError);
    }

    // Fetch the user's profile from the 'users' table
    let { data: profile, error: profileError } = await supabase
        .from('users')
        .select('name, phone, avatar_url')
        .eq('id', user.id)
        .single();

    // console.log('📊 Profile query result:', {
        // profile: profile,
        // error: profileError?.message,
        // hasPhone: !!profile?.phone
    // });
// 
    // // If user doesn't exist in users table, try to create them
    // if (profileError && profileError.code === 'PGRST116') {
        // // console.log('📝 User not found, creating missing user record...');
        // const userData = {
            // id: user.id,
            // email: user.email,
            // name: user.user_metadata?.name ||
                  // user.user_metadata?.full_name ||
                  // user.user_metadata?.display_name ||
                  // user.email?.split('@')[0],
            // avatar_url: user.user_metadata?.picture ||
                       // user.user_metadata?.avatar_url ||
                       // user.user_metadata?.photo ||
                       // user.user_metadata?.image,
            // phone: user.phone,
            // created_at: new Date().toISOString(),
            // updated_at: new Date().toISOString()
        // };
        // 
        // try {
            // const { data: newProfile, error: createError } = await supabase
                // .from('users')
                // .insert(userData)
                // .select('name, phone, avatar_url')
                // .single();
                // 
            // if (!createError) {
                // // console.log('✅ User record created successfully');
                // profile = newProfile;
                // profileError = null;
            // } else {
                // // console.error('❌ Failed to create user record:', createError);
            // }
        // } catch (createErr) {
            // // console.error('❌ Exception creating user record:', createErr);
        // }
    // } else if (profileError) {
        // // console.error('❌ Error fetching profile:', profileError);
    // }
// 
    // // Combine auth user data with profile data for a complete user object
    // const fullUser = {
        // id: user.id,
        // email: user.email,
        // name: profile?.name || user.user_metadata?.name || 'New User',
        // phone: profile?.phone || null,
        // avatar_url: profile?.avatar_url || user.user_metadata?.avatar_url || `https://i.pravatar.cc/150?u=${user.id}`,
    // };
// 
    // // console.log('👤 Full user profile:', {
        // id: fullUser.id,
        // email: fullUser.email,
        // name: fullUser.name,
        // phone: fullUser.phone,
        // hasPhone: !!fullUser.phone
    // });

    // Fetch all listings in parallel with specific column selection
    // console.log('📋 Fetching listings for user:', user.id);
    
    const [productsRes, notesRes, roomsRes] = await Promise.all([
        supabase.from('products').select(`
            id, title, description, price, category, condition, college, 
            location, images, is_sold, seller_id, created_at
        `).eq('seller_id', user.id),
        supabase.from('notes').select(`
            id, title, description, price, category, college, 
            academic_year, course_subject, images, pdf_urls, pdf_url, 
            seller_id, created_at
        `).eq('seller_id', user.id),
        supabase.from('rooms').select(`
            id, title, description, price, category, college, location, 
            images, room_type, occupancy, distance, deposit, fees_include_mess, 
            mess_fees, owner_name, contact1, contact2, amenities, seller_id, created_at
        `).eq('seller_id', user.id)
    ]);

    // Log individual results for debugging
    // console.log('📦 Products result:', {
        // count: productsRes.data?.length || 0,
        // error: productsRes.error?.message
    // });
    // // console.log('📝 Notes result:', {
        // count: notesRes.data?.length || 0,
        // error: notesRes.error?.message
    // });
    // console.log('🏠 Rooms result:', {
        // count: roomsRes.data?.length || 0,
        // error: roomsRes.error?.message
    // });

    // Consolidate error checking
    const fetchError = productsRes.error || notesRes.error || roomsRes.error;
    if (fetchError) {
        // console.error('❌ Error fetching listings:', fetchError);
        // Instead of returning error immediately, show partial data
        // return <div className="text-center text-red-500 py-10">Failed to load your listings. Please try again later.</div>;
    }

    // Augment data with a 'type' field for reliable client-side routing and logic
    // Handle potential null/undefined data gracefully
    const products = augmentData(productsRes.data || [], 'product');
    const notes = augmentData(notesRes.data || [], 'note');
    const rooms = augmentData(roomsRes.data || [], 'room');

    // console.log('📊 Final counts - Products:', products.length, 'Notes:', notes.length, 'Rooms:', rooms.length);

    return (
        <ErrorBoundary>
            <ProfileClientPage 
                serverUser={fullUser}
                serverProducts={products} 
                serverNotes={notes} 
                serverRooms={rooms} 
            />
        </ErrorBoundary>
    );
}

