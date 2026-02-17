// Test the exact same fetchListings call as the homepage
import { fetchListings } from '@/app/actions';

export async function GET() {
    try {
        // This is the exact same call as the homepage
        const result = await fetchListings({ page: 1, limit: 8 });
        
        // Analyze the results
        const typeCounts = {};
        result.listings?.forEach(item => {
            typeCounts[item.type] = (typeCounts[item.type] || 0) + 1;
        });
        
        const hasArduinoKits = result.listings?.some(item => item.type === 'arduino_kit') || false;
        
        return Response.json({
            success: true,
            totalListings: result.listings?.length || 0,
            hasMore: result.hasMore,
            hasArduinoKits,
            typeCounts,
            allListings: result.listings?.map(item => ({
                id: item.id,
                title: item.title,
                type: item.type,
                price: item.price,
                created_at: item.created_at
            })) || [],
            message: hasArduinoKits ? 
                '✅ Arduino kits ARE appearing in homepage fetchListings' :
                '❌ Arduino kits are NOT appearing in homepage fetchListings'
        });
        
    } catch (error) {
        return Response.json({
            success: false,
            error: error.message,
            stack: error.stack
        }, { status: 500 });
    }
}