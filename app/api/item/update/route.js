import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request) {
    const supabase = createRouteHandlerClient({ cookies });

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, type, data } = await request.json();

    if (!id || !type || !data) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    let tableName;
    switch (type) {
        case 'product': tableName = 'products'; break;
        case 'note': tableName = 'notes'; break;
        case 'room': tableName = 'rooms'; break;
        default: return NextResponse.json({ error: 'Invalid item type' }, { status: 400 });
    }

    try {
        // Verify ownership
        const { data: item, error: fetchError } = await supabase
            .from(tableName)
            .select('seller_id')
            .eq('id', id)
            .single();

        if (fetchError || !item) {
            return NextResponse.json({ error: 'Item not found' }, { status: 404 });
        }

        if (item.seller_id !== session.user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Update the item
        const { error: updateError } = await supabase
            .from(tableName)
            .update(data)
            .eq('id', id);

        if (updateError) {
            throw new Error(updateError.message);
        }

        return NextResponse.json({ message: 'Item updated successfully' });

    } catch (error) {
        // console.error('Update API Error:', error);
        return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
    }
}
