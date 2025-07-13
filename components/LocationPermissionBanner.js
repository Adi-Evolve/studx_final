'use client';

import { useState } from 'react';
import { useUserLocation } from '@/hooks/useUserLocation';

export default function LocationPermissionBanner() {
    const { 
        userLocation, 
        locationLoading, 
        locationError, 
        locationPermission,
        requestLocation,
        clearLocation 
    } = useUserLocation();
    
    const [dismissed, setDismissed] = useState(false);

    // Don't show banner if user has location, dismissed, or denied permission
    if (userLocation || dismissed || locationPermission === 'denied') {
        return null;
    }

    const handleRequestLocation = async () => {
        await requestLocation();
    };

    const handleDismiss = () => {
        setDismissed(true);
    };

    return (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-l-4 border-blue-400 dark:border-blue-500 p-4 mb-6 rounded-r-lg">
            <div className="flex items-start">
                <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400 dark:text-blue-300" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                </div>
                <div className="ml-3 flex-1">
                    <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                        Find items near you
                    </h3>
                    <div className="mt-1 text-sm text-blue-700 dark:text-blue-300">
                        <p>Allow location access to see listings sorted by distance and find items nearby.</p>
                    </div>
                    {locationError && (
                        <div className="mt-2 text-sm text-red-600 dark:text-red-400">
                            {locationError}
                        </div>
                    )}
                    <div className="mt-3 flex gap-3">
                        <button
                            onClick={handleRequestLocation}
                            disabled={locationLoading}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white text-sm font-medium rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {locationLoading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Getting location...
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    Enable Location
                                </>
                            )}
                        </button>
                        <button
                            onClick={handleDismiss}
                            className="inline-flex items-center px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                        >
                            Maybe Later
                        </button>
                    </div>
                </div>
                <div className="flex-shrink-0 ml-4">
                    <button
                        onClick={handleDismiss}
                        className="inline-flex text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 transition-colors"
                    >
                        <span className="sr-only">Close</span>
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}
