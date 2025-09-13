import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function GET(request, { params }) {
    const { sellerId } = params;
    const { searchParams } = new URL(request.url);
    const currentItemId = searchParams.get('currentItemId');
    const currentItemType = searchParams.get('currentItemType');

    if (!sellerId) {
        return NextResponse.json({ error: 'Seller ID is required' }, { status: 400 });
    }

    const supabase = createSupabaseServerClient();

    try {
        // Fetch from all four tables in parallel with specific columns
        const [productsRes, roomsRes, notesRes, arduinoRes] = await Promise.all([
            supabase.from('products').select(`
                id, title, description, price, category, condition, college, 
                location, images, is_sold, seller_id, created_at
            `).eq('seller_id', sellerId),
            supabase.from('rooms').select(`
                id, title, description, price, category, college, location, 
                images, room_type, occupancy, distance, deposit, fees_include_mess, 
                mess_fees, owner_name, contact1, contact2, amenities, duration, seller_id, created_at
            `).eq('seller_id', sellerId),
            supabase.from('notes').select(`
                id, title, description, price, category, college, 
                academic_year, course_subject, images, pdf_urls, pdfUrl, 
                seller_id, created_at
            `).eq('seller_id', sellerId),
            supabase.from('arduino').select('*').order('created_at', { ascending: false })
        ]);

        // Combine and augment data with a 'type' field
        const products = (productsRes.data || []).map(item => ({ ...item, type: 'regular' }));
        const rooms = (roomsRes.data || []).map(item => ({ ...item, type: 'room' }));
        const notes = (notesRes.data || []).map(item => ({ ...item, type: 'note' }));
        
        // Parse Arduino kits and filter by seller
        const arduinoKits = (arduinoRes.data || [])
            .map(row => {
                try {
                    if (!row.other_components) return null
                    
                    const productInfo = JSON.parse(row.other_components)
                    
                    // Filter by seller_id
                    if (productInfo.seller_id !== sellerId) return null
                    
                    return {
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
                    }
                } catch (error) {
                    console.error('Error parsing Arduino kit:', error)
                    return null
                }
            })
            .filter(kit => kit !== null);

        let allItems = [...products, ...rooms, ...notes, ...arduinoKits];

        // Filter out the current item being viewed
        if (currentItemId && currentItemType) {
            allItems = allItems.filter(item => 
                !(item.id.toString() === currentItemId && item.type === currentItemType)
            );
        }

        // Sort by most recent
        allItems.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        return NextResponse.json(allItems);

    } catch (error) {
        // console.error('Error fetching seller listings:', error);
        return NextResponse.json({ error: 'An internal error occurred' }, { status: 500 });
    }
}
