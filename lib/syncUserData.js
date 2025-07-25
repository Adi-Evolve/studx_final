import { createSupabaseServerClient } from './supabase/server';

/**
 * Syncs user data from Supabase Auth to the public.users table
 * This ensures email, name, avatar_url, and phone are properly populated
 */
export async function syncUserData(userId = null) {
    const supabase = createSupabaseServerClient();
    
    try {
        // Get current user if no userId provided
        let user = null;
        if (userId) {
            // For admin operations, we'd need to use the admin client
            const { data: { user: authUser }, error } = await supabase.auth.getUser();
            if (error || !authUser || authUser.id !== userId) {
                throw new Error('Cannot sync other user data without admin privileges');
            }
            user = authUser;
        } else {
            const { data: { user: authUser }, error } = await supabase.auth.getUser();
            if (error || !authUser) {
                throw new Error('No authenticated user found');
            }
            user = authUser;
        }
        
        // console.log('🔄 Syncing user data for:', user.email);
        
        // Check if user exists in public.users table
        const { data: existingUser, error: fetchError } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single();
        
        // Prepare user data from auth metadata
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
            updated_at: new Date().toISOString()
        };
        
        // console.log('📊 User metadata from auth:', {
        //     email: user.email,
        //     phone: user.phone,
        //     metadata: user.user_metadata
        // });
        
        if (existingUser) {
            // Update existing user, preserving non-null values
            const updateData = {
                email: userData.email,
                name: userData.name || existingUser.name,
                avatar_url: userData.avatar_url || existingUser.avatar_url,
                phone: userData.phone || existingUser.phone,
                updated_at: userData.updated_at
            };
            
            const { error: updateError } = await supabase
                .from('users')
                .update(updateData)
                .eq('id', user.id);
            
            if (updateError) {
                // console.error('❌ Error updating user:', updateError);
                throw updateError;
            } else {
                // console.log('✅ User data updated successfully');
                return { success: true, action: 'updated', data: updateData };
            }
        } else {
            // Insert new user
            const { error: insertError } = await supabase
                .from('users')
                .insert(userData);
            
            if (insertError) {
                // console.error('❌ Error inserting user:', insertError);
                throw insertError;
            } else {
                // console.log('✅ New user created successfully');
                return { success: true, action: 'created', data: userData };
            }
        }
        
    } catch (error) {
        // console.error('❌ Error syncing user data:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Middleware function to ensure user data is synced on protected routes
 */
export async function ensureUserSynced() {
    try {
        const result = await syncUserData();
        if (!result.success) {
            // console.warn('⚠️ User sync failed but continuing:', result.error);
        }
        return result;
    } catch (error) {
        // console.warn('⚠️ User sync error but continuing:', error);
        return { success: false, error: error.message };
    }
}
