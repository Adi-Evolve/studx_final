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
                const redirectUrl = isProduction
                    ? `https://studxchange.vercel.app${next}`
                    : `http://localhost:1501${next}`;
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
    const errorRedirect = isProduction
        ? 'https://studxchange.vercel.app/auth/auth-code-error'
        : 'http://localhost:1501/auth/auth-code-error';
    // console.log('🔗 Error redirect to:', errorRedirect, { host, isProduction });
    return NextResponse.redirect(errorRedirect);
}
