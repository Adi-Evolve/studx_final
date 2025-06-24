import { notFound } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import ProductPageClient from '@/components/ProductPageClient';
import { getSellerInfo } from '@/app/actions';

// This is a Server Component, responsible for fetching data securely.
async function getProductData(id) {
    // We still need a client here to fetch the product itself.
    // Use the new server client to respect RLS and handle sessions correctly.
    const supabase = createSupabaseServerClient();

    const { data: productData, error: productError } = await supabase
        .from('products')
        .select('*') // Fetch all columns, including the 'category' text column.
        .eq('id', id)
        .single();

    if (productError || !productData) {
        console.error('Error fetching product:', productError);
        notFound();
    }

    // No reshaping needed. The 'category' column is now directly available.
    const seller = productData.seller_id ? await getSellerInfo(productData.seller_id) : null;

    return { product: productData, seller };
}

// The page itself is a Server Component.
export default async function RegularProductPage({ params }) {
    const { product, seller } = await getProductData(params.id);
    return <ProductPageClient product={product} seller={seller} type="product" />;
}