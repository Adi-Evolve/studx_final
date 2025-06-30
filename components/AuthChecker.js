// AuthChecker.js - Add this to debug authentication
'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useEffect, useState } from 'react';

export default function AuthChecker() {
    const [authStatus, setAuthStatus] = useState('checking...');
    const supabase = createClientComponentClient();

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const { data: { session }, error } = await supabase.auth.getSession();
            // console.log('Client Auth Check:', {
            //     hasSession: !!session,
            //     userId: session?.user?.id,
            //     email: session?.user?.email,
            //     error: error
            // });
            
            if (error) {
                setAuthStatus(`Error: ${error.message}`);
            } else if (session) {
                setAuthStatus(`Authenticated as: ${session.user.email}`);
            } else {
                setAuthStatus('Not authenticated');
            }
        } catch (err) {
            // console.error('Auth check failed:', err);
            setAuthStatus(`Failed: ${err.message}`);
        }
    };

    return (
        <div style={{ 
            background: '#f3f4f6', 
            padding: '10px', 
            border: '1px solid #ccc', 
            borderRadius: '5px',
            margin: '10px',
            fontSize: '12px'
        }}>
            <strong>Auth Status:</strong> {authStatus}
            <button 
                onClick={checkAuth}
                style={{ marginLeft: '10px', padding: '2px 8px', fontSize: '10px' }}
            >
                Refresh
            </button>
        </div>
    );
}
