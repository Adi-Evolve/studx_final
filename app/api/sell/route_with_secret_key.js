import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Enhanced error logging
function logError(context, error, data = {}) {
  // console.error(`[SELL API ${context}]:`, {
    message: error.message,
    stack: error.stack?.substring(0, 500),
    data,
    timestamp: new Date().toISOString()
  })
}

// Environment check
const ENV_CHECK = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  hasSecretKey: !!process.env.SUPABASE_SECRET_KEY,
  hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
  hasImgbbKey: !!process.env.IMGBB_API_KEY,
  nodeEnv: process.env.NODE_ENV
}

// console.log('[SELL API] Environment check:', ENV_CHECK)

// Initialize Supabase with your exact variable name
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SECRET_KEY

if (!supabaseUrl || !supabaseKey) {
  // console.error('[SELL API] Missing environment variables:', {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseKey,
    availableKeys: Object.keys(process.env).filter(k => k.includes('SUPABASE'))
  })
}

const supabase = createClient(supabaseUrl, supabaseKey)

// Image upload function
async function uploadImageToImgBB(imageBase64) {
  try {
    const imgbbApiKey = process.env.IMGBB_API_KEY
    if (!imgbbApiKey) {
      throw new Error('ImgBB API key not found')
    }

    // console.log('[SELL API] Uploading image to ImgBB...')
    
    const formData = new FormData()
    formData.append('key', imgbbApiKey)
    formData.append('image', imageBase64)

    const response = await fetch('https://api.imgbb.com/1/upload', {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      throw new Error(`ImgBB upload failed: ${response.status} ${response.statusText}`)
    }

    const result = await response.json()
    
    if (!result.success) {
      throw new Error(`ImgBB API error: ${result.error?.message || 'Unknown error'}`)
    }

    // console.log('[SELL API] Image uploaded successfully')
    return result.data.url
  } catch (error) {
    logError('IMAGE_UPLOAD', error, { hasApiKey: !!process.env.IMGBB_API_KEY })
    throw error
  }
}

// GET endpoint for health check
export async function GET() {
  try {
    return NextResponse.json({
      message: 'StudX Sell API - Working with SUPABASE_SECRET_KEY',
      status: 'active',
      timestamp: new Date().toISOString(),
      environment: ENV_CHECK,
      supabaseConnection: 'testing...'
    })
  } catch (error) {
    logError('GET_REQUEST', error)
    return NextResponse.json({ 
      error: 'Health check failed',
      details: error.message 
    }, { status: 500 })
  }
}

// POST endpoint for selling items
export async function POST(request) {
  try {
    // console.log('[SELL API] POST request received')

    // Parse request body
    let body
    try {
      body = await request.json()
      // console.log('[SELL API] Request body parsed:', { 
        type: body.type, 
        hasImage: !!body.image,
        userEmail: body.userEmail 
      })
    } catch (parseError) {
      logError('BODY_PARSE', parseError)
      return NextResponse.json({ 
        error: 'Invalid JSON in request body',
        details: parseError.message 
      }, { status: 400 })
    }

    // Validate required fields
    const { type, userEmail } = body
    if (!type || !userEmail) {
      return NextResponse.json({ 
        error: 'Missing required fields',
        required: ['type', 'userEmail'],
        received: { type: !!type, userEmail: !!userEmail }
      }, { status: 400 })
    }

    // console.log('[SELL API] Validating user...')

    // Check if user exists
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, email')
      .eq('email', userEmail)
      .single()

    if (userError || !userData) {
      logError('USER_VALIDATION', userError || new Error('User not found'))
      return NextResponse.json({ 
        error: 'User not found or invalid',
        userEmail,
        details: userError?.message 
      }, { status: 401 })
    }

    // console.log('[SELL API] User validated:', userData.id)

    // Handle image upload if present
    let imageUrl = null
    if (body.image) {
      try {
        // console.log('[SELL API] Processing image upload...')
        imageUrl = await uploadImageToImgBB(body.image)
        // console.log('[SELL API] Image uploaded:', imageUrl)
      } catch (imageError) {
        logError('IMAGE_UPLOAD_FAIL', imageError)
        return NextResponse.json({ 
          error: 'Image upload failed',
          details: imageError.message 
        }, { status: 500 })
      }
    }

    // Prepare data for database
    const now = new Date().toISOString()
    let insertData = {
      user_id: userData.id,
      created_at: now,
      updated_at: now
    }

    // Add image URL if available
    if (imageUrl) {
      insertData.image_url = imageUrl
    }

    let tableName
    let result

    // Insert based on type
    if (type === 'room') {
      tableName = 'room_listings'
      insertData = {
        ...insertData,
        room_name: body.roomName || 'Unnamed Room',
        location: body.location || '',
        price: parseFloat(body.price) || 0,
        description: body.description || '',
        amenities: body.amenities || [],
        room_type: body.roomType || 'single',
        availability_status: 'available'
      }
    } else if (type === 'product') {
      tableName = 'product_listings'
      insertData = {
        ...insertData,
        product_name: body.productName || 'Unnamed Product',
        category: body.category || 'other',
        price: parseFloat(body.price) || 0,
        description: body.description || '',
        condition: body.condition || 'good',
        availability_status: 'available'
      }
    } else if (type === 'note') {
      tableName = 'notes'
      insertData = {
        ...insertData,
        title: body.title || 'Untitled Note',
        subject: body.subject || '',
        price: parseFloat(body.price) || 0,
        description: body.description || '',
        file_type: body.fileType || 'pdf',
        availability_status: 'available'
      }
    } else {
      return NextResponse.json({ 
        error: 'Invalid type',
        validTypes: ['room', 'product', 'note'],
        received: type 
      }, { status: 400 })
    }

    // console.log(`[SELL API] Inserting into ${tableName}...`)

    // Insert into database
    const { data, error: insertError } = await supabase
      .from(tableName)
      .insert(insertData)
      .select()
      .single()

    if (insertError) {
      logError('DATABASE_INSERT', insertError, { tableName, insertData })
      return NextResponse.json({ 
        error: 'Failed to create listing',
        details: insertError.message,
        table: tableName 
      }, { status: 500 })
    }

    // console.log('[SELL API] Successfully created listing:', data.id)

    return NextResponse.json({
      success: true,
      message: `${type} listing created successfully`,
      id: data.id,
      imageUrl,
      timestamp: now
    })

  } catch (error) {
    logError('POST_REQUEST', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
