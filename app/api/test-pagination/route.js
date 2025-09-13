// Check pagination and sorting
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

export async function GET(request) {
    const supabase = createSupabaseServerClient();
    
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '50'); // Get more items to see the Arduino kit
    
    try {
        // Fetch all tables
        const [productsRes, notesRes, roomsRes, rentalsRes, arduinoRes] = await Promise.all([
            supabase.from('products').select('id, title, created_at').order('created_at', { ascending: false }),
            supabase.from('notes').select('id, title, created_at').order('created_at', { ascending: false }),
            supabase.from('rooms').select('id, title, created_at').order('created_at', { ascending: false }),
            supabase.from('rentals').select('id, title, created_at').order('created_at', { ascending: false }),
            supabase.from('arduino').select('id, other_components, created_at').order('created_at', { ascending: false })
        ]);

        // Parse Arduino kits
        const arduinoKits = (arduinoRes.data || [])
            .map(row => {
                try {
                    const productInfo = JSON.parse(row.other_components || '{}');
                    if (!productInfo.title) return null;
                    
                    return {
                        id: row.id,
                        title: productInfo.title,
                        created_at: row.created_at,
                        type: 'arduino_kit',
                        table: 'arduino'
                    };
                } catch (error) {
                    return null;
                }
            })
            .filter(kit => kit !== null);

        // Combine all listings
        const allListings = [
            ...(productsRes.data || []).map(item => ({ ...item, type: 'regular', table: 'products' })),
            ...(notesRes.data || []).map(item => ({ ...item, type: 'note', table: 'notes' })),
            ...(roomsRes.data || []).map(item => ({ ...item, type: 'room', table: 'rooms' })),
            ...(rentalsRes.data || []).map(item => ({ ...item, type: 'rental', table: 'rentals' })),
            ...arduinoKits
        ];

        // Sort by created_at date (most recent first)
        allListings.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        // Take the requested limit
        const topItems = allListings.slice(0, limit);

        // Find where the Arduino kit appears
        const arduinoKitIndex = topItems.findIndex(item => item.type === 'arduino_kit');
        
        return Response.json({
            totalItems: allListings.length,
            requestedLimit: limit,
            returnedItems: topItems.length,
            arduinoKitPosition: arduinoKitIndex === -1 ? 'Not found in top items' : `Position ${arduinoKitIndex + 1}`,
            allArduinoKits: arduinoKits,
            topItems: topItems.map((item, index) => ({
                position: index + 1,
                title: item.title,
                type: item.type,
                table: item.table,
                created_at: item.created_at
            }))
        });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
}