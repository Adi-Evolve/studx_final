// Location-based search utilities
export class LocationService {
    constructor() {
        this.userLocation = null;
    }

    // Get user's current location
    async getUserLocation() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation is not supported by this browser.'));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    this.userLocation = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        accuracy: position.coords.accuracy
                    };
                    resolve(this.userLocation);
                },
                (error) => {
                    let errorMessage = 'Unable to retrieve location.';
                    switch(error.code) {
                        case error.PERMISSION_DENIED:
                            errorMessage = 'Location access denied by user.';
                            break;
                        case error.POSITION_UNAVAILABLE:
                            errorMessage = 'Location information is unavailable.';
                            break;
                        case error.TIMEOUT:
                            errorMessage = 'Location request timed out.';
                            break;
                    }
                    reject(new Error(errorMessage));
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 600000 // 10 minutes
                }
            );
        });
    }

    // Calculate distance between two points (Haversine formula)
    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Radius of the Earth in kilometers
        const dLat = this.deg2rad(lat2 - lat1);
        const dLon = this.deg2rad(lon2 - lon1);
        const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const distance = R * c; // Distance in kilometers
        return distance;
    }

    deg2rad(deg) {
        return deg * (Math.PI/180);
    }

    // Format distance for display
    formatDistance(distance) {
        if (distance < 1) {
            return `${Math.round(distance * 1000)}m away`;
        } else if (distance < 10) {
            return `${distance.toFixed(1)}km away`;
        } else {
            return `${Math.round(distance)}km away`;
        }
    }

    // Filter items by distance
    filterByDistance(items, maxDistance = 50) {
        if (!this.userLocation) {
            return items;
        }

        return items
            .map(item => {
                if (item.location && item.location.lat && item.location.lng) {
                    const distance = this.calculateDistance(
                        this.userLocation.latitude,
                        this.userLocation.longitude,
                        item.location.lat,
                        item.location.lng
                    );
                    return { ...item, distance };
                }
                return { ...item, distance: null };
            })
            .filter(item => item.distance === null || item.distance <= maxDistance)
            .sort((a, b) => {
                if (a.distance === null) return 1;
                if (b.distance === null) return -1;
                return a.distance - b.distance;
            });
    }

    // Get location suggestions for search
    async getLocationSuggestions(query) {
        // You can integrate with Google Places API or similar
        // For now, we'll use a simple local implementation
        const commonPlaces = [
            'Near Campus',
            'Student Housing',
            'Library Area',
            'Dormitory',
            'Main Gate',
            'Cafeteria Area'
        ];

        return commonPlaces.filter(place => 
            place.toLowerCase().includes(query.toLowerCase())
        );
    }
}

// React hook for location-based search
import { useState, useEffect } from 'react';

export function useLocationSearch() {
    const [locationService] = useState(() => new LocationService());
    const [userLocation, setUserLocation] = useState(null);
    const [locationError, setLocationError] = useState(null);
    const [locationLoading, setLocationLoading] = useState(false);

    const requestLocation = async () => {
        setLocationLoading(true);
        setLocationError(null);
        
        try {
            const location = await locationService.getUserLocation();
            setUserLocation(location);
            return location;
        } catch (error) {
            setLocationError(error.message);
            return null;
        } finally {
            setLocationLoading(false);
        }
    };

    const filterItemsByDistance = (items, maxDistance = 50) => {
        return locationService.filterByDistance(items, maxDistance);
    };

    const calculateDistance = (item) => {
        if (!userLocation || !item.location) return null;
        return locationService.calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            item.location.lat,
            item.location.lng
        );
    };

    const formatDistance = (distance) => {
        return locationService.formatDistance(distance);
    };

    return {
        userLocation,
        locationError,
        locationLoading,
        requestLocation,
        filterItemsByDistance,
        calculateDistance,
        formatDistance
    };
}
