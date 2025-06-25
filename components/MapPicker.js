'use client';

import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import { useState, useEffect } from 'react';

function LocationMarker({ position, setPosition }) {
    const map = useMap();
    
    useEffect(() => {
        if (position) {
            map.flyTo(position, 13);
        }
    }, [position, map]);

    map.on('click', (e) => {
        setPosition(e.latlng);
    });

    return position === null ? null : (
        <Marker position={position}></Marker>
    );
}

export default function MapPicker({ onLocationChange, initialPosition }) {
    const [position, setPosition] = useState(initialPosition || null);
    const [searchQuery, setSearchQuery] = useState('');

        useEffect(() => {
        if (!position) {
            // Default to a central location if no initial position is provided
            setPosition([20.5937, 78.9629]); // Centered on India
        }
    }, [position]);

    useEffect(() => {
        if (position) {
            onLocationChange({ lat: position.lat, lng: position.lng });
        }
    }, [position, onLocationChange]);

            const handleGetCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const { latitude, longitude } = pos.coords;
                    setPosition([latitude, longitude]);
                },
                (err) => {
                    console.error("Error getting current location:", err);
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
                console.error('Location not found.');
                // toast.error('Location not found.');
            }
        } catch (error) {
            console.error('Error fetching location:', error);
            // toast.error('Failed to search for location.');
        }
    };

        return (
        <div>
            <div className="flex flex-wrap items-center gap-2 mb-4">
                <input 
                    type="text" 
                    placeholder="Search for a location..." 
                    className="flex-grow block w-full sm:w-auto rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
                    className="bg-accent text-white font-bold py-2 px-4 rounded-lg hover:bg-primary transition duration-300"
                >
                    Search
                </button>
                <button 
                    type="button"
                    onClick={handleGetCurrentLocation}
                    className="bg-secondary text-white font-bold py-2 px-4 rounded-lg hover:bg-primary transition duration-300 whitespace-nowrap"
                >
                    Use Current Location
                </button>
            </div>
            <div className="h-96 w-full z-0">
                {position && (
                    <MapContainer center={position} zoom={13} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <LocationMarker position={position} setPosition={setPosition} />
                    </MapContainer>
                )}
                <p className="text-sm text-gray-600 mt-2">Click on the map to set the exact location of your item.</p>
            </div>
        </div>
    );
}
