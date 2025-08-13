import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Enhanced error logging
function logError(context, error, data = {}) {
  console.error(`[SELL API ${context}]:`, {
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

console.log('[SELL API] Environment check:', ENV_CHECK)

// Initialize Supabase with your exact variable name
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SECRET_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('[SELL API] Missing environment variables:', {
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

    console.log('[SELL API] Uploading image to ImgBB...')
    
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

    console.log('[SELL API] Image uploaded successfully')
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
  console.log('[SELL API] POST endpoint called - start of function')
  
  try {
    console.log('[SELL API] POST request received')

    // Parse request body - handle both JSON and FormData
    let body
    let isFormData = false
    
    try {
      const contentType = request.headers.get('content-type') || ''
      console.log('[SELL API] Content-Type:', contentType)
      
      if (contentType.includes('multipart/form-data')) {
        console.log('[SELL API] Handling FormData request')
        isFormData = true
        const formData = await request.formData()
        
        // Convert FormData to regular object
        body = {}
        for (const [key, value] of formData.entries()) {
          console.log('[SELL API] Processing FormData field:', key, typeof value)
          
          if (key === 'user') {
            try {
              body.user = JSON.parse(value)
            } catch (e) {
              console.log('[SELL API] Failed to parse user field:', e.message)
              body.user = null
            }
          } else if (key === 'location') {
            try {
              body.location = JSON.parse(value)
            } catch (e) {
              console.log('[SELL API] Failed to parse location field:', e.message)
              body.location = value // Use as string if JSON parse fails
            }
          } else if (key === 'amenities') {
            // Handle multiple amenities
            if (!body.amenities) body.amenities = []
            body.amenities.push(value)
          } else if (key.startsWith('images') && value instanceof File) {
            // Handle image files - we'll process these later
            if (!body.imageFiles) body.imageFiles = []
            body.imageFiles.push(value)
          } else if (key === 'type') {
            // Convert plural forms to singular forms for consistency
            if (value === 'rooms') {
              body.type = 'room'
            } else if (value === 'products') {
              body.type = 'product'
            } else if (value === 'notes') {
              body.type = 'note'
            } else {
              body.type = value
            }
          } else {
            // Handle regular fields
            body[key] = value
          }
        }

        // Use user email from parsed user object for authentication
        body.userEmail = body.user?.email
        
        console.log('[SELL API] FormData parsed:', { 
          type: body.type, 
          hasUser: !!body.user,
          userEmail: body.userEmail,
          hasImages: !!(body.imageFiles && body.imageFiles.length > 0),
          amenitiesCount: body.amenities?.length || 0,
          allKeys: Object.keys(body)
        })
      } else {
        console.log('[SELL API] Attempting to handle as JSON request')
        try {
          body = await request.json()
          console.log('[SELL API] JSON parsed successfully:', { 
            type: body.type, 
            hasImage: !!body.image,
            userEmail: body.userEmail 
          })
        } catch (jsonError) {
          console.log('[SELL API] Failed to parse as JSON:', jsonError.message)
          throw new Error(`Unable to parse request body as JSON: ${jsonError.message}`)
        }
      }
    } catch (parseError) {
      logError('BODY_PARSE', parseError)
      return NextResponse.json({ 
        error: 'Invalid request format',
        details: parseError.message,
        contentType: request.headers.get('content-type')
      }, { status: 400 })
    }

    // Validate required fields
    const { type, userEmail } = body
    if (!type || !userEmail) {
      return NextResponse.json({ 
        error: 'Missing required fields',
        required: ['type', 'userEmail'],
        received: { type: !!type, userEmail: !!userEmail },
        debug: { 
          bodyKeys: Object.keys(body),
          hasUser: !!body.user,
          userObject: body.user 
        }
      }, { status: 400 })
    }

    console.log('[SELL API] Validating user...')

    // Check if user exists - diagnostic version
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, email')
      .eq('email', userEmail)

    console.log('[SELL API] User query result:', {
      userData,
      userError,
      userCount: userData ? userData.length : 0
    })

    if (userError) {
      logError('USER_VALIDATION', userError)
      return NextResponse.json({ 
        error: 'Database error during user validation',
        userEmail,
        details: userError.message 
      }, { status: 500 })
    }

    if (!userData || userData.length === 0) {
      console.log('[SELL API] No user found with email:', userEmail)
      return NextResponse.json({ 
        error: 'User not found',
        userEmail,
        suggestion: 'Please make sure you are logged in with the correct email'
      }, { status: 401 })
    }

    if (userData.length > 1) {
      console.log('[SELL API] Multiple users found with email:', userEmail)
      return NextResponse.json({ 
        error: 'Multiple users found with this email',
        userEmail,
        count: userData.length
      }, { status: 409 })
    }

    const user = userData[0]
    console.log('[SELL API] User validated:', user.id)

    // Handle image upload - support both single image (base64) and multiple images (File objects)
    let imageUrls = []
    
    if (isFormData && body.imageFiles && body.imageFiles.length > 0) {
      // Handle File uploads from FormData
      console.log('[SELL API] Processing File uploads:', body.imageFiles.length)
      for (const file of body.imageFiles) {
        try {
          // Convert File to base64 for ImgBB
          const buffer = await file.arrayBuffer()
          const base64 = Buffer.from(buffer).toString('base64')
          const imageUrl = await uploadImageToImgBB(base64)
          imageUrls.push(imageUrl)
          console.log('[SELL API] File uploaded:', imageUrl)
        } catch (imageError) {
          logError('FILE_UPLOAD_FAIL', imageError, { fileName: file.name })
          return NextResponse.json({ 
            error: 'File upload failed',
            details: imageError.message,
            fileName: file.name
          }, { status: 500 })
        }
      }
    } else if (body.image) {
      // Handle base64 image upload (original method)
      try {
        console.log('[SELL API] Processing base64 image upload...')
        const imageUrl = await uploadImageToImgBB(body.image)
        imageUrls.push(imageUrl)
        console.log('[SELL API] Base64 image uploaded:', imageUrl)
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
      created_at: now,
      updated_at: now
    }

    // Add image URLs if available
    if (imageUrls.length > 0) {
      insertData.images = imageUrls
    }

    let tableName

    // Insert based on type with enhanced field mapping
    if (type === 'room') {
      tableName = 'rooms'
      insertData = {
        ...insertData,
        title: body.title || body.roomName || body.hostel_name || 'Unnamed Room',
        description: body.description || '',
        price: parseFloat(body.price || body.fees) || 0,
        location: body.location || '',
        room_type: body.roomType || body.room_type || 'single',
        category: 'rooms',
        seller_id: user.id,
        college: body.college || '',
        occupancy: body.occupancy || '1',
        owner_name: body.ownerName || body.owner_name || '',
        contact1: body.contact1 || body.contact_primary || '',
        contact2: body.contact2 || body.contact_secondary || null,
        deposit: parseFloat(body.deposit) || 0,
        fees_include_mess: body.feesIncludeMess || body.mess_included || false,
        mess_fees: parseFloat(body.messFees || body.mess_fees) || null,
        amenities: body.amenities || [],
        distance: body.distance || '0',
        duration: body.feePeriod || body.fees_period || body.duration || 'monthly'
      }
      
      console.log('[SELL API] Room data prepared:', {
        title: insertData.title,
        price: insertData.price,
        duration: insertData.duration,
        amenities: insertData.amenities?.length || 0,
        hasImages: !!(insertData.images && insertData.images.length > 0)
      })
      
    } else if (type === 'product') {
      tableName = 'products'
      insertData = {
        ...insertData,
        title: body.productName || body.title || 'Unnamed Product',
        description: body.description || '',
        price: parseFloat(body.price) || 0,
        category: body.category || 'other',
        condition: body.condition || 'Used',
        seller_id: user.id,
        college: body.college || '',
        location: body.location || '',
        is_sold: false
      }
    } else if (type === 'note') {
      tableName = 'notes'
      insertData = {
        ...insertData,
        title: body.title || 'Untitled Note',
        subject: body.subject || '',
        price: parseFloat(body.price) || 0,
        description: body.description || '',
        seller_id: user.id,
        category: 'notes'
      }
    } else {
      return NextResponse.json({ 
        error: 'Invalid type',
        validTypes: ['room', 'product', 'note'],
        received: type 
      }, { status: 400 })
    }

    console.log(`[SELL API] Inserting into ${tableName}...`)
    console.log('[SELL API] Insert data keys:', Object.keys(insertData))

    // Insert into database
    const { data, error: insertError } = await supabase
      .from(tableName)
      .insert(insertData)
      .select()
      .single()

    if (insertError) {
      logError('DATABASE_INSERT', insertError, { 
        tableName, 
        insertDataKeys: Object.keys(insertData),
        sampleData: {
          title: insertData.title,
          seller_id: insertData.seller_id,
          college: insertData.college
        }
      })
      return NextResponse.json({ 
        error: 'Failed to create listing',
        details: insertError.message,
        code: insertError.code,
        table: tableName,
        hint: insertError.hint
      }, { status: 500 })
    }

    console.log('[SELL API] Successfully created listing:', data.id)

    return NextResponse.json({
      success: true,
      message: `${type} listing created successfully`,
      id: data.id,
      imageUrls,
      data: {
        id: data.id,
        title: data.title,
        type: type
      },
      timestamp: now
    })

  } catch (error) {
    console.error('[SELL API] POST_REQUEST - Outer catch block error:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      cause: error.cause
    })
    logError('POST_REQUEST', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message,
      stack: error.stack?.substring(0, 1000),
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
