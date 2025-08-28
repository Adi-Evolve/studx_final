import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Enhanced error logging
function logError(context, error, data = {}) {
  console.error(`[SEARCH API ${context}]:`, {
    message: error.message,
    stack: error.stack?.substring(0, 500),
    data,
    timestamp: new Date().toISOString()
  })
}

// Initialize Supabase with service key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SECRET_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('[SEARCH API] Missing environment variables:', {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseKey,
    availableKeys: Object.keys(process.env).filter(k => k.includes('SUPABASE'))
  })
}

const supabase = createClient(supabaseUrl, supabaseKey)

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const type = searchParams.get('type') || 'all' // 'all', 'products', 'rooms', 'notes', 'rentals'
    
    if (!query) {
      return NextResponse.json({ error: 'Search query is required' }, { status: 400 })
    }

    console.log(`[SEARCH API] Search request: "${query}", type: "${type}"`)

    let searchTerm = `%${query.trim()}%`
    
    // Handle accommodation-related searches - treat hostel, rooms, pg as equivalent
    const accommodationKeywords = ['room', 'rooms', 'hostel', 'hostels', 'pg', 'accommodation'];
    const lowerQuery = query.toLowerCase().trim();
    
    let isAccommodationSearch = accommodationKeywords.some(keyword => 
        lowerQuery.includes(keyword)
    );
    
    // If it's an accommodation search, expand the search terms
    if (isAccommodationSearch) {
        const accommodationTerms = accommodationKeywords.map(term => `%${term}%`).join(',');
        console.log(`[SEARCH API] Detected accommodation search - expanding terms for: ${accommodationKeywords.join(', ')}`);
    }
    
    console.log(`[SEARCH API] Searching for keyword: "${query}" (SQL term: "${searchTerm}")`)

    let allMatchingItems = []
    
    // Step 1: Search ALL tables (products, rooms, notes) for items matching the keyword
    console.log('[SEARCH API] Step 1: Searching all tables for matching items...')
    
    // Search products table
    if (type === 'all' || type === 'products') {
      console.log('[SEARCH API] Searching products...')
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .or(`title.ilike.${searchTerm},description.ilike.${searchTerm},category.ilike.${searchTerm}`)
        .eq('is_sold', false)
        .order('created_at', { ascending: false })

      if (productsError) {
        logError('PRODUCTS_SEARCH', productsError)
      } else {
        const productsWithType = (productsData || []).map(item => ({
          ...item,
          type: 'product',
          table_type: 'products'
        }))
        allMatchingItems.push(...productsWithType)
        console.log(`[SEARCH API] Found ${productsData?.length || 0} matching products`)
      }
    }

    // Search rooms table  
    if (type === 'all' || type === 'rooms') {
      console.log('[SEARCH API] Searching rooms...')
      
      let roomsQuery;
      
      if (isAccommodationSearch) {
        // For accommodation searches, return ALL rooms since they're all accommodations
        roomsQuery = supabase
          .from('rooms')
          .select('*')
          .order('created_at', { ascending: false });
        
        console.log('[SEARCH API] Using accommodation search - returning all rooms');
      } else {
        // For non-accommodation searches, use the specific search term
        roomsQuery = supabase
          .from('rooms')
          .select('*')
          .or(`title.ilike.${searchTerm},description.ilike.${searchTerm},category.ilike.${searchTerm},room_type.ilike.${searchTerm}`)
          .order('created_at', { ascending: false });
      }

      const { data: roomsData, error: roomsError } = await roomsQuery;

      if (roomsError) {
        logError('ROOMS_SEARCH', roomsError)
      } else {
        const roomsWithType = (roomsData || []).map(item => ({
          ...item,
          type: 'room',
          table_type: 'rooms'
        }))
        allMatchingItems.push(...roomsWithType)
        console.log(`[SEARCH API] Found ${roomsData?.length || 0} matching rooms`)
      }
    }

    // Search notes table
    if (type === 'all' || type === 'notes') {
      console.log('[SEARCH API] Searching notes...')
      const { data: notesData, error: notesError } = await supabase
        .from('notes')
        .select('*')
        .or(`title.ilike.${searchTerm},description.ilike.${searchTerm},category.ilike.${searchTerm},subject.ilike.${searchTerm},course_subject.ilike.${searchTerm},academic_year.ilike.${searchTerm}`)
        .order('created_at', { ascending: false })

      if (notesError) {
        logError('NOTES_SEARCH', notesError)
      } else {
        const notesWithType = (notesData || []).map(item => ({
          ...item,
          type: 'note',
          table_type: 'notes'
        }))
        allMatchingItems.push(...notesWithType)
        console.log(`[SEARCH API] Found ${notesData?.length || 0} matching notes`)
      }
    }

    // Search rentals table
    if (type === 'all' || type === 'rentals') {
      console.log('[SEARCH API] Searching rentals...')
      const { data: rentalsData, error: rentalsError } = await supabase
        .from('rentals')
        .select('*')
        .or(`title.ilike.${searchTerm},description.ilike.${searchTerm},category.ilike.${searchTerm},condition.ilike.${searchTerm},rental_terms.ilike.${searchTerm}`)
        .eq('is_rented', false)
        .order('created_at', { ascending: false })

      if (rentalsError) {
        logError('RENTALS_SEARCH', rentalsError)
      } else {
        const rentalsWithType = (rentalsData || []).map(item => ({
          ...item,
          type: 'rental',
          table_type: 'rentals'
        }))
        allMatchingItems.push(...rentalsWithType)
        console.log(`[SEARCH API] Found ${rentalsData?.length || 0} matching rentals`)
      }
    }

    console.log(`[SEARCH API] Step 1 Complete: Found total ${allMatchingItems.length} matching items`)

    // Step 2: Check which of these matching items are in sponsorship_sequences
    console.log('[SEARCH API] Step 2: Checking which items are sponsored...')
    
    const { data: sponsoredSequences, error: sponsoredError } = await supabase
      .from('sponsorship_sequences')
      .select('item_id, item_type, slot, created_at')

    if (sponsoredError) {
      logError('SPONSORED_SEQUENCES', sponsoredError)
    }

    // Step 3: Separate sponsored and regular items
    const sponsoredItems = []
    const regularItems = []

    allMatchingItems.forEach(item => {
      // Check if this item is in sponsorship_sequences
      const sponsorshipEntry = (sponsoredSequences || []).find(
        seq => seq.item_id === item.id && seq.item_type === item.type
      )

      if (sponsorshipEntry) {
        // This item is sponsored
        sponsoredItems.push({
          ...item,
          is_sponsored: true,
          sponsored_slot: sponsorshipEntry.slot,
          sponsored_created_at: sponsorshipEntry.created_at
        })
      } else {
        // This item is regular
        regularItems.push({
          ...item,
          is_sponsored: false
        })
      }
    })

    console.log(`[SEARCH API] Step 3 Complete: ${sponsoredItems.length} sponsored + ${regularItems.length} regular items`)

    // Step 4: Combine results with sponsored items first, sorted by sponsored slot
    const sponsoredSorted = sponsoredItems.sort((a, b) => a.sponsored_slot - b.sponsored_slot)
    const regularSorted = regularItems.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    
    const combinedResults = [
      ...sponsoredSorted,
      ...regularSorted
    ]

    const counts = {
      sponsored: sponsoredItems.length,
      regular: regularItems.length,
      total: combinedResults.length
    }

    console.log(`[SEARCH API] Search completed: ${counts.sponsored} sponsored + ${counts.regular} regular = ${counts.total} total`)

    return NextResponse.json({
      success: true,
      query,
      type,
      results: combinedResults,
      counts
    })

  } catch (error) {
    console.error('[SEARCH API] Unexpected error:', error)
    logError('GET_REQUEST', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
