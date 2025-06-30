import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// GET method for debugging - shows current user status
export async function GET(request) {
    // console.log('🔍 User sync status check');
    
    try {
        const supabase = createRouteHandlerClient({ cookies });
        
        // Try to get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        // console.log('Auth status:', {
        //     hasUser: !!user,
        //     hasSession: !!session,
        //     userError: userError?.message,
        //     sessionError: sessionError?.message
        // });
        
        let authStatus = 'not_authenticated';
        let currentUser = null;
        
        if (user) {
            authStatus = 'authenticated';
            currentUser = {
                id: user.id,
                email: user.email,
                metadata: user.user_metadata
            };
        }
        
        // Get users from public.users table for comparison
        const { data: publicUsers, error: publicError } = await supabase
            .from('users')
            .select('id, email, name, phone, avatar_url, updated_at')
            .limit(10);
        
        return NextResponse.json({
            authStatus,
            currentUser,
            publicUsers: publicUsers || [],
            publicUsersCount: publicUsers?.length || 0,
            errors: {
                userError: userError?.message,
                sessionError: sessionError?.message,
                publicError: publicError?.message
            }
        });
        
    } catch (error) {
        // console.error('❌ Status check error:', error);
        return NextResponse.json({ 
            error: 'Failed to check status',
            details: error.message 
        }, { status: 500 });
    }
}

export async function POST(request) {
    // console.log('🔄 Manual user sync endpoint called');
    
    try {
        // Get query parameters for debug mode
        const url = new URL(request.url);
        const debugMode = url.searchParams.get('debug') === 'true';
        
        // Try both server and route handler clients
        const supabaseServer = createSupabaseServerClient();
        const supabaseRoute = createRouteHandlerClient({ cookies });
        
        // Try to get current user from both clients
        const { data: { user: serverUser }, error: serverUserError } = await supabaseServer.auth.getUser();
        const { data: { user: routeUser }, error: routeUserError } = await supabaseRoute.auth.getUser();
        
        // console.log('Auth client comparison:', {
        //     serverUser: !!serverUser,
        //     routeUser: !!routeUser,
        //     serverUserError: serverUserError?.message,
        //     routeUserError: routeUserError?.message
        // });
        
        let user = routeUser || serverUser;
        let supabase = routeUser ? supabaseRoute : supabaseServer;
        
        if (!user) {
            if (debugMode) {
                // If debug mode and no authenticated user, return debug info
                const { data: allUsers, error: allUsersError } = await supabase
                    .from('users')
                    .select('id, email, name, phone, avatar_url, updated_at');
                
                return NextResponse.json({ 
                    error: 'No authenticated user found',
                    debugMode: true,
                    debug: {
                        serverUserError: serverUserError?.message,
                        routeUserError: routeUserError?.message,
                        allUsersCount: allUsers?.length || 0,
                        allUsers: allUsers || []
                    }
                });
            } else {
                // Normal mode - just return auth required
                return NextResponse.json({ 
                    error: 'Authentication required to sync user data',
                    code: 'NOT_AUTHENTICATED'
                }, { status: 401 });
            }
        }
        
        // console.log('📊 Syncing user data for:', user.email);
        
        // Get user from auth
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
        
        // Check if user exists in public.users table
        const { data: existingUser, error: fetchError } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single();
        
        let result;
        
        if (existingUser) {
            // Update existing user
            const { error: updateError } = await supabase
                .from('users')
                .update({
                    email: userData.email,
                    name: userData.name || existingUser.name,
                    avatar_url: userData.avatar_url || existingUser.avatar_url,
                    phone: userData.phone || existingUser.phone,
                    updated_at: userData.updated_at
                })
                .eq('id', user.id);
            
            if (updateError) {
                // console.error('❌ Error updating user:', updateError);
                throw updateError;
            }
            
            result = { action: 'updated', user: userData };
        } else {
            // Insert new user
            const { error: insertError } = await supabase
                .from('users')
                .insert(userData);
            
            if (insertError) {
                // console.error('❌ Error inserting user:', insertError);
                throw insertError;
            }
            
            result = { action: 'created', user: userData };
        }
        
        // Get updated user data
        const { data: updatedUser, error: refetchError } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single();
        
        // console.log('✅ User sync completed successfully');
        
        return NextResponse.json({
            success: true,
            result: result.action,
            userData: updatedUser,
            authData: {
                email: user.email,
                metadata: user.user_metadata
            }
        });
        
    } catch (error) {
        // console.error('❌ User sync API error:', error);
        return NextResponse.json({ 
            error: 'Failed to sync user data',
            details: error.message 
        }, { status: 500 });
    }
}
