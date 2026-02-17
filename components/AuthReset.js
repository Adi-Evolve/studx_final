'use client';

import { useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

export default function AuthReset() {
    const [isResetting, setIsResetting] = useState(false);
    const supabase = createSupabaseBrowserClient();

    const resetAuth = async () => {
        setIsResetting(true);
        try {
            // Sign out completely
            await supabase.auth.signOut();
            
            // Clear all relevant cookies and local storage
            document.cookie.split(";").forEach((c) => {
                const eqPos = c.indexOf("=");
                const name = eqPos > -1 ? c.substr(0, eqPos) : c;
                document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
                document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=" + window.location.hostname;
            });
            
            // Clear local and session storage
            if (typeof window !== 'undefined') {
                localStorage.clear();
                sessionStorage.clear();
            }
            
            // Force reload
            window.location.href = '/';
        } catch (error) {
            // console.error('Reset failed:', error);
        } finally {
            setIsResetting(false);
        }
    };

    return (
        <div className="fixed bottom-20 right-4 bg-red-600 text-white p-3 rounded text-xs z-50">
            <h3 className="font-bold mb-2">Auth Issues?</h3>
            <button 
                onClick={resetAuth}
                disabled={isResetting}
                className="bg-red-800 text-white px-3 py-1 rounded text-xs hover:bg-red-900 disabled:opacity-50"
            >
                {isResetting ? 'Resetting...' : 'Reset Auth'}
            </button>
        </div>
    );
}
