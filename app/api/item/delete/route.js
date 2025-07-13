import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request) {
    const supabase = createRouteHandlerClient({ cookies });

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, type } = await request.json();

    if (!id || !type) {
        return NextResponse.json({ error: 'Missing item ID or type' }, { status: 400 });
    }

    let tableName;
    switch (type) {
        case 'product':
            tableName = 'products';
            break;
        case 'note':
            tableName = 'notes';
            break;
        case 'room':
            tableName = 'rooms';
            break;
        default:
            return NextResponse.json({ error: 'Invalid item type' }, { status: 400 });
    }

    try {
        // First, verify the user owns the item
        const { data: item, error: fetchError } = await supabase
            .from(tableName)
            .select('seller_id, pdf_url') // Also select pdf_url for notes
            .eq('id', id)
            .single();

        if (fetchError || !item) {
            return NextResponse.json({ error: 'Item not found' }, { status: 404 });
        }

        if (item.seller_id !== session.user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // If it's a note with a PDF, delete the PDF from storage
        if (type === 'note' && item.pdf_url) {
            const fileName = item.pdf_url.split('/').pop();
            await supabase.storage.from('notes_pdfs').remove([fileName]);
        }

        // Delete the item from the database
        const { error: deleteError } = await supabase
            .from(tableName)
            .delete()
            .eq('id', id);

        if (deleteError) {
            throw new Error(deleteError.message);
        }

        return NextResponse.json({ message: 'Item deleted successfully' });

    } catch (error) {
        // console.error('Delete API Error:', error);
        return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
    }
}
