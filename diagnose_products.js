const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://vdpmumstdxgftaaxeacx.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZkcG11bXN0ZHhnZnRhYXhlYWN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5MDYwODIsImV4cCI6MjA2NzQ4MjA4Mn0.Pbfm3FebzjQAHLPfdkzky-IH9aF3Zj1ZNVBjwe-3lyw';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZkcG11bXN0ZHhnZnRhYXhlYWN4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTkwNjA4MiwiZXhwIjoyMDY3NDgyMDgyfQ.tdYV9te2jYq2ARdPiJi6mpkqfvg45YlfgZ2kXnhLVRs';

async function diagnoseProductsTable() {
    console.log('🔍 Diagnosing products table access...\n');
    
    // Test with service role key first
    console.log('1. Testing with SERVICE ROLE key (admin access):');
    const adminClient = createClient(supabaseUrl, serviceKey);
    
    try {
        const { data: adminProducts, error: adminError, count: adminCount } = await adminClient
            .from('products')
            .select('*', { count: 'exact' });
            
        if (adminError) {
            console.log('❌ Service role error:', adminError.message);
        } else {
            console.log(`✅ Service role found: ${adminProducts?.length || 0} products (count: ${adminCount})`);
            if (adminProducts && adminProducts.length > 0) {
                console.log('📦 Sample products:');
                adminProducts.slice(0, 3).forEach((p, i) => {
                    console.log(`   ${i+1}. ID: ${p.id}, Title: "${p.title}", User: ${p.user_id}`);
                });
            }
        }
    } catch (err) {
        console.log('❌ Service role exception:', err.message);
    }
    
    console.log('\n2. Testing with ANON key (public access):');
    const anonClient = createClient(supabaseUrl, anonKey);
    
    try {
        const { data: anonProducts, error: anonError, count: anonCount } = await anonClient
            .from('products')
            .select('*', { count: 'exact' });
            
        if (anonError) {
            console.log('❌ Anon key error:', anonError.message);
            console.log('🔧 This suggests RLS (Row Level Security) is blocking access');
        } else {
            console.log(`✅ Anon key found: ${anonProducts?.length || 0} products (count: ${anonCount})`);
        }
    } catch (err) {
        console.log('❌ Anon key exception:', err.message);
    }
    
    // Check RLS policies
    console.log('\n3. Checking RLS policies on products table:');
    try {
        const { data: rlsInfo, error: rlsError } = await adminClient
            .rpc('pg_table_is_visible', { table_name: 'products' });
            
        console.log('RLS visibility check:', rlsInfo);
    } catch (err) {
        console.log('Could not check RLS policies:', err.message);
    }
    
    // Check if table exists and structure
    console.log('\n4. Checking table structure:');
    try {
        const { data: tableInfo, error: tableError } = await adminClient
            .from('information_schema.columns')
            .select('column_name, data_type')
            .eq('table_name', 'products')
            .eq('table_schema', 'public');
            
        if (tableError) {
            console.log('❌ Cannot check table structure:', tableError.message);
        } else if (tableInfo && tableInfo.length > 0) {
            console.log('✅ Products table columns:');
            tableInfo.forEach(col => {
                console.log(`   - ${col.column_name}: ${col.data_type}`);
            });
        } else {
            console.log('❌ Products table does not exist or has no columns');
        }
    } catch (err) {
        console.log('❌ Table structure check failed:', err.message);
    }
}

diagnoseProductsTable();
