// Script to execute SQL commands directly through Supabase client
import { config } from 'dotenv';
config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error('❌ Missing required environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function executeSQLCommands() {
    // console.log('🔧 Executing SQL commands to fix database issues...');
    
    try {
        // 1. Remove foreign key constraints
        // console.log('1. Removing foreign key constraints...');
        
        const removeConstraints = [
            'ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_id_fkey;',
            'ALTER TABLE public.rooms DROP CONSTRAINT IF EXISTS rooms_seller_id_fkey;',
            'ALTER TABLE public.rooms DROP CONSTRAINT IF EXISTS rooms_seller_id_fkey1;',
            'ALTER TABLE public.notes DROP CONSTRAINT IF EXISTS notes_seller_id_fkey;',
            'ALTER TABLE public.notes DROP CONSTRAINT IF EXISTS notes_seller_id_fkey1;',
            'ALTER TABLE public.products DROP CONSTRAINT IF EXISTS products_seller_id_fkey;',
            'ALTER TABLE public.products DROP CONSTRAINT IF EXISTS products_seller_id_fkey1;'
        ];
        
        for (const sql of removeConstraints) {
            const { error } = await supabase.rpc('exec_sql', { sql_query: sql });
            if (error) {
                // console.log(`Warning: ${sql} - ${error.message}`);
            } else {
                // console.log(`✅ ${sql}`);
            }
        }
        
        // 2. Disable RLS on all tables
        // console.log('2. Disabling RLS on all tables...');
        
        const disableRLS = [
            'ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;',
            'ALTER TABLE public.rooms DISABLE ROW LEVEL SECURITY;',
            'ALTER TABLE public.notes DISABLE ROW LEVEL SECURITY;',
            'ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;',
            'ALTER TABLE public.categories DISABLE ROW LEVEL SECURITY;'
        ];
        
        for (const sql of disableRLS) {
            const { error } = await supabase.rpc('exec_sql', { sql_query: sql });
            if (error) {
                // console.log(`Warning: ${sql} - ${error.message}`);
            } else {
                // console.log(`✅ ${sql}`);
            }
        }
        
        // 3. Grant permissions
        // console.log('3. Granting permissions...');
        
        const grantPermissions = [
            'GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;',
            'GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon;',
            'GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;',
            'GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;',
            'GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;',
            'GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;'
        ];
        
        for (const sql of grantPermissions) {
            const { error } = await supabase.rpc('exec_sql', { sql_query: sql });
            if (error) {
                // console.log(`Warning: ${sql} - ${error.message}`);
            } else {
                // console.log(`✅ ${sql}`);
            }
        }
        
        // 4. Insert development user
        // console.log('4. Creating development user...');
        
        const { error: userError } = await supabase
            .from('users')
            .upsert({
                id: '00000000-0000-0000-0000-000000000000',
                name: 'Development User',
                email: 'dev@example.com',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            });
            
        if (userError) {
            // console.log('User creation error:', userError.message);
        } else {
            // console.log('✅ Development user created/updated');
        }
        
        // 5. Test database operations
        // console.log('5. Testing database operations...');
        
        const { data: users, error: usersError } = await supabase
            .from('users')
            .select('count');
            
        if (usersError) {
            // console.log('Users test error:', usersError.message);
        } else {
            // console.log(`✅ Users table accessible`);
        }
        
        const { data: rooms, error: roomsError } = await supabase
            .from('rooms')
            .select('count');
            
        if (roomsError) {
            // console.log('Rooms test error:', roomsError.message);
        } else {
            // console.log(`✅ Rooms table accessible`);
        }
        
        // console.log('🎉 Database configuration completed!');
        
    } catch (error) {
        // console.error('❌ Error:', error);
    }
}

// Run the script
executeSQLCommands();
