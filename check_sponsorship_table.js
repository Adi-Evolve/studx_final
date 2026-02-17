const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SECRET_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkSponsorshipTable() {
    // console.log('🔍 Checking sponsorship_sequences table structure...');
    
    try {
        // Try to select from the table to see its structure
        const { data, error } = await supabase
            .from('sponsorship_sequences')
            .select('*')
            .limit(1);
        
        if (error) {
            // console.log('❌ Error accessing table:', error.message);
            return;
        }
        
        // console.log('✅ Table accessible');
        // console.log('📊 Current records:', data?.length || 0);
        
        // Try a simple INSERT to test current policies
        // console.log('\n🧪 Testing INSERT with minimal data...');
        
        const testRecord = {
            item_id: '550e8400-e29b-41d4-a716-446655440000', // dummy UUID for testing
            item_type: 'product',
            slot: 1
        };
        
        const { data: insertData, error: insertError } = await supabase
            .from('sponsorship_sequences')
            .insert(testRecord)
            .select();
        
        if (insertError) {
            // console.log('❌ INSERT failed:', insertError.message);
            // console.log('🔧 This confirms the RLS policy issue exists');
            
            // Let's try to understand the table schema
            // console.log('\n📋 Attempting to get table info...');
            
            const { data: schemaData, error: schemaError } = await supabase
                .rpc('get_table_columns', { table_name: 'sponsorship_sequences' })
                .single();
                
            if (schemaError) {
                // console.log('⚠️  Could not get schema info:', schemaError.message);
            } else {
                // console.log('📋 Table schema:', schemaData);
            }
            
        } else {
            // console.log('✅ INSERT successful - RLS policies are working correctly');
            // console.log('📝 Inserted record:', insertData);
            
            // Clean up
            if (insertData && insertData[0]) {
                await supabase
                    .from('sponsorship_sequences')
                    .delete()
                    .eq('id', insertData[0].id);
                // console.log('🧹 Test record cleaned up');
            }
        }
        
    } catch (error) {
        // console.error('❌ Unexpected error:', error);
    }
}

checkSponsorshipTable();
