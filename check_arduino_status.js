// Check for Arduino-related products that might need to be moved to Arduino table
const { createSupabaseServerClient } = require('./lib/supabase/server');

async function checkArduinoProducts() {
    try {
        console.log('Checking for Arduino-related products in products table...');
        
        const supabase = createSupabaseServerClient();
        
        // Check products table for Arduino-related items
        const { data: products, error } = await supabase
            .from('products')
            .select('*')
            .or('title.ilike.%arduino%,description.ilike.%arduino%,category.eq.Project Equipment')
            .order('created_at', { ascending: false });
            
        if (error) {
            console.error('Error fetching products:', error);
            return;
        }
        
        console.log(`Found ${products?.length || 0} products matching Arduino/Project Equipment criteria`);
        
        products?.forEach((product, index) => {
            console.log(`${index + 1}. ${product.title} - ₹${product.price} (Category: ${product.category})`);
            if (product.description?.toLowerCase().includes('arduino') || 
                product.title?.toLowerCase().includes('arduino')) {
                console.log('   ⚡ This looks like an Arduino kit!');
            }
        });
        
        // Also check Arduino table
        const { data: arduinoKits, error: arduinoError } = await supabase
            .from('arduino')
            .select('*')
            .order('created_at', { ascending: false });
            
        if (arduinoError) {
            console.error('Error fetching Arduino kits:', arduinoError);
            return;
        }
        
        console.log(`\nArduino table has ${arduinoKits?.length || 0} entries`);
        
        arduinoKits?.forEach((kit, index) => {
            try {
                const productInfo = JSON.parse(kit.other_components || '{}');
                console.log(`${index + 1}. ${productInfo.title || 'Untitled'} - ₹${productInfo.price || 0}`);
            } catch (e) {
                console.log(`${index + 1}. Arduino kit (parsing error)`);
            }
        });
        
    } catch (error) {
        console.error('Script error:', error);
    }
}

checkArduinoProducts();