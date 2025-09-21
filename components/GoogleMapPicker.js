'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { loadGoogleMaps } from '../lib/googleMapsLoader';
import toast from 'react-hot-toast';

export default function GoogleMapPicker({ onLocationChange, initialPosition, initialLocation }) {
    const [map, setMap] = useState(null);
    const [marker, setMarker] = useState(null);
    const [position, setPosition] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLocationConfirmed, setIsLocationConfirmed] = useState(false);
    const [isGettingLocation, setIsGettingLocation] = useState(false);
    const [isMapLoaded, setIsMapLoaded] = useState(false);
    const mapRef = useRef(null);
    const autocompleteRef = useRef(null);
    const lastNotifiedPosition = useRef(null);

    // Initialize position from props
    useEffect(() => {
        let initialPos = null;
        
        // Handle different initial position formats
        if (initialLocation && typeof initialLocation === 'object') {
            if (initialLocation.lat && initialLocation.lng) {
                initialPos = { lat: initialLocation.lat, lng: initialLocation.lng };
            }
        } else if (initialPosition) {
            if (Array.isArray(initialPosition) && initialPosition.length === 2) {
                initialPos = { lat: initialPosition[0], lng: initialPosition[1] };
            } else if (typeof initialPosition === 'object' && initialPosition.lat && initialPosition.lng) {
                initialPos = { lat: initialPosition.lat, lng: initialPosition.lng };
            }
        }
        
        if (initialPos) {
            setPosition(initialPos);
        } else {
            // Default to Delhi, India
            setPosition({ lat: 28.6139, lng: 77.2090 });
        }
    }, [initialLocation, initialPosition]);

    // Initialize Google Maps
    useEffect(() => {
        const initializeMap = async () => {
            try {
                const google = await loadGoogleMaps();
                
                if (!mapRef.current || !position) return;

                const mapInstance = new google.maps.Map(mapRef.current, {
                    center: position,
                    zoom: 13,
                    mapTypeControl: false,
                    streetViewControl: false,
                    fullscreenControl: false,
                    zoomControl: true,
                    gestureHandling: 'greedy'
                });

                const markerInstance = new google.maps.Marker({
                    position: position,
                    map: mapInstance,
                    draggable: true,
                    title: 'Selected Location'
                });

                // Handle map clicks
                mapInstance.addListener('click', (event) => {
                    const newPosition = {
                        lat: event.latLng.lat(),
                        lng: event.latLng.lng()
                    };
                    updatePosition(newPosition, mapInstance, markerInstance);
                });

                // Handle marker drag
                markerInstance.addListener('dragend', (event) => {
                    const newPosition = {
                        lat: event.latLng.lat(),
                        lng: event.latLng.lng()
                    };
                    updatePosition(newPosition, mapInstance, markerInstance);
                });

                setMap(mapInstance);
                setMarker(markerInstance);
                setIsMapLoaded(true);

                // Initialize autocomplete
                if (autocompleteRef.current) {
                    const autocomplete = new google.maps.places.Autocomplete(autocompleteRef.current, {
                        types: ['establishment', 'geocode'],
                        componentRestrictions: { country: 'in' } // Restrict to India
                    });

                    autocomplete.addListener('place_changed', () => {
                        const place = autocomplete.getPlace();
                        if (place.geometry && place.geometry.location) {
                            const newPosition = {
                                lat: place.geometry.location.lat(),
                                lng: place.geometry.location.lng()
                            };
                            updatePosition(newPosition, mapInstance, markerInstance);
                            mapInstance.setCenter(newPosition);
                            mapInstance.setZoom(15);
                            setSearchQuery(place.formatted_address || place.name || '');
                        }
                    });
                }

            } catch (error) {
                console.error('Error loading Google Maps:', error);
                toast.error('Failed to load Google Maps. Please check your internet connection.');
            }
        };

        initializeMap();
    }, [position]);

    const updatePosition = useCallback((newPosition, mapInstance, markerInstance) => {
        setPosition(newPosition);
        
        if (markerInstance) {
            markerInstance.setPosition(newPosition);
        }

        // Auto-confirm location and notify parent
        const posKey = `${newPosition.lat.toFixed(6)},${newPosition.lng.toFixed(6)}`;
        if (posKey !== lastNotifiedPosition.current) {
            onLocationChange && onLocationChange(newPosition);
            lastNotifiedPosition.current = posKey;
            setIsLocationConfirmed(true);
        }
    }, [onLocationChange]);

    // Update map when position changes externally
    useEffect(() => {
        if (map && marker && position) {
            map.setCenter(position);
            marker.setPosition(position);
        }
    }, [map, marker, position]);

    const handleGetCurrentLocation = async () => {
        setIsGettingLocation(true);
        
        try {
            if (!navigator.geolocation) {
                throw new Error('Geolocation is not supported by this browser');
            }

            const options = {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 60000
            };

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const newPosition = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };
                    
                    updatePosition(newPosition, map, marker);
                    
                    if (map) {
                        map.setCenter(newPosition);
                        map.setZoom(16);
                    }
                    
                    setIsGettingLocation(false);
                    toast.success('Current location detected successfully!');
                },
                (error) => {
                    setIsGettingLocation(false);
                    let errorMessage = 'Unable to get your location';
                    
                    switch(error.code) {
                        case error.PERMISSION_DENIED:
                            errorMessage = 'Location access denied. Please enable location permissions.';
                            break;
                        case error.POSITION_UNAVAILABLE:
                            errorMessage = 'Location information is unavailable.';
                            break;
                        case error.TIMEOUT:
                            errorMessage = 'Location request timed out.';
                            break;
                    }
                    
                    toast.error(errorMessage);
                },
                options
            );
        } catch (error) {
            setIsGettingLocation(false);
            toast.error(error.message || 'Could not get your location');
        }
    };

    const handleConfirmLocation = () => {
        if (position) {
            onLocationChange && onLocationChange(position);
            setIsLocationConfirmed(true);
            toast.success('Location confirmed!');
        }
    };

    return (
        <div className="relative">
            <div className="flex flex-wrap items-center gap-2 mb-4">
                <input 
                    ref={autocompleteRef}
                    type="text" 
                    placeholder="Search for a location..." 
                    className="flex-grow block w-full sm:w-auto rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button 
                    type="button"
                    onClick={handleGetCurrentLocation}
                    disabled={isGettingLocation || !isMapLoaded}
                    className={`${
                        isGettingLocation || !isMapLoaded
                            ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed' 
                            : 'bg-green-600 dark:bg-green-700 hover:bg-green-700 dark:hover:bg-green-600'
                    } text-white font-bold py-2 px-4 rounded-lg transition duration-300 whitespace-nowrap flex items-center gap-2`}
                >
                    {isGettingLocation ? (
                        <>
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                            Getting Location...
                        </>
                    ) : (
                        <>
                            🎯 Get Current Location
                        </>
                    )}
                </button>
            </div>
            
            <div className="h-96 w-full relative overflow-hidden rounded-lg border border-gray-300 dark:border-gray-600">
                {!isMapLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mx-auto mb-2"></div>
                            <p className="text-gray-600 dark:text-gray-400">Loading Google Maps...</p>
                        </div>
                    </div>
                )}
                <div 
                    ref={mapRef} 
                    className="w-full h-full"
                    style={{ display: isMapLoaded ? 'block' : 'none' }}
                />
            </div>
            
            <div className="mt-4 space-y-3">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                    Click on the map, drag the marker, or search for a location to set the exact position.
                </p>
                {position && (
                    <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg shadow-sm">
                        <div className="text-sm">
                            <span className="font-medium text-gray-900 dark:text-gray-100">Selected Location: </span>
                            <span className="text-blue-700 dark:text-blue-300">
                                {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
                            </span>
                            {isLocationConfirmed && (
                                <span className="ml-2 text-green-600 dark:text-green-400 font-medium">✓ Confirmed</span>
                            )}
                        </div>
                        <button
                            type="button"
                            onClick={handleConfirmLocation}
                            className="bg-blue-600 dark:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 dark:hover:bg-blue-600 transition duration-200 shadow-sm"
                        >
                            {isLocationConfirmed ? 'Update Location' : 'Confirm Location'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}