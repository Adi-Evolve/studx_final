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

            // STRICT Filter: only show sponsored items that match EXACTLY the current category type AND category name
            const categorySpecificSponsored = sponsoredItems.filter(item => {
                // First, ensure the type matches
                const typeMatches = (
                    (categoryType === 'room' && item.type === 'room') ||
                    (categoryType === 'note' && item.type === 'note') ||
                    (categoryType === 'regular' && item.type === 'regular')
                );
                
                if (!typeMatches) return false;
                
                // Second, ensure the category matches for products
                if (categoryType === 'regular') {
                    // For specific product categories like Bike, Furniture, etc.
                    const itemCategory = (item.category || '').toLowerCase();
                    const searchCategory = categoryName.toLowerCase();
                    
                    // Strict matching - category must contain the search term
                    if (searchCategory === 'bike' && !itemCategory.includes('bike')) return false;
                    if (searchCategory === 'furniture' && !itemCategory.includes('furniture')) return false;
                    if (searchCategory === 'electronics' && !itemCategory.includes('electronics')) return false;
                    if (searchCategory === 'laptop' && !itemCategory.includes('laptop')) return false;
                    
                    // For other specific categories, ensure exact match
                    if (!itemCategory.includes(searchCategory)) return false;
                }
                
                return true;
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
            // console.error('Error mixing sponsored items:', error);
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
            // Fetch both regular products and Arduino kits for Project Equipment category
            const [productsRes, arduinoRes] = await Promise.all([
                supabase
                    .from('products')
                    .select('*')
                    .ilike('category', '%Project%')
                    .order('created_at', { ascending: false }),
                supabase
                    .from('arduino')
                    .select(`
                        id, breadboard, motor, led, resistor, other_components, 
                        created_at, updated_at
                    `)
                    .order('created_at', { ascending: false })
            ]);

            if (productsRes.error && arduinoRes.error) {
                return { error: productsRes.error };
            }

            // Parse Arduino kits from JSON data
            const arduinoKits = (arduinoRes.data || [])
                .map(row => {
                    try {
                        const productInfo = JSON.parse(row.other_components || '{}');
                        if (!productInfo.title) return null;
                        
                        return {
                            id: row.id,
                            title: productInfo.title,
                            description: productInfo.description || '',
                            price: productInfo.price || 0,
                            category: productInfo.category || 'Project Equipment',
                            college: productInfo.college || '',
                            images: productInfo.images || [],
                            breadboard: row.breadboard || false,
                            motor: row.motor || false,
                            led: row.led || false,
                            resistor: row.resistor || false,
                            location: productInfo.location || '',
                            is_sold: productInfo.is_sold || false,
                            seller_id: productInfo.seller_id,
                            created_at: row.created_at,
                            updated_at: row.updated_at,
                            type: 'arduino_kit',
                            table_type: 'arduino',
                            component_count: productInfo.component_count || 0
                        };
                    } catch (error) {
                        console.error('Error parsing Arduino kit in category:', error);
                        return null;
                    }
                })
                .filter(kit => kit !== null);

            // Combine regular products and Arduino kits
            const allItems = [
                ...augmentData(productsRes.data || [], 'regular'),
                ...arduinoKits
            ];

            // Sort by creation date
            allItems.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

            return { listings: allItems };
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

