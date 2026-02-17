'use client';

import dynamic from 'next/dynamic';

// Define the dynamically imported Leaflet Maps component (Free alternative to Google Maps)
const LeafletLocationMap = dynamic(
    () => import('./LeafletLocationMap'),
    { 
        loading: () => (
            <div className="h-full bg-gray-200 dark:bg-gray-800 rounded-lg flex justify-center items-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-2"></div>
                    <p className="text-gray-600 dark:text-gray-400">Loading map...</p>
                </div>
            </div>
        ),
        ssr: false // Prevent server-side rendering
    }
);

export default function MapDisplay({ location, popupText }) {
    // Destructure lat and lng from the location object
    const { lat, lng, lon } = location || {};
    const longitude = lng || lon;

    // Only render the map if we have valid coordinates
    if (typeof lat !== 'number' || typeof longitude !== 'number') {
        return (
            <div className="h-full bg-gray-100 dark:bg-gray-800 rounded-lg flex justify-center items-center text-gray-500 dark:text-gray-400">
                <div className="text-center p-4">
                    <svg className="w-12 h-12 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                    <p>Location data not available.</p>
                </div>
            </div>
        );
    }

    // Render the dynamically loaded Leaflet Maps component
    return (
        <div className="w-full h-full">
            <LeafletLocationMap lat={lat} lng={longitude} popupText={popupText} />
        </div>
    );
}

