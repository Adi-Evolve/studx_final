import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SECRET_KEY
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Security: Input validation (same as sell API)
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

// Secure image upload (exact copy from sell API)
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

export async function POST(request) {
    console.log('📥 POST request received at /api/rent');
    
    try {
        // Log environment check
        console.log('🔧 Environment check:');
        console.log('  - Supabase URL:', !!process.env.NEXT_PUBLIC_SUPABASE_URL);
        console.log('  - Supabase Secret Key:', !!process.env.SUPABASE_SECRET_KEY);
        console.log('  - ImgBB API Key:', !!process.env.IMGBB_API_KEY);
        
        // Parse form data
        const formData = await request.formData()
        
        // Build body object from form data
        const body = {}
        
        for (const [key, value] of formData.entries()) {
            if (key.startsWith('images') && value instanceof File) {
                if (!body.imageFiles) body.imageFiles = []
                body.imageFiles.push(value)
            } else if (key === 'college' || key === 'location') {
                try {
                    body[key] = JSON.parse(value)
                } catch (e) {
                    body[key] = value
                }
            } else {
                body[key] = validateAndSanitizeInput(value, 2000)
            }
        }

        console.log('📋 Form data summary:');
        console.log('  - Title:', body.title);
        console.log('  - Images:', body.imageFiles?.length || 0);
        console.log('  - Category:', body.category);

        // Get user authentication from bearer token
        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
        }

        const token = authHeader.replace('Bearer ', '');
        console.log('🔐 Validating session token...');

        // Create a Supabase client with the user's token
        const supabaseWithAuth = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
            auth: { autoRefreshToken: false, persistSession: false },
            global: { headers: { Authorization: `Bearer ${token}` } }
        });

        // Get user from session token
        const { data: { user }, error: authError } = await supabaseWithAuth.auth.getUser();
        
        if (authError || !user) {
            console.log('❌ Authentication failed:', authError?.message);
            return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
        }

        console.log('✅ User authenticated:', user.id);
        body.userEmail = user.email;

        // Validate required fields
        if (!body.title || !body.userEmail) {
            return NextResponse.json({ error: 'Missing required fields: title, userEmail' }, { status: 400 })
        }

        // Validate user in database (same as sell API)
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('id, email')
            .eq('email', body.userEmail)
            .single()

        if (userError || !userData) {
            return NextResponse.json({ error: 'User not authenticated or not found' }, { status: 401 })
        }

        console.log('📝 Form data validated for user:', userData.email);

        // Handle image uploads with security validation (with ImgBB outage fallback)
        let imageUrls = []
        let hasImgBBIssues = false
        
        if (body.imageFiles && body.imageFiles.length > 0) {
            console.log('🖼️ Processing', body.imageFiles.length, 'images with ImgBB...');
            
            for (const file of body.imageFiles) {
                // Validate file type
                if (!file.type.startsWith('image/')) {
                    return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 })
                }
                
                console.log(`📤 Uploading: ${file.name} (${file.size} bytes)`);
                
                // Convert File to base64
                const buffer = await file.arrayBuffer()
                const base64 = Buffer.from(buffer).toString('base64')
                
                try {
                    const imageUrl = await uploadImageToImgBB(base64)
                    imageUrls.push(imageUrl)
                    console.log(`✅ Uploaded: ${imageUrl.substring(0, 50)}...`);
                } catch (error) {
                    console.error('❌ Upload failed:', error.message);
                    
                    // Check if it's a 504 or server error (ImgBB outage)
                    if (error.message.includes('504') || error.message.includes('502') || error.message.includes('503')) {
                        console.log('⚠️ ImgBB service issue detected, using placeholder for', file.name);
                        hasImgBBIssues = true
                        
                        // Use a data URL placeholder to avoid Next.js image domain issues
                        const placeholderDataUrl = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRTVFN0VCIi8+CjxwYXRoIGQ9Ik0xNzUgMTIwSDIyNVYxODBIMTc1VjEyMFoiIGZpbGw9IiM5Q0E3QUYiLz4KPHA+PC9wPjx0ZXh0IHg9IjIwMCIgeT0iMjIwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNkI3MjgwIiBmb250LXNpemU9IjE0IiBmb250LWZhbWlseT0iQXJpYWwiPkltYWdlIFVwbG9hZCBQZW5kaW5nPC90ZXh0Pgo8L3N2Zz4='
                        imageUrls.push(placeholderDataUrl)
                    } else {
                        // Other errors should still fail the request
                        return NextResponse.json({ 
                            error: `Image upload failed: ${error.message}` 
                        }, { status: 500 })
                    }
                }
            }
        }

        // Require at least one image (including placeholders)
        if (imageUrls.length === 0) {
            console.log('❌ No valid images were uploaded');
            return NextResponse.json({ error: 'At least one image is required' }, { status: 400 })
        }

        if (hasImgBBIssues) {
            console.log(`⚠️ Rental created with ${imageUrls.length} placeholder images due to ImgBB service issues`);
        } else {
            console.log(`🎉 Successfully uploaded ${imageUrls.length} images to ImgBB`);
        }

        // Prepare rental data for database (matching schema columns)
        const rentalData = {
            title: body.title,
            description: body.description || '',
            rental_price: parseFloat(body.rental_price || body.rentPrice || '0'),
            security_deposit: parseFloat(body.security_deposit || body.securityDeposit || '0'),
            condition: body.condition,
            category: body.category,
            rental_duration: body.rental_duration || 'daily', // Required field with default
            available_from: body.availableFrom,
            available_until: body.availableUntil,
            delivery_options: body.deliveryOptions,
            college: typeof body.college === 'object' ? body.college.name || JSON.stringify(body.college) : body.college,
            location: typeof body.location === 'object' ? JSON.stringify(body.location) : body.location,
            images: imageUrls, // Store ImgBB URLs
            seller_id: userData.id, // Column name in schema is seller_id, not user_id
            // Remove status, created_at, updated_at - they have defaults in schema
        }

        console.log('💾 Inserting rental data into database...');

        // Insert into rentals table
        const { data: insertedRental, error: insertError } = await supabase
            .from('rentals')
            .insert([rentalData])
            .select()

        if (insertError) {
            console.error('❌ Database insertion error:', insertError);
            return NextResponse.json({ 
                error: 'Failed to save rental listing',
                details: insertError.message 
            }, { status: 500 })
        }

        console.log('✅ Rental listing created successfully:', insertedRental[0]?.id);

        // Prepare response with service status info
        const responseData = {
            success: true,
            rental: insertedRental[0],
            message: hasImgBBIssues 
                ? 'Rental listing created successfully! Images are temporarily using placeholders due to service issues.' 
                : 'Rental listing created successfully',
            imageCount: imageUrls.length,
            serviceIssue: hasImgBBIssues
        }

        return NextResponse.json(responseData, { status: 201 })

    } catch (error) {
        console.error('💥 API Error:', error);
        return NextResponse.json({ 
            error: 'Internal server error',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        }, { status: 500 })
    }
}
