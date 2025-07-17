'use client';

import { useState, useEffect } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

export default function TestUserCreation() {
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);
    
    const supabase = createSupabaseBrowserClient();

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const { data: { user }, error } = await supabase.auth.getUser();
                if (error) {
                    // console.error('Auth error:', error);
                    setUser(null);
                } else {
                    setUser(user);
                }
            } catch (error) {
                // console.error('Auth check error:', error);
                setUser(null);
            } finally {
                setAuthLoading(false);
            }
        };

        checkAuth();
    }, [supabase.auth]);

    const testUserCreation = async () => {
        setLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            
            const response = await fetch('/api/test-user-creation', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Authorization': `Bearer ${session?.access_token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            const data = await response.json();
            setResult(data);
        } catch (error) {
            setResult({ error: error.message });
        } finally {
            setLoading(false);
        }
    };

    if (authLoading) {
        return <div>Loading...</div>;
    }

    if (!user) {
        return <div>Please log in first</div>;
    }

    return (
        <div style={{ padding: '20px' }}>
            <h1>Test User Creation</h1>
            <p>User: {user.email}</p>
            
            <button onClick={testUserCreation} disabled={loading}>
                {loading ? 'Testing...' : 'Test User Creation & Note Insert'}
            </button>
            
            {result && (
                <div style={{ marginTop: '20px' }}>
                    <h3>Result:</h3>
                    <pre>{JSON.stringify(result, null, 2)}</pre>
                </div>
            )}
        </div>
    );
}
