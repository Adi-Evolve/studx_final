const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Create admin client with service role key for database operations
const supabaseUrl = 'https://ygqbktlsyqfrhnsttjop.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlncWJrdGxzeXFmcmhuc3R0am9wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNTU1MjU4NCwiZXhwIjoyMDUxMTI4NTg0fQ.FgRfp04wvOYYQNhYLT5M1E84Lp3pAn_DL-DGH3OJP0Q';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function executeSQL() {
    // console.log('🔧 Fixing users table sync with Supabase Auth...');
    
    try {
        // Read the SQL file
        const sqlContent = fs.readFileSync('./fix_users_table_sync.sql', 'utf8');
        
        // Split the SQL into individual statements (basic splitting on ;)
        const statements = sqlContent
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
        
        // console.log(`📝 Executing ${statements.length} SQL statements...`);
        
        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i];
            if (statement.trim()) {
                // console.log(`⏳ Executing statement ${i + 1}/${statements.length}...`);
                
                const { data, error } = await supabase.rpc('execute_sql', {
                    sql_query: statement
                });
                
                if (error) {
                    // console.error(`❌ Error in statement ${i + 1}:`, error);
                    // Try direct query if RPC fails
                    try {
                        const { data: directData, error: directError } = await supabase
                            .from('information_schema.columns')
                            .select('*')
                            .limit(1);
                        
                        if (directError) {
                            // console.error('Direct query also failed:', directError);
                        } else {
                            // console.log('✅ Direct query worked, trying alternative approach...');
                        }
                    } catch (e) {
                        // console.error('Alternative approach failed:', e);
                    }
                } else {
                    // console.log(`✅ Statement ${i + 1} executed successfully`);
                }
            }
        }
        
        // console.log('🎉 Users table sync fix completed!');
        
    } catch (error) {
        // console.error('❌ Error executing SQL:', error);
    }
}

// Alternative approach using individual SQL operations
async function fixUsersTableManually() {
    // console.log('🔧 Manually fixing users table...');
    
    try {
        // Check if email column exists
        // console.log('📊 Checking current users table structure...');
        
        const { data: users, error: usersError } = await supabase
            .from('users')
            .select('*')
            .limit(5);
            
        if (usersError) {
            // console.error('❌ Error fetching users:', usersError);
            return;
        }
        
        // console.log('👥 Sample users data:', users);
        
        // Try to get auth users data for comparison
        const { data: authUser, error: authError } = await supabase.auth.getUser();
        
        if (authError) {
            // console.log('⚠️ Cannot get auth user directly (requires user session)');
        } else {
            // console.log('🔐 Current auth user:', authUser);
        }
        
        // console.log('✅ Manual check completed. You may need to run the SQL directly in Supabase dashboard.');
        
    } catch (error) {
        // console.error('❌ Error in manual fix:', error);
    }
}

// Run the fix
executeSQL().then(() => {
    // console.log('📋 Also running manual check...');
    return fixUsersTableManually();
}).finally(() => {
    process.exit(0);
});
