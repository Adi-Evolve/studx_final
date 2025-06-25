import { notFound } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import ProductPageClient from '@/components/ProductPageClient';

// This function fetches room data and formats it consistently as a 'product' object.
async function getRoomData(id) {
    const supabase = createSupabaseServerClient();

    const { data: roomData, error: roomError } = await supabase
        .from('rooms')
        .select('*')
        .eq('id', id)
        .single();

    if (roomError || !roomData) {
        console.error('Error fetching room data:', roomError?.message || 'Room not found');
        notFound();
    }

    // For rooms, the seller's info is stored directly in the table.
    // We create a detailed seller object for consistency with other product types.
    const seller = {
        name: roomData.ownerName || 'Anonymous Owner',
        // Pass contact numbers for the UI to use.
        phone: roomData.contact1, // Primary contact for the main 'Contact Seller' button
        contact1: roomData.contact1,
        contact2: roomData.contact2
    };

    // We return the fetched data under the key 'product' to align with the client component's expectation.
    return { product: roomData, seller };
}

// The page component awaits the data and passes it to the client component.
export default async function RoomPage({ params }) {
    // Destructure the 'product' and 'seller' from the fetched data.
    const { product, seller } = await getRoomData(params.id);
    
    // Pass the 'product' object to the ProductPageClient.
    return <ProductPageClient product={product} seller={seller} type="room" />;
}