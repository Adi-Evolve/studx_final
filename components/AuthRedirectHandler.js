'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

export default function AuthRedirectHandler({ children }) {
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState(null);
    const router = useRouter();
    const supabase = createSupabaseBrowserClient();

    useEffect(() => {
        // Check if user has visited before
        const hasVisitedBefore = localStorage.getItem('studx_visited');
        
        // Get current auth state
        const checkAuth = async () => {
            try {
                const { data: { user }, error } = await supabase.auth.getUser();
                
                if (error) throw error;
                
                setUser(user);
                
                // If user is authenticated, redirect to home regardless of visit status
                if (user) {
                    router.replace('/');
                    return;
                }
                
                // If user is not authenticated but has visited before, 
                // still show landing page (they might have logged out)
                setIsLoading(false);
                
                // Mark as visited for future visits
                if (!hasVisitedBefore) {
                    localStorage.setItem('studx_visited', 'true');
                    localStorage.setItem('studx_first_visit_date', new Date().toISOString());
                }
                
            } catch (error) {
                // console.error('Auth check error:', error);
                setIsLoading(false);
            }
        };

        checkAuth();

        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (event === 'SIGNED_IN' && session?.user) {
                    // User just signed in, redirect to home
                    router.replace('/');
                } else if (event === 'SIGNED_OUT') {
                    // User signed out, they can stay on landing page
                    setUser(null);
                    setIsLoading(false);
                }
            }
        );

        return () => subscription.unsubscribe();
    }, [router, supabase.auth]);

    // Show loading spinner while checking auth
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary-600 to-accent-500 rounded-2xl flex items-center justify-center shadow-xl mb-4 mx-auto animate-pulse">
                        <svg viewBox="0 0 24 24" className="w-10 h-10 text-white" fill="currentColor">
                            <path d="M12 2L15.09 8.26L22 9L17 14L18.18 21L12 17.77L5.82 21L7 14L2 9L8.91 8.26L12 2Z"/>
                            <circle cx="12" cy="12" r="3" fill="rgba(255,255,255,0.3)"/>
                        </svg>
                    </div>
                    <h2 className="text-heading-2 font-display text-gray-900 mb-2">StudXchange</h2>
                    <div className="flex items-center justify-center space-x-1">
                        <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                </div>
            </div>
        );
    }

    // Render landing page for non-authenticated users
    return children;
}