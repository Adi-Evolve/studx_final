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

    // Map homepage category names to correct query logic
    const categoryMap = {
        'Rooms': async () => {
            const { data, error: queryError } = await supabase
                .from('rooms')
                .select('*')
                .order('created_at', { ascending: false });
            return queryError ? { error: queryError } : { listings: augmentData(data, 'room') };
        },
        'Notes': async () => {
            const { data, error: queryError } = await supabase
                .from('notes')
                .select('*')
                .order('created_at', { ascending: false });
            return queryError ? { error: queryError } : { listings: augmentData(data, 'note') };
        },
        'Books': async () => {
            const { data, error: queryError } = await supabase
                .from('products')
                .select('*')
                .ilike('category', '%Book%')
                .order('created_at', { ascending: false });
            return queryError ? { error: queryError } : { listings: augmentData(data, 'regular') };
        },
        'Textbook': async () => {
            const { data, error: queryError } = await supabase
                .from('products')
                .select('*')
                .or('category.ilike.%Textbook%,category.ilike.%Book%')
                .order('created_at', { ascending: false });
            return queryError ? { error: queryError } : { listings: augmentData(data, 'regular') };
        },
        'Laptops': async () => {
            const { data, error: queryError } = await supabase
                .from('products')
                .select('*')
                .ilike('category', '%Laptop%')
                .order('created_at', { ascending: false });
            return queryError ? { error: queryError } : { listings: augmentData(data, 'regular') };
        },
        'Laptop': async () => {
            const { data, error: queryError } = await supabase
                .from('products')
                .select('*')
                .ilike('category', '%Laptop%')
                .order('created_at', { ascending: false });
            return queryError ? { error: queryError } : { listings: augmentData(data, 'regular') };
        },
        'Bike': async () => {
            const { data, error: queryError } = await supabase
                .from('products')
                .select('*')
                .ilike('category', '%Bike%')
                .order('created_at', { ascending: false });
            return queryError ? { error: queryError } : { listings: augmentData(data, 'regular') };
        },
        'Electronics': async () => {
            const { data, error: queryError } = await supabase
                .from('products')
                .select('*')
                .ilike('category', '%Electronics%')
                .order('created_at', { ascending: false });
            return queryError ? { error: queryError } : { listings: augmentData(data, 'regular') };
        },
        'Furniture': async () => {
            const { data, error: queryError } = await supabase
                .from('products')
                .select('*')
                .ilike('category', '%Furniture%')
                .order('created_at', { ascending: false });
            return queryError ? { error: queryError } : { listings: augmentData(data, 'regular') };
        },
        'Dorm Equipment': async () => {
            const { data, error: queryError } = await supabase
                .from('products')
                .select('*')
                .or('category.ilike.%Dorm%,category.ilike.%Hostel%,category.ilike.%Bed%,category.ilike.%Mattress%,category.ilike.%Pillow%,category.ilike.%Blanket%')
                .order('created_at', { ascending: false });
            return queryError ? { error: queryError } : { listings: augmentData(data, 'regular') };
        },
        'Project Equipment': async () => {
            const { data, error: queryError } = await supabase
                .from('products')
                .select('*')
                .ilike('category', '%Project%')
                .order('created_at', { ascending: false });
            return queryError ? { error: queryError } : { listings: augmentData(data, 'regular') };
        },
        'Other': async () => {
            const { data, error: queryError } = await supabase
                .from('products')
                .select('*')
                .ilike('category', '%Other%')
                .order('created_at', { ascending: false });
            return queryError ? { error: queryError } : { listings: augmentData(data, 'regular') };
        }
    };

    let result;
    if (categoryMap[categoryName]) {
        result = await categoryMap[categoryName]();
    } else {
        // Fallback: search in products table by category name
        const { data, error: queryError } = await supabase
            .from('products')
            .select('*')
            .ilike('category', `%${categoryName}%`)
            .order('created_at', { ascending: false });
        result = queryError ? { error: queryError } : { listings: augmentData(data, 'regular') };
    }

    if (result.error) {
        error = result.error;
        listings = [];
    } else {
        listings = result.listings;
    }

    if (error) {
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

