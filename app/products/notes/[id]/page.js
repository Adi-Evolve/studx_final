import { notFound } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import ProductPageClient from '@/components/ProductPageClient';
import { getSellerInfo } from '@/app/actions';

async function getNoteData(id) {
    const supabase = createSupabaseServerClient();

    const { data: noteData, error: noteError } = await supabase
        .from('notes')
        .select('*') // Fetch all columns, including the 'category' text column.
        .eq('id', id)
        .single();

    if (noteError || !noteData) {
        console.error('Error fetching note:', noteError);
        notFound();
    }

    const seller = noteData.seller_id ? await getSellerInfo(noteData.seller_id) : null;

    return { note: noteData, seller };
}

export default async function NotePage({ params }) {
    const { note, seller } = await getNoteData(params.id);
    return <ProductPageClient product={note} seller={seller} type="note" />;
}