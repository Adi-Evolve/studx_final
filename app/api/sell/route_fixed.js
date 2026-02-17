import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Enhanced logging function
function logError(context, error, additionalInfo = {}) {
  console.error(`[SELL API ERROR - ${context}]:`, {
    error: error.message,
    stack: error.stack,
    additionalInfo,
    timestamp: new Date().toISOString(),
    env: {
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      hasImgbbKey: !!process.env.IMGBB_API_KEY,
      nodeEnv: process.env.NODE_ENV
    }
  })
}

// Initialize Supabase client with error handling
let supabase
try {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL environment variable is missing')
  }
  if (!supabaseServiceKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY environment variable is missing')
  }

  supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  console.log('[SELL API] Supabase client initialized successfully')
} catch (initError) {
  console.error('[SELL API] Failed to initialize Supabase:', initError.message)
}

// ImgBB upload function with better error handling
async function uploadImageToImgBB(file) {
  const IMGBB_API_KEY = process.env.IMGBB_API_KEY
  
  if (!IMGBB_API_KEY) {
    throw new Error('IMGBB_API_KEY environment variable is not set')
  }

  // Validate file
  if (!file || !file.name || !file.type) {
    throw new Error('Invalid file object')
  }

  // Check file size (ImgBB has a 32MB limit)
  const maxImageSize = 32 * 1024 * 1024 // 32MB
  if (file.size > maxImageSize) {
    throw new Error(`Image file "${file.name}" is too large. Maximum size is 32MB.`)
  }

  // Check file type
  if (!file.type.startsWith('image/')) {
    throw new Error(`File "${file.name}" is not a valid image file`)
  }

  try {
    const formData = new FormData()
    formData.append('image', file)

    const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
      method: 'POST',
      body: formData,
    })

    const result = await response.json()

    if (!response.ok || !result.success) {
      throw new Error(result.error?.message || `ImgBB upload failed with status ${response.status}`)
    }

    return result.data.url
  } catch (uploadError) {
    console.error('[IMGBB] Upload error:', uploadError)
    throw uploadError
  }
}

// Authentication function
async function authenticateUser(userEmail) {
  if (!userEmail) {
    throw new Error('User email is required')
  }

  try {
    // Check if user exists in our users table
    const { data: existingUser, error: userError } = await supabase
      .from('users')
      .select('id, email, name, college, phone, avatar_url')
      .eq('email', userEmail)
      .single()

    if (userError) {
      if (userError.code === 'PGRST116') { // No rows returned
        throw new Error(`User with email ${userEmail} not found. Please register first.`)
      }
      throw new Error(`User authentication failed: ${userError.message}`)
    }

    return existingUser
  } catch (authError) {
    console.error('[AUTH] Authentication error:', authError)
    throw authError
  }
}

export async function POST(request) {
  console.log('[SELL API] POST request received')
  
  try {
    // Check if Supabase is initialized
    if (!supabase) {
      return NextResponse.json({
        success: false,
        error: 'Database connection not initialized. Please check environment variables.',
        code: 'DB_INIT_ERROR'
      }, { status: 500 })
    }

    // Parse request data
    let parsedData
    let isJson = false
    const contentType = request.headers.get('content-type') || ''

    console.log('[SELL API] Content type:', contentType)

    try {
      if (contentType.includes('application/json')) {
        parsedData = await request.json()
        isJson = true
      } else {
        const formData = await request.formData()
        parsedData = {}
        for (const key of formData.keys()) {
          const value = formData.get(key)
          parsedData[key] = value
        }
      }
    } catch (parseError) {
      logError('REQUEST_PARSING', parseError)
      return NextResponse.json({
        success: false,
        error: 'Failed to parse request data',
        code: 'PARSE_ERROR',
        details: parseError.message
      }, { status: 400 })
    }

    console.log('[SELL API] Parsed data keys:', Object.keys(parsedData))

    // Extract and validate required fields
    const type = parsedData.type
    const userEmail = parsedData.userEmail || parsedData.user?.email

    if (!type) {
      return NextResponse.json({
        success: false,
        error: 'Type is required (rooms, products, or notes)',
        code: 'MISSING_TYPE'
      }, { status: 400 })
    }

    if (!['rooms', 'products', 'notes'].includes(type)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid type. Must be rooms, products, or notes',
        code: 'INVALID_TYPE'
      }, { status: 400 })
    }

    if (!userEmail) {
      return NextResponse.json({
        success: false,
        error: 'User email is required for authentication',
        code: 'MISSING_USER_EMAIL'
      }, { status: 401 })
    }

    // Authenticate user
    let authenticatedUser
    try {
      authenticatedUser = await authenticateUser(userEmail)
      console.log('[SELL API] User authenticated:', authenticatedUser.email)
    } catch (authError) {
      logError('AUTHENTICATION', authError, { userEmail })
      return NextResponse.json({
        success: false,
        error: authError.message,
        code: 'AUTH_ERROR'
      }, { status: 401 })
    }

    // Validate required fields based on type
    const requiredFields = {
      rooms: ['title', 'description', 'price', 'college', 'roomType', 'ownerName', 'contact1'],
      products: ['title', 'description', 'price', 'category', 'condition', 'college'],
      notes: ['title', 'description', 'price', 'college', 'course', 'subject', 'academicYear']
    }

    const missingFields = requiredFields[type].filter(field => !parsedData[field])
    if (missingFields.length > 0) {
      return NextResponse.json({
        success: false,
        error: `Missing required fields: ${missingFields.join(', ')}`,
        code: 'MISSING_FIELDS',
        missingFields
      }, { status: 400 })
    }

    // Process images if any
    let imageUrls = []
    const images = parsedData.images || []
    
    if (images && images.length > 0) {
      console.log('[SELL API] Processing images:', images.length)
      
      try {
        for (let i = 0; i < images.length; i++) {
          const image = images[i]
          
          if (typeof image === 'string' && image.trim() !== '') {
            // Already a URL
            imageUrls.push(image)
          } else if (image && typeof image === 'object' && image.name) {
            // File object - upload to ImgBB
            const uploadedUrl = await uploadImageToImgBB(image)
            imageUrls.push(uploadedUrl)
          }
        }
        console.log('[SELL API] Images processed:', imageUrls.length)
      } catch (imageError) {
        logError('IMAGE_PROCESSING', imageError)
        return NextResponse.json({
          success: false,
          error: `Failed to process images: ${imageError.message}`,
          code: 'IMAGE_ERROR'
        }, { status: 400 })
      }
    }

    // Prepare data for database insertion
    const baseData = {
      seller_id: authenticatedUser.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    let insertData
    let tableName

    try {
      switch (type) {
        case 'rooms':
          tableName = 'rooms'
          insertData = {
            ...baseData,
            title: parsedData.title,
            description: parsedData.description,
            price: parseFloat(parsedData.price),
            college: parsedData.college,
            location: parsedData.location ? (typeof parsedData.location === 'string' ? parsedData.location : JSON.stringify(parsedData.location)) : null,
            images: imageUrls,
            room_type: parsedData.roomType,
            occupancy: parsedData.occupancy || 'Single',
            owner_name: parsedData.ownerName,
            contact1: parsedData.contact1,
            contact2: parsedData.contact2 || null,
            distance: parsedData.distance || null,
            deposit: parsedData.deposit ? parseFloat(parsedData.deposit) : null,
            fees_include_mess: parsedData.feesIncludeMess === 'true' || parsedData.feesIncludeMess === true,
            mess_fees: parsedData.messType && parsedData.messType !== 'no-mess' ? parseFloat(parsedData.messType) || 0 : null,
            amenities: Array.isArray(parsedData.amenities) ? parsedData.amenities : (parsedData.amenities ? [parsedData.amenities] : []),
            fees_period: parsedData.feesPeriod || parsedData.fees_period || 'Monthly',
            category: 'rooms',
          }
          break

        case 'products':
          tableName = 'products'
          insertData = {
            ...baseData,
            title: parsedData.title,
            description: parsedData.description,
            price: parseFloat(parsedData.price),
            category: parsedData.category,
            condition: parsedData.condition,
            college: parsedData.college,
            location: parsedData.location ? (typeof parsedData.location === 'string' ? parsedData.location : JSON.stringify(parsedData.location)) : null,
            images: imageUrls,
          }
          break

        case 'notes':
          tableName = 'notes'
          insertData = {
            ...baseData,
            title: parsedData.title,
            description: parsedData.description,
            price: parseFloat(parsedData.price),
            college: parsedData.college,
            course: parsedData.course,
            subject: parsedData.subject,
            academic_year: parsedData.academicYear,
            course_subject: `${parsedData.course} - ${parsedData.subject}`,
            images: imageUrls,
            pdf_urls: [],
            category: 'notes',
          }
          break
      }
    } catch (dataError) {
      logError('DATA_PREPARATION', dataError, { type, parsedData })
      return NextResponse.json({
        success: false,
        error: `Failed to prepare ${type} data: ${dataError.message}`,
        code: 'DATA_PREP_ERROR'
      }, { status: 400 })
    }

    // Insert data into database
    console.log('[SELL API] Inserting into table:', tableName)
    
    try {
      const { data: insertedData, error: insertError } = await supabase
        .from(tableName)
        .insert(insertData)
        .select()
        .single()

      if (insertError) {
        logError('DATABASE_INSERT', insertError, { tableName, insertData })
        
        // Handle specific database errors
        if (insertError.code === '23505') {
          return NextResponse.json({
            success: false,
            error: 'Duplicate entry detected',
            code: 'DUPLICATE_ENTRY'
          }, { status: 409 })
        }
        
        if (insertError.code === '42501') {
          return NextResponse.json({
            success: false,
            error: 'Insufficient permissions. Please check your authentication.',
            code: 'PERMISSION_ERROR'
          }, { status: 403 })
        }

        return NextResponse.json({
          success: false,
          error: `Database error: ${insertError.message}`,
          code: 'DB_INSERT_ERROR',
          details: insertError
        }, { status: 500 })
      }

      console.log('[SELL API] Successfully inserted:', insertedData.id)

      return NextResponse.json({
        success: true,
        message: `${type.charAt(0).toUpperCase() + type.slice(1)} listed successfully!`,
        data: {
          id: insertedData.id,
          type: type,
          title: insertedData.title,
          created_at: insertedData.created_at
        }
      }, { status: 201 })

    } catch (insertException) {
      logError('DATABASE_EXCEPTION', insertException, { tableName })
      return NextResponse.json({
        success: false,
        error: 'Database connection error. Please try again.',
        code: 'DB_CONNECTION_ERROR',
        details: insertException.message
      }, { status: 500 })
    }

  } catch (error) {
    logError('GENERAL_ERROR', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error. Please try again later.',
      code: 'INTERNAL_ERROR',
      details: process.env.NODE_ENV === 'development' ? error.message : 'An unexpected error occurred'
    }, { status: 500 })
  }
}

export async function GET(request) {
  return NextResponse.json({
    message: 'StudX Sell API - Fixed Version',
    status: 'active',
    timestamp: new Date().toISOString(),
    environment: {
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      hasImgbbKey: !!process.env.IMGBB_API_KEY,
      nodeEnv: process.env.NODE_ENV
    }
  })
}
