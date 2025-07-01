import { createSupabaseServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');
    const next = searchParams.get('next') ?? '/';

    if (code) {
        const supabase = createSupabaseServerClient();
        
        try {
            const { error } = await supabase.auth.exchangeCodeForSession(code);
            
            if (!error) {
                // Get the current user after successful authentication
                const { data: { user }, error: userError } = await supabase.auth.getUser();
                
                if (user && !userError) {
                    // console.log('Auth callback: User authenticated:', user.email);
                    
                    // Sync user data to public.users table
                    try {
                        const { data: existingUser, error: fetchError } = await supabase
                            .from('users')
                            .select('*')
                            .eq('id', user.id)
                            .single();
                        
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
                                // console.error('Error updating user:', updateError);
                            } else {
                                // console.log('✅ User data updated successfully for:', user.email);
                            }
                        } else {
                            // Insert new user
                            const { error: insertError } = await supabase
                                .from('users')
                                .insert(userData);
                            
                            if (insertError) {
                                // console.error('Error inserting user:', insertError);
                            } else {
                                // console.log('✅ New user created successfully for:', user.email);
                            }
                        }
                    } catch (syncError) {
                        // console.error('Error syncing user data:', syncError);
                        // Don't fail auth if sync fails
                    }
                }
                
                // Determine redirect URL based on environment
                const isLocalhost = request.headers.get('host')?.includes('localhost') || 
                                  request.headers.get('host')?.includes('127.0.0.1');
                
                const redirectUrl = isLocalhost 
                    ? `http://localhost:1501${next}`
                    : `${origin}${next}`;
                
                return NextResponse.redirect(redirectUrl);
            }
        } catch (error) {
            // console.error('Auth callback error:', error);
        }
    }

    // Fallback redirect on error
    const isLocalhost = request.headers.get('host')?.includes('localhost') || 
                       request.headers.get('host')?.includes('127.0.0.1');
    
    const errorRedirect = isLocalhost 
        ? 'http://localhost:1501/auth/auth-code-error'
        : `${origin}/auth/auth-code-error`;
    
    return NextResponse.redirect(errorRedirect);
}
