'use client';

import { useState, useEffect, useRef } from 'react';
import { loadGoogleMaps } from '../lib/googleMapsLoader';

export default function GoogleLocationMap({ lat, lng, popupText }) {
    const [isMapLoaded, setIsMapLoaded] = useState(false);
    const [error, setError] = useState(null);
    const mapRef = useRef(null);

    useEffect(() => {
        if (typeof window === 'undefined' || !lat || !lng) {
            return;
        }

        const initializeMap = async () => {
            try {
                const google = await loadGoogleMaps();
                
                if (!mapRef.current) return;

                const position = { lat: parseFloat(lat), lng: parseFloat(lng) };

                const mapInstance = new google.maps.Map(mapRef.current, {
                    center: position,
                    zoom: 15,
                    mapTypeControl: false,
                    streetViewControl: false,
                    fullscreenControl: false,
                    zoomControl: true,
                    gestureHandling: 'cooperative',
                    styles: [
                        {
                            featureType: 'poi',
                            elementType: 'labels',
                            stylers: [{ visibility: 'off' }]
                        }
                    ]
                });

                const marker = new google.maps.Marker({
                    position: position,
                    map: mapInstance,
                    title: popupText || 'Location',
                    animation: google.maps.Animation.DROP
                });

                if (popupText) {
                    const infoWindow = new google.maps.InfoWindow({
                        content: `<div style="padding: 8px; font-family: system-ui; font-size: 14px;">${popupText}</div>`
                    });

                    marker.addListener('click', () => {
                        infoWindow.open(mapInstance, marker);
                    });
                }

                setIsMapLoaded(true);

            } catch (error) {
                console.error('Error loading Google Maps:', error);
                setError('Failed to load map');
            }
        };

        initializeMap();
    }, [lat, lng, popupText]);

    if (typeof window === 'undefined') {
        return null; // Don't render on the server
    }

    if (!lat || !lng) {
        return (
            <div className="h-full bg-gray-100 dark:bg-gray-800 rounded-lg flex justify-center items-center text-gray-500 dark:text-gray-400">
                Location coordinates not available
            </div>
        );
    }

    if (error) {
        return (
            <div className="h-full bg-gray-100 dark:bg-gray-800 rounded-lg flex justify-center items-center text-red-500">
                {error}
            </div>
        );
    }

    return (
        <div className="relative w-full h-full overflow-hidden rounded-lg">
            {!isMapLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 z-10">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mx-auto mb-2"></div>
                        <p className="text-gray-600 dark:text-gray-400">Loading map...</p>
                    </div>
                </div>
            )}
            <div 
                ref={mapRef} 
                className="w-full h-full rounded-lg"
                style={{ 
                    minHeight: '300px',
                    display: isMapLoaded ? 'block' : 'none'
                }}
            />
        </div>
    );
}