/**
 * Google Maps Enhanced Location Service
 * Provides more accurate location detection than browser's geolocation API
 */

// Enhanced location detection with multiple fallback methods
export class GoogleMapsLocationService {
    constructor(apiKey = null) {
        this.apiKey = apiKey;
        this.isGoogleMapsLoaded = false;
    }

    /**
     * Get user's current location using multiple methods for maximum accuracy
     * @returns {Promise<{lat: number, lng: number, accuracy: number, method: string}>}
     */
    async getCurrentLocation() {
        // console.log('[GoogleMapsLocationService] Starting location detection...');
        
        try {
            // Method 1: Try Google Maps Geolocation API (most accurate)
            if (this.apiKey) {
                const googleResult = await this.getLocationViaGoogleMaps();
                if (googleResult) {
                    // console.log('[GoogleMapsLocationService] Using Google Maps API');
                    return { ...googleResult, method: 'Google Maps API' };
                }
            }

            // Method 2: Enhanced browser geolocation with high accuracy
            const browserResult = await this.getEnhancedBrowserLocation();
            if (browserResult) {
                // console.log('[GoogleMapsLocationService] Using enhanced browser geolocation');
                return { ...browserResult, method: 'Enhanced Browser GPS' };
            }

            // Method 3: IP-based location (least accurate but always available)
            const ipResult = await this.getLocationViaIP();
            // console.log('[GoogleMapsLocationService] Using IP-based location');
            return { ...ipResult, method: 'IP-based Location' };

        } catch (error) {
            // console.error('[GoogleMapsLocationService] All location methods failed:', error);
            throw new Error('Unable to determine your location. Please enable location services or enter your location manually.');
        }
    }

    /**
     * Get location using Google Maps Geolocation API (requires API key)
     */
    async getLocationViaGoogleMaps() {
        if (!this.apiKey) return null;

        try {
            // Use server-side API to avoid exposing API key in client
            const response = await fetch('/api/enhanced-location', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    method: 'google_geolocation',
                    wifiAccessPoints: [],
                    cellTowers: []
                })
            });

            if (!response.ok) {
                // console.warn('[GoogleMapsLocationService] Server-side Google API failed:', response.status);
                return null;
            }

            const data = await response.json();
            
            if (data.success) {
                return {
                    lat: data.lat,
                    lng: data.lng,
                    accuracy: data.accuracy || 1000
                };
            }
        } catch (error) {
            // console.warn('[GoogleMapsLocationService] Server-side Google API error:', error);
        }

        return null;
    }

    /**
     * Enhanced browser geolocation with optimized settings
     */
    async getEnhancedBrowserLocation() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation not supported'));
                return;
            }

            // Enhanced options for better accuracy
            const options = {
                enableHighAccuracy: true,    // Use GPS if available
                timeout: 20000,              // Wait up to 20 seconds
                maximumAge: 0               // Don't use cached location
            };

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude, accuracy } = position.coords;
                    // console.log(`[GoogleMapsLocationService] Browser location: ${latitude}, ${longitude} (accuracy: ${accuracy}m)`);
                    
                    resolve({
                        lat: latitude,
                        lng: longitude,
                        accuracy: accuracy || 1000
                    });
                },
                (error) => {
                    // console.warn('[GoogleMapsLocationService] Browser geolocation failed:', error);
                    reject(error);
                },
                options
            );
        });
    }

    /**
     * Get approximate location using IP address
     */
    async getLocationViaIP() {
        try {
            // Use server-side API for better reliability and multiple fallback services
            const response = await fetch('/api/enhanced-location', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    method: 'ip_location'
                })
            });

            if (response.ok) {
                const data = await response.json();
                
                if (data.success) {
                    return {
                        lat: data.lat,
                        lng: data.lng,
                        accuracy: data.accuracy || 5000,
                        city: data.city || 'Unknown',
                        country: data.country || 'Unknown'
                    };
                }
            }

            // Fallback to default location if server API fails
            // console.warn('[GoogleMapsLocationService] Server IP location failed, using default');
            return {
                lat: 20.5937,
                lng: 78.9629,
                accuracy: 50000, // Very low accuracy for default location
                city: 'Unknown',
                country: 'India'
            };
        } catch (error) {
            // console.error('[GoogleMapsLocationService] IP location failed:', error);
            
            // Fallback to a default location (India center)
            return {
                lat: 20.5937,
                lng: 78.9629,
                accuracy: 50000, // Very low accuracy for default location
                city: 'Unknown',
                country: 'India'
            };
        }
    }

    /**
     * Validate and improve location accuracy using reverse geocoding
     */
    async validateLocation(lat, lng) {
        try {
            // Use server-side API for validation
            const response = await fetch('/api/enhanced-location', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    method: 'validate_location',
                    lat,
                    lng
                })
            });

            if (response.ok) {
                const data = await response.json();
                
                if (data.success && data.isValid) {
                    return {
                        isValid: true,
                        address: data.address,
                        city: data.city || 'Unknown',
                        components: data.components
                    };
                }
            }

            return { isValid: false };
        } catch (error) {
            // console.warn('[GoogleMapsLocationService] Location validation failed:', error);
            return { isValid: false };
        }
    }

    /**
     * Format accuracy for user display
     */
    formatAccuracy(accuracy) {
        if (accuracy < 50) return `${Math.round(accuracy)}m - Very accurate`;
        if (accuracy < 100) return `${Math.round(accuracy)}m - Accurate`;
        if (accuracy < 1000) return `${Math.round(accuracy)}m - Good`;
        if (accuracy < 5000) return `${(accuracy / 1000).toFixed(1)}km - Fair`;
        return `${(accuracy / 1000).toFixed(1)}km - Approximate`;
    }

    /**
     * Get location with user-friendly status updates
     */
    async getCurrentLocationWithStatus(statusCallback) {
        try {
            if (statusCallback) statusCallback('Detecting your location...', 'loading');

            const location = await this.getCurrentLocation();
            const validation = await this.validateLocation(location.lat, location.lng);
            
            const accuracyText = this.formatAccuracy(location.accuracy);
            const methodText = location.method;
            
            if (statusCallback) {
                statusCallback(
                    `Location found using ${methodText} - ${accuracyText}`,
                    location.accuracy < 100 ? 'success' : 'warning'
                );
            }

            return {
                ...location,
                validation,
                accuracyText,
                methodText
            };
        } catch (error) {
            if (statusCallback) statusCallback(error.message, 'error');
            throw error;
        }
    }
}

// Export a default instance
export const googleMapsLocationService = new GoogleMapsLocationService(
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
);

// Export utility functions
export const getCurrentLocation = () => googleMapsLocationService.getCurrentLocation();
export const getCurrentLocationWithStatus = (callback) => googleMapsLocationService.getCurrentLocationWithStatus(callback);
