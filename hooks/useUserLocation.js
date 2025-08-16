'use client';

import { useState, useEffect } from 'react';
import { getUserLocation, storeUserLocation, getStoredUserLocation } from '@/lib/locationUtils';

/**
 * Custom hook for managing user location state
 * @returns {Object} Location state and functions
 */
export const useUserLocation = () => {
    const [userLocation, setUserLocation] = useState(null);
    const [locationLoading, setLocationLoading] = useState(false);
    const [locationError, setLocationError] = useState(null);
    const [locationPermission, setLocationPermission] = useState('prompt'); // 'granted', 'denied', 'prompt'

    // Check for stored location on mount
    useEffect(() => {
        const stored = getStoredUserLocation();
        if (stored) {
            setUserLocation(stored);
            setLocationPermission('granted');
        }
    }, []);

    /**
     * Request user location permission and get coordinates
     */
    const requestLocation = async () => {
        setLocationLoading(true);
        setLocationError(null);

        try {
            const location = await getUserLocation();
            setUserLocation(location);
            setLocationPermission('granted');
            storeUserLocation(location);
            // console.log('📍 User location obtained:', location);
        } catch (error) {
            setLocationError(error.message);
            setLocationPermission('denied');
            // console.error('❌ Location error:', error);
        } finally {
            setLocationLoading(false);
        }
    };

    /**
     * Clear stored location and reset state
     */
    const clearLocation = () => {
        setUserLocation(null);
        setLocationPermission('prompt');
        setLocationError(null);
        try {
            localStorage.removeItem('userLocation');
        } catch (error) {
            // console.warn('Failed to clear stored location:', error);
        }
    };

    return {
        userLocation,
        locationLoading,
        locationError,
        locationPermission,
        requestLocation,
        clearLocation,
        hasLocation: !!userLocation
    };
};
