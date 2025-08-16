import { NextResponse } from 'next/server'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    
    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter is required' }, 
        { status: 400 }
      )
    }

    // console.log('[GEOCODE API] Searching for:', query)

    // Make request to Nominatim API with proper headers
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`,
      {
        headers: {
          'User-Agent': 'StudX-App/1.0 (contact@studx.com)', // Required by Nominatim
          'Accept': 'application/json',
        },
      }
    )

    if (!response.ok) {
      // console.error('[GEOCODE API] Nominatim error:', response.status, response.statusText)
      return NextResponse.json(
        { error: 'Failed to fetch location data' },
        { status: response.status }
      )
    }

    const data = await response.json()
    // console.log('[GEOCODE API] Found', data.length, 'results')

    // Add CORS headers for the response
    return NextResponse.json(data, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    })

  } catch (error) {
    // console.error('[GEOCODE API] Error:', error.message)
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
