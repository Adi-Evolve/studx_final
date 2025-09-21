import { NextResponse } from 'next/server'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const lat = searchParams.get('lat')
    const lng = searchParams.get('lng')
    
    // Get API key from environment
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'AIzaSyBWliYbQUM08KHDigAiP7ARtsYcoGC74tM'
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Google Maps API key not configured' }, 
        { status: 500 }
      )
    }

    let response;
    
    // Handle reverse geocoding (coordinates to address)
    if (lat && lng) {
      console.log('[GEOCODE API] Reverse geocoding:', lat, lng)
      
      response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`,
        {
          headers: {
            'Accept': 'application/json',
          },
        }
      )
    } 
    // Handle forward geocoding (address to coordinates)
    else if (query) {
      console.log('[GEOCODE API] Forward geocoding:', query)
      
      response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=${apiKey}`,
        {
          headers: {
            'Accept': 'application/json',
          },
        }
      )
    } else {
      return NextResponse.json(
        { error: 'Either query parameter (for address search) or lat/lng parameters (for reverse geocoding) are required' }, 
        { status: 400 }
      )
    }

    if (!response.ok) {
      console.error('[GEOCODE API] Google Maps error:', response.status, response.statusText)
      return NextResponse.json(
        { error: 'Failed to fetch location data from Google Maps' },
        { status: response.status }
      )
    }

    const data = await response.json()
    
    if (data.status !== 'OK') {
      console.error('[GEOCODE API] Google Maps API error:', data.status, data.error_message)
      return NextResponse.json(
        { error: data.error_message || 'Google Maps API error' },
        { status: 400 }
      )
    }

    console.log('[GEOCODE API] Found', data.results.length, 'results')

    // Transform Google Maps results to match expected format
    const transformedResults = data.results.map(result => ({
      lat: result.geometry.location.lat,
      lon: result.geometry.location.lng, // Keep 'lon' for backward compatibility
      lng: result.geometry.location.lng,
      display_name: result.formatted_address,
      formatted_address: result.formatted_address,
      place_id: result.place_id,
      types: result.types
    }))

    // Add CORS headers for the response
    return NextResponse.json(transformedResults, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    })

  } catch (error) {
    console.error('[GEOCODE API] Error:', error.message)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Handle preflight requests
export async function OPTIONS(request) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
