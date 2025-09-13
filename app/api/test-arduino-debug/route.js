// Test API endpoint to debug Arduino fetching
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function GET() {
    try {
        const supabase = createSupabaseServerClient();
        
        console.log('🔍 Testing Arduino table access...');
        
        // Test Arduino table access
        const { data: arduinoData, error: arduinoError } = await supabase
            .from('arduino')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(5);
            
        if (arduinoError) {
            console.error('Arduino error:', arduinoError);
            return Response.json({ 
                error: 'Arduino table error', 
                details: arduinoError,
                arduinoCount: 0 
            });
        }
        
        console.log(`Found ${arduinoData?.length || 0} Arduino entries`);
        
        // Parse Arduino kits
        const parsedArduinoKits = (arduinoData || []).map(row => {
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
                console.error('Error parsing Arduino kit:', error);
                return null;
            }
        }).filter(kit => kit !== null);
        
        // Also test fetchListings simulation
        const [productsRes, notesRes, roomsRes, rentalsRes] = await Promise.all([
            supabase.from('products').select('id, title, price, created_at').order('created_at', { ascending: false }).limit(3),
            supabase.from('notes').select('id, title, price, created_at').order('created_at', { ascending: false }).limit(3),
            supabase.from('rooms').select('id, title, price, created_at').order('created_at', { ascending: false }).limit(3),
            supabase.from('rentals').select('id, title, rental_price, created_at').order('created_at', { ascending: false }).limit(3)
        ]);
        
        return Response.json({
            success: true,
            arduinoTableEntries: arduinoData?.length || 0,
            parsedArduinoKits: parsedArduinoKits.length,
            arduinoKits: parsedArduinoKits,
            otherTables: {
                products: productsRes.data?.length || 0,
                notes: notesRes.data?.length || 0,
                rooms: roomsRes.data?.length || 0,
                rentals: rentalsRes.data?.length || 0
            },
            message: parsedArduinoKits.length > 0 ? 
                `✅ Found ${parsedArduinoKits.length} Arduino kits that should appear in listings` :
                '❌ No Arduino kits found - this is why they are not showing in explore listings'
        });
        
    } catch (error) {
        console.error('Test API error:', error);
        return Response.json({ 
            error: 'Server error', 
            details: error.message 
        }, { status: 500 });
    }
}