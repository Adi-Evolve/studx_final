// Check table structures to understand column names
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseKey) {
    // console.error('Missing Supabase environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTableStructures() {
    // console.log('🔍 CHECKING TABLE STRUCTURES');
    // console.log('='.repeat(40));
    
    const tables = ['sponsorship_sequences', 'products', 'rooms', 'notes'];
    
    for (const tableName of tables) {
        // console.log(`\n📋 ${tableName.toUpperCase()}:`);
        // console.log('-'.repeat(30));
        
        try {
            // Get first item to see structure
            const { data, error } = await supabase
                .from(tableName)
                .select('*')
                .limit(1);
            
            if (error) {
                // console.log(`❌ Error: ${error.message}`);
                continue;
            }
            
            if (data && data.length > 0) {
                const item = data[0];
                // console.log('📝 Columns found:');
                Object.keys(item).forEach(key => {
                    const value = item[key];
                    const type = typeof value;
                    const preview = type === 'string' && value.length > 50 
                        ? value.substring(0, 50) + '...'
                        : String(value);
                    // console.log(`   ${key}: ${type} = "${preview}"`);
                });
            } else {
                // console.log('📭 No items found');
            }
            
        } catch (err) {
            // console.log(`💥 Unexpected error: ${err.message}`);
        }
    }
}

checkTableStructures().catch(console.error);
