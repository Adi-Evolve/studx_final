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
                    console.log('🔐 Auth callback: User authenticated:', user.email);
                    
                    // Sync user data to public.users table
                    try {
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
                        
                        console.log('📝 Syncing user data:', { id: userData.id, email: userData.email, name: userData.name });
                        
                        // Use upsert to insert or update
                        const { data: syncResult, error: syncError } = await supabase
                            .from('users')
                            .upsert(userData, { 
                                onConflict: 'id',
                                ignoreDuplicates: false 
                            })
                            .select();
                            
                        if (syncError) {
                            console.error('❌ User sync error:', syncError);
                            console.log('🔍 User data that failed:', userData);
                            
                            // Try a direct insert as fallback
                            const { error: insertError } = await supabase
                                .from('users')
                                .insert(userData);
                                
                            if (insertError) {
                                console.error('❌ Fallback insert also failed:', insertError);
                            } else {
                                console.log('✅ Fallback insert successful');
                            }
                        } else {
                            console.log('✅ User sync successful:', syncResult?.[0]?.email);
                        }
                        
                        // Verify the user exists in the table
                        const { data: verifyUser, error: verifyError } = await supabase
                            .from('users')
                            .select('id, email, name')
                            .eq('id', user.id)
                            .single();
                            
                        if (verifyError) {
                            console.error('❌ User verification failed:', verifyError);
                        } else {
                            console.log('✅ User verified in database:', verifyUser.email);
                        }
                        
                    } catch (syncError) {
                        console.error('❌ Exception during user sync:', syncError);
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
