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

    try {
        await syncUserData();
    } catch {}

    let { data: profile } = await supabase
        .from('users')
        .select('name, phone, avatar_url')
        .eq('id', user.id)
        .single();

    // Always construct a serializable user object
    const fullUser = {
        id: user.id,
        email: user.email,
        name: profile?.name || user.user_metadata?.name || 'New User',
        phone: profile?.phone || null,
        avatar_url: profile?.avatar_url || user.user_metadata?.avatar_url || `https://i.pravatar.cc/150?u=${user.id}`,
    };

    // Fetch all listings in parallel
    const [productsRes, notesRes, roomsRes] = await Promise.all([
        supabase.from('products').select(`id, title, description, price, category, condition, college, location, images, is_sold, seller_id, created_at`).eq('seller_id', user.id),
        supabase.from('notes').select(`id, title, description, price, category, college, academic_year, course_subject, images, pdf_urls, pdf_url, seller_id, created_at`).eq('seller_id', user.id),
        supabase.from('rooms').select(`id, title, description, price, category, college, location, images, room_type, occupancy, distance, deposit, fees_include_mess, mess_fees, owner_name, contact1, contact2, amenities, duration, seller_id, created_at`).eq('seller_id', user.id)
    ]);

    // Only pass serializable arrays
    const products = augmentData(productsRes.data || [], 'product');
    const notes = augmentData(notesRes.data || [], 'note');
    const rooms = augmentData(roomsRes.data || [], 'room');

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

