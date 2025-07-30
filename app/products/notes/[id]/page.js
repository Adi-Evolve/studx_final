import { notFound } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import ProductPageClient from '@/components/ProductPageClient';
import { getSellerInfo } from '@/app/actions';

async function getNoteData(id) {
    const supabase = createSupabaseServerClient();
    console.log('[getNoteData] Fetching note with ID:', id);
    const { data: noteData, error: noteError } = await supabase
        .from('notes')
        .select(`
            id, title, description, price, category, college, 
            academic_year, course_subject, images, pdf_urls, pdf_url, 
            seller_id, created_at
        `)
        .eq('id', id)
        .single();
    // Parse pdf_url and pdf_urls if they are JSON strings
    if (noteData) {
        if (noteData.pdf_url && typeof noteData.pdf_url === 'string') {
            try {
                noteData.pdf_url = JSON.parse(noteData.pdf_url);
            } catch (e) {}
        }
        if (noteData.pdf_urls && Array.isArray(noteData.pdf_urls)) {
            noteData.pdf_urls = noteData.pdf_urls.map(item => {
                if (typeof item === 'string') {
                    try {
                        return JSON.parse(item);
                    } catch (e) { return item; }
                }
                return item;
            });
        }
    }
    console.log('[getNoteData] Supabase response:', { noteData, noteError });
    if (noteError || !noteData) {
        console.error('[getNoteData] Error fetching note:', noteError);
        notFound();
    }
    const seller = noteData.seller_id ? await getSellerInfo(noteData.seller_id) : null;
    return { note: noteData, seller };
}

export default async function NotePage({ params }) {
    const { note, seller } = await getNoteData(params.id);
    return <ProductPageClient product={note} seller={seller} type="note" />;
}