import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Initialize Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SECRET_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

// Security: Rate limiting storage
const rateLimitStore = new Map()

function rateLimit(identifier, maxRequests = 50, windowMs = 15 * 60 * 1000) {
  const now = Date.now()
  const windowStart = now - windowMs
  
  if (!rateLimitStore.has(identifier)) {
    rateLimitStore.set(identifier, [])
  }
  
  const requests = rateLimitStore.get(identifier)
  const validRequests = requests.filter(timestamp => timestamp > windowStart)
  
  if (validRequests.length >= maxRequests) {
    return false
  }
  
  validRequests.push(now)
  rateLimitStore.set(identifier, validRequests)
  return true
}

// Security: Input validation
function validateAndSanitizeInput(input, maxLength = 1000) {
  if (!input) return null
  
  let sanitized = input.toString().trim()
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
  sanitized = sanitized.replace(/javascript:/gi, '')
  sanitized = sanitized.replace(/on\w+\s*=/gi, '')
  
  if (sanitized.length > maxLength) {
    throw new Error(`Input too long. Maximum ${maxLength} characters allowed.`)
  }
  
  return sanitized
}

// Secure image upload
async function uploadImageToImgBB(imageBase64) {
  const imgbbApiKey = process.env.IMGBB_API_KEY
  if (!imgbbApiKey) {
    throw new Error('ImgBB API key not configured')
  }

  // Validate image size (limit to 10MB)
  const imageSizeKB = (imageBase64.length * 3) / 4 / 1024
  if (imageSizeKB > 10240) {
    throw new Error('Image too large. Maximum 10MB allowed.')
  }

  const formData = new FormData()
  formData.append('image', imageBase64)

  const response = await fetch(`https://api.imgbb.com/1/upload?key=${imgbbApiKey}`, {
    method: 'POST',
    body: formData
  })

  if (!response.ok) {
    throw new Error(`Image upload failed: ${response.status}`)
  }

  const result = await response.json()
  
  if (!result.success) {
    throw new Error(`Image upload error: ${result.error?.message || 'Unknown error'}`)
  }

  return result.data.url
}

// Secure API response
function secureAPIResponse(data, status = 200) {
  return NextResponse.json({
    success: status < 400,
    data: status < 400 ? data : null,
    error: status >= 400 ? data : null,
    timestamp: new Date().toISOString()
  }, {
    status,
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    }
  })
}

// GET endpoint - Health check with security
export async function GET(request) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown'
    if (!rateLimit(ip, 100)) {
      return secureAPIResponse('Rate limit exceeded', 429)
    }

    return secureAPIResponse({
      message: '🔒 StudX Sell API - Secured',
      status: 'active',
      timestamp: new Date().toISOString(),
      security: 'enabled'
    })
  } catch (error) {
    console.error('🚨 GET API Error:', error)
    return secureAPIResponse('Internal server error', 500)
  }
}

// POST endpoint with comprehensive security
export async function POST(request) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown'
    if (!rateLimit(ip, 10)) {
      return secureAPIResponse('Rate limit exceeded. Try again later.', 429)
    }

    const contentType = request.headers.get('content-type') || ''
    let body = {}
    let isFormData = false

    // Handle FormData or JSON
    if (contentType.includes('multipart/form-data')) {
      isFormData = true
      const formData = await request.formData()
      
      for (const [key, value] of formData.entries()) {
        if (key === 'user') {
          try {
            body.user = JSON.parse(value)
          } catch {
            body.user = null
          }
        } else if (key === 'location') {
          try {
            body.location = JSON.parse(value)
          } catch {
            body.location = value
          }
        } else if (key === 'amenities') {
          if (!body.amenities) body.amenities = []
          body.amenities.push(value)
        } else if (key.startsWith('images') && value instanceof File) {
          if (!body.imageFiles) body.imageFiles = []
          body.imageFiles.push(value)
        } else if (key === 'type') {
          body.type = value === 'rooms' ? 'room' : 
                     value === 'products' ? 'product' : 
                     value === 'notes' ? 'note' : value
        } else {
          body[key] = validateAndSanitizeInput(value, 2000)
        }
      }
      
      body.userEmail = body.user?.email
    } else {
      body = await request.json()
      
      // Sanitize inputs
      Object.keys(body).forEach(key => {
        if (typeof body[key] === 'string') {
          body[key] = validateAndSanitizeInput(body[key], 2000)
        }
      })
    }

    // Validate required fields
    if (!body.type || !body.userEmail) {
      return secureAPIResponse('Missing required fields: type, userEmail', 400)
    }

    // Validate user authentication
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, email')
      .eq('email', body.userEmail)
      .single()

    if (userError || !userData) {
      return secureAPIResponse('User not authenticated or not found', 401)
    }

    // Handle image uploads with security validation
    let imageUrls = []
    
    if (isFormData && body.imageFiles?.length > 0) {
      for (const file of body.imageFiles) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          return secureAPIResponse('Only image files are allowed', 400)
        }
        
        // Convert File to base64
        const buffer = await file.arrayBuffer()
        const base64 = Buffer.from(buffer).toString('base64')
        
        try {
          const imageUrl = await uploadImageToImgBB(base64)
          imageUrls.push(imageUrl)
        } catch (error) {
          return secureAPIResponse(`Image upload failed: ${error.message}`, 500)
        }
      }
    } else if (body.image) {
      try {
        const imageUrl = await uploadImageToImgBB(body.image)
        imageUrls.push(imageUrl)
      } catch (error) {
        return secureAPIResponse(`Image upload failed: ${error.message}`, 500)
      }
    }

    // Prepare secure data insertion
    const now = new Date().toISOString()
    
    let insertData = {
      created_at: now,
      updated_at: now,
      seller_id: userData.id
    }

    if (imageUrls.length > 0) {
      insertData.images = imageUrls
    }

    let tableName

    // Data preparation based on type
    if (body.type === 'room') {
      tableName = 'rooms'
      insertData = {
        ...insertData,
        title: body.title || body.hostel_name || 'Unnamed Room',
        description: body.description || '',
        price: Math.max(0, parseFloat(body.price || body.fees) || 0),
        location: body.location || '',
        room_type: body.room_type || 'single',
        category: 'rooms',
        college: body.college || '',
        occupancy: body.occupancy || '1',
        owner_name: body.owner_name || '',
        contact1: body.contact_primary || '',
        contact2: body.contact_secondary || null,
        deposit: Math.max(0, parseFloat(body.deposit) || 0),
        fees_include_mess: Boolean(body.mess_included),
        mess_fees: parseFloat(body.mess_fees) || null,
        amenities: body.amenities || [],
        distance: body.distance || '0',
        duration: body.duration || 'monthly'
      }
    } else if (body.type === 'product') {
      tableName = 'products'
      insertData = {
        ...insertData,
        title: body.title || 'Unnamed Product',
        description: body.description || '',
        price: Math.max(0, parseFloat(body.price) || 0),
        category: body.category || 'other',
        condition: body.condition || 'Used',
        college: body.college || '',
        location: body.location || '',
        is_sold: false
      }
    } else if (body.type === 'note') {
      tableName = 'notes'
      insertData = {
        ...insertData,
        title: body.title || 'Untitled Note',
        subject: body.subject || '',
        price: Math.max(0, parseFloat(body.price) || 0),
        description: body.description || '',
        category: 'notes'
      }
    } else {
      return secureAPIResponse('Invalid item type', 400)
    }

    // Insert into database with security validation
    const { data, error: insertError } = await supabase
      .from(tableName)
      .insert(insertData)
      .select()
      .single()

    if (insertError) {
      console.error('🚨 Database insert error:', insertError)
      return secureAPIResponse('Failed to create listing', 500)
    }

    return secureAPIResponse({
      success: true,
      message: `${body.type} listing created successfully`,
      id: data.id,
      data: {
        id: data.id,
        title: data.title,
        type: body.type
      }
    })

  } catch (error) {
    console.error('🚨 Sell API error:', error)
    return secureAPIResponse('Internal server error', 500)
  }
}
