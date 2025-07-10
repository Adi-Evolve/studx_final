'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function ProfileError({ error, reset }) {
    useEffect(() => {
        console.error('Profile page error:', error);
    }, [error]);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-gray-900 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 max-w-lg w-full text-center">
                <div className="text-6xl mb-4">👤</div>
                <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
                    Profile Error
                </h2>
                <p className="text-slate-600 dark:text-gray-300 mb-6">
                    We had trouble loading your profile. This might be due to authentication or database issues.
                </p>
                <div className="space-y-3">
                    <button
                        onClick={() => reset()}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors font-medium"
                    >
                        Try Again
                    </button>
                    <Link 
                        href="/login"
                        className="inline-block w-full bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors font-medium"
                    >
                        Sign In Again
                    </Link>
                    <Link 
                        href="/"
                        className="inline-block w-full bg-slate-200 hover:bg-slate-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-slate-700 dark:text-gray-300 px-6 py-3 rounded-lg transition-colors font-medium"
                    >
                        Go Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
