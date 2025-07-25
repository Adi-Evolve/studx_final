import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Enhanced error logging function
function logError(context, error, additionalInfo = {}) {
  console.error(`[SELL API ERROR - ${context}]:`, {
    error: error.message,
    stack: error.stack,
    additionalInfo,
    timestamp: new Date().toISOString()
  })
}

// Email-based authentication check
async function authenticateUser(request) {
  try {
    // Get Authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      throw new Error('No valid authorization header found')
    }

    const token = authHeader.replace('Bearer ', '')
    
    // Verify the token with Supabase Auth
    const { data: { user }, error } = await supabase.auth.getUser(token)
    
    if (error || !user?.email) {
      throw new Error(`Authentication failed: ${error?.message || 'No user email found'}`)
    }

    // Check if user exists in our users table
    const { data: existingUser, error: userError } = await supabase
      .from('users')
      .select('id, email, name, college')
      .eq('email', user.email)
      .single()

    if (userError && userError.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw new Error(`User lookup failed: ${userError.message}`)
    }

    // If user doesn't exist, create them
    if (!existingUser) {
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          id: user.id,
          email: user.email,
          name: user.user_metadata?.name || user.user_metadata?.full_name || user.email.split('@')[0],
          avatar_url: user.user_metadata?.avatar_url,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (createError) {
        throw new Error(`Failed to create user: ${createError.message}`)
      }

      return newUser
    }

    return existingUser
  } catch (error) {
    logError('AUTHENTICATION', error)
    throw error
  }
}

// Get or create user by email
async function getOrCreateUser(email, additionalData = {}) {
  try {
    // First try to find existing user
    const { data: existingUser, error: selectError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    if (selectError && selectError.code !== 'PGRST116') {
      throw new Error(`User lookup failed: ${selectError.message}`)
    }

    if (existingUser) {
      // Update user with any new information
      if (additionalData.college || additionalData.name) {
        const updateData = {
          updated_at: new Date().toISOString()
        }
        if (additionalData.college) updateData.college = additionalData.college
        if (additionalData.name) updateData.name = additionalData.name

        const { data: updatedUser, error: updateError } = await supabase
          .from('users')
          .update(updateData)
          .eq('id', existingUser.id)
          .select()
          .single()

        if (updateError) {
          logError('USER_UPDATE', updateError, { userId: existingUser.id, updateData })
          // Don't throw here, just log and continue with existing user
        } else {
          return updatedUser
        }
      }
      return existingUser
    }

    // Create new user if not found
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert({
        id: crypto.randomUUID(),
        email,
        name: additionalData.name || email.split('@')[0],
        college: additionalData.college || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (insertError) {
      throw new Error(`Failed to create user: ${insertError.message}`)
    }

    return newUser
  } catch (error) {
    logError('GET_OR_CREATE_USER', error, { email, additionalData })
    throw error
  }
}

// Validate required fields for each item type
function validateItemData(itemType, data) {
  const errors = []

  const commonRequired = ['title', 'description', 'price', 'college']
  
  for (const field of commonRequired) {
    if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
      errors.push(`${field} is required`)
    }
  }

  // Type-specific validation
  switch (itemType) {
    case 'rooms':
      const roomRequired = ['roomType', 'occupancy', 'ownerName', 'contact1']
      for (const field of roomRequired) {
        if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
          errors.push(`${field} is required for rooms`)
        }
      }
      break

    case 'products':
      if (!data.category || data.category.trim() === '') {
        errors.push('category is required for products')
      }
      if (!data.condition || data.condition.trim() === '') {
        errors.push('condition is required for products')
      }
      break

    case 'notes':
      const notesRequired = ['course', 'subject', 'academicYear']
      for (const field of notesRequired) {
        if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
          errors.push(`${field} is required for notes`)
        }
      }
      break

    default:
      errors.push(`Invalid item type: ${itemType}`)
  }

  return errors
}

// Insert item into appropriate table
async function insertItem(itemType, data, userId) {
  try {
    let insertData = {
      seller_id: userId,
      title: data.title.trim(),
      description: data.description.trim(),
      price: parseFloat(data.price),
      college: data.college.trim(),
      location: data.location || null,
      images: data.images || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    switch (itemType) {
      case 'rooms':
        insertData = {
          ...insertData,
          category: 'rooms',
          room_type: data.roomType,
          occupancy: data.occupancy,
          owner_name: data.ownerName,
          contact1: data.contact1,
          contact2: data.contact2 || null,
          distance: data.distance || null,
          deposit: data.deposit ? parseFloat(data.deposit) : null,
          fees_include_mess: data.feesIncludeMess || false,
          mess_fees: data.messType ? parseFloat(data.messType) : null,
          amenities: data.amenities || [],
          // Legacy fields for compatibility
          fees: data.fees || null,
          feesIncludeMess: data.feesIncludeMess || false,
          messType: data.messType || null,
          ownerName: data.ownerName,
          roomName: data.title
        }
        break

      case 'products':
        insertData = {
          ...insertData,
          category: data.category,
          condition: data.condition,
          pdf_url: data.pdfUrl || null
        }
        break

      case 'notes':
        insertData = {
          ...insertData,
          category: 'notes',
          course: data.course,
          subject: data.subject,
          academic_year: data.academicYear,
          course_subject: `${data.course} - ${data.subject}`,
          pdf_urls: data.pdfUrls || [],
          pdf_url: data.pdfUrl || null
        }
        break

      default:
        throw new Error(`Invalid item type: ${itemType}`)
    }

    const { data: result, error } = await supabase
      .from(itemType)
      .insert(insertData)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to insert ${itemType}: ${error.message}`)
    }

    return result
  } catch (error) {
    logError('INSERT_ITEM', error, { itemType, userId })
    throw error
  }
}

export async function POST(request) {
  try {
    // console.log('[SELL API] Processing request...')

    // Parse request body
    let body
    try {
      body = await request.json()
    } catch (parseError) {
      logError('REQUEST_PARSING', parseError)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid JSON in request body',
          details: parseError.message 
        },
        { status: 400 }
      )
    }

    const { itemType, data } = body

    // console.log('[SELL API] Request data:', { itemType, dataKeys: Object.keys(data || {}) })

    // Validate request structure
    if (!itemType || !data) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing itemType or data in request body',
          received: { itemType: !!itemType, data: !!data }
        },
        { status: 400 }
      )
    }

    // Authenticate user
    let authenticatedUser
    try {
      authenticatedUser = await authenticateUser(request)
      // console.log('[SELL API] User authenticated:', { email: authenticatedUser.email, id: authenticatedUser.id })
    } catch (authError) {
      logError('AUTHENTICATION_FAILED', authError)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Authentication failed',
          details: authError.message,
          hint: 'Make sure you are signed in and have a valid session'
        },
        { status: 401 }
      )
    }

    // Validate item data
    const validationErrors = validateItemData(itemType, data)
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Validation failed',
          details: validationErrors,
          received: data
        },
        { status: 400 }
      )
    }

    // Get or create user with additional data
    let user
    try {
      user = await getOrCreateUser(authenticatedUser.email, {
        name: data.name || authenticatedUser.name,
        college: data.college
      })
      // console.log('[SELL API] User found/created:', { id: user.id, email: user.email })
    } catch (userError) {
      logError('USER_CREATION_FAILED', userError)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to create or update user',
          details: userError.message
        },
        { status: 500 }
      )
    }

    // Insert the item
    let result
    try {
      result = await insertItem(itemType, data, user.id)
      // console.log('[SELL API] Item created:', { itemType, id: result.id })
    } catch (insertError) {
      logError('ITEM_INSERT_FAILED', insertError, { itemType, userId: user.id })
      return NextResponse.json(
        { 
          success: false, 
          error: `Failed to create ${itemType}`,
          details: insertError.message
        },
        { status: 500 }
      )
    }

    // Success response
    return NextResponse.json({
      success: true,
      message: `${itemType.slice(0, -1)} created successfully!`,
      data: {
        id: result.id,
        title: result.title,
        itemType,
        seller: {
          id: user.id,
          email: user.email,
          name: user.name
        }
      }
    })

  } catch (error) {
    logError('UNEXPECTED_ERROR', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'An unexpected error occurred',
        details: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
