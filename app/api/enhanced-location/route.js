import { NextResponse } from 'next/server';

// Enhanced location detection using Google Maps API and fallback methods
export async function POST(request) {
    try {
        const body = await request.json();
        const { method, ...params } = body;

        console.log('[LOCATION API] Request for method:', method);

        switch (method) {
            case 'google_geolocation':
                return await handleGoogleGeolocation(params);
            
            case 'ip_location':
                return await handleIPLocation();
            
            case 'validate_location':
                return await handleLocationValidation(params);
            
            default:
                return NextResponse.json(
                    { error: 'Invalid method. Supported: google_geolocation, ip_location, validate_location' },
                    { status: 400 }
                );
        }

    } catch (error) {
        console.error('[LOCATION API] Error:', error);
        return NextResponse.json(
            { error: 'Internal server error', details: error.message },
            { status: 500 }
        );
    }
}

async function handleGoogleGeolocation(params) {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
        return NextResponse.json(
            { error: 'Google Maps API key not configured' },
            { status: 503 }
        );
    }

    try {
        const response = await fetch(`https://www.googleapis.com/geolocation/v1/geolocate?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                considerIp: true,
                wifiAccessPoints: params.wifiAccessPoints || [],
                cellTowers: params.cellTowers || []
            })
        });

        if (!response.ok) {
            console.warn('[LOCATION API] Google Geolocation API failed:', response.status);
            return NextResponse.json(
                { error: 'Google Geolocation API failed', status: response.status },
                { status: response.status }
            );
        }

        const data = await response.json();
        
        if (data.location) {
            console.log('[LOCATION API] Google Geolocation successful');
            return NextResponse.json({
                success: true,
                lat: data.location.lat,
                lng: data.location.lng,
                accuracy: data.accuracy || 1000,
                method: 'Google Geolocation API'
            });
        } else {
            return NextResponse.json(
                { error: 'No location data returned from Google API' },
                { status: 404 }
            );
        }

    } catch (error) {
        console.error('[LOCATION API] Google Geolocation error:', error);
        return NextResponse.json(
            { error: 'Failed to get location from Google API', details: error.message },
            { status: 500 }
        );
    }
}

async function handleIPLocation() {
    try {
        // Try multiple IP geolocation services
        const services = [
            'https://ipapi.co/json/',
            'https://ip-api.com/json/',
            'https://ipinfo.io/json'
        ];

        for (const service of services) {
            try {
                console.log('[LOCATION API] Trying IP service:', service);
                
                const response = await fetch(service, {
                    headers: {
                        'Accept': 'application/json',
                        'User-Agent': 'StudX-App/1.0'
                    },
                    timeout: 5000
                });

                if (!response.ok) continue;

                const data = await response.json();
                
                // Handle different response formats
                let lat, lng, city, country;
                
                if (service.includes('ipapi.co')) {
                    lat = data.latitude;
                    lng = data.longitude;
                    city = data.city;
                    country = data.country_name;
                } else if (service.includes('ip-api.com')) {
                    lat = data.lat;
                    lng = data.lon;
                    city = data.city;
                    country = data.country;
                } else if (service.includes('ipinfo.io')) {
                    if (data.loc) {
                        const [latStr, lngStr] = data.loc.split(',');
                        lat = parseFloat(latStr);
                        lng = parseFloat(lngStr);
                    }
                    city = data.city;
                    country = data.country;
                }

                if (lat && lng) {
                    console.log('[LOCATION API] IP location successful via:', service);
                    return NextResponse.json({
                        success: true,
                        lat: parseFloat(lat),
                        lng: parseFloat(lng),
                        accuracy: 5000, // IP-based location is typically ~5km accurate
                        city: city || 'Unknown',
                        country: country || 'Unknown',
                        method: 'IP Geolocation'
                    });
                }

            } catch (serviceError) {
                console.warn('[LOCATION API] IP service failed:', service, serviceError.message);
                continue;
            }
        }

        // All services failed, return default India location
        console.log('[LOCATION API] All IP services failed, using default location');
        return NextResponse.json({
            success: true,
            lat: 20.5937,
            lng: 78.9629,
            accuracy: 50000,
            city: 'Unknown',
            country: 'India',
            method: 'Default Location'
        });

    } catch (error) {
        console.error('[LOCATION API] IP location error:', error);
        return NextResponse.json(
            { error: 'Failed to get IP location', details: error.message },
            { status: 500 }
        );
    }
}

async function handleLocationValidation({ lat, lng }) {
    if (!lat || !lng) {
        return NextResponse.json(
            { error: 'Latitude and longitude required' },
            { status: 400 }
        );
    }

    try {
        // Try Google Geocoding API first if available
        const apiKey = process.env.GOOGLE_MAPS_API_KEY;
        
        if (apiKey) {
            try {
                const response = await fetch(
                    `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`
                );
                
                if (response.ok) {
                    const data = await response.json();
                    if (data.results && data.results.length > 0) {
                        const result = data.results[0];
                        console.log('[LOCATION API] Location validated via Google Geocoding');
                        return NextResponse.json({
                            success: true,
                            isValid: true,
                            address: result.formatted_address,
                            components: result.address_components,
                            method: 'Google Geocoding API'
                        });
                    }
                }
            } catch (googleError) {
                console.warn('[LOCATION API] Google Geocoding failed:', googleError);
            }
        }

        // Fallback to OpenStreetMap Nominatim
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
            {
                headers: {
                    'User-Agent': 'StudX-App/1.0 (contact@studx.com)',
                    'Accept': 'application/json',
                },
            }
        );

        if (response.ok) {
            const data = await response.json();
            console.log('[LOCATION API] Location validated via Nominatim');
            return NextResponse.json({
                success: true,
                isValid: true,
                address: data.display_name,
                city: data.address?.city || data.address?.town || 'Unknown',
                method: 'OpenStreetMap Nominatim'
            });
        }

        return NextResponse.json({
            success: true,
            isValid: false,
            error: 'Location could not be validated'
        });

    } catch (error) {
        console.error('[LOCATION API] Validation error:', error);
        return NextResponse.json(
            { error: 'Failed to validate location', details: error.message },
            { status: 500 }
        );
    }
}

// Handle preflight requests
export async function OPTIONS(request) {
    return new Response(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
    });
}
