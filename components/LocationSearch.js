// Location Search Component
'use client';
import { useState, useEffect } from 'react';
import { useLocationSearch } from '@/lib/locationService';

export default function LocationSearchComponent({ onLocationFilter, items = [] }) {
    const {
        userLocation,
        locationError,
        locationLoading,
        requestLocation,
        filterItemsByDistance,
        formatDistance
    } = useLocationSearch();

    const [maxDistance, setMaxDistance] = useState(25); // Default 25km
    const [locationEnabled, setLocationEnabled] = useState(false);
    const [filteredItems, setFilteredItems] = useState(items);

    // Update filtered items when location or distance changes
    useEffect(() => {
        if (locationEnabled && userLocation) {
            const filtered = filterItemsByDistance(items, maxDistance);
            setFilteredItems(filtered);
            onLocationFilter?.(filtered);
        } else {
            setFilteredItems(items);
            onLocationFilter?.(items);
        }
    }, [items, userLocation, maxDistance, locationEnabled]);

    const handleEnableLocation = async () => {
        const location = await requestLocation();
        if (location) {
            setLocationEnabled(true);
        }
    };

    const handleDisableLocation = () => {
        setLocationEnabled(false);
        setFilteredItems(items);
        onLocationFilter?.(items);
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-800">📍 Near Me</h3>
                
                {!locationEnabled ? (
                    <button
                        onClick={handleEnableLocation}
                        disabled={locationLoading}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 transition-colors"
                    >
                        {locationLoading ? (
                            <div className="flex items-center">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Getting Location...
                            </div>
                        ) : (
                            'Enable Location Search'
                        )}
                    </button>
                ) : (
                    <button
                        onClick={handleDisableLocation}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                        Disable Location
                    </button>
                )}
            </div>

            {locationError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-3">
                    <div className="flex items-center">
                        <span className="text-red-500 mr-2">⚠️</span>
                        <div>
                            <p className="font-medium">Location Error</p>
                            <p className="text-sm">{locationError}</p>
                            <p className="text-xs mt-1">
                                Please enable location permissions in your browser settings.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {locationEnabled && userLocation && (
                <div className="space-y-3">
                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                        <div className="flex items-center">
                            <span className="text-green-500 mr-2">✅</span>
                            <div>
                                <p className="font-medium">Location Enabled</p>
                                <p className="text-sm">
                                    Showing items near your location (accuracy: ±{Math.round(userLocation.accuracy)}m)
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            Search within: {maxDistance}km
                        </label>
                        <div className="flex items-center space-x-4">
                            <input
                                type="range"
                                min="1"
                                max="100"
                                value={maxDistance}
                                onChange={(e) => setMaxDistance(parseInt(e.target.value))}
                                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                            />
                            <span className="text-sm text-gray-600 min-w-[60px]">
                                {maxDistance}km
                            </span>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500">
                            <span>Very Close (1km)</span>
                            <span>Far (100km)</span>
                        </div>
                    </div>

                    {filteredItems.length > 0 && (
                        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg">
                            <p className="text-sm">
                                📍 Found {filteredItems.length} items within {maxDistance}km
                                {filteredItems.length !== items.length && (
                                    <span className="text-blue-600"> (filtered from {items.length} total)</span>
                                )}
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Quick distance buttons */}
            {locationEnabled && userLocation && (
                <div className="mt-3">
                    <p className="text-xs text-gray-600 mb-2">Quick filters:</p>
                    <div className="flex flex-wrap gap-2">
                        {[5, 10, 25, 50].map(distance => (
                            <button
                                key={distance}
                                onClick={() => setMaxDistance(distance)}
                                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                                    maxDistance === distance
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                {distance}km
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// Distance display component for individual items
export function DistanceDisplay({ item, userLocation }) {
    const { calculateDistance, formatDistance } = useLocationSearch();
    
    if (!userLocation || !item.location) {
        return null;
    }

    const distance = calculateDistance(item);
    
    if (distance === null) return null;

    return (
        <div className="flex items-center text-sm text-gray-600 mt-1">
            <span className="mr-1">📍</span>
            <span>{formatDistance(distance)}</span>
            {distance < 5 && (
                <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                    Very Close
                </span>
            )}
        </div>
    );
}
