import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { uploadPdfToGoogleDrive } from '@/lib/googleDriveOAuthService';

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
    // Parse FormData instead of JSON
    const formData = await request.formData();
    
    // console.log('📥 [SELL API] Received FormData request');

    // Extract data from FormData
    const type = formData.get('type');
    const user = JSON.parse(formData.get('user') || '{}');
    
    // Extract other fields based on type
    const data = {
      title: formData.get('title'),
      description: formData.get('description'),
      price: formData.get('price'),
      category: formData.get('category'),
      condition: formData.get('condition'),
      college: formData.get('college'),
      location: formData.get('location') ? JSON.parse(formData.get('location')) : null,
      images: formData.getAll('images'), // Get all image files
      pdfs: formData.getAll('pdfs'), // Get all PDF files
      // Add other fields as needed for rooms/notes
      roomType: formData.get('roomType'),
      occupancy: formData.get('occupancy'),
      ownerName: formData.get('ownerName'),
      contact1: formData.get('contact1'),
      contact2: formData.get('contact2'),
      distance: formData.get('distance'),
      deposit: formData.get('deposit'),
      feesIncludeMess: formData.get('feesIncludeMess') === 'true',
      messType: formData.get('messType'),
      amenities: formData.getAll('amenities'),
      course: formData.get('course'),
      subject: formData.get('subject'),
      academicYear: formData.get('academicYear'),
      pdfUrls: formData.getAll('pdfUrls'),
      pdfUrl: formData.get('pdfUrl'),
    };

    // console.log('📥 [SELL API] Parsed data:', {
    // //   type,
    // //   user: user.email,
    // //   title: data.title,
    // //   imagesCount: data.images?.length || 0
    // // });
// 
    // // ============================================================================
    // // 1. AUTHENTICATION VALIDATION (EMAIL-BASED)
    // // ============================================================================
    // 
    // if (!user || !user.email) {
      // // console.error('❌ [AUTH ERROR] No user or email provided');
      // return NextResponse.json({
        // success: false,
        // error: 'Authentication required. Please sign in with a valid email.',
        // code: 'AUTH_MISSING_EMAIL'
      // }, { status: 401 });
    // }
// 
    // // console.log('🔍 [AUTH] Checking user authentication for email:', user.email);
// 
    // // Check if email exists in Supabase Auth by checking the public.users table
    // // Since we have RLS enabled, this also validates the user exists in auth
    // let authUser;
    // try {
      // // First, try to find the user in our public.users table
      // const { data: existingUser, error: userCheckError } = await supabaseAdmin
        // .from('users')
        // .select('id, email, name, avatar_url, college, phone')
        // .eq('email', user.email)
        // .single();
// 
      // if (userCheckError && userCheckError.code !== 'PGRST116') {
        // // console.error('❌ [AUTH ERROR] Database error during user check:', userCheckError);
        // return NextResponse.json({
          // success: false,
          // error: 'Authentication system error. Please try again.',
          // code: 'AUTH_SYSTEM_ERROR',
          // details: userCheckError.message
        // }, { status: 500 });
      // }
// 
      // if (!existingUser) {
        // // console.error('❌ [AUTH ERROR] No user found for email:', user.email);
        // return NextResponse.json({
          // success: false,
          // error: 'Email not registered. Please create an account first.',
          // code: 'AUTH_EMAIL_UNREGISTERED'
        // }, { status: 403 });
      // }
// 
      // // Create auth user object from existing user data
      // authUser = {
        // id: existingUser.id,
        // email: existingUser.email,
        // user_metadata: {
          // name: existingUser.name,
          // avatar_url: existingUser.avatar_url
        // }
      // };
      // 
      // // console.log('✅ [AUTH] User authenticated successfully:', authUser.id);
    // } catch (authCheckError) {
      // // console.error('❌ [AUTH ERROR] Exception during auth check:', authCheckError);
      // return NextResponse.json({
        // success: false,
        // error: 'Authentication system error. Please try again.',
        // code: 'AUTH_SYSTEM_ERROR',
        // details: authCheckError.message
      // }, { status: 500 });
    // }
// 
    // // ============================================================================
    // // 2. USER SYNC AND UPSERT
    // // ============================================================================
    // 
    // // console.log('👤 [USER SYNC] Upserting user to public.users table');
    // try {
      // // First, get existing user data to preserve fields not sent in the form
      // const { data: existingUserData, error: existingUserError } = await supabaseAdmin
        // .from('users')
        // .select('phone, name, avatar_url, college')
        // .eq('id', authUser.id)
        // .single();
// 
      // // If user exists, preserve their existing phone number and other data
      // const userData = {
        // id: authUser.id,
        // email: user.email,
        // name: user.name || authUser.user_metadata?.name || authUser.user_metadata?.full_name || existingUserData?.name || user.email.split('@')[0],
        // avatar_url: user.avatar_url || authUser.user_metadata?.avatar_url || existingUserData?.avatar_url || null,
        // college: user.college || data.college || existingUserData?.college || null,
        // phone: user.phone || existingUserData?.phone || null, // Preserve existing phone if not provided
        // updated_at: new Date().toISOString(),
      // };
// 
      // const { data: upsertedUser, error: upsertError } = await supabaseAdmin
        // .from('users')
        // .upsert(userData, { onConflict: 'email' })
        // .select()
        // .single();
// 
      // if (upsertError) {
        // // console.error('❌ [USER SYNC ERROR] Failed to upsert user:', upsertError);
        // return NextResponse.json({
          // success: false,
          // error: 'Failed to sync user profile. Please try again.',
          // code: 'USER_SYNC_ERROR',
          // details: upsertError.message
        // }, { status: 500 });
      // }
// 
      // // console.log('✅ [USER SYNC] User upserted successfully, phone preserved:', !!upsertedUser.phone);
    // } catch (syncError) {
      // // console.error('❌ [USER SYNC ERROR] Exception during user sync:', syncError);
      // return NextResponse.json({
        // success: false,
        // error: 'User synchronization failed. Please try again.',
        // code: 'USER_SYNC_EXCEPTION',
        // details: syncError.message
      // }, { status: 500 });
    // }
// 
    // // ============================================================================
    // // 3. VALIDATE REQUEST TYPE
    // // ============================================================================
    // 
    // if (!type || !['rooms', 'products', 'notes'].includes(type)) {
      // // console.error('❌ [VALIDATION ERROR] Invalid or missing type:', type);
      // return NextResponse.json({
        // success: false,
        // error: 'Invalid submission type. Must be rooms, products, or notes.',
        // code: 'INVALID_TYPE'
      // }, { status: 400 });
    // }
// 
    // // console.log(`📝 [${type.toUpperCase()}] Processing ${type} submission`);
// 
    // // ============================================================================
    // // 4. IMAGE UPLOAD PROCESSING
    // // ============================================================================
    // 
    // let imageUrls = [];
    // if (data.images && Array.isArray(data.images) && data.images.length > 0) {
      // // console.log(`🖼️ [IMAGE UPLOAD] Processing ${data.images.length} images for ${type}`);
      // 
      // try {
        // for (let i = 0; i < data.images.length; i++) {
          // const imageItem = data.images[i];
          // 
          // // Skip if it's already a URL string
          // if (typeof imageItem === 'string' && imageItem.trim() !== '') {
            // imageUrls.push(imageItem);
            // continue;
          // }
          // 
          // // Skip if it's an invalid object or empty
          // if (!imageItem || typeof imageItem !== 'object') {
            // // console.warn(`⚠️ [IMAGE UPLOAD] Skipping invalid image item at index ${i}:`, imageItem);
            // continue;
          // }
          // 
          // // If it's a File object or has file-like properties, we need to upload it
          // if (imageItem.name && imageItem.type && imageItem.size) {
            // // console.log(`📤 [IMAGE UPLOAD] Uploading image ${i + 1}: ${imageItem.name} (${(imageItem.size / 1024).toFixed(1)}KB)`);
            // 
            // try {
              // const uploadedUrl = await uploadImageToImgBB(imageItem);
              // imageUrls.push(uploadedUrl);
              // // console.log(`✅ [IMAGE UPLOAD] Image ${i + 1} uploaded successfully: ${uploadedUrl.substring(0, 50)}...`);
            // } catch (uploadError) {
              // // console.error(`❌ [IMAGE UPLOAD] Failed to upload image ${i + 1}:`, uploadError);
              // return NextResponse.json({
                // success: false,
                // error: `Failed to upload image "${imageItem.name}": ${uploadError.message}`,
                // code: 'IMAGE_UPLOAD_ERROR',
                // details: uploadError.message
              // }, { status: 400 });
            // }
          // }
        // }
        // 
        // // console.log(`✅ [IMAGE UPLOAD] Successfully processed ${imageUrls.length} images`);
      // } catch (imageProcessError) {
        // // console.error('❌ [IMAGE UPLOAD] Exception during image processing:', imageProcessError);
        // return NextResponse.json({
          // success: false,
          // error: 'Failed to process images. Please try again.',
          // code: 'IMAGE_PROCESSING_ERROR',
          // details: imageProcessError.message
        // }, { status: 500 });
      // }
    // }
// 
    // // ============================================================================
    // // 4B. PDF UPLOAD PROCESSING (for notes)
    // // ============================================================================
    // 
    // let pdfUrls = [];
    // if (type === 'notes' && data.pdfs && Array.isArray(data.pdfs) && data.pdfs.length > 0) {
      // // console.log(`📄 [PDF UPLOAD] Processing ${data.pdfs.length} PDFs for notes`);
      // 
      // try {
        // for (let i = 0; i < data.pdfs.length; i++) {
          // const pdfFile = data.pdfs[i];
          // 
          // // Skip if it's already a URL string
          // if (typeof pdfFile === 'string' && pdfFile.trim() !== '') {
            // pdfUrls.push(pdfFile);
            // continue;
          // }
          // 
          // // Skip if it's an invalid object or empty
          // if (!pdfFile || typeof pdfFile !== 'object') {
            // // console.warn(`⚠️ [PDF UPLOAD] Skipping invalid PDF item at index ${i}:`, pdfFile);
            // continue;
          // }
          // 
          // // If it's a File object, upload it
          // if (pdfFile.name && pdfFile.type && pdfFile.size) {
            // // console.log(`📤 [PDF UPLOAD] Uploading PDF ${i + 1}: ${pdfFile.name} (${(pdfFile.size / 1024 / 1024).toFixed(1)}MB)`);
            // 
            // try {
              // const uploadedUrl = await uploadPdfToGoogleDrive(pdfFile);
              // pdfUrls.push(uploadedUrl);
              // // console.log(`✅ [PDF UPLOAD] PDF ${i + 1} uploaded successfully`);
            // } catch (uploadError) {
              // // console.error(`❌ [PDF UPLOAD] Failed to upload PDF ${i + 1}:`, uploadError);
              // return NextResponse.json({
                // success: false,
                // error: `Failed to upload PDF "${pdfFile.name}": ${uploadError.message}`,
                // code: 'PDF_UPLOAD_ERROR',
                // details: uploadError.message
              // }, { status: 400 });
            // }
          // }
        // }
        // 
        // // console.log(`✅ [PDF UPLOAD] Successfully processed ${pdfUrls.length} PDFs`);
      // } catch (pdfProcessError) {
        // // console.error('❌ [PDF UPLOAD] Exception during PDF processing:', pdfProcessError);
        // return NextResponse.json({
          // success: false,
          // error: 'Failed to process PDFs. Please try again.',
          // code: 'PDF_PROCESSING_ERROR',
          // details: pdfProcessError.message
        // }, { status: 500 });
      // }
    // }
// 
    // // ============================================================================
    // // 5. PREPARE DATA FOR INSERTION
    // // ============================================================================
    // 
    // const baseData = {
      // seller_id: authUser.id,
      // created_at: new Date().toISOString(),
      // updated_at: new Date().toISOString(),
    // };
// 
    // let insertData;
    // let tableName;
// 
    // try {
      // switch (type) {
        // case 'rooms':
          // tableName = 'rooms';
          // insertData = {
            // ...baseData,
            // title: data.title,
            // description: data.description,
            // price: parseFloat(data.price),
            // college: data.college,
            // location: data.location ? JSON.stringify(data.location) : null,
            // images: imageUrls,
            // room_type: data.roomType,
            // occupancy: data.occupancy,
            // owner_name: data.ownerName,
            // contact1: data.contact1,
            // contact2: data.contact2 || null,
            // distance: data.distance || null,
            // deposit: data.deposit ? parseFloat(data.deposit) : null,
            // fees_include_mess: data.feesIncludeMess || false,
            // mess_fees: data.messType && data.messType !== 'no-mess' ? parseFloat(data.messType) : null,
            // amenities: data.amenities || [],
            // category: 'rooms',
          // };
          // break;
// 
        // case 'products':
          // tableName = 'products';
          // insertData = {
            // ...baseData,
            // title: data.title,
            // description: data.description,
            // price: parseFloat(data.price),
            // category: data.category,
            // condition: data.condition,
            // college: data.college,
            // location: data.location ? JSON.stringify(data.location) : null,
            // images: imageUrls,
            // pdf_url: data.pdfUrl || null,
          // };
          // break;
// 
        // case 'notes':
          // tableName = 'notes';
          // insertData = {
            // ...baseData,
            // title: data.title,
            // description: data.description,
            // price: parseFloat(data.price),
            // college: data.college,
            // course: data.course,
            // subject: data.subject,
            // academic_year: data.academicYear,
            // course_subject: `${data.course} - ${data.subject}`,
            // images: imageUrls,
            // pdf_urls: pdfUrls,
            // pdf_url: pdfUrls.length > 0 ? pdfUrls[0] : null,
            // category: 'notes',
          // };
          // break;
// 
        // default:
          // throw new Error(`Unsupported type: ${type}`);
      // }
// 
      // // console.log(`📊 [${type.toUpperCase()}] Prepared data:`, JSON.stringify(insertData, null, 2));
    // } catch (dataError) {
      // // console.error(`❌ [DATA ERROR] Failed to prepare ${type} data:`, dataError);
      // return NextResponse.json({
        // success: false,
        // error: `Failed to prepare ${type} data. Check required fields.`,
        // code: 'DATA_PREPARATION_ERROR',
        // details: dataError.message
      // }, { status: 400 });
    // }
// 
    // // ============================================================================
    // // 6. INSERT DATA TO DATABASE
    // // ============================================================================
    // 
    // try {
      // // console.log(`💾 [DATABASE] Inserting ${type} to ${tableName} table`);
      // 
      // const { data: insertedData, error: insertError } = await supabaseAdmin
        // .from(tableName)
        // .insert(insertData)
        // .select()
        // .single();
// 
      // if (insertError) {
        // // console.error(`❌ [DATABASE ERROR] Failed to insert ${type}:`, insertError);
        // 
        // // Handle specific database errors
        // if (insertError.code === 'PGRST116') {
          // return NextResponse.json({
            // success: false,
            // error: 'Database configuration error. RLS policies may be blocking access.',
            // code: 'DATABASE_RLS_ERROR',
            // details: insertError.message
          // }, { status: 500 });
        // }
        // 
        // if (insertError.code === '42501') {
          // return NextResponse.json({
            // success: false,
            // error: 'Insufficient permissions. Please check your authentication.',
            // code: 'DATABASE_PERMISSION_ERROR',
            // details: insertError.message
          // }, { status: 403 });
        // }
// 
        // return NextResponse.json({
          // success: false,
          // error: `Failed to save ${type}. Please check your data and try again.`,
          // code: 'DATABASE_INSERT_ERROR',
          // details: insertError.message
        // }, { status: 500 });
      // }
// 
      // // console.log(`✅ [SUCCESS] ${type} inserted successfully:`, insertedData.id);
// 
      // // ============================================================================
      // // 7. SUCCESS RESPONSE
      // // ============================================================================
      // 
      // return NextResponse.json({
        // success: true,
        // message: `${type.charAt(0).toUpperCase() + type.slice(1)} submitted successfully!`,
        // data: {
          // id: insertedData.id,
          // type: type,
          // title: insertedData.title,
          // created_at: insertedData.created_at
        // }
      // }, { status: 201 });
// 
    // } catch (insertException) {
      // // console.error(`❌ [DATABASE EXCEPTION] Exception during ${type} insertion:`, insertException);
      // return NextResponse.json({
        // success: false,
        // error: `Database error while saving ${type}. Please try again.`,
        // code: 'DATABASE_EXCEPTION',
        // details: insertException.message
      // }, { status: 500 });
    // }
// 
  // } catch (error) {
    // // console.error('❌ [FATAL ERROR] Unhandled exception in sell API:', error);
    // return NextResponse.json({
      // success: false,
      // error: 'Internal server error. Please try again later.',
      // code: 'INTERNAL_SERVER_ERROR',
      // details: error.message,
      // stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    // }, { status: 500 });
  // }
// }
// 
// export async function GET(request) {
  // return NextResponse.json({
    // message: 'StudX Sell API - Production Mode',
    // status: 'active',
    // authentication: 'email-based',
    // security: 'RLS enabled',
    // timestamp: new Date().toISOString()
  // });
}
