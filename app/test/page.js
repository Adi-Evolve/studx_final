// Test component imports
import { Suspense } from 'react';

// Test FeaturedSlider import separately
async function TestPage() {
    try {
        // Test with empty data first
        const emptyData = [];
        
        return (
            <div className="p-8">
                <h1 className="text-2xl font-bold mb-4">Test Page</h1>
                <p>Testing component imports...</p>
                
                {/* Test with empty array first */}
                <div className="mt-4">
                    <h2 className="text-lg mb-2">Empty Featured Slider:</h2>
                    <p>Array length: {emptyData.length}</p>
                </div>
            </div>
        );
    } catch (error) {
        return (
            <div className="p-8">
                <h1 className="text-2xl font-bold mb-4 text-red-600">Error</h1>
                <p>Error: {error.message}</p>
            </div>
        );
    }
}

export default TestPage;
