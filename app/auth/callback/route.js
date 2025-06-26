import { createSupabaseServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get('code');
    const next = searchParams.get('next') ?? '/home';

    if (code) {
        const supabase = createSupabaseServerClient();
        
        try {
            const { error } = await supabase.auth.exchangeCodeForSession(code);
            
            if (!error) {
                // Determine redirect URL based on environment
                const isLocalhost = request.headers.get('host')?.includes('localhost') || 
                                  request.headers.get('host')?.includes('127.0.0.1');
                
                const redirectUrl = isLocalhost 
                    ? `http://localhost:1501${next}`
                    : `${origin}${next}`;
                
                return NextResponse.redirect(redirectUrl);
            }
        } catch (error) {
            console.error('Auth callback error:', error);
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
