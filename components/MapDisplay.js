'use client';

import dynamic from 'next/dynamic';

// Define the dynamically imported component at the top level of the module.
// This is the standard and recommended practice for Next.js.
const LocationMap = dynamic(
    () => import('./LocationMap'),
    { 
        loading: () => <div style={{height: '400px', background: '#e0e0e0', borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>Loading map...</div>,
        ssr: false // This is the key to preventing server-side rendering
    }
);

export default function MapDisplay({ location, popupText }) {
    // Destructure lat and lng from the location object
    const { lat, lng, lon } = location || {};
    const longitude = lng || lon;

    // Only render the map if we have valid coordinates
    if (typeof lat !== 'number' || typeof longitude !== 'number') {
        return <div style={{height: '400px', background: '#f0f0f0', borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#666'}}>Location data not available.</div>;
    }

    // Render the dynamically loaded map with the correct props
    return <LocationMap lat={lat} lng={longitude} popupText={popupText} />;
}
