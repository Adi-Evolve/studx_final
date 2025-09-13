// Script to create Arduino components table in Supabase
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing required environment variables');
    console.error('Make sure your .env.local file contains:');
    console.error('NEXT_PUBLIC_SUPABASE_URL=your_supabase_url');
    console.error('SUPABASE_SECRET_KEY=your_service_role_key');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createArduinoTable() {
    console.log('🔧 Creating Arduino components table...\n');

    try {
        // Read the SQL file
        const sqlContent = fs.readFileSync('create_arduino_components_table.sql', 'utf8');
        
        // Split the SQL into individual statements
        const statements = sqlContent
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt && !stmt.startsWith('--') && stmt.length > 0);

        console.log(`📝 Found ${statements.length} SQL statements to execute\n`);

        // Execute each statement
        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i];
            if (!statement) continue;

            console.log(`${i + 1}. Executing: ${statement.substring(0, 60)}...`);
            
            try {
                // Try using RPC method first
                const { error } = await supabase.rpc('exec_sql', { 
                    sql_query: statement + ';' 
                });
                
                if (error) {
                    console.log(`   ⚠️  RPC method failed: ${error.message}`);
                    
                    // Try direct query for simple operations
                    if (statement.includes('CREATE TABLE')) {
                        // For table creation, we need to use a different approach
                        console.log('   🔄 Trying alternative method for table creation...');
                        
                        // Extract table creation components
                        const createTableMatch = statement.match(/CREATE TABLE IF NOT EXISTS (\w+)\s*\(([\s\S]*)\)/i);
                        if (createTableMatch) {
                            const tableName = createTableMatch[1];
                            console.log(`   📋 Creating table: ${tableName}`);
                            
                            // We'll need to create this manually through Supabase dashboard
                            console.log('   ⚠️  Manual creation required for complex table structure');
                        }
                    }
                } else {
                    console.log(`   ✅ Success`);
                }
            } catch (err) {
                console.log(`   ⚠️  Statement execution error: ${err.message}`);
            }
        }

        console.log('\n🧪 Testing table creation...');
        
        // Test if the arduino table was created
        const { data, error: testError } = await supabase
            .from('arduino')
            .select('*')
            .limit(1);
        
        if (testError) {
            console.log('❌ Arduino table not accessible:', testError.message);
            console.log('\n📋 MANUAL STEPS REQUIRED:');
            console.log('1. Go to your Supabase dashboard: https://supabase.com/dashboard');
            console.log('2. Navigate to your project');
            console.log('3. Go to SQL Editor');
            console.log('4. Copy and paste the contents of create_arduino_components_table.sql');
            console.log('5. Click "Run" to execute the SQL');
            console.log('\n🎯 This will create the Arduino components table for your Arduino kit feature.');
        } else {
            console.log('✅ Arduino table created successfully!');
            console.log('🎉 You can now use the Arduino kit feature in your application.');
            
            // Test a simple insert to verify the structure
            console.log('\n🧪 Testing table structure...');
            try {
                const { data: insertData, error: insertError } = await supabase
                    .from('arduino')
                    .insert({
                        product_id: 1, // Test product ID
                        arduino_uno_r3: true,
                        breadboard: true,
                        other_components: 'Test components'
                    })
                    .select();
                
                if (insertError) {
                    console.log('⚠️  Insert test failed (this is expected):', insertError.message);
                } else {
                    console.log('✅ Insert test successful:', insertData);
                    
                    // Clean up test data
                    await supabase
                        .from('arduino')
                        .delete()
                        .eq('product_id', 1);
                    console.log('🧹 Test data cleaned up');
                }
            } catch (testInsertError) {
                console.log('⚠️  Structure test completed with expected constraints');
            }
        }

    } catch (error) {
        console.error('💥 Error creating Arduino table:', error.message);
        console.log('\n📋 FALLBACK SOLUTION:');
        console.log('Please manually execute the SQL file in your Supabase dashboard.');
    }
}

// Run the script
console.log('🚀 Arduino Components Table Setup\n');
createArduinoTable().then(() => {
    console.log('\n✨ Setup complete!');
    process.exit(0);
}).catch(error => {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
});