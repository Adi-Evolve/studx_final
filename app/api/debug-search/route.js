import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SECRET_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const type = searchParams.get('type') || 'all'
    
    // console.log(`🔍 [SEARCH DEBUG] Query: "${query}", Type: "${type}"`)
    
    if (!query) {
      return NextResponse.json({ error: 'Search query is required' }, { status: 400 })
    }

    const searchTerm = `%${query.trim()}%`
    // console.log(`🔍 [SEARCH DEBUG] Search term: "${searchTerm}"`)

    // Test direct products search
    // console.log('📦 [SEARCH DEBUG] Testing products search...')
    const { data: productsData, error: productsError } = await supabase
      .from('products')
      .select('id, title, category, price, description, is_sold')
      .or(`title.ilike.${searchTerm},description.ilike.${searchTerm},category.ilike.${searchTerm}`)
      .eq('is_sold', false)
      .limit(5)

    // console.log(`📦 [SEARCH DEBUG] Products result:`, {
    //   error: productsError?.message,
    //   dataLength: productsData?.length,
    //   data: productsData?.map(p => ({ id: p.id, title: p.title, category: p.category, is_sold: p.is_sold }))
    // })

    // Test rooms search
    // console.log('🏠 [SEARCH DEBUG] Testing rooms search...')
    const { data: roomsData, error: roomsError } = await supabase
      .from('rooms')
      .select('id, title, room_type, price')
      .or(`title.ilike.${searchTerm},description.ilike.${searchTerm},room_type.ilike.${searchTerm}`)
      .limit(5)

        // console.log(`🏠 [SEARCH DEBUG] Rooms result:`, {
        //   error: roomsError?.message,
        //   dataLength: roomsData?.length,
        //   data: roomsData?.map(r => ({ id: r.id, title: r.title, room_type: r.room_type }))
        // })    // Combine results
    const results = [
      ...(productsData || []).map(item => ({ ...item, type: 'product', is_sponsored: false })),
      ...(roomsData || []).map(item => ({ ...item, type: 'room', is_sponsored: false }))
    ]

    // console.log(`✅ [SEARCH DEBUG] Final results: ${results.length} items`)

    return NextResponse.json({
      success: true,
      query,
      type,
      debug: {
        searchTerm,
        productsFound: productsData?.length || 0,
        roomsFound: roomsData?.length || 0,
        productsError: productsError?.message,
        roomsError: roomsError?.message
      },
      results,
      counts: {
        sponsored: 0,
        regular: results.length,
        total: results.length
      }
    })

  } catch (error) {
    // console.error('💥 [SEARCH DEBUG] Exception:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
