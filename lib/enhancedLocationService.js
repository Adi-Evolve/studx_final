/**
 * Enhanced Location Service for StudX
 * FREE and accurate location detection using HTML5 Geolocation API
 * Much more precise than IP-based location, no API key required
 */

import { getHTML5Location, getLocationWithRetry, formatLocationInfo, getAccuracyLevel } from './html5LocationService.js';

/**
 * Get current location with intelligent fallback system
 * Priority: HTML5 GPS → Enhanced Browser GPS → IP Location → Default
 */
export async function getCurrentLocation(options = {}) {
  const { onStatusUpdate = null, timeout = 30000 } = options;

  const updateStatus = (message, type = 'info') => {
    if (onStatusUpdate) onStatusUpdate(message, type);
    // console.log(`[Location] ${message}`);
  };

  try {
    updateStatus('🎯 Starting precise location detection...', 'info');

    // Method 1: HTML5 Geolocation API (FREE, accurate, works offline)
    try {
      updateStatus('📡 Requesting GPS location...', 'info');
      
      const html5Location = await getLocationWithRetry({
        maxRetries: 2,
        highAccuracy: true,
        onStatusUpdate: updateStatus
      });

      if (html5Location) {
        const accuracyInfo = getAccuracyLevel(html5Location.accuracy);
        updateStatus(
          `✅ GPS location found! ${accuracyInfo.message} (${html5Location.accuracy}m)`, 
          'success'
        );

        return {
          lat: html5Location.lat,
          lng: html5Location.lng,
          accuracy: html5Location.accuracy,
          method: html5Location.method,
          source: 'html5_gps',
          timestamp: html5Location.timestamp,
          city: null, // Will be resolved separately if needed
          country: null,
          details: {
            altitude: html5Location.altitude,
            speed: html5Location.speed,
            heading: html5Location.heading,
            accuracyLevel: accuracyInfo.level
          }
        };
      }
    } catch (error) {
      updateStatus(`⚠️ GPS location failed: ${error.message}`, 'warning');
    }

    // Method 2: IP-based location (fallback)
    try {
      updateStatus('🌐 Trying IP-based location...', 'info');
      
      const ipLocation = await getLocationViaIP();
      if (ipLocation) {
        updateStatus(`✅ IP location found: ${ipLocation.city}, ${ipLocation.country}`, 'success');
        return ipLocation;
      }
    } catch (error) {
      updateStatus(`❌ IP location failed: ${error.message}`, 'error');
    }

    // Method 3: Default location (India center)
    updateStatus('🔄 Using default location (India center)', 'warning');
    return getDefaultLocation();

  } catch (error) {
    // console.error('[Location] All methods failed:', error);
    updateStatus('❌ All location methods failed, using default', 'error');
    return getDefaultLocation();
  }
}

/**
 * Get location with status updates (for UI integration)
 */
export async function getCurrentLocationWithStatus(statusCallback) {
  return await getCurrentLocation({
    onStatusUpdate: statusCallback
  });
}

/**
 * Get IP-based location (fallback method)
 */
async function getLocationViaIP() {
  try {
    const response = await fetch('/api/enhanced-location', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ method: 'ip_location' })
    });

    if (!response.ok) throw new Error('IP location service unavailable');

    const data = await response.json();
    if (!data.success) throw new Error(data.error || 'IP location failed');

    return {
      lat: data.lat,
      lng: data.lng,
      accuracy: data.accuracy || 5000,
      method: 'IP Geolocation',
      source: 'ip_location',
      city: data.city,
      country: data.country,
      timestamp: Date.now()
    };
  } catch (error) {
    throw new Error(`IP location failed: ${error.message}`);
  }
}

/**
 * Default location (India center) as last resort
 */
function getDefaultLocation() {
  return {
    lat: 20.5937,
    lng: 78.9629,
    accuracy: 50000,
    method: 'Default Location (India Center)',
    source: 'default',
    city: 'India',
    country: 'India',
    timestamp: Date.now()
  };
}

/**
 * Validate location coordinates
 */
export async function validateLocation(lat, lng) {
  try {
    const response = await fetch('/api/enhanced-location', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        method: 'validate_location',
        lat: lat,
        lng: lng
      })
    });

    if (!response.ok) return null;

    const data = await response.json();
    return data.success ? data : null;
  } catch (error) {
    // console.error('Location validation failed:', error);
    return null;
  }
}

/**
 * Check if browser supports geolocation
 */
export function isGeolocationSupported() {
  return 'geolocation' in navigator;
}

/**
 * Check geolocation permissions
 */
export async function checkGeolocationPermission() {
  if (!navigator.permissions) {
    return { state: 'unknown', message: 'Permissions API not supported' };
  }

  try {
    const permission = await navigator.permissions.query({ name: 'geolocation' });
    return {
      state: permission.state,
      message: getPermissionMessage(permission.state)
    };
  } catch (error) {
    return { state: 'unknown', message: 'Could not check permissions' };
  }
}

function getPermissionMessage(state) {
  switch (state) {
    case 'granted':
      return 'Location access is allowed';
    case 'denied':
      return 'Location access is blocked. Please enable in browser settings.';
    case 'prompt':
      return 'Location access will be requested when needed';
    default:
      return 'Location permission status unknown';
  }
}

/**
 * Format accuracy for user display
 */
export function formatAccuracy(accuracy) {
  if (accuracy <= 50) return '📍 Excellent (GPS)';
  if (accuracy <= 100) return '🎯 Very Good (GPS + WiFi)';
  if (accuracy <= 500) return '📱 Good (WiFi/Cell)';
  if (accuracy <= 1000) return '📶 Fair (Cell towers)';
  if (accuracy <= 5000) return '🌐 City-level (IP)';
  return '🌍 Regional (IP)';
}

/**
 * Calculate distance between two points
 */
export function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function toRad(degrees) {
  return degrees * (Math.PI/180);
}

// Export everything for compatibility
const enhancedLocationService = {
  getCurrentLocation,
  getCurrentLocationWithStatus,
  validateLocation,
  isGeolocationSupported,
  checkGeolocationPermission,
  formatAccuracy,
  calculateDistance
};

export default enhancedLocationService;
