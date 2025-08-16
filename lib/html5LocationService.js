/**
 * Enhanced HTML5 Geolocation Service
 * Free, precise location detection using browser's built-in GPS
 * Much more accurate than IP-based location
 */

// Configuration for high-accuracy geolocation
const HIGH_ACCURACY_CONFIG = {
  enableHighAccuracy: true,
  timeout: 30000,        // 30 seconds timeout
  maximumAge: 300000     // Cache for 5 minutes
};

const STANDARD_CONFIG = {
  enableHighAccuracy: false,
  timeout: 15000,        // 15 seconds timeout
  maximumAge: 600000     // Cache for 10 minutes
};

/**
 * Get current location using HTML5 Geolocation API with enhanced accuracy
 */
export async function getHTML5Location(options = {}) {
  const {
    highAccuracy = true,
    fallbackToStandard = true,
    onStatusUpdate = null,
    timeout = 30000
  } = options;

  // Check if geolocation is supported
  if (!navigator.geolocation) {
    throw new Error('Geolocation is not supported by this browser');
  }

  const updateStatus = (message, type = 'info') => {
    if (onStatusUpdate) onStatusUpdate(message, type);
    // console.log(`[Location] ${type.toUpperCase()}: ${message}`);
  };

  try {
    updateStatus('🎯 Requesting precise GPS location...', 'info');
    
    // Try high accuracy first
    const position = await getCurrentPosition(
      highAccuracy ? HIGH_ACCURACY_CONFIG : STANDARD_CONFIG
    );
    
    const result = {
      lat: position.coords.latitude,
      lng: position.coords.longitude,
      accuracy: Math.round(position.coords.accuracy),
      altitude: position.coords.altitude,
      altitudeAccuracy: position.coords.altitudeAccuracy,
      heading: position.coords.heading,
      speed: position.coords.speed,
      timestamp: position.timestamp,
      method: highAccuracy ? 'HTML5 GPS (High Accuracy)' : 'HTML5 GPS (Standard)',
      source: 'browser_gps'
    };

    updateStatus(
      `✅ GPS location found! Accuracy: ${result.accuracy}m`, 
      'success'
    );
    
    return result;

  } catch (error) {
    updateStatus(`❌ High accuracy GPS failed: ${error.message}`, 'warning');
    
    // Fallback to standard accuracy if requested
    if (fallbackToStandard && highAccuracy) {
      try {
        updateStatus('🔄 Trying standard GPS...', 'info');
        
        const position = await getCurrentPosition(STANDARD_CONFIG);
        
        const result = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: Math.round(position.coords.accuracy),
          altitude: position.coords.altitude,
          altitudeAccuracy: position.coords.altitudeAccuracy,
          heading: position.coords.heading,
          speed: position.coords.speed,
          timestamp: position.timestamp,
          method: 'HTML5 GPS (Standard)',
          source: 'browser_gps'
        };

        updateStatus(
          `⚠️ Standard GPS location found! Accuracy: ${result.accuracy}m`, 
          'warning'
        );
        
        return result;

      } catch (fallbackError) {
        updateStatus('❌ Standard GPS also failed', 'error');
        throw new Error(`GPS location failed: ${fallbackError.message}`);
      }
    } else {
      throw error;
    }
  }
}

/**
 * Wrapper for navigator.geolocation.getCurrentPosition with Promise
 */
function getCurrentPosition(options) {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      resolve,
      (error) => {
        let message;
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = 'Location access denied by user. Please allow location access.';
            break;
          case error.POSITION_UNAVAILABLE:
            message = 'Location information unavailable. Check GPS/WiFi settings.';
            break;
          case error.TIMEOUT:
            message = 'Location request timeout. Please try again.';
            break;
          default:
            message = 'Unknown location error occurred.';
            break;
        }
        reject(new Error(message));
      },
      options
    );
  });
}

/**
 * Get location with multiple attempts and fallbacks
 */
export async function getLocationWithRetry(options = {}) {
  const { maxRetries = 2, onStatusUpdate = null } = options;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      if (onStatusUpdate) {
        onStatusUpdate(`📍 Location attempt ${attempt}/${maxRetries}...`, 'info');
      }

      const location = await getHTML5Location({
        ...options,
        highAccuracy: attempt === 1, // Try high accuracy first
        fallbackToStandard: true
      });

      return location;

    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }
      
      if (onStatusUpdate) {
        onStatusUpdate(`⏳ Attempt ${attempt} failed, retrying...`, 'warning');
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
}

/**
 * Validate location accuracy and provide user-friendly feedback
 */
export function getAccuracyLevel(accuracy) {
  if (accuracy <= 50) {
    return { level: 'excellent', message: 'Excellent accuracy (GPS)' };
  } else if (accuracy <= 100) {
    return { level: 'good', message: 'Good accuracy (GPS + WiFi)' };
  } else if (accuracy <= 500) {
    return { level: 'fair', message: 'Fair accuracy (WiFi/Cell towers)' };
  } else if (accuracy <= 1000) {
    return { level: 'poor', message: 'Poor accuracy (Cell towers only)' };
  } else {
    return { level: 'very_poor', message: 'Very poor accuracy' };
  }
}

/**
 * Format location for display
 */
export function formatLocationInfo(location) {
  const accuracyInfo = getAccuracyLevel(location.accuracy);
  
  return {
    coordinates: `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`,
    accuracy: `~${location.accuracy}m`,
    accuracyLevel: accuracyInfo.level,
    accuracyMessage: accuracyInfo.message,
    method: location.method,
    timestamp: new Date(location.timestamp).toLocaleString(),
    hasAltitude: location.altitude !== null,
    altitude: location.altitude ? `${Math.round(location.altitude)}m` : null,
    hasSpeed: location.speed !== null,
    speed: location.speed ? `${Math.round(location.speed * 3.6)} km/h` : null
  };
}

/**
 * Watch position for real-time location updates
 */
export function watchLocation(callback, options = {}) {
  const {
    highAccuracy = true,
    timeout = 60000,
    maximumAge = 30000
  } = options;

  if (!navigator.geolocation) {
    throw new Error('Geolocation is not supported by this browser');
  }

  const config = {
    enableHighAccuracy: highAccuracy,
    timeout: timeout,
    maximumAge: maximumAge
  };

  const watchId = navigator.geolocation.watchPosition(
    (position) => {
      const result = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: Math.round(position.coords.accuracy),
        altitude: position.coords.altitude,
        altitudeAccuracy: position.coords.altitudeAccuracy,
        heading: position.coords.heading,
        speed: position.coords.speed,
        timestamp: position.timestamp,
        method: highAccuracy ? 'HTML5 GPS (High Accuracy)' : 'HTML5 GPS (Standard)',
        source: 'browser_gps'
      };
      
      callback(null, result);
    },
    (error) => {
      let message;
      switch (error.code) {
        case error.PERMISSION_DENIED:
          message = 'Location access denied by user';
          break;
        case error.POSITION_UNAVAILABLE:
          message = 'Location information unavailable';
          break;
        case error.TIMEOUT:
          message = 'Location request timeout';
          break;
        default:
          message = 'Unknown location error';
          break;
      }
      callback(new Error(message), null);
    },
    config
  );

  // Return function to stop watching
  return () => {
    navigator.geolocation.clearWatch(watchId);
  };
}

/**
 * Check if high-accuracy location is available
 */
export async function checkLocationCapabilities() {
  if (!navigator.geolocation) {
    return {
      supported: false,
      reason: 'Geolocation API not supported'
    };
  }

  try {
    // Quick test with low timeout to check availability
    const position = await getCurrentPosition({
      enableHighAccuracy: false,
      timeout: 5000,
      maximumAge: 86400000 // Accept cached position up to 1 day old
    });

    return {
      supported: true,
      hasLocation: true,
      lastKnownAccuracy: Math.round(position.coords.accuracy)
    };
  } catch (error) {
    return {
      supported: true,
      hasLocation: false,
      reason: error.message
    };
  }
}

export default {
  getHTML5Location,
  getLocationWithRetry,
  getAccuracyLevel,
  formatLocationInfo,
  watchLocation,
  checkLocationCapabilities
};
