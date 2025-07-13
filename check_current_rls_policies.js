const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SECRET_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkCurrentRLSPolicies() {
    console.log('🔍 Checking current RLS policies for sponsorship_sequences...');
    
    try {
        // Query the pg_policies view to see current policies
        const { data: policies, error } = await supabase
            .rpc('exec_sql', {
                sql: `
                SELECT 
                    schemaname,
                    tablename,
                    policyname,
                    permissive,
                    roles,
                    cmd,
                    qual,
                    with_check
                FROM pg_policies 
                WHERE schemaname = 'public' AND tablename = 'sponsorship_sequences'
                ORDER BY policyname;
                `
            });

        if (error) {
            console.log('❌ Error querying policies (trying alternative method):', error.message);
            
            // Alternative: try checking via information_schema
            const { data: tableInfo, error: tableError } = await supabase
                .from('information_schema.tables')
                .select('*')
                .eq('table_schema', 'public')
                .eq('table_name', 'sponsorship_sequences');
            
            if (tableError) {
                console.log('❌ Error accessing table info:', tableError.message);
            } else {
                console.log('✅ Table exists in schema');
                console.log('📋 Table info:', tableInfo);
            }
            
            return;
        }

        if (!policies || policies.length === 0) {
            console.log('ℹ️  No RLS policies found for sponsorship_sequences');
        } else {
            console.log('📋 Current RLS policies:');
            policies.forEach((policy, index) => {
                console.log(`\n${index + 1}. Policy: ${policy.policyname}`);
                console.log(`   Command: ${policy.cmd}`);
                console.log(`   Roles: ${policy.roles?.join(', ') || 'N/A'}`);
                console.log(`   Condition: ${policy.qual || 'None'}`);
                console.log(`   With Check: ${policy.with_check || 'None'}`);
            });
        }

        // Test INSERT with anon key (like adi.html does)
        console.log('\n🧪 Testing INSERT with anon key (like adi.html)...');
        
        const anonSupabase = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
        
        const testRecord = {
            item_id: '550e8400-e29b-41d4-a716-446655440000',
            item_type: 'product',
            slot: 1
        };

        const { data: insertData, error: insertError } = await anonSupabase
            .from('sponsorship_sequences')
            .insert(testRecord)
            .select();

        if (insertError) {
            console.log('❌ INSERT with anon key failed:', insertError.message);
            console.log('🔧 This explains why adi.html is failing');
        } else {
            console.log('✅ INSERT with anon key successful');
            console.log('📝 Inserted record:', insertData);
            
            // Clean up
            if (insertData && insertData[0]) {
                await supabase
                    .from('sponsorship_sequences')
                    .delete()
                    .eq('id', insertData[0].id);
                console.log('🧹 Test record cleaned up');
            }
        }

    } catch (error) {
        console.error('❌ Unexpected error:', error);
    }
}

checkCurrentRLSPolicies();
