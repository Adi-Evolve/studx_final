import { createSupabaseServerClient } from '@/lib/supabase/server';
import ListingCard from '@/components/ListingCard';
import Link from 'next/link';

export default async function CategoryPage({ params }) {
    const categoryName = decodeURIComponent(params.name);
        const supabase = createSupabaseServerClient();

    let listings = [];
    let error = null;

    // Helper to add a 'type' to each item for the ListingCard component
    const augmentData = (data, type) => {
        if (!data) return [];
        return data.map(item => ({ ...item, type }));
    };

    if (categoryName === 'Rooms/Hostel') {
        const { data, error: queryError } = await supabase
            .from('rooms')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (queryError) {
            error = queryError;
        } else {
            listings = augmentData(data, 'room');
        }
    } else if (categoryName === 'Lab Equipment') {
        const { data, error: queryError } = await supabase
            .from('products')
            .select('*')
            .eq('category', 'project_equipments')
            .order('created_at', { ascending: false });
        
        if (queryError) {
            error = queryError;
        } else {
            listings = augmentData(data, 'regular');
        }
    } else if (categoryName === 'Notes') {
        const { data, error: queryError } = await supabase
            .from('notes')
            .select('*')
            .order('created_at', { ascending: false });

        if (queryError) {
            error = queryError;
        } else {
            listings = augmentData(data, 'note');
        }
    } else {
        const { data, error: queryError } = await supabase
            .from('products')
            .select('*')
            .ilike('category', `%${categoryName.slice(0, -1)}%`)
            .order('created_at', { ascending: false });
        
        if (queryError) {
            error = queryError;
        } else {
            listings = augmentData(data, 'regular');
        }
    }

    if (error) {
        console.error('Error fetching category listings:', error.message);
        return (
            <div className="container mx-auto px-4 py-12 text-center">
                <h1 className="text-3xl font-bold text-primary mb-8">Category: {categoryName}</h1>
                <p className="text-red-500">Could not fetch listings: {error.message}</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-12">
            <h1 className="text-3xl font-bold text-primary mb-8">Category: {categoryName}</h1>
            {listings && listings.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                    {listings.map(item => (
                        <ListingCard key={`${item.type}-${item.id}`} item={item} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-10">
                    <p className="text-gray-500 text-lg">No items found in the "{categoryName}" category yet.</p>
                    <p className="mt-4">Why not be the first to sell something in this category?</p>
                    <Link href="/sell" className="mt-6 inline-block bg-accent text-white font-bold py-3 px-8 rounded-lg hover:bg-primary transition duration-300">
                        Sell an Item
                    </Link>
                </div>
            )}
        </div>
    );
}

