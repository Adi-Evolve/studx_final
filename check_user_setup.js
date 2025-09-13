require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
);

async function checkUserAndFix() {
    try {
        console.log('🔍 Checking users table...');
        
        // Check if users table exists and has data
        const { data: users, error: usersError } = await supabase
            .from('users')
            .select('*')
            .limit(5);
            
        if (usersError) {
            console.error('❌ Users table error:', usersError);
            return;
        }
        
        console.log(`✅ Found ${users.length} users in database`);
        
        if (users.length === 0) {
            console.log('🔧 Creating a test user for development...');
            
            const { data: newUser, error: createError } = await supabase
                .from('users')
                .insert({
                    email: 'test@example.com',
                    name: 'Test User',
                    college: 'Test College',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })
                .select()
                .single();
                
            if (createError) {
                console.error('❌ Failed to create test user:', createError);
            } else {
                console.log('✅ Test user created:', newUser);
            }
        } else {
            console.log('👥 Existing users:', users.map(u => ({ id: u.id, email: u.email, name: u.name })));
        }
        
        // Check products table structure
        console.log('\n📦 Checking products table...');
        const { data: products, error: productsError } = await supabase
            .from('products')
            .select('*')
            .limit(1);
            
        if (productsError) {
            console.error('❌ Products table error:', productsError);
        } else {
            console.log('✅ Products table is accessible');
        }
        
        // Check Arduino table structure
        console.log('\n🤖 Checking Arduino table...');
        const { data: arduino, error: arduinoError } = await supabase
            .from('arduino')
            .select('*')
            .limit(1);
            
        if (arduinoError) {
            console.error('❌ Arduino table error:', arduinoError);
        } else {
            console.log('✅ Arduino table is accessible');
        }
        
    } catch (error) {
        console.error('🚨 Check failed:', error);
    }
}

checkUserAndFix();