'use client';

import { useState, useEffect } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

export default function AuthTestPage() {
    const [authState, setAuthState] = useState({
        loading: true,
        user: null,
        session: null,
        error: null
    });

    const supabase = createSupabaseBrowserClient();

    useEffect(() => {
        const checkAuth = async () => {
            console.log('🔍 Testing authentication...');
            try {
                const { data: { session }, error } = await supabase.auth.getSession();
                
                console.log('Session data:', {
                    hasSession: !!session,
                    hasUser: !!session?.user,
                    userEmail: session?.user?.email,
                    accessToken: session?.access_token ? 'Present' : 'Missing',
                    refreshToken: session?.refresh_token ? 'Present' : 'Missing',
                    error: error?.message
                });

                setAuthState({
                    loading: false,
                    user: session?.user || null,
                    session: session,
                    error: error
                });
            } catch (err) {
                console.error('Auth check failed:', err);
                setAuthState({
                    loading: false,
                    user: null,
                    session: null,
                    error: err
                });
            }
        };

        checkAuth();
    }, [supabase]);

    const testApiCall = async () => {
        console.log('🧪 Testing API call...');
        
        try {
            // First test the test endpoint
            const testResponse = await fetch('/api/test-auth', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    test: true
                })
            });

            const testResult = await testResponse.json();
            console.log('Test API Response:', testResult);

            // Then test the sell endpoint
            const response = await fetch('/api/sell', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    test: true,
                    formType: 'notes'
                })
            });

            const result = await response.json();
            
            console.log('Sell API Response:', {
                status: response.status,
                ok: response.ok,
                result: result
            });

            if (!response.ok) {
                alert(`API Error: ${result.error || 'Unknown error'}\nDetails: ${result.details || 'No details'}`);
            } else {
                alert('API call successful!');
            }
        } catch (error) {
            console.error('API call failed:', error);
            alert(`API call failed: ${error.message}`);
        }
    };

    if (authState.loading) {
        return <div className="p-8">Loading authentication state...</div>;
    }

    return (
        <div className="p-8 max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Authentication Test</h1>
            
            <div className="bg-gray-100 p-4 rounded-lg mb-6">
                <h2 className="text-lg font-semibold mb-2">Auth State:</h2>
                <pre className="text-sm overflow-x-auto">
                    {JSON.stringify({
                        authenticated: !!authState.user,
                        userEmail: authState.user?.email,
                        userId: authState.user?.id,
                        hasSession: !!authState.session,
                        error: authState.error?.message
                    }, null, 2)}
                </pre>
            </div>

            <div className="space-y-4">
                <button
                    onClick={testApiCall}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                    Test API Call
                </button>

                <div className="text-sm text-gray-600">
                    <p>• If you see "authenticated: true", the auth fix should work</p>
                    <p>• If you see "authenticated: false", you need to log in</p>
                    <p>• Click "Test API Call" to check if the API receives the session</p>
                </div>
            </div>
        </div>
    );
}
