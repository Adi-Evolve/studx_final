// Test the actual fetchListings function
import { createSupabaseServerClient } from '@/lib/supabase/server';

function serializeDataForClient(data) {
    if (data === null || data === undefined) return data;
    
    if (typeof data === 'string' || typeof data === 'number' || typeof data === 'boolean') {
        return data;
    }
    
    if (data instanceof Date) {
        return data.toISOString();
    }
    
    if (Array.isArray(data)) {
        return data.map(item => serializeDataForClient(item));
    }
    
    if (typeof data === 'object') {
        const serialized = {};
        for (const [key, value] of Object.entries(data)) {
            serialized[key] = serializeDataForClient(value);
        }
        return serialized;
    }
    
    return data;
}

async function testFetchListings() {
    const supabase = createSupabaseServerClient();
    const page = 1;
    const limit = 12;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    try {
        console.log('🧪 Testing fetchListings function...');
        
        // Fetch from all tables including rentals and Arduino kits with updated column selections
        const [productsRes, notesRes, roomsRes, rentalsRes, arduinoRes] = await Promise.all([
            supabase
                .from('products')
                .select(`
                    id, title, description, price, category, condition, college,
                    location, images, is_sold, seller_id, created_at
                `)
                .order('created_at', { ascending: false }), // Order by newest first
            supabase
                .from('notes')
                .select(`
                    id, title, description, price, category, college,
                    academic_year, course_subject, images, pdf_urls, pdf_url,
                    seller_id, created_at
                `)
                .order('created_at', { ascending: false }),
            supabase
                .from('rooms')
                .select(`
                    id, title, description, price, fees, category, college, location,
                    images, room_type, occupancy, distance, deposit, fees_include_mess,
                    mess_fees, owner_name, contact1, contact2, amenities, duration, 
                    seller_id, created_at
                `)
                .order('created_at', { ascending: false }),
            supabase
                .from('rentals')
                .select(`
                    id, title, description, rental_price, security_deposit, category, condition, college,
                    location, images, is_rented, seller_id, created_at, rental_duration,
                    available_from, available_until, delivery_options
                `)
                .order('created_at', { ascending: false }),
            supabase
                .from('arduino')
                .select(`
                    id, breadboard, motor, led, resistor, other_components, 
                    created_at, updated_at
                `)
                .order('created_at', { ascending: false })
        ]);

        console.log('📊 Raw fetch results:');
        console.log('Products:', productsRes.data?.length || 0);
        console.log('Notes:', notesRes.data?.length || 0);
        console.log('Rooms:', roomsRes.data?.length || 0);
        console.log('Rentals:', rentalsRes.data?.length || 0);
        console.log('Arduino (raw):', arduinoRes.data?.length || 0);

        // Parse Arduino kits from JSON data
        const arduinoKits = (arduinoRes.data || [])
            .map(row => {
                try {
                    const productInfo = JSON.parse(row.other_components || '{}')
                    if (!productInfo.title) return null
                    
                    return serializeDataForClient({
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
                    })
                } catch (error) {
                    console.error('Error parsing Arduino kit in fetchListings:', error)
                    return null
                }
            })
            .filter(kit => kit !== null);

        console.log('Arduino (parsed):', arduinoKits.length);
        arduinoKits.forEach(kit => {
            console.log(`  - ${kit.title} (₹${kit.price}) [${kit.type}]`);
        });

        // Combine all listings and add type information with proper serialization
        const allListings = [
            ...(productsRes.data || []).map(item => serializeDataForClient({ ...item, type: 'regular' })),
            ...(notesRes.data || []).map(item => serializeDataForClient({ ...item, type: 'note' })),
            ...(roomsRes.data || []).map(item => serializeDataForClient({ 
                ...item, 
                type: 'room',
                price: item.price || item.fees // Use fees if price is null
            })),
            ...(rentalsRes.data || []).map(item => serializeDataForClient({ 
                ...item, 
                type: 'rental',
                price: item.rental_price // Map rental_price to price for consistency
            })),
            ...arduinoKits
        ];

        console.log('\n📋 Combined listings:');
        console.log('Total items before pagination:', allListings.length);
        
        // Sort by created_at date (most recent first) since we already ordered in the queries
        allListings.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        // Apply pagination
        const paginatedListings = allListings.slice(from, to + 1);
        
        console.log('Items after pagination (page 1, limit 12):', paginatedListings.length);
        
        // Show breakdown by type
        const typeCounts = {};
        paginatedListings.forEach(item => {
            typeCounts[item.type] = (typeCounts[item.type] || 0) + 1;
        });
        
        console.log('Type breakdown in paginated results:', typeCounts);
        
        return {
            success: true,
            totalBeforePagination: allListings.length,
            totalAfterPagination: paginatedListings.length,
            typeCounts,
            hasArduinoKits: paginatedListings.some(item => item.type === 'arduino_kit'),
            firstFewItems: paginatedListings.slice(0, 5).map(item => ({
                title: item.title,
                type: item.type,
                price: item.price
            }))
        };

    } catch (error) {
        console.error('❌ fetchListings test error:', error.message);
        return {
            success: false,
            error: error.message
        };
    }
}

export async function GET() {
    const result = await testFetchListings();
    return Response.json(result);
}