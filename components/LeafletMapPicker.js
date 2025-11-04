'use client';

import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon in Next.js
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom red marker icon
const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

function LocationMarker({ position, onLocationChange }) {
  const [localPosition, setLocalPosition] = useState(position);
  const markerRef = useRef(null);

  useMapEvents({
    click(e) {
      const newPosition = {
        lat: e.latlng.lat,
        lng: e.latlng.lng
      };
      setLocalPosition(newPosition);
      onLocationChange(newPosition);
    },
  });

  useEffect(() => {
    setLocalPosition(position);
  }, [position]);

  return localPosition ? (
    <Marker 
      position={[localPosition.lat, localPosition.lng]} 
      icon={redIcon}
      ref={markerRef}
      draggable={true}
      eventHandlers={{
        dragend: (e) => {
          const marker = e.target;
          const newPos = marker.getLatLng();
          const newPosition = {
            lat: newPos.lat,
            lng: newPos.lng
          };
          setLocalPosition(newPosition);
          onLocationChange(newPosition);
        }
      }}
    />
  ) : null;
}

export default function LeafletMapPicker({ onLocationChange, initialPosition, initialLocation }) {
  const [position, setPosition] = useState(
    initialPosition || { lat: 28.6139, lng: 77.2090 } // Default: New Delhi
  );
  const [address, setAddress] = useState(initialLocation || '');
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [accuracy, setAccuracy] = useState(null);
  const mapRef = useRef(null);

  const handleLocationChange = (newLocation) => {
    setPosition(newLocation);
    setAccuracy(null);
    
    // Reverse geocode to get address
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${newLocation.lat}&lon=${newLocation.lng}`)
      .then(res => res.json())
      .then(data => {
        const addr = data.display_name || 'Location selected';
        setAddress(addr);
        onLocationChange({
          ...newLocation,
          address: addr
        });
      })
      .catch(err => {
        console.error('Reverse geocoding error:', err);
        onLocationChange(newLocation);
      });
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('❌ Geolocation is not supported by your browser. Please use a modern browser like Chrome, Firefox, or Safari.');
      return;
    }

    setIsLoadingLocation(true);
    
    // First, try to get cached position quickly for better UX
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        
        const acc = position.coords.accuracy;
        setAccuracy(acc);
        
        console.log('📍 Location obtained:', {
          lat: newLocation.lat,
          lng: newLocation.lng,
          accuracy: `±${Math.round(acc)}m`,
          timestamp: new Date(position.timestamp).toLocaleTimeString()
        });
        
        setPosition(newLocation);
        setIsLoadingLocation(false);

        // Reverse geocode to get address
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${newLocation.lat}&lon=${newLocation.lng}`)
          .then(res => res.json())
          .then(data => {
            const addr = data.display_name || 'Current location';
            setAddress(addr);
            onLocationChange({
              ...newLocation,
              address: addr,
              accuracy: acc
            });
          })
          .catch(err => {
            console.error('Reverse geocoding error:', err);
            onLocationChange({
              ...newLocation,
              accuracy: acc
            });
          });

        // Pan map to new location with appropriate zoom
        if (mapRef.current) {
          // Zoom level based on accuracy
          let zoomLevel = 18; // Very precise
          if (acc > 100) zoomLevel = 16; // Less precise
          if (acc > 500) zoomLevel = 14; // Low precision
          
          mapRef.current.setView([newLocation.lat, newLocation.lng], zoomLevel);
        }
        
        // Show accuracy feedback
        if (acc <= 20) {
          console.log('✅ Excellent accuracy: ±' + Math.round(acc) + 'm');
        } else if (acc <= 50) {
          console.log('✅ Good accuracy: ±' + Math.round(acc) + 'm');
        } else if (acc <= 100) {
          console.log('⚠️ Fair accuracy: ±' + Math.round(acc) + 'm - Try moving to a location with better GPS signal');
        } else {
          console.log('⚠️ Low accuracy: ±' + Math.round(acc) + 'm - Consider using WiFi or moving outdoors for better precision');
        }
      },
      (error) => {
        setIsLoadingLocation(false);
        let errorMessage = '❌ Unable to get your location.\n\n';
        
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage += '📍 Location Permission Denied\n\n';
            errorMessage += 'Please allow location access:\n';
            errorMessage += '1. Click the location icon in your browser\'s address bar\n';
            errorMessage += '2. Select "Allow" for location access\n';
            errorMessage += '3. Refresh the page and try again';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage += '📡 Location Unavailable\n\n';
            errorMessage += 'Your device cannot determine your location right now.\n\n';
            errorMessage += 'Try these solutions:\n';
            errorMessage += '• Enable WiFi or mobile data\n';
            errorMessage += '• Move to an area with better GPS signal\n';
            errorMessage += '• Check if Location Services are enabled on your device';
            break;
          case error.TIMEOUT:
            errorMessage += '⏱️ Location Request Timed Out\n\n';
            errorMessage += 'It took too long to get your location.\n\n';
            errorMessage += 'Try these solutions:\n';
            errorMessage += '• Ensure you have a stable internet connection\n';
            errorMessage += '• Move to an area with better GPS signal\n';
            errorMessage += '• Try again in a moment';
            break;
          default:
            errorMessage += '⚠️ An unknown error occurred.\n\n';
            errorMessage += 'Please try again or use the search feature to set your location manually.';
        }
        
        console.error('Geolocation error:', error);
        alert(errorMessage);
      },
      {
        enableHighAccuracy: true,    // Use GPS for maximum precision
        timeout: 30000,               // Wait up to 30 seconds for accurate position
        maximumAge: 0                 // Don't use cached position, get fresh location
      }
    );
  };

  const searchLocation = async (query) => {
    if (!query.trim()) return;

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        const result = data[0];
        const newLocation = {
          lat: parseFloat(result.lat),
          lng: parseFloat(result.lon)
        };
        
        setPosition(newLocation);
        setAddress(result.display_name);
        onLocationChange({
          ...newLocation,
          address: result.display_name
        });

        if (mapRef.current) {
          mapRef.current.setView([newLocation.lat, newLocation.lng], 16);
        }
      } else {
        alert('Location not found. Please try a different search term.');
      }
    } catch (error) {
      console.error('Search error:', error);
      alert('Error searching location. Please try again.');
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Current Location */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Search location (e.g., Connaught Place, Delhi)"
          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              searchLocation(address);
            }
          }}
        />
        <button
          type="button"
          onClick={() => searchLocation(address)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Search
        </button>
        <button
          type="button"
          onClick={getCurrentLocation}
          disabled={isLoadingLocation}
          className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isLoadingLocation ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
              Getting...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Current Location
            </>
          )}
        </button>
      </div>

      {/* Location Info */}
      {position && (
        <div className={`border rounded-lg p-3 text-sm ${
          accuracy && accuracy <= 20 
            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700' 
            : accuracy && accuracy <= 100
            ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700'
            : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700'
        }`}>
          <div className="flex items-start gap-2">
            <svg className={`w-5 h-5 mt-0.5 ${
              accuracy && accuracy <= 20
                ? 'text-green-600 dark:text-green-400'
                : accuracy && accuracy <= 100
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-yellow-600 dark:text-yellow-400'
            }`} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            <div className="flex-1">
              <p className={`font-medium ${
                accuracy && accuracy <= 20
                  ? 'text-green-900 dark:text-green-100'
                  : accuracy && accuracy <= 100
                  ? 'text-blue-900 dark:text-blue-100'
                  : 'text-yellow-900 dark:text-yellow-100'
              }`}>
                {accuracy && accuracy <= 20 ? '✅ Excellent Precision' : 
                 accuracy && accuracy <= 100 ? '✓ Good Precision' : 
                 '⚠️ Low Precision'}
              </p>
              <p className={`mt-1 ${
                accuracy && accuracy <= 20
                  ? 'text-green-700 dark:text-green-300'
                  : accuracy && accuracy <= 100
                  ? 'text-blue-700 dark:text-blue-300'
                  : 'text-yellow-700 dark:text-yellow-300'
              }`}>
                📍 Lat: {position.lat.toFixed(6)}, Lng: {position.lng.toFixed(6)}
              </p>
              {accuracy && (
                <p className={`mt-1 font-semibold ${
                  accuracy && accuracy <= 20
                    ? 'text-green-600 dark:text-green-400'
                    : accuracy && accuracy <= 100
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-yellow-600 dark:text-yellow-400'
                }`}>
                  🎯 Accuracy: ±{Math.round(accuracy)} meters
                  {accuracy <= 10 && ' (Precise!)'}
                  {accuracy > 10 && accuracy <= 20 && ' (Excellent)'}
                  {accuracy > 20 && accuracy <= 50 && ' (Very Good)'}
                  {accuracy > 50 && accuracy <= 100 && ' (Good)'}
                  {accuracy > 100 && ' - Try WiFi/outdoor for better precision'}
                </p>
              )}
              {address && (
                <p className={`mt-1 ${
                  accuracy && accuracy <= 20
                    ? 'text-green-600 dark:text-green-400'
                    : accuracy && accuracy <= 100
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-yellow-600 dark:text-yellow-400'
                }`}>
                  📌 {address}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Map Container */}
      <div className="h-96 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600 relative">
        <MapContainer
          center={[position.lat, position.lng]}
          zoom={15}
          style={{ height: '100%', width: '100%' }}
          ref={mapRef}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker position={position} onLocationChange={handleLocationChange} />
        </MapContainer>
        
        {/* Instructions Overlay */}
        <div className="absolute bottom-4 left-4 right-4 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-lg p-3 shadow-lg z-[1000]">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            💡 <strong>Tip:</strong> Click anywhere on the map to set location, or drag the marker to adjust
          </p>
        </div>
      </div>

      {/* Info Text */}
      <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
        Powered by OpenStreetMap • Free & Accurate Mapping
      </div>
    </div>
  );
}
