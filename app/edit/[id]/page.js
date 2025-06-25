import { createSupabaseServerClient } from '../../../lib/supabase/server';
import { redirect } from 'next/navigation';
import EditForm from './EditForm';

async function getItemData(supabase, id, type) {
    let tableName;
    switch (type) {
        case 'product': tableName = 'product'; break;
        case 'note': tableName = 'notes'; break;
        case 'room': tableName = 'rooms'; break;
        default: return null;
    }

    const { data, error } = await supabase.from(tableName).select('*').eq('id', id).single();
    if (error) {
        console.error('Error fetching item:', error);
        return null;
    }
    return data;
}

export default async function EditItemPage({ params, searchParams }) {
    const supabase = createSupabaseServerClient();
    const { id } = params;
    const { type } = searchParams;

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        redirect('/login');
    }

    const itemData = await getItemData(supabase, id, type);

    if (!itemData || itemData.seller_id !== session.user.id) {
        return <div className="text-center py-10">Item not found or you do not have permission to edit it.</div>;
    }

    return (
        <div className="container mx-auto px-4 py-12">
            <h1 className="text-3xl font-bold text-primary mb-8">Edit Your Listing</h1>
            <EditForm item={itemData} type={type} />
        </div>
    );
}
