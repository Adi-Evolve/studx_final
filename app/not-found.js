import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-gray-900 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 max-w-lg w-full text-center">
                <div className="text-6xl mb-4">🔍</div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">
                    Page Not Found
                </h2>
                <p className="text-slate-600 dark:text-gray-300 mb-6">
                    Sorry, we couldn't find the page you're looking for. It might have been moved or deleted.
                </p>
                <div className="space-y-3">
                    <Link 
                        href="/"
                        className="inline-block w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors font-medium"
                    >
                        Go Home
                    </Link>
                    <Link 
                        href="/sell"
                        className="inline-block w-full bg-slate-200 hover:bg-slate-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-slate-700 dark:text-gray-300 px-6 py-3 rounded-lg transition-colors font-medium"
                    >
                        Browse Listings
                    </Link>
                </div>
            </div>
        </div>
    );
}
