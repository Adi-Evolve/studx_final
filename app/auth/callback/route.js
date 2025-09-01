import { createSupabaseServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { validateEducationalEmail, checkSuspiciousEmail } from '@/lib/emailValidation';

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
                    // Validate educational email address for OAuth users
                    const emailValidation = validateEducationalEmail(user.email);
                    const suspiciousCheck = checkSuspiciousEmail(user.email);
                    
                    if (!emailValidation.isValid || suspiciousCheck.isSuspicious) {
                        // Sign out the user immediately
                        await supabase.auth.signOut();
                        
                        // Redirect to login with error message
                        const host = request.headers.get('host') || '';
                        const isProduction = host.includes('studxchange.vercel.app') || host.includes('studxchange.com');
                        
                        let baseUrl = `http://localhost:3001`;
                        if (host.includes('localhost:')) {
                            const port = host.split(':')[1];
                            baseUrl = `http://localhost:${port}`;
                        }
                        
                        const redirectUrl = isProduction
                            ? 'https://studxchange.vercel.app'
                            : baseUrl;
                        
                        const errorMessage = !emailValidation.isValid 
                            ? emailValidation.message 
                            : suspiciousCheck.message;
                        
                        const loginUrl = `${redirectUrl}/login?error=${encodeURIComponent(errorMessage)}`;
                        
                        console.log('❌ Educational email validation failed for OAuth user:', {
                            email: user.email,
                            error: errorMessage
                        });
                        
                        return NextResponse.redirect(loginUrl);
                    }
                    
                    console.log('✅ Educational email validation passed for OAuth user:', user.email);
                    // console.log('🔐 Auth callback: User authenticated:', user.email);
                    // Sync user data to public.users table
                    try {
                        // First check if user already exists in database to preserve phone number
                        const { data: existingUser, error: fetchError } = await supabase
                            .from('users')
                            .select('phone')
                            .eq('id', user.id)
                            .single();
                        // If user exists, preserve their phone number, otherwise use phone from auth
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
                            phone: existingUser?.phone ?? user.phone ?? null,
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString()
                        };
                        // console.log('📝 Syncing user data:', {
                        //     id: userData.id, 
                        //     email: userData.email, 
                        //     name: userData.name,
                        //     phone: userData.phone,
                        //     existingPhone: existingUser?.phone 
                        // });
                        // Use upsert to insert or update
                        const { data: syncResult, error: syncError } = await supabase
                            .from('users')
                            .upsert(userData, { 
                                onConflict: 'id',
                                ignoreDuplicates: false 
                            })
                            .select();
                        if (syncError) {
                            // console.error('❌ User sync error:', syncError);
                            // console.log('🔍 User data that failed:', userData);
                            // Try a direct insert as fallback
                            const { error: insertError } = await supabase
                                .from('users')
                                .insert(userData);
                            if (insertError) {
                                // console.error('❌ Fallback insert also failed:', insertError);
                            } else {
                                // console.log('✅ Fallback insert successful');
                            }
                        } else {
                            // console.log('✅ User sync successful:', syncResult?.[0]?.email);
                        }
                        // Verify the user exists in the table
                        const { data: verifyUser, error: verifyError } = await supabase
                            .from('users')
                            .select('id, email, name')
                            .eq('id', user.id)
                            .single();
                        if (verifyError) {
                            // console.error('❌ User verification failed:', verifyError);
                        } else {
                            // console.log('✅ User verified in database:', verifyUser.email);
                        }
                    } catch (syncError) {
                        // console.error('❌ Exception during user sync:', syncError);
                        // Don't fail auth if sync fails
                    }
                }
                // Always redirect to production after deployment
                const host = request.headers.get('host') || '';
                // If running on Vercel, always use production URL
                const isProduction = host.includes('studxchange.vercel.app') || host.includes('studxchange.com');
                
                // For local development, detect the current port
                let localUrl = `http://localhost:3001${next}`;  // Default to 3001
                if (host.includes('localhost:')) {
                    const port = host.split(':')[1];
                    localUrl = `http://localhost:${port}${next}`;
                }
                
                const redirectUrl = isProduction
                    ? `https://studxchange.vercel.app${next}`
                    : localUrl;
                    
                // console.log('🔗 Redirecting to:', redirectUrl, { host, isProduction });
                return NextResponse.redirect(redirectUrl);
            }
        } catch (error) {
            // console.error('Auth callback error:', error);
        }
    }

    // Fallback redirect on error
    const host = request.headers.get('host') || '';
    const isProduction = host.includes('studxchange.vercel.app') || host.includes('studxchange.com');
    
    // For local development, detect the current port
    let localErrorUrl = 'http://localhost:3001/auth/auth-code-error';  // Default to 3001
    if (host.includes('localhost:')) {
        const port = host.split(':')[1];
        localErrorUrl = `http://localhost:${port}/auth/auth-code-error`;
    }
    
    const errorRedirect = isProduction
        ? 'https://studxchange.vercel.app/auth/auth-code-error'
        : localErrorUrl;
        
    // console.log('🔗 Error redirect to:', errorRedirect, { host, isProduction });
    return NextResponse.redirect(errorRedirect);
}
