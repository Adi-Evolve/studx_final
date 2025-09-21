'use client';

import dynamic from 'next/dynamic';

// Define the dynamically imported Google Maps component
const GoogleLocationMap = dynamic(
    () => import('./GoogleLocationMap'),
    { 
        loading: () => <div className="h-full bg-gray-200 dark:bg-gray-800 rounded-lg flex justify-center items-center">Loading map...</div>,
        ssr: false // Prevent server-side rendering
    }
);

export default function MapDisplay({ location, popupText }) {
    // Destructure lat and lng from the location object
    const { lat, lng, lon } = location || {};
    const longitude = lng || lon;

    // Only render the map if we have valid coordinates
    if (typeof lat !== 'number' || typeof longitude !== 'number') {
        return <div className="h-full bg-gray-100 dark:bg-gray-800 rounded-lg flex justify-center items-center text-gray-500 dark:text-gray-400">Location data not available.</div>;
    }

    // Render the dynamically loaded Google Maps component
    return (
        <div className="w-full h-full">
            <GoogleLocationMap lat={lat} lng={longitude} popupText={popupText} />
        </div>
    );
}
