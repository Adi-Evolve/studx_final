import { notFound } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import ProductPageClient from '@/components/ProductPageClient';
import { getSellerInfo } from '@/app/actions';

// Server component to fetch rental data
async function getRentalData(id) {
    const supabase = createSupabaseServerClient();

    const { data: rentalData, error: rentalError } = await supabase
        .from('rentals')
        .select(`
            id, title, description, rental_price, security_deposit, category, condition, 
            rental_duration, min_rental_period, max_rental_period, college, location,
            images, is_rented, rental_terms, seller_id, created_at, available_from,
            available_until, delivery_options
        `)
        .eq('id', id)
        .single();

    if (rentalError || !rentalData) {
        console.error('Error fetching rental:', rentalError);
        notFound();
    }

    // Get seller information
    const seller = rentalData.seller_id ? await getSellerInfo(rentalData.seller_id) : null;

    return { product: rentalData, seller };
}

// Server component page
export default async function RentalProductPage({ params }) {
    const { product, seller } = await getRentalData(params.id);
    return <ProductPageClient product={product} seller={seller} type="rental" />;
}
