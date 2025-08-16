// Manual User Sync - Run this to sync current authenticated user to users table
import { supabase } from '@/lib/supabase.js';

async function manualUserSync() {
    // console.log('🔄 Manual User Sync Started...\n');
    
    try {
        // Get current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
            // console.error('❌ No active session. Please log in first.');
            return;
        }
        
        const user = session.user;
        // console.log('👤 Current user:', user.email);
        
        // Prepare user data
        const userData = {
            id: user.id,
            email: user.email,
            name: user.user_metadata?.name || 
                  user.user_metadata?.full_name || 
                  user.user_metadata?.display_name || 
                  user.email?.split('@')[0],
            avatar_url: user.user_metadata?.picture || 
                       user.user_metadata?.avatar_url || 
                       user.user_metadata?.photo || 
                       user.user_metadata?.image,
            phone: user.phone,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        
        // console.log('📝 User data to sync:', userData);
        
        // Try upsert (insert or update)
        const { data: result, error } = await supabase
            .from('users')
            .upsert(userData, { 
                onConflict: 'id',
                ignoreDuplicates: false 
            })
            .select();
            
        if (error) {
            // console.error('❌ Sync failed:', error);
            
            // Try with service role key if regular fails
            // console.log('🔑 Trying with service role access...');
            
            const serviceRoleSupabase = supabase.createClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL,
                process.env.SUPABASE_SECRET_KEY,
                {
                    auth: {
                        autoRefreshToken: false,
                        persistSession: false
                    }
                }
            );
            
            const { data: serviceResult, error: serviceError } = await serviceRoleSupabase
                .from('users')
                .upsert(userData, { 
                    onConflict: 'id',
                    ignoreDuplicates: false 
                })
                .select();
                
            if (serviceError) {
                // console.error('❌ Service role sync also failed:', serviceError);
            } else {
                // console.log('✅ Service role sync successful:', serviceResult);
            }
        } else {
            // console.log('✅ User sync successful:', result);
        }
        
        // Verify the sync worked
        // console.log('\n🔍 Verifying sync...');
        const { data: verifyUser, error: verifyError } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single();
            
        if (verifyError) {
            // console.error('❌ Verification failed:', verifyError);
        } else {
            // console.log('✅ User found in table:', verifyUser);
        }
        
    } catch (error) {
        // console.error('❌ Manual sync error:', error);
    }
}

// Run the sync
manualUserSync();
