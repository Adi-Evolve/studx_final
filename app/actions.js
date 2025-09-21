'use server';

import { createClient } from '@supabase/supabase-js';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { calculateDistance, isValidLocation } from '@/lib/locationUtils';

// Centralized function to create an admin client for privileged operations
function createSupabaseAdminClient() {
    // Note: This uses the service role key and should only be used in secure, server-side environments.
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SECRET_KEY,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        }
    );
}

// Action to fetch detailed seller information
export async function getSellerInfo(sellerId) {
    if (!sellerId) return null;
    
    const supabaseAdmin = createSupabaseAdminClient();

    try {
        const [profileResult, authUserResult] = await Promise.all([
            supabaseAdmin.from('users').select('*').eq('id', sellerId).single(),
            supabaseAdmin.auth.admin.getUserById(sellerId)
        ]);

        const profile = profileResult.data;
        const authUser = authUserResult.data?.user;

        if (!profile && !authUser) {
            return { id: sellerId, name: 'Anonymous Seller', avatar_url: null, phone: null, email: null };
        }

        // Prioritize Google/Gmail profile picture from authentication
        const avatarUrl = authUser?.user_metadata?.picture // Google profile picture
            || authUser?.user_metadata?.avatar_url // Generic OAuth avatar
            || authUser?.user_metadata?.photo // Alternative Google field
            || profile?.avatar_url // Database stored avatar
            || authUser?.user_metadata?.avatar  // Alternative field
            || null;

        const sellerInfo = {
            id: sellerId,
            name: profile?.name || authUser?.user_metadata?.full_name || authUser?.user_metadata?.name || 'Anonymous Seller',
            avatar_url: avatarUrl,
            phone: profile?.phone || authUser?.phone || null,
            email: authUser?.email || null,
        };

        return sellerInfo;
    } catch (error) {
        console.error(`[Actions] Error fetching seller info for ID ${sellerId}:`, error.message);
        return null;
    }
}

// Action to fetch all listings by a specific seller
export async function fetchSellerListings({ sellerId, excludeId, excludeType }) {
    if (!sellerId) return [];

    const supabase = createSupabaseServerClient(); // Use the server client for RLS

    try {
        const [products, notes, rooms] = await Promise.all([
            supabase.from('products').select(`
                id, title, description, price, category, condition, college,
                location, images, is_sold, seller_id, created_at
            `).eq('seller_id', sellerId),
            supabase.from('notes').select(`
                id, title, description, price, category, college,
                academic_year, course_subject, images, pdf_urls, pdf_url,
                seller_id, created_at
            `).eq('seller_id', sellerId),
            supabase.from('rooms').select(`
                id, title, description, price, category, college, location,
                images, room_type, occupancy, distance, deposit, fees_include_mess,
                mess_fees, owner_name, contact1, contact2, amenities, duration, seller_id, created_at
            `).eq('seller_id', sellerId)
        ]);

        const allListings = [
            ...(products.data || []).map(p => ({ ...p, type: 'product' })),
            ...(notes.data || []).map(n => ({ ...n, type: 'note' })),
            ...(rooms.data || []).map(r => ({ ...r, type: 'room' }))
        ];

        // Filter out the currently viewed item
        return allListings.filter(item => !(item.id === excludeId && item.type === excludeType));

    } catch (error) {
        console.error(`[Actions] Error fetching listings for seller ID ${sellerId}:`, error.message);
        return [];
    }
}

// Action to fetch similar listings based on category (for products/notes) or college (for rooms)
export async function fetchSimilarListings({ type, category, college, excludeId, page = 1, pageSize = 10 }) {
    if (!type) return [];

    const supabase = createSupabaseServerClient();
    const offset = (page - 1) * pageSize;

    let query;

    // Determine the table and filter column based on the type
    if (type === 'product' || type === 'note' || type === 'rental' || type === 'arduino_kit') {
        if (!category) return [];
        let tableName, selectColumns;
        
        if (type === 'product') {
            tableName = 'products';
            selectColumns = `
                id, title, description, price, category, condition, college,
                location, images, is_sold, seller_id, created_at
            `;
        } else if (type === 'note') {
            tableName = 'notes';
            selectColumns = `
                id, title, description, price, category, college,
                academic_year, course_subject, images, pdf_urls, pdf_url,
                seller_id, created_at
            `;
        } else if (type === 'rental') {
            tableName = 'rentals';
            selectColumns = `
                id, title, description, rental_price, security_deposit, category, condition, college,
                location, images, is_rented, seller_id, created_at, rental_duration,
                available_from, available_until, delivery_options
            `;
        } else if (type === 'arduino_kit') {
            tableName = 'arduino';
            selectColumns = `
                id, breadboard, motor, led, resistor, other_components, 
                created_at, updated_at
            `;
        }
        
        if (type === 'arduino_kit') {
            // For Arduino kits, we need to filter by category differently since it's stored in JSON
            query = supabase.from(tableName)
                .select(selectColumns);
        } else {
            query = supabase.from(tableName)
                .select(selectColumns)
                .eq('category', category);
        }
    } else if (type === 'room') {
        if (!college) return [];
        query = supabase.from('rooms')
            .select(`
                id, title, description, price, category, college, location,
                images, room_type, occupancy, distance, deposit, fees_include_mess,
                mess_fees, owner_name, contact1, contact2, amenities, duration, seller_id, created_at
            `)
            .eq('college', college);
    } else {
        return []; // Invalid type
    }

    try {
        // Exclude the current item and apply pagination
        const { data, error } = await query
            .neq('id', excludeId)
            .range(offset, offset + pageSize - 1);

        if (error) {
            console.error(`[Actions] Supabase error fetching similar listings for type ${type}:`, error.message);
            throw error;
        }

        // Process Arduino kits differently since they store data in JSON
        if (type === 'arduino_kit') {
            const processedArduinoKits = data
                .map(row => {
                    try {
                        const productInfo = JSON.parse(row.other_components || '{}');
                        if (!productInfo.title) return null;
                        
                        // Filter by category if specified
                        if (category && productInfo.category !== category) return null;
                        
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
                        console.error('Error parsing Arduino kit in fetchSimilarListings:', error);
                        return null;
                    }
                })
                .filter(kit => kit !== null);
            
            return processedArduinoKits;
        }

        // Add the 'type' to each item so the client knows how to render it
        return data.map(item => {
            // Map rental_price to price for consistency with other types
            if (type === 'rental' && item.rental_price) {
                return { ...item, type, price: item.rental_price };
            }
            return { ...item, type };
        });

    } catch (error) {
        console.error(`[Actions] General error fetching similar listings for type ${type}:`, error.message);
        return [];
    }
}

// Helper function to serialize data for client-side consumption
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
    
    // For any other type, convert to string
    return String(data);
}

// Fetch sponsored/featured listings from sponsorship_sequences table
export async function fetchSponsoredListings() {
    const supabase = createSupabaseServerClient();
    
    try {
        // Get the sequence of sponsored items
        const { data: sequenceItems, error: sequenceError } = await supabase
            .from('sponsorship_sequences')
            .select('item_id, item_type, slot')
            .order('slot', { ascending: true });

        if (sequenceError) {
            console.error('Error fetching sponsorship sequence:', sequenceError);
            return [];
        }

        if (!sequenceItems || sequenceItems.length === 0) {
            return [];
        }

        // Group items by type for efficient fetching
        const productIds = sequenceItems.filter(item => item.item_type === 'product').map(item => item.item_id);
        const noteIds = sequenceItems.filter(item => item.item_type === 'note').map(item => item.item_id);
        const roomIds = sequenceItems.filter(item => item.item_type === 'room').map(item => item.item_id);

        // Fetch all items in parallel
        const [productsRes, notesRes, roomsRes] = await Promise.all([
            productIds.length > 0 ? supabase
                .from('products')
                .select(`
                    id, title, description, price, category, condition, college,
                    location, images, is_sold, seller_id, created_at
                `)
                .in('id', productIds) : { data: [], error: null },
            
            noteIds.length > 0 ? supabase
                .from('notes')
                .select(`
                    id, title, description, price, category, college,
                    academic_year, course_subject, images, pdf_urls,
                    seller_id, created_at
                `)
                .in('id', noteIds) : { data: [], error: null },
            
            roomIds.length > 0 ? supabase
                .from('rooms')
                .select(`
                    id, title, description, price, category, college, location,
                    images, room_type, occupancy, distance, deposit, fees_include_mess,
                    mess_fees, owner_name, contact1, contact2, amenities, duration, seller_id, created_at
                `)
                .in('id', roomIds) : { data: [], error: null }
        ]);

        // Check for errors
        if (productsRes.error) console.error('Error fetching products:', productsRes.error);
        if (notesRes.error) console.error('Error fetching notes:', notesRes.error);
        if (roomsRes.error) console.error('Error fetching rooms:', roomsRes.error);

        // Create maps for quick lookup
        const productsMap = new Map((productsRes.data || []).map(item => [item.id, { ...item, type: 'regular' }]));
        const notesMap = new Map((notesRes.data || []).map(item => [item.id, { ...item, type: 'note' }]));
        const roomsMap = new Map((roomsRes.data || []).map(item => [item.id, { ...item, type: 'room' }]));

        // Build the final ordered array
        const sponsoredItems = [];
        for (const sequenceItem of sequenceItems) {
            let item = null;
            
            if (sequenceItem.item_type === 'product') {
                item = productsMap.get(sequenceItem.item_id);
            } else if (sequenceItem.item_type === 'note') {
                item = notesMap.get(sequenceItem.item_id);
            } else if (sequenceItem.item_type === 'room') {
                item = roomsMap.get(sequenceItem.item_id);
            }

            if (item) {
                sponsoredItems.push(serializeDataForClient(item));
            }
        }

        return sponsoredItems;
    } catch (error) {
        console.error('Error in fetchSponsoredListings:', error);
        return [];
    }
}

// Fetch regular listings (pagination-aware)
export async function fetchListings({ page = 1, limit = 12 } = {}) {
    const supabase = createSupabaseServerClient();
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    try {
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
                    id, breadboard, arduino_uno_r3, servo_motor_sg90, led_red, led_green, 
                    resistor_220_ohm, ultrasonic_sensor, other_components, 
                    created_at, updated_at
                `)
                .order('created_at', { ascending: false })
        ]);

        // Check for errors
        if (productsRes.error) {
            console.error('[Action: fetchListings] Error fetching products:', productsRes.error.message);
        }
        if (notesRes.error) {
            console.error('[Action: fetchListings] Error fetching notes:', notesRes.error.message);
        }
        if (roomsRes.error) {
            console.error('[Action: fetchListings] Error fetching rooms:', roomsRes.error.message);
        }
        if (rentalsRes.error) {
            console.error('[Action: fetchListings] Error fetching rentals:', rentalsRes.error.message);
        }
        if (arduinoRes.error) {
            console.error('[Action: fetchListings] Error fetching Arduino kits:', arduinoRes.error.message);
        }

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
                        arduino_uno_r3: row.arduino_uno_r3 || false,
                        servo_motor_sg90: row.servo_motor_sg90 || false,
                        led_red: row.led_red || false,
                        led_green: row.led_green || false,
                        resistor_220_ohm: row.resistor_220_ohm || false,
                        ultrasonic_sensor: row.ultrasonic_sensor || false,
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

        // Sort by created_at date (most recent first) since we already ordered in the queries
        allListings.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        // Apply pagination
        const paginatedListings = allListings.slice(from, to + 1);

        return {
            listings: paginatedListings || [],
            hasMore: paginatedListings.length === limit && allListings.length > to + 1
        };

    } catch (error) {
        console.error('[Action: fetchListings] A critical error occurred:', error.message);
        return { listings: [], hasMore: false };
    }
}

// Helper function to parse location strings  
function parseLocationString(locationString) {
    if (!locationString || typeof locationString !== 'string') return null;
    
    try {
        // Try to parse as JSON first
        const parsed = JSON.parse(locationString);
        if (parsed && typeof parsed.lat === 'number' && typeof parsed.lng === 'number') {
            return { lat: parsed.lat, lng: parsed.lng };
        }
    } catch (e) {
        // Not JSON, try other formats
    }
    
    // Try comma-separated format: "lat,lng"
    const parts = locationString.split(',');
    if (parts.length === 2) {
        const lat = parseFloat(parts[0].trim());
        const lng = parseFloat(parts[1].trim());
        if (!isNaN(lat) && !isNaN(lng)) {
            return { lat, lng };
        }
    }
    
    return null;
}

// Action to fetch newest products from all tables (for homepage)
export async function fetchNewestProducts(limit = 4) {
    const supabase = createSupabaseServerClient();
    const PRIORITY_ARDUINO_ID = 'e8a8f0a5-4cac-4b43-810c-5704129ee974';

    try {
        let productsRes, notesRes, roomsRes, rentalsRes, arduinoRes, priorityArduinoRes;
        try {
            [productsRes, notesRes, roomsRes, rentalsRes, arduinoRes, priorityArduinoRes] = await Promise.all([
            supabase
                .from('products')
                .select(`
                    id, title, description, price, category, condition, college, 
                    location, images, is_sold, seller_id, created_at
                `)
                .order('created_at', { ascending: false })
                .limit(limit),
            supabase
                .from('notes')
                .select(`
                    id, title, description, price, category, college, 
                    academic_year, course_subject, images, pdf_urls, pdf_url, 
                    seller_id, created_at
                `)
                .order('created_at', { ascending: false })
                .limit(limit),
            supabase
                .from('rooms')
                .select(`
                    id, title, description, price, category, college, location, 
                    images, room_type, occupancy, distance, deposit, fees_include_mess, 
                    mess_fees, owner_name, contact1, contact2, amenities, duration, seller_id, created_at
                `)
                .order('created_at', { ascending: false })
                .limit(limit),
            supabase
                .from('rentals')
                .select(`
                    id, title, description, rental_price, security_deposit, category, condition, college, 
                    location, images, is_rented, seller_id, created_at, rental_duration,
                    available_from, available_until, delivery_options
                `)
                .order('created_at', { ascending: false })
                .limit(limit),
            supabase
                .from('arduino')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(limit * 2)
        ]);
        } catch (err) {
            console.error('[fetchNewestProducts] DB fetch error:', err);
            return { error: 'Database fetch error', details: err.message };
        }

        // Enhanced error handling for notes
        if (notesRes.error) {
            console.error('[fetchNewestProducts] Notes fetch error:', notesRes.error);
            return { error: 'Notes fetch error', details: notesRes.error.message };
        }
        const notes = (notesRes.data || []).map(item => serializeDataForClient({ ...item, type: 'note' }));

        // Parse Arduino kits and separate priority kit
        let priorityArduinoFromTable = null;
        const arduinoKits = [];
        
        (arduinoRes.data || []).forEach(row => {
            try {
                if (!row.other_components) return;
                
                const productInfo = JSON.parse(row.other_components);
                
                const arduinoItem = serializeDataForClient({
                    id: row.id,
                    title: productInfo.title || 'Arduino Kit',
                    description: productInfo.description || 'Arduino development kit',
                    price: productInfo.price || 0,
                    category: productInfo.category || 'electronics',
                    condition: productInfo.condition || 'Used',
                    college: productInfo.college || '',
                    location: productInfo.location || '',
                    is_sold: productInfo.is_sold || false,
                    seller_id: productInfo.seller_id,
                    created_at: row.created_at,
                    updated_at: row.updated_at,
                    type: 'arduino_kit',
                    table_type: 'arduino',
                    component_count: productInfo.component_count || 0
                });
                
                // Check if this is the priority Arduino kit
                if (productInfo.seller_id === PRIORITY_ARDUINO_ID) {
                    priorityArduinoFromTable = arduinoItem;
                } else {
                    arduinoKits.push(arduinoItem);
                }
            } catch (error) {
                console.error('Error parsing Arduino kit in fetchNewestProducts:', error);
            }
        });

        // Separate priority Arduino from regular products
        let priorityArduino = null;
        const regularProducts = (productsRes.data || [])
            .map(item => {
                const product = serializeDataForClient({ ...item, type: 'regular' });
                
                // Check if this is our priority Arduino kit
                if (item.id === PRIORITY_ARDUINO_ID) {
                    priorityArduino = product;
                    return null; // Don't include in regular list
                }
                
                return product;
            })
            .filter(item => item !== null);

        const allNewest = [
            ...regularProducts,
            ...notes,
            ...(roomsRes.data || []).map(item => serializeDataForClient({ ...item, type: 'room' })),
            ...(rentalsRes.data || []).map(item => serializeDataForClient({ 
                ...item, 
                type: 'rental',
                price: item.rental_price // Map rental_price to price for consistency
            })),
            ...arduinoKits
        ];

        allNewest.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        // Insert priority Arduino at the front if present
        if (priorityArduino) {
            allNewest.unshift(priorityArduino);
        }

        return allNewest.slice(0, limit * 4); // Increased from limit * 3 to limit * 4 for Arduino kits

    } catch (error) {
        console.error('[Action: fetchNewestProducts] Error:', error.message);
        return [];
    }
}

// Action to fetch newest products with location-based sorting
export async function fetchNewestProductsWithLocation(userLat, userLng, limit = 4) {
    const supabase = createSupabaseServerClient();
    const PRIORITY_ARDUINO_ID = 'e8a8f0a5-4cac-4b43-810c-5704129ee974';

    try {
        const [productsRes, notesRes, roomsRes, rentalsRes, arduinoRes] = await Promise.all([
            supabase
                .from('products')
                .select(`
                    id, title, description, price, category, condition, college, 
                    location, images, is_sold, seller_id, created_at
                `)
                .order('created_at', { ascending: false })
                .limit(limit * 2), // Get more to filter and sort by distance
            supabase
                .from('notes')
                .select(`
                    id, title, description, price, category, college, 
                    academic_year, course_subject, images, pdf_urls, pdf_url, 
                    seller_id, created_at
                `)
                .order('created_at', { ascending: false })
                .limit(limit * 2),
            supabase
                .from('rooms')
                .select(`
                    id, title, description, price, category, college, location, 
                    images, room_type, occupancy, distance, deposit, fees_include_mess, 
                    mess_fees, owner_name, contact1, contact2, amenities, duration, seller_id, created_at
                `)
                .order('created_at', { ascending: false })
                .limit(limit * 2),
            supabase
                .from('rentals')
                .select(`
                    id, title, description, rental_price, security_deposit, category, condition, college, 
                    location, images, is_rented, seller_id, created_at, rental_duration,
                    available_from, available_until, delivery_options
                `)
                .order('created_at', { ascending: false })
                .limit(limit * 2),
            supabase
                .from('arduino')
                .select(`
                    id, breadboard, motor, led, resistor, other_components, 
                    created_at, updated_at
                `)
                .order('created_at', { ascending: false })
                .limit(limit * 2)
        ]);

        // Parse Arduino kits from JSON data and separate priority kit
        let priorityArduinoFromTable = null;
        const arduinoKits = (arduinoRes.data || [])
            .map(row => {
                try {
                    const productInfo = JSON.parse(row.other_components || '{}')
                    if (!productInfo.title) return null
                    
                    const kit = serializeDataForClient({
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
                    
                    // Check if this is our priority Arduino kit
                    if (productInfo.seller_id === PRIORITY_ARDUINO_ID) {
                        priorityArduinoFromTable = kit;
                        return null; // Don't include in regular list
                    }
                    
                    return kit;
                } catch (error) {
                    console.error('Error parsing Arduino kit in fetchNewestProductsWithLocation:', error)
                    return null
                }
            })
            .filter(kit => kit !== null);

        // Separate priority Arduino from regular products
        let priorityArduino = null;
        const regularProducts = (productsRes.data || [])
            .map(item => {
                const product = serializeDataForClient({ ...item, type: 'regular' });
                
                // Check if this is our priority Arduino kit
                if (item.id === PRIORITY_ARDUINO_ID) {
                    priorityArduino = product;
                    return null; // Don't include in regular list
                }
                
                return product;
            })
            .filter(item => item !== null);

        // Combine all and get the newest across all tables
        const allNewest = [
            ...regularProducts,
            ...(notesRes.data || []).map(item => serializeDataForClient({ ...item, type: 'note' })),
            ...(roomsRes.data || []).map(item => serializeDataForClient({ ...item, type: 'room' })),
            ...(rentalsRes.data || []).map(item => serializeDataForClient({ 
                ...item, 
                type: 'rental',
                price: item.rental_price // Map rental_price to price for consistency
            })),
            ...arduinoKits
        ];

        // Add distance calculations
        const itemsWithDistance = allNewest.map(item => {
            let distance = null;
            
            // Try to parse location for distance calculation
            if (item.location && userLat && userLng) {
                try {
                    const coords = parseLocationString(item.location);
                    if (coords) {
                        distance = calculateDistance(userLat, userLng, coords.lat, coords.lng);
                    }
                } catch (e) {
                    // If parsing fails, distance remains null
                }
            }
            
            return { ...item, distance };
        });

        // Sort by creation date first, then by distance (closer items get priority among recent ones)
        itemsWithDistance.sort((a, b) => {
            const dateA = new Date(a.created_at);
            const dateB = new Date(b.created_at);
            const timeDiff = dateB - dateA;
            
            // If items are created within 24 hours of each other, prioritize by distance
            if (Math.abs(timeDiff) < 24 * 60 * 60 * 1000) {
                if (a.distance !== null && b.distance !== null) {
                    return a.distance - b.distance;
                }
                if (a.distance !== null) return -1;
                if (b.distance !== null) return 1;
            }
            
            return timeDiff;
        });
        
        // Insert priority Arduino at the front if present
        if (priorityArduino) {
            // Add distance to priority Arduino if location is available
            let distance = null;
            if (priorityArduino.location && userLat && userLng) {
                try {
                    const coords = parseLocationString(priorityArduino.location);
                    if (coords) {
                        distance = calculateDistance(userLat, userLng, coords.lat, coords.lng);
                    }
                } catch (e) {
                    // If parsing fails, distance remains null
                }
            }
            priorityArduino.distance = distance;
            itemsWithDistance.unshift(priorityArduino);
        }
        
        return itemsWithDistance.slice(0, limit * 4); // Increased from limit * 3 to limit * 4 for Arduino kits

    } catch (error) {
        console.error('[Action: fetchNewestProductsWithLocation] Error:', error.message);
        // Fallback to regular newest products
        return await fetchNewestProducts(limit);
    }
}

// Basic search function for listings
export async function searchListings({ query }) {
    if (!query || query.trim().length === 0) return [];
    
    const supabase = createSupabaseServerClient();
    const searchTerm = query.toLowerCase();

    try {
        const [productsRes, notesRes, roomsRes, rentalsRes] = await Promise.all([
            supabase
                .from('products')
                .select(`
                    id, title, description, price, category, condition, college,
                    location, images, is_sold, seller_id, created_at
                `)
                .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%`),
            supabase
                .from('notes')
                .select(`
                    id, title, description, price, category, college,
                    academic_year, course_subject, images, pdf_urls, pdf_url,
                    seller_id, created_at
                `)
                .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%,course_subject.ilike.%${searchTerm}%`),
            supabase
                .from('rooms')
                .select(`
                    id, title, description, price, category, college, location,
                    images, room_type, occupancy, distance, deposit, fees_include_mess,
                    mess_fees, owner_name, contact1, contact2, amenities, duration, seller_id, created_at
                `)
                .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%,college.ilike.%${searchTerm}%`),
            supabase
                .from('rentals')
                .select(`
                    id, title, description, rental_price, security_deposit, category, condition, college,
                    location, images, is_rented, seller_id, created_at, rental_duration,
                    available_from, available_until, delivery_options
                `)
                .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%,college.ilike.%${searchTerm}%`)
        ]);

        // Combine results
        const allResults = [
            ...(productsRes.data || []).map(item => serializeDataForClient({ ...item, type: 'regular' })),
            ...(notesRes.data || []).map(item => serializeDataForClient({ ...item, type: 'note' })),
            ...(roomsRes.data || []).map(item => serializeDataForClient({ ...item, type: 'room' })),
            ...(rentalsRes.data || []).map(item => serializeDataForClient({ 
                ...item, 
                type: 'rental',
                price: item.rental_price // Map rental_price to price for consistency
            }))
        ];

        // Sort by relevance (title matches first, then description matches)
        return allResults.sort((a, b) => {
            const aTitle = a.title?.toLowerCase() || '';
            const bTitle = b.title?.toLowerCase() || '';
            
            const aTitleMatch = aTitle.includes(searchTerm);
            const bTitleMatch = bTitle.includes(searchTerm);
            
            if (aTitleMatch && !bTitleMatch) return -1;
            if (!aTitleMatch && bTitleMatch) return 1;
            
            // If both or neither match title, sort by creation date
            return new Date(b.created_at) - new Date(a.created_at);
        });

    } catch (error) {
        console.error('[searchListings] Error:', error.message);
        return [];
    }
}

// Chat System - Create or get conversation
export async function createOrGetConversation({ listingId, sellerId, listingType = 'product' }) {
    const supabase = createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error('User not authenticated');
    
    try {
        // Check if conversation already exists
        const { data: existingConversation, error: fetchError } = await supabase
            .from('conversations')
            .select('*')
            .eq('listing_id', listingId)
            .eq('buyer_id', user.id)
            .eq('seller_id', sellerId)
            .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
            // PGRST116 is "not found" error, which is expected if no conversation exists
            throw fetchError;
        }

        if (existingConversation) {
            return { data: existingConversation, error: null };
        }

        // Create new conversation
        const { data: newConversation, error: createError } = await supabase
            .from('conversations')
            .insert([{
                listing_id: listingId,
                buyer_id: user.id,
                seller_id: sellerId,
                listing_type: listingType,
                created_at: new Date().toISOString()
            }])
            .select()
            .single();

        if (createError) {
            throw createError;
        }

        return { data: newConversation, error: null };
    } catch (error) {
        console.error('[createOrGetConversation] Error:', error.message);
        return { data: null, error };
    }
}

// Submit a review for a room/listing
export async function submitReview({ roomId, rating, comment }) {
    const supabase = createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
        return { error: 'User not authenticated' };
    }

    try {
        const { data, error } = await supabase
            .from('reviews')
            .insert([
                {
                    room_id: roomId,
                    user_id: user.id,
                    rating: parseInt(rating),
                    comment: comment?.trim() || null,
                    created_at: new Date().toISOString()
                }
            ])
            .select()
            .single();

        if (error) {
            console.error('[submitReview] Error:', error.message);
            return { error: error.message };
        }

        return { data, error: null };
    } catch (error) {
        console.error('[submitReview] Unexpected error:', error.message);
        return { error: 'Failed to submit review' };
    }
}
