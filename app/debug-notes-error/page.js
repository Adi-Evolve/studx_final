'use client';

import { useState, useEffect } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

export default function ReplicateNotesError() {
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState(null);
    const [accessToken, setAccessToken] = useState(null);
    
    const supabase = createSupabaseBrowserClient();

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const { data: { user }, error } = await supabase.auth.getUser();
                const { data: { session } } = await supabase.auth.getSession();
                setUser(user);
                setAccessToken(session?.access_token);
            } catch (error) {
                // console.error('Auth error:', error);
            }
        };
        checkAuth();
    }, [supabase.auth]);

    const replicateError = async () => {
        setLoading(true);
        try {
            // Create the exact same FormData as the NotesForm
            const data = new FormData();
            
            // Add all required fields
            data.append('formType', 'notes');
            data.append('title', 'Test Note Debug');
            data.append('college', 'Test College');
            data.append('academic_year', '2024');
            data.append('subject', 'Test Subject');
            data.append('category', 'Notes');
            data.append('price', '99');
            data.append('description', 'Test description');
            
            // Add empty files arrays (to match the form)
            data.append('images', new File([], ''));
            data.append('pdfs', new File([], ''));
            
            // console.log('🔍 Sending request with FormData, user:', user?.email);
            
            const headers = {
                ...(accessToken && { 'Authorization': `Bearer ${accessToken}` })
            };
            
            const response = await fetch('/api/sell', {
                method: 'POST',
                headers: headers,
                body: data,
                credentials: 'include'
            });
            
            let responseData;
            try {
                responseData = await response.json();
            } catch (e) {
                responseData = { error: 'Failed to parse response', rawResponse: await response.text() };
            }
            
            setResult({ 
                status: response.status,
                statusText: response.statusText,
                data: responseData
            });
            
        } catch (error) {
            setResult({ error: error.message });
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return <div style={{ padding: '20px' }}>Please log in first to test</div>;
    }

    return (
        <div style={{ padding: '20px' }}>
            <h1>Replicate Notes Error</h1>
            <p>User: {user.email}</p>
            <p>Access Token: {accessToken ? 'Present' : 'Missing'}</p>
            
            <button onClick={replicateError} disabled={loading}>
                {loading ? 'Testing...' : 'Replicate Exact Notes Form Error'}
            </button>
            
            {result && (
                <div style={{ marginTop: '20px' }}>
                    <h3>Result:</h3>
                    <pre style={{ background: '#f0f0f0', padding: '10px', fontSize: '12px' }}>
                        {JSON.stringify(result, null, 2)}
                    </pre>
                </div>
            )}
        </div>
    );
}
