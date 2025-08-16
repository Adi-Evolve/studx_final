'use client';

import { useEffect } from 'react';

export default function Error({ error, reset }) {
    useEffect(() => {
        // Log the error to an error reporting service
        // console.error('Global error caught:', error);
    }, [error]);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-gray-900 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 max-w-lg w-full text-center">
                <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
                    Oops! Something went wrong
                </h2>
                <p className="text-slate-600 dark:text-gray-300 mb-6">
                    We encountered an unexpected error. Don't worry, it's not your fault!
                </p>
                <div className="space-y-3">
                    <button
                        onClick={() => reset()}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors font-medium"
                    >
                        Try Again
                    </button>
                    <button
                        onClick={() => window.location.href = '/'}
                        className="w-full bg-slate-200 hover:bg-slate-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-slate-700 dark:text-gray-300 px-6 py-3 rounded-lg transition-colors font-medium"
                    >
                        Go Home
                    </button>
                </div>
                {process.env.NODE_ENV === 'development' && (
                    <details className="mt-6 text-left">
                        <summary className="cursor-pointer text-sm text-slate-500 dark:text-gray-400">
                            Error details (development only)
                        </summary>
                        <pre className="mt-2 text-xs bg-slate-100 dark:bg-gray-700 p-3 rounded overflow-auto text-red-600 dark:text-red-400">
                            {error?.message || 'Unknown error'}
                        </pre>
                    </details>
                )}
            </div>
        </div>
    );
}
