'use client';

import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        // Log error details
        console.error('ErrorBoundary caught an error:', error, errorInfo);
        this.setState({
            error: error,
            errorInfo: errorInfo
        });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-slate-50 dark:bg-gray-900 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 max-w-lg w-full">
                        <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
                            Something went wrong
                        </h2>
                        <p className="text-slate-600 dark:text-gray-300 mb-4">
                            We encountered an unexpected error. Please try refreshing the page.
                        </p>
                        <details className="mb-4">
                            <summary className="cursor-pointer text-sm text-slate-500 dark:text-gray-400">
                                Error details
                            </summary>
                            <pre className="mt-2 text-xs bg-slate-100 dark:bg-gray-700 p-2 rounded overflow-auto">
                                {this.state.error && this.state.error.toString()}
                                <br />
                                {this.state.errorInfo.componentStack}
                            </pre>
                        </details>
                        <button 
                            onClick={() => window.location.reload()} 
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
                        >
                            Refresh Page
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
