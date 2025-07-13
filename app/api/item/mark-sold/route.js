import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request) {
    const supabase = createRouteHandlerClient({ cookies });

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await request.json();

    if (!id) {
        return NextResponse.json({ error: 'Missing product ID' }, { status: 400 });
    }

    try {
        // First, verify the user owns the product
        const { data: product, error: fetchError } = await supabase
            .from('products')
            .select('seller_id')
            .eq('id', id)
            .single();

        if (fetchError || !product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        if (product.seller_id !== session.user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Update the is_sold status
        const { error: updateError } = await supabase
            .from('products')
            .update({ is_sold: true })
            .eq('id', id);

        if (updateError) {
            throw new Error(updateError.message);
        }

        return NextResponse.json({ message: 'Product marked as sold successfully' });

    } catch (error) {
        // console.error('Mark Sold API Error:', error);
        return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
    }
}
