'use client';

import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import 'leaflet-defaulticon-compatibility';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

function LocationMap({ lat, lng, popupText }) {
    if (typeof window === 'undefined') {
        return null; // Don't render on the server
    }

    const position = [lat, lng];

    return (
        <div className="relative w-full h-full overflow-hidden rounded-lg">
            <MapContainer 
                center={position} 
                zoom={15} 
                scrollWheelZoom={false} 
                style={{ 
                    height: '100%', 
                    width: '100%', 
                    borderRadius: '12px',
                    position: 'relative',
                    zIndex: 1
                }}
                className="leaflet-container-custom"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={position}>
                    {popupText && (
                        <Popup>
                            {popupText}
                        </Popup>
                    )}
                </Marker>
            </MapContainer>
        </div>
    );
}

export default LocationMap;
