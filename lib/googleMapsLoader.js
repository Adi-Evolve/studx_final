'use client';

import pkg from '@googlemaps/js-api-loader';
const { Loader } = pkg;

// Global Google Maps loader instance to prevent conflicts
let globalLoader = null;
let googleMapsPromise = null;

export const getGoogleMapsLoader = () => {
    if (!globalLoader) {
        globalLoader = new Loader({
            apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'AIzaSyBWliYbQUM08KHDigAiP7ARtsYcoGC74tM',
            version: 'weekly',
            libraries: ['places', 'geometry']
        });
    }
    return globalLoader;
};

export const loadGoogleMaps = () => {
    if (!googleMapsPromise) {
        const loader = getGoogleMapsLoader();
        googleMapsPromise = loader.load();
    }
    return googleMapsPromise;
};