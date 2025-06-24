import { createSupabaseServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import ProfileClientPage from './ProfileClientPage';

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

    // Fetch the user's profile from the 'profiles' table
    const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('name, phone, avatar_url')
        .eq('id', user.id)
        .single();

    if (profileError && profileError.code !== 'PGRST116') { // Ignore 'no rows' error
        console.error('Error fetching profile:', profileError);
    }

    // Combine auth user data with profile data for a complete user object
    const fullUser = {
        id: user.id,
        email: user.email,
        name: profile?.name || user.user_metadata?.name || 'New User',
        phone_number: profile?.phone_number || null,
        avatar_url: profile?.avatar_url || user.user_metadata?.avatar_url || `https://i.pravatar.cc/150?u=${user.id}`,
    };

    // Fetch all listings in parallel
    const [productsRes, notesRes, roomsRes] = await Promise.all([
        supabase.from('products').select('*').eq('seller_id', user.id),
        supabase.from('notes').select('*').eq('seller_id', user.id),
        supabase.from('rooms').select('*').eq('seller_id', user.id)
    ]);

    // Consolidate error checking
    const fetchError = productsRes.error || notesRes.error || roomsRes.error;
    if (fetchError) {
        console.error('Error fetching listings:', fetchError);
        return <div className="text-center text-red-500 py-10">Failed to load your listings. Please try again later.</div>;
    }

    // Augment data with a 'type' field for reliable client-side routing and logic
    const products = augmentData(productsRes.data, 'product');
    const notes = augmentData(notesRes.data, 'note');
    const rooms = augmentData(roomsRes.data, 'room');

    return (
        <ProfileClientPage 
            serverUser={fullUser}
            serverProducts={products} 
            serverNotes={notes} 
            serverRooms={rooms} 
        />
    );
}

