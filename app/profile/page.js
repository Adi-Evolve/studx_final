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

    // Sync user data to ensure all fields are populated
    try {
        const syncResult = await syncUserData();
        // console.log('Profile page - User sync result:', syncResult.success ? 'success' : 'failed');
    } catch (syncError) {
        // console.warn('Profile page - User sync error:', syncError);
    }

    // Fetch the user's profile from the 'profiles' table
    const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('name, phone, avatar_url')
        .eq('id', user.id)
        .single();

    if (profileError && profileError.code !== 'PGRST116') { // Ignore 'no rows' error
        // console.error('Error fetching profile:', profileError);
    }

    // Combine auth user data with profile data for a complete user object
    const fullUser = {
        id: user.id,
        email: user.email,
        name: profile?.name || user.user_metadata?.name || 'New User',
        phone: profile?.phone || null,
        avatar_url: profile?.avatar_url || user.user_metadata?.avatar_url || `https://i.pravatar.cc/150?u=${user.id}`,
    };

    // Fetch all listings in parallel with specific column selection
    const [productsRes, notesRes, roomsRes] = await Promise.all([
        supabase.from('products').select(`
            id, title, description, price, category, condition, college, 
            location, images, is_sold, seller_id, created_at
        `).eq('seller_id', user.id),
        supabase.from('notes').select(`
            id, title, description, price, category, college, 
            academic_year, course_subject, images, pdf_urls, pdfUrl, 
            seller_id, created_at
        `).eq('seller_id', user.id),
        supabase.from('rooms').select(`
            id, title, description, price, category, college, location, 
            images, room_type, occupancy, distance, deposit, fees_include_mess, 
            mess_fees, owner_name, contact1, contact2, amenities, seller_id, created_at
        `).eq('seller_id', user.id)
    ]);

    // Consolidate error checking
    const fetchError = productsRes.error || notesRes.error || roomsRes.error;
    if (fetchError) {
        // console.error('Error fetching listings:', fetchError);
        return <div className="text-center text-red-500 py-10">Failed to load your listings. Please try again later.</div>;
    }

    // Augment data with a 'type' field for reliable client-side routing and logic
    const products = augmentData(productsRes.data, 'product');
    const notes = augmentData(notesRes.data, 'note');
    const rooms = augmentData(roomsRes.data, 'room');

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

