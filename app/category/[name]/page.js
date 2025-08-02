import { createSupabaseServerClient } from '@/lib/supabase/server';
import ListingCard from '@/components/ListingCard';
import Link from 'next/link';
import { sponsorshipManager } from '@/lib/sponsorship';

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

    // Helper to get category type for sponsorship filtering
    const getCategoryType = (categoryName) => {
        const lowerCategory = categoryName.toLowerCase();
        
        // Room categories
        if (lowerCategory.includes('room') || lowerCategory === 'rooms') {
            return 'room';
        }
        
        // Note categories  
        if (lowerCategory.includes('note') || lowerCategory === 'notes') {
            return 'note';
        }
        
        // All other categories are products
        return 'regular';
    };

    // Helper to mix sponsored items with regular results
    const mixWithSponsoredItems = async (regularListings, categoryName) => {
        try {
            const categoryType = getCategoryType(categoryName);
            
            // Get relevant sponsored items for this category ONLY
            const sponsoredItems = await sponsorshipManager.getSponsoredItems({
                type: categoryType,
                category: categoryName,
                limit: 2
            });
            
            if (!sponsoredItems || sponsoredItems.length === 0) {
                return regularListings;
            }

            // Filter to only show sponsored items that match the current category type
            const categorySpecificSponsored = sponsoredItems.filter(item => {
                // Ensure sponsored rooms only appear in room categories
                if (categoryType === 'room' && item.type === 'room') return true;
                if (categoryType === 'note' && item.type === 'note') return true;
                if (categoryType === 'regular' && item.type === 'regular') return true;
                return false;
            });

            // For category pages, show 1-2 sponsored items at the top
            const numSponsoredToShow = Math.min(2, categorySpecificSponsored.length);
            const selectedSponsored = categorySpecificSponsored.slice(0, numSponsoredToShow).map(item => ({
                ...item,
                is_sponsored: true,
                type: categoryType
            }));

            // CRITICAL: Create a Set of sponsored item IDs to prevent duplication
            const sponsoredItemIds = new Set(selectedSponsored.map(item => item.id));
            
            // Filter out sponsored items from regular listings to prevent duplication
            const filteredRegularListings = regularListings.filter(item => 
                !sponsoredItemIds.has(item.id)
            );

            // Mix sponsored items at the beginning with deduplicated regular items
            return [...selectedSponsored, ...filteredRegularListings];
        } catch (error) {
            console.error('Error mixing sponsored items:', error);
            return regularListings;
        }
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
        // Mix sponsored items with regular listings
        listings = await mixWithSponsoredItems(result.listings, categoryName);
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
                    {listings.map((item, index) => (
                        <ListingCard 
                            key={`${item.type}-${item.id}-${index}`} 
                            item={item} 
                            isSponsored={item.is_sponsored || false}
                        />
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

