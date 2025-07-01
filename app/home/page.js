'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
    const router = useRouter();
    
    useEffect(() => {
        // Immediately redirect to the root page
        router.replace('/');
    }, [router]);

    // Return null or a loading state while redirecting
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-gray-900 flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-4"></div>
                <p className="text-slate-600 dark:text-gray-300">Redirecting...</p>
            </div>
        </div>
    );
}
