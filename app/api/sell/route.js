import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
const { uploadPdfToGoogleDrive } = require('@/lib/googleDriveOAuthService');
// Initialize Supabase clients
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
);
// Get API key from environment variables for security
const IMGBB_API_KEY = process.env.IMGBB_API_KEY;
// Helper function to upload an image to ImgBB
async function uploadImageToImgBB(file) {
    // Check for API key
    if (!IMGBB_API_KEY) {
        throw new Error('IMGBB_API_KEY environment variable is not set');
    }
    // Check file size (ImgBB has a 32MB limit)
    const maxImageSize = 32 * 1024 * 1024; // 32MB
    if (file.size > maxImageSize) {
        throw new Error(`Image file "${file.name}" is too large. Maximum size is 32MB.`);
    }
    const formData = new FormData();
    formData.append('image', file);
    const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
        method: 'POST',
        body: formData,
    });
    const result = await response.json();
    if (!response.ok || !result.success) {
        throw new Error(result.error?.message || 'ImgBB upload failed');
    }
    return result.data.url;
}
export async function POST(request) {
  try {
    let parsedData;
    let isJson = false;
    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      parsedData = await request.json();
      isJson = true;
    } else {
      const formData = await request.formData();
      parsedData = {};
      for (const key of formData.keys()) {
        parsedData[key] = formData.get(key);
      }
    }
    // Now use parsedData object for all fields
    const type = parsedData.type;
    const user = isJson ? (parsedData.user || {}) : JSON.parse(parsedData.user || '{}');
    // Extract other fields based on type
    const data = {
      title: parsedData.title,
      description: parsedData.description,
      price: parsedData.price,
      category: parsedData.category,
      condition: parsedData.condition,
      college: parsedData.college,
      location: parsedData.location ? (typeof parsedData.location === 'string' ? JSON.parse(parsedData.location) : parsedData.location) : null,
      images: parsedData.images || [],
      pdfs: parsedData.pdfs || [],
      roomType: parsedData.roomType,
      occupancy: parsedData.occupancy,
      ownerName: parsedData.ownerName,
      contact1: parsedData.contact1,
      contact2: parsedData.contact2,
      distance: parsedData.distance,
      deposit: parsedData.deposit,
      feesIncludeMess: parsedData.feesIncludeMess === 'true',
      messType: parsedData.messType,
      amenities: parsedData.amenities || [],
      feesPeriod: parsedData.fees_period,
      course: parsedData.course,
      subject: parsedData.subject,
      academicYear: parsedData.academicYear,
      pdfUrls: parsedData.pdfUrls || [],
      pdfUrl: parsedData.pdfUrl,
    };
    // ============================================================================
    // 1. AUTHENTICATION VALIDATION (EMAIL-BASED)
    // ============================================================================
    if (!user || !user.email) {
      return NextResponse.json({ 
        success: false, 
        error: 'Authentication required. Please sign in with a valid email.',
        code: 'AUTH_MISSING_EMAIL'
      }, { status: 401 });
    }
    // Check if email exists in Supabase Auth by checking the public.users table
    // Since we have RLS enabled, this also validates the user exists in auth
    let authUser;
    try {
      // First, try to find the user in our public.users table
      const { data: existingUser, error: userCheckError } = await supabaseAdmin
        .from('users')
        .select('id, email, name, avatar_url, college, phone')
        .eq('email', user.email)
        .single();
      if (userCheckError && userCheckError.code !== 'PGRST116') {
        return NextResponse.json({ 
          success: false, 
          error: 'Authentication system error. Please try again.',
          code: 'AUTH_SYSTEM_ERROR',
          details: userCheckError.message
        }, { status: 500 });
      }
      if (!existingUser) {
        return NextResponse.json({ 
          success: false, 
          error: 'Email not registered. Please create an account first.',
          code: 'AUTH_EMAIL_UNREGISTERED'
        }, { status: 403 });
      }
      // Create auth user object from existing user data
      authUser = {
        id: existingUser.id,
        email: existingUser.email,
        user_metadata: {
          name: existingUser.name,
          avatar_url: existingUser.avatar_url
        }
      };
    } catch (authCheckError) {
      return NextResponse.json({ 
        success: false, 
        error: 'Authentication system error. Please try again.',
        code: 'AUTH_SYSTEM_ERROR',
        details: authCheckError.message
      }, { status: 500 });
    }
    // ============================================================================
    // 2. USER SYNC AND UPSERT
    // ============================================================================
    try {
      // First, get existing user data to preserve fields not sent in the form
      const { data: existingUserData, error: existingUserError } = await supabaseAdmin
        .from('users')
        .select('phone, name, avatar_url, college')
        .eq('id', authUser.id)
        .single();
      // If user exists, preserve their existing phone number and other data
      const userData = {
        id: authUser.id,
        email: user.email,
        name: user.name || authUser.user_metadata?.name || authUser.user_metadata?.full_name || existingUserData?.name || user.email.split('@')[0],
        avatar_url: user.avatar_url || authUser.user_metadata?.avatar_url || existingUserData?.avatar_url || null,
        college: user.college || data.college || existingUserData?.college || null,
        phone: user.phone || existingUserData?.phone || null, // Preserve existing phone if not provided
        updated_at: new Date().toISOString(),
      };
      const { data: upsertedUser, error: upsertError } = await supabaseAdmin
        .from('users')
        .upsert(userData, { onConflict: 'email' })
        .select()
        .single();
      if (upsertError) {
        return NextResponse.json({ 
          success: false, 
          error: 'Failed to sync user profile. Please try again.',
          code: 'USER_SYNC_ERROR',
          details: upsertError.message
        }, { status: 500 });
      }
    } catch (syncError) {
      return NextResponse.json({ 
        success: false, 
        error: 'User synchronization failed. Please try again.',
        code: 'USER_SYNC_EXCEPTION',
        details: syncError.message
      }, { status: 500 });
    }
    // ============================================================================
    // 3. VALIDATE REQUEST TYPE
    // ============================================================================
    if (!type || !['rooms', 'products', 'notes'].includes(type)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid submission type. Must be rooms, products, or notes.',
        code: 'INVALID_TYPE'
      }, { status: 400 });
    }
    // ============================================================================
    // 4. IMAGE UPLOAD PROCESSING
    // ============================================================================
    let imageUrls = [];
    // Accept single File object or array
    let imagesArray = [];
    if (Array.isArray(data.images)) {
      imagesArray = data.images;
    } else if (data.images) {
      imagesArray = [data.images];
    }
    if (imagesArray.length > 0) {
      try {
        for (let i = 0; i < imagesArray.length; i++) {
          const imageItem = imagesArray[i];
          if (typeof imageItem === 'string' && imageItem.trim() !== '') {
            imageUrls.push(imageItem);
            continue;
          }
          if (!imageItem || typeof imageItem !== 'object') {
            continue;
          }
          if (imageItem.name && imageItem.type && imageItem.size) {
            try {
              const uploadedUrl = await uploadImageToImgBB(imageItem);
              imageUrls.push(uploadedUrl);
            } catch (uploadError) {
              return NextResponse.json({ 
                success: false, 
                error: `Failed to upload image "${imageItem.name}": ${uploadError.message}`,
                code: 'IMAGE_UPLOAD_ERROR',
                details: uploadError.message
              }, { status: 400 });
            }
          } else {
          }
        }
      } catch (imageProcessError) {
        return NextResponse.json({ 
          success: false, 
          error: 'Failed to process images. Please try again.',
          code: 'IMAGE_PROCESSING_ERROR',
          details: imageProcessError.message
        }, { status: 500 });
      }
    }
    // ============================================================================
    // 4B. PDF UPLOAD PROCESSING (for notes)
    // ============================================================================
    let pdfUrls = [];
    // Accept single File object or array
    let pdfsArray = [];
    if (Array.isArray(data.pdfs)) {
      pdfsArray = data.pdfs;
    } else if (data.pdfs) {
      pdfsArray = [data.pdfs];
    }
    if (type === 'notes' && pdfsArray.length > 0) {
      try {
        for (let i = 0; i < pdfsArray.length; i++) {
          const pdfFile = pdfsArray[i];
          if (typeof pdfFile === 'string' && pdfFile.trim() !== '') {
            pdfUrls.push(pdfFile);
            continue;
          }
          if (!pdfFile || typeof pdfFile !== 'object') {
            continue;
          }
          if (pdfFile.name && pdfFile.type && pdfFile.size) {
            try {
              const uploadedUrl = await uploadPdfToGoogleDrive(pdfFile);
              pdfUrls.push(uploadedUrl);
            } catch (uploadError) {
              return NextResponse.json({ 
                success: false, 
                error: `Failed to upload PDF "${pdfFile.name}": ${uploadError.message}`,
                code: 'PDF_UPLOAD_ERROR',
                details: uploadError.message
              }, { status: 400 });
            }
          } else {
          }
        }
      } catch (pdfProcessError) {
        return NextResponse.json({ 
          success: false, 
          error: 'Failed to process PDFs. Please try again.',
          code: 'PDF_PROCESSING_ERROR',
          details: pdfProcessError.message
        }, { status: 500 });
      }
    }
    // ============================================================================
    // 5. PREPARE DATA FOR INSERTION
    // ============================================================================
    const baseData = {
      seller_id: authUser.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    let insertData;
    let tableName;
    try {
      switch (type) {
        case 'rooms':
          tableName = 'rooms';
          insertData = {
            ...baseData,
            title: data.title,
            description: data.description,
            price: parseFloat(data.price),
            college: data.college,
            location: data.location ? JSON.stringify(data.location) : null,
            images: imageUrls,
            room_type: data.roomType,
            occupancy: data.occupancy,
            owner_name: data.ownerName,
            contact1: data.contact1,
            contact2: data.contact2 || null,
            distance: data.distance || null,
            deposit: data.deposit ? parseFloat(data.deposit) : null,
            fees_include_mess: data.feesIncludeMess || false,
            mess_fees: data.messType && data.messType !== 'no-mess' ? parseFloat(data.messType) : null,
            amenities: data.amenities || [],
            fees_period: data.feesPeriod || 'Monthly', // Add fees period with default
            category: 'rooms',
          };
          break;
        case 'products':
          tableName = 'products';
          insertData = {
            ...baseData,
            title: data.title,
            description: data.description,
            price: parseFloat(data.price),
            category: data.category,
            condition: data.condition,
            college: data.college,
            location: data.location ? JSON.stringify(data.location) : null,
            images: imageUrls,
            pdf_url: data.pdfUrl || null,
          };
          break;
        case 'notes':
          tableName = 'notes';
          insertData = {
            ...baseData,
            title: data.title,
            description: data.description,
            price: parseFloat(data.price),
            college: data.college,
            course: data.course,
            subject: data.subject,
            academic_year: data.academicYear,
            course_subject: `${data.course} - ${data.subject}`,
            images: imageUrls,
            pdf_urls: pdfUrls,
            pdf_url: pdfUrls.length > 0 ? pdfUrls[0] : null,
            category: 'notes',
          };
          break;
        default:
          throw new Error(`Unsupported type: ${type}`);
      }
    } catch (dataError) {
      console.error('[Sell API] Data preparation error:', dataError);
      return NextResponse.json({ 
        success: false, 
        error: `Failed to prepare ${type} data. Check required fields.`,
        code: 'DATA_PREPARATION_ERROR',
        details: dataError.message
      }, { status: 400 });
    }
    // ============================================================================
    // 6. INSERT DATA TO DATABASE
    // ============================================================================
    try {
      console.log('[Sell API] Inserting into table:', tableName, 'with data:', insertData);
      const { data: insertedData, error: insertError } = await supabaseAdmin
        .from(tableName)
        .insert(insertData)
        .select()
        .single();
      if (insertError) {
        console.error('[Sell API] Database insert error:', insertError);
        // Handle specific database errors
        if (insertError.code === 'PGRST116') {
          return NextResponse.json({ 
            success: false, 
            error: 'Database configuration error. RLS policies may be blocking access.',
            code: 'DATABASE_RLS_ERROR',
            details: insertError.message
          }, { status: 500 });
        }
        if (insertError.code === '42501') {
          return NextResponse.json({ 
            success: false, 
            error: 'Insufficient permissions. Please check your authentication.',
            code: 'DATABASE_PERMISSION_ERROR',
            details: insertError.message
          }, { status: 403 });
        }
        return NextResponse.json({ 
          success: false, 
          error: `Failed to save ${type}. Please check your data and try again.`,
          code: 'DATABASE_INSERT_ERROR',
          details: insertError.message
        }, { status: 500 });
      }
      // ============================================================================
      // 7. SUCCESS RESPONSE
      // ============================================================================
      console.log('[Sell API] Inserted data:', insertedData);
      return NextResponse.json({
        success: true,
        message: `${type.charAt(0).toUpperCase() + type.slice(1)} submitted successfully!`,
        data: {
          id: insertedData.id,
          type: type,
          title: insertedData.title,
          created_at: insertedData.created_at
        }
      }, { status: 201 });
    } catch (insertException) {
      console.error('[Sell API] Database exception:', insertException);
      return NextResponse.json({ 
        success: false, 
        error: `Database error while saving ${type}. Please try again.`,
        code: 'DATABASE_EXCEPTION',
        details: insertException.message
      }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Internal server error. Please try again later.',
      code: 'INTERNAL_SERVER_ERROR',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}
export async function GET(request) {
  return NextResponse.json({
    message: 'StudX Sell API - Production Mode',
    status: 'active',
    authentication: 'email-based',
    security: 'RLS enabled',
    timestamp: new Date().toISOString()
  });
}

