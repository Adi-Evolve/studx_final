// Location utility functions for distance calculation and user location detection

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {number} lat1 - Latitude of first point
 * @param {number} lng1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lng2 - Longitude of second point
 * @returns {number} Distance in kilometers
 */
export const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in km
};

/**
 * Get user's current location using browser geolocation API
 * @returns {Promise<{lat: number, lng: number}>} User's coordinates
 */
export const getUserLocation = () => {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation is not supported by this browser'));
            return;
        }
        
        const options = {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000 // 5 minutes cache
        };
        
        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                });
            },
            (error) => {
                let errorMessage = 'Unable to retrieve location';
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = 'Location access denied by user';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = 'Location information unavailable';
                        break;
                    case error.TIMEOUT:
                        errorMessage = 'Location request timed out';
                        break;
                }
                reject(new Error(errorMessage));
            },
            options
        );
    });
};

/**
 * Format distance for display
 * @param {number} distance - Distance in kilometers
 * @returns {string} Formatted distance string
 */
export const formatDistance = (distance) => {
    if (distance < 1) {
        return `${Math.round(distance * 1000)}m away`;
    } else if (distance < 10) {
        return `${distance.toFixed(1)}km away`;
    } else {
        return `${Math.round(distance)}km away`;
    }
};

/**
 * Check if location data is valid
 * @param {Object} location - Location object from database
 * @returns {boolean} True if location is valid
 */
export const isValidLocation = (location) => {
    return (
        location &&
        typeof location === 'object' &&
        typeof location.lat === 'number' &&
        typeof location.lng === 'number' &&
        location.lat >= -90 && location.lat <= 90 &&
        location.lng >= -180 && location.lng <= 180
    );
};

/**
 * Store user location in localStorage
 * @param {Object} location - User's location {lat, lng}
 */
export const storeUserLocation = (location) => {
    try {
        localStorage.setItem('userLocation', JSON.stringify({
            ...location,
            timestamp: Date.now()
        }));
    } catch (error) {
        // console.warn('Failed to store user location:', error);
    }
};

/**
 * Get stored user location from localStorage
 * @returns {Object|null} Stored location or null if not found/expired
 */
export const getStoredUserLocation = () => {
    try {
        const stored = localStorage.getItem('userLocation');
        if (!stored) return null;
        
        const parsed = JSON.parse(stored);
        const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
        
        // Return null if location is older than 5 minutes
        if (parsed.timestamp < fiveMinutesAgo) {
            localStorage.removeItem('userLocation');
            return null;
        }
        
        return {
            lat: parsed.lat,
            lng: parsed.lng
        };
    } catch (error) {
        // console.warn('Failed to get stored user location:', error);
        return null;
    }
};

/**
 * Distance filter options
 */
export const DISTANCE_FILTERS = [
    { value: 'all', label: 'All Distances', maxDistance: null },
    { value: '1km', label: 'Within 1 km', maxDistance: 1 },
    { value: '5km', label: 'Within 5 km', maxDistance: 5 },
    { value: '10km', label: 'Within 10 km', maxDistance: 10 },
    { value: '25km', label: 'Within 25 km', maxDistance: 25 },
    { value: '50km', label: 'Within 50 km', maxDistance: 50 },
    { value: 'city', label: 'Same City', maxDistance: 100 }
];

/**
 * Get items within specified distance from user location
 * @param {Array} items - Array of items with location data
 * @param {Object} userLocation - User's location {lat, lng}
 * @param {number} maxDistance - Maximum distance in km (null for no limit)
 * @returns {Array} Filtered and sorted items with distance
 */
export const filterItemsByDistance = (items, userLocation, maxDistance = null) => {
    if (!userLocation || !items) return items;
    
    const itemsWithDistance = items
        .map(item => {
            if (!isValidLocation(item.location)) {
                return { ...item, distance: null };
            }
            
            const distance = calculateDistance(
                userLocation.lat,
                userLocation.lng,
                item.location.lat,
                item.location.lng
            );
            
            return { ...item, distance };
        })
        .filter(item => {
            // Keep items without location or within distance
            if (item.distance === null) return true;
            if (maxDistance === null) return true;
            return item.distance <= maxDistance;
        })
        .sort((a, b) => {
            // Sort by distance (items without location go to end)
            if (a.distance === null && b.distance === null) return 0;
            if (a.distance === null) return 1;
            if (b.distance === null) return -1;
            return a.distance - b.distance;
        });
    
    return itemsWithDistance;
};
