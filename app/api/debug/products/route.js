import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const supabase = createRouteHandlerClient({ cookies });
        
        // Get recent products to see if uploads are working
        const { data: products, error } = await supabase
            .from('products')
            .select(`
                id,
                title,
                images,
                category,
                price,
                is_sold,
                created_at
            `)
            .order('created_at', { ascending: false })
            .limit(5);
        
        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
        
        return NextResponse.json({
            message: 'Recent products from database',
            products: products,
            count: products?.length || 0
        });
        
    } catch (error) {
        return NextResponse.json({ 
            error: error.message 
        }, { status: 500 });
    }
}
