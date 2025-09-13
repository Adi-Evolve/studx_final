// Debug the specific Arduino parsing issue
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

export async function GET() {
    const supabase = createSupabaseServerClient();
    
    try {
        // Get just the Arduino data and debug the parsing
        const { data: arduinoData, error } = await supabase
            .from('arduino')
            .select('*')
            .order('created_at', { ascending: false });
            
        if (error) {
            return Response.json({ error: error.message });
        }
        
        console.log('🔍 Raw Arduino data:', arduinoData);
        
        // Parse Arduino kits step by step
        const debugResults = [];
        const finalArduinoKits = [];
        
        (arduinoData || []).forEach((row, index) => {
            const debugInfo = {
                rawRow: row,
                step: 1,
                hasOtherComponents: !!row.other_components,
                otherComponentsType: typeof row.other_components
            };
            
            try {
                debugInfo.step = 2;
                const productInfo = JSON.parse(row.other_components || '{}');
                debugInfo.parsedProductInfo = productInfo;
                debugInfo.hasTitle = !!productInfo.title;
                
                if (!productInfo.title) {
                    debugInfo.skipped = 'No title in productInfo';
                    debugResults.push(debugInfo);
                    return;
                }
                
                debugInfo.step = 3;
                const arduinoKit = {
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
                
                debugInfo.step = 4;
                debugInfo.beforeSerialization = arduinoKit;
                
                const serialized = serializeDataForClient(arduinoKit);
                debugInfo.afterSerialization = serialized;
                debugInfo.success = true;
                
                finalArduinoKits.push(serialized);
                
            } catch (error) {
                debugInfo.error = error.message;
                debugInfo.stack = error.stack;
            }
            
            debugResults.push(debugInfo);
        });
        
        return Response.json({
            rawDataCount: arduinoData?.length || 0,
            debugResults,
            finalArduinoKitsCount: finalArduinoKits.length,
            finalArduinoKits,
            summary: finalArduinoKits.length > 0 ? 
                `✅ Successfully processed ${finalArduinoKits.length} Arduino kits` :
                `❌ Failed to process Arduino kits - check debug results`
        });
        
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
}