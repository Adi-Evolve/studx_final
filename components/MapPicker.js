'use client';

import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import { useState, useEffect, useRef } from 'react';

function LocationMarker({ position, setPosition }) {
    const map = useMap();
    
    useEffect(() => {
        if (position) {
            map.flyTo(position, 13);
        }
    }, [position, map]);

    useEffect(() => {
        const handleClick = (e) => {
            setPosition([e.latlng.lat, e.latlng.lng]);
        };

        map.on('click', handleClick);
        
        return () => {
            map.off('click', handleClick);
        };
    }, [map, setPosition]);

    return position === null ? null : (
        <Marker position={position}></Marker>
    );
}

export default function MapPicker({ onLocationChange, initialPosition }) {
    const [position, setPosition] = useState(initialPosition || [20.5937, 78.9629]); // Default to India center
    const [searchQuery, setSearchQuery] = useState('');
    const [isLocationConfirmed, setIsLocationConfirmed] = useState(false);
    const lastNotifiedPosition = useRef(null);

    // Debug logging for position changes
    useEffect(() => {
        // console.log('MapPicker position changed:', position);
    }, [position]);

    // Initialize with default position if no initial position provided
    useEffect(() => {
        if (!initialPosition && onLocationChange && position) {
            // console.log('MapPicker: Setting default location:', position);
            const locationObj = { lat: position[0], lng: position[1] };
            // console.log('MapPicker: Sending location object:', locationObj);
            onLocationChange(locationObj);
            lastNotifiedPosition.current = `${position[0]},${position[1]}`;
        }
    }, []); // Run only once on mount

    // Only update position if initialPosition changes and is different
    useEffect(() => {
        if (initialPosition && Array.isArray(initialPosition) && initialPosition.length === 2 && (!position || 
            position[0] !== initialPosition[0] || 
            position[1] !== initialPosition[1])) {
            setPosition(initialPosition);
        }
    }, [initialPosition]);

    // Auto-confirm location when position changes
    useEffect(() => {
        if (position && Array.isArray(position) && position.length === 2 && 
            typeof position[0] === 'number' && typeof position[1] === 'number') {
            const currentPosKey = `${position[0]},${position[1]}`;
            const lastPosKey = lastNotifiedPosition.current;
            
            // Only call if position actually changed
            if (currentPosKey !== lastPosKey) {
                const locationObj = { lat: position[0], lng: position[1] };
                // console.log('MapPicker: Auto-confirming location:', locationObj);
                onLocationChange(locationObj);
                lastNotifiedPosition.current = currentPosKey;
                setIsLocationConfirmed(true);
            }
        }
    }, [position, onLocationChange]);

    const handleConfirmLocation = () => {
        if (position && Array.isArray(position) && position.length === 2) {
            const locationObj = { lat: position[0], lng: position[1] };
            // console.log('MapPicker: Manually confirming location:', locationObj);
            onLocationChange(locationObj);
            setIsLocationConfirmed(true);
            lastNotifiedPosition.current = `${position[0]},${position[1]}`;
        }
    };

            const handleGetCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const { latitude, longitude } = pos.coords;
                    setPosition([latitude, longitude]);
                },
                (err) => {
                    // console.error("Error getting current location:", err);
                    // toast.error('Could not get your location.');
                }
            );
        } else {
            // toast.error('Geolocation is not supported by this browser.');
        }
    };

    const handleSearch = async () => {
        if (!searchQuery) return;
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
            const data = await response.json();
            if (data && data.length > 0) {
                const { lat, lon } = data[0];
                setPosition([parseFloat(lat), parseFloat(lon)]);
            } else {
                // console.error('Location not found.');
                // toast.error('Location not found.');
            }
        } catch (error) {
            // console.error('Error fetching location:', error);
            // toast.error('Failed to search for location.');
        }
    };

        return (
        <div className="relative" style={{ zIndex: 1 }}>
            <div className="flex flex-wrap items-center gap-2 mb-4">
                <input 
                    type="text" 
                    placeholder="Search for a location..." 
                    className="flex-grow block w-full sm:w-auto rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            handleSearch();
                        }
                    }}
                />
                <button
                    type="button"
                    onClick={handleSearch}
                    className="bg-blue-600 dark:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition duration-300"
                >
                    Search
                </button>
                <button 
                    type="button"
                    onClick={handleGetCurrentLocation}
                    className="bg-green-600 dark:bg-green-700 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition duration-300 whitespace-nowrap"
                >
                    Use Current Location
                </button>
            </div>
            <div className="h-96 w-full relative overflow-hidden rounded-lg border border-gray-300 dark:border-gray-600" style={{ zIndex: 1 }}>
                {position && (
                    <MapContainer 
                        center={position} 
                        zoom={13} 
                        scrollWheelZoom={false} 
                        style={{ height: '100%', width: '100%', zIndex: 1 }}
                        zoomControl={true}
                        className="leaflet-container-custom"
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <LocationMarker position={position} setPosition={setPosition} />
                    </MapContainer>
                )}
            </div>
            <div className="mt-4 space-y-3">
                <p className="text-sm text-gray-600 dark:text-gray-300">Click on the map to set the exact location of your item.</p>
                {position && Array.isArray(position) && position.length === 2 && (
                    <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg shadow-sm">
                        <div className="text-sm">
                            <span className="font-medium text-gray-900 dark:text-gray-100">Selected Location: </span>
                            <span className="text-blue-700 dark:text-blue-300">
                                {position[0].toFixed(4)}, {position[1].toFixed(4)}
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
