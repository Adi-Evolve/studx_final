'use client';

import { useEffect, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

export default function AuthDebugger() {
    const [authState, setAuthState] = useState({
        user: null,
        session: null,
        loading: true,
        error: null
    });

    const supabase = createSupabaseBrowserClient();

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();
                const { data: { user }, error: userError } = await supabase.auth.getUser();
                
                setAuthState({
                    user,
                    session,
                    loading: false,
                    error: sessionError || userError
                });
            } catch (error) {
                setAuthState({
                    user: null,
                    session: null,
                    loading: false,
                    error
                });
            }
        };

        checkAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            // console.log('Auth state change:', event, session?.user?.email);
            setAuthState({
                user: session?.user || null,
                session,
                loading: false,
                error: null
            });
        });

        return () => subscription.unsubscribe();
    }, [supabase]);

    if (authState.loading) {
        return <div>Loading auth...</div>;
    }

    return (
        <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded text-xs max-w-xs z-50">
            <h3 className="font-bold mb-2">Auth Debug</h3>
            <p><strong>User:</strong> {authState.user ? authState.user.email : 'None'}</p>
            <p><strong>Session:</strong> {authState.session ? 'Active' : 'None'}</p>
            {authState.error && (
                <p className="text-red-400"><strong>Error:</strong> {authState.error.message}</p>
            )}
        </div>
    );
}
