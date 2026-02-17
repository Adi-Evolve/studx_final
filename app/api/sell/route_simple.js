import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Create Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

// ImgBB upload helper
async function uploadToImgBB(file) {
  const IMGBB_API_KEY = process.env.IMGBB_API_KEY
  if (!IMGBB_API_KEY) {
    throw new Error('IMGBB_API_KEY not configured')
  }

  const formData = new FormData()
  formData.append('image', file)

  const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
    method: 'POST',
    body: formData,
  })

  const result = await response.json()
  if (!result.success) {
    throw new Error(result.error?.message || 'Upload failed')
  }

  return result.data.url
}

export async function POST(request) {
  // console.log('[SELL API SIMPLE] Request received')

  try {
    // Parse the form data
    const formData = await request.formData()
    
    // Extract data
    const data = {}
    for (const [key, value] of formData.entries()) {
      data[key] = value
    }

    // console.log('[SELL API SIMPLE] Form data received:', Object.keys(data))

    // Check required fields
    if (!data.type) {
      return NextResponse.json({ 
        success: false, 
        error: 'Type is required' 
      }, { status: 400 })
    }

    if (!data.userEmail) {
      return NextResponse.json({ 
        success: false, 
        error: 'User email is required' 
      }, { status: 400 })
    }

    // Check if user exists
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email')
      .eq('email', data.userEmail)
      .single()

    if (userError || !user) {
      return NextResponse.json({ 
        success: false, 
        error: 'User not found. Please register first.' 
      }, { status: 401 })
    }

    // console.log('[SELL API SIMPLE] User authenticated:', user.email)

    // Process images
    let imageUrls = []
    const images = formData.getAll('images[]') || formData.getAll('images')
    
    for (const image of images) {
      if (image && image.size > 0) {
        try {
          const url = await uploadToImgBB(image)
          imageUrls.push(url)
        } catch (uploadError) {
          // console.error('Image upload error:', uploadError)
          // Continue with other images
        }
      }
    }

    // Prepare room data
    const roomData = {
      seller_id: user.id,
      title: data.title,
      description: data.description,
      price: parseFloat(data.price),
      college: data.college,
      room_type: data.roomType,
      occupancy: data.occupancy || 'Single',
      owner_name: data.ownerName,
      contact1: data.contact1,
      contact2: data.contact2 || null,
      distance: data.distance || null,
      deposit: data.deposit ? parseFloat(data.deposit) : null,
      fees_include_mess: data.feesIncludeMess === 'true',
      mess_fees: data.messType && data.messType !== 'no-mess' ? parseFloat(data.messType) : null,
      amenities: data.amenities ? data.amenities.split(',') : [],
      fees_period: data.feesPeriod || 'Monthly',
      images: imageUrls,
      location: data.location || null,
      category: 'rooms',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    // console.log('[SELL API SIMPLE] Inserting room data')

    // Insert into database
    const { data: insertedRoom, error: insertError } = await supabase
      .from('rooms')
      .insert(roomData)
      .select()
      .single()

    if (insertError) {
      // console.error('[SELL API SIMPLE] Insert error:', insertError)
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to save room listing',
        details: insertError.message 
      }, { status: 500 })
    }

    // console.log('[SELL API SIMPLE] Room inserted successfully:', insertedRoom.id)

    return NextResponse.json({
      success: true,
      message: 'Room listed successfully!',
      data: {
        id: insertedRoom.id,
        title: insertedRoom.title
      }
    })

  } catch (error) {
    // console.error('[SELL API SIMPLE] Error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error.message
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Sell API Simple - Working',
    status: 'active',
    env: {
      hasSupabase: !!(supabaseUrl && supabaseKey),
      hasImgBB: !!process.env.IMGBB_API_KEY
    }
  })
}
