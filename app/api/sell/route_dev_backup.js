import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { syncUserData } from '@/lib/syncUserData';
import { uploadPdfToGoogleDrive } from '@/lib/googleDrivePdfService';
import { v4 as uuidv4 } from 'uuid';

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
    // console.log('=== API /sell POST request received ===');
    try {
        // console.log('🔍 Step 1: Processing headers...');
        // Debug incoming request
        const cookieHeader = request.headers.get('cookie');
        const authHeader = request.headers.get('authorization');
        // console.log('🔍 Request headers:', {
            // // hasCookies: !!cookieHeader,
            // // hasAuthHeader: !!authHeader,
            // // authType: authHeader ? authHeader.substring(0, 10) + '...' : 'None'
        // // });
        // //
        // // // console.log('🔍 Step 2: Authenticating user...');
        // // // Try different approaches to get the session
        // // let supabase;
        // // let user = null;
        // // let userId = null;
        // // let userEmail = null;
// //
        // // try {
            // // // Method 1: Standard approach with cookies
            // // supabase = createRouteHandlerClient({ cookies });
            // // // console.log('🔍 Supabase client created with cookies');
// //
            // // // console.log('🔍 Attempting to get user...');
            // // const { data: { user: authUser }, error: userError } = await supabase.auth.getUser();
            // // // console.log('🔍 Auth result:', {
                // // hasUser: !!authUser,
                // // userEmail: authUser?.email,
                // // error: userError?.message
            // // });
            // 
            // if (authUser && !userError) {
                // user = authUser;
                // userId = authUser.id;
                // userEmail = authUser.email;
                // // console.log('✅ User authenticated via cookies:', userEmail);
            // } else if (authHeader && authHeader.startsWith('Bearer ')) {
                // // Method 2: Try using Authorization header
                // // console.log('🔍 Trying Authorization header...');
                // const token = authHeader.replace('Bearer ', '');
                // 
                // // Create a new client with the token
                // const supabaseWithToken = createClient(
                    // process.env.NEXT_PUBLIC_SUPABASE_URL,
                    // process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
                    // {
                        // global: {
                            // headers: {
                                // Authorization: authHeader
                            // }
                        // }
                    // }
                // );
                // 
                // const { data: { user: tokenUser }, error: tokenError } = await supabaseWithToken.auth.getUser();
                // // console.log('🔍 Token auth result:', {
                    // // hasUser: !!tokenUser,
                    // // userEmail: tokenUser?.email,
                    // // error: tokenError?.message
                // // });
                // //
                // // if (tokenUser && !tokenError) {
                    // // user = tokenUser;
                    // // userId = tokenUser.id;
                    // // userEmail = tokenUser.email;
                    // // // console.log('✅ User authenticated via token:', userEmail);
                // // } else {
                    // // // console.error('❌ Token authentication failed:', tokenError);
                // // }
            // // }
            // //
            // // if (!user) {
                // // // Method 3: Try to get session instead
                // // // console.log('🔍 Trying to get session instead...');
                // // const { data: { session }, error: sessionError } = await supabase.auth.getSession();
                // // // console.log('🔍 Session result:', {
                    // // hasSession: !!session,
                    // // hasUser: !!session?.user,
                    // // userEmail: session?.user?.email,
                    // // error: sessionError?.message
                // // });
                // 
                // if (session?.user && !sessionError) {
                    // user = session.user;
                    // userId = session.user.id;
                    // userEmail = session.user.email;
                    // // console.log('✅ User authenticated via session:', userEmail);
                // }
            // }
            // 
            // if (!user) {
                // // console.error('❌ All authentication methods failed');
                // 
                // // PRODUCTION MODE: Require authentication
                // return NextResponse.json({
                    // error: 'Authentication required. Please log in to create listings.',
                    // code: 'NOT_AUTHENTICATED',
                    // redirect: '/login'
                // }, { status: 401 });
                // 
                // // DEVELOPMENT MODE: Uncomment below to bypass authentication
                // /*
                // // console.log('🔍 DEVELOPMENT MODE - Using test user');
                // userId = '12345678-1234-1234-1234-123456789abc';
                // userEmail = 'test@example.com';
                // user = {
                    // id: userId,
                    // email: userEmail,
                    // user_metadata: {
                        // name: 'Test User',
                        // full_name: 'Test User'
                    // }
                // };
                // // console.log('✅ Using development user with UUID:', userId);
                // */
            // }
            // 
        // } catch (authError) {
            // // console.error('❌ Authentication error:', authError);
            // 
            // // PRODUCTION MODE: Return authentication error
            // return NextResponse.json({
                // error: 'Authentication error. Please log in and try again.',
                // details: authError.message,
                // code: 'AUTH_ERROR'
            // }, { status: 401 });
        // }
// 
        // // Ensure user is authenticated before proceeding
        // if (!userId || !userEmail) {
            // // console.error('❌ No authenticated user found');
            // // console.log('🔍 TEMPORARILY BYPASSING AUTHENTICATION - Creating test user');
            // 
            // // Create a temporary test user for development with proper UUID
            // if (!supabase) {
                // supabase = createRouteHandlerClient({ cookies });
            // }
            // userId = uuidv4();
            // userEmail = 'test@example.com';
            // user = {
                // id: userId,
                // email: userEmail,
                // user_metadata: {
                    // name: 'Test User',
                    // full_name: 'Test User'
                // }
            // };
            // 
            // // console.log('✅ Using fixed development user ID:', userId);
            // 
            // // Uncomment below for production use
            // // return NextResponse.json({
            // //     error: 'Authentication required. Please log in and try again.'
            // // }, { status: 401 });
        // }
// 
        // // Use service role client for admin operations with temporary users
        // const supabaseAdmin = createClient(
            // process.env.NEXT_PUBLIC_SUPABASE_URL,
            // process.env.SUPABASE_SECRET_KEY
        // );
// 
        // // For development user, skip user creation and use a known good user ID
        // if (userId === '00000000-0000-0000-0000-000000000000') {
            // // console.log('🔍 Using development mode - ensuring dev user exists via raw SQL');
            // 
            // // Use raw SQL to insert dev user bypassing foreign key constraint
            // try {
                // const { error: rawSqlError } = await supabaseAdmin
                    // .rpc('create_dev_user_if_not_exists', {
                        // user_id: userId,
                        // user_name: 'Development User',
                        // user_email: userEmail
                    // });
                
                if (rawSqlError) {
                    // console.log('⚠️  RPC function not available, trying direct SQL...');
                    
                    // Fallback: Direct SQL insert
                    const { error: sqlError } = await supabaseAdmin
                        .from('users')
                        .upsert({
                            id: userId,
                            name: 'Development User',
                            email: userEmail,
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString()
                        }, { 
                            onConflict: 'id',
                            ignoreDuplicates: true
                        });
                    
                    if (sqlError && sqlError.code === '23503') {
                        // console.log('⚠️  Foreign key constraint detected - proceeding without user creation');
                        // console.log('⚠️  Note: Room listings will be created with orphaned seller_id');
                        // console.log('⚠️  This is acceptable for development but should be fixed for production');
                    } else if (sqlError) {
                        // console.error('❌ Failed to create development user:', sqlError);
                        // console.log('🔄 Proceeding anyway for development...');
                        // Don't return error for development - just log and continue
                    }
                }
                
                // console.log('✅ Development mode active - proceeding with user ID:', userId);
            } catch (err) {
                // console.log('⚠️  User creation skipped due to constraints - proceeding anyway');
            }
        } else {
            // For real users, ensure user exists in public.users table
            // console.log('🔍 Checking user existence in public.users table...');
            
            const { data: userData, error: publicUserError } = await supabaseAdmin
                .from('users')
                .select('id, email, name, phone')
                .eq('id', userId)
                .single();
                      if (publicUserError || !userData) {
            // console.log('❌ User not found in public.users table:', publicUserError?.message);
            // console.log('🔄 Attempting to create user in public.users table...');
            
            // Create the user in public.users - handle constraint errors gracefully
            const newUserData = {
                id: userId,
                email: userEmail,
                name: user?.user_metadata?.name || 
                      user?.user_metadata?.full_name || 
                      user?.user_metadata?.display_name || 
                      userEmail.split('@')[0],
                avatar_url: user?.user_metadata?.picture || 
                           user?.user_metadata?.avatar_url || 
                           user?.user_metadata?.photo || null,
                phone: user?.phone || null,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
            
            const { data: insertedUser, error: insertError } = await supabaseAdmin
                .from('users')
                .upsert(newUserData, { onConflict: 'id' }) // Use upsert instead of insert
                .select('id, email, name')
                .single();
            
            if (insertError) {
                // console.error('❌ Failed to create user in public.users:', insertError.message);
                
                // Check if it's a foreign key constraint error or unique constraint
                if (insertError.message.includes('foreign key constraint') || 
                    insertError.message.includes('users_id_fkey') ||
                    insertError.message.includes('duplicate key value') ||
                    insertError.message.includes('users_email_key')) {
                    // console.log('🔄 Database constraint detected. Proceeding without user creation for development...');
                    // console.log('✅ This is acceptable for development with authentication bypass');
                } else {
                    // console.log('💡 For production, ensure user exists in auth.users first or remove foreign key constraints');
                    // Don't return error, continue with the request for development
                }
            } else {
                // console.log('✅ Created/updated user in public.users table:', insertedUser);
            }
            } else {
                // console.log('✅ User verified in public.users:', userData.email);
            }
        }

        // Check content length before processing (allow for multiple 100MB PDFs + images)
        const contentLength = request.headers.get('content-length');
        const maxSize = 500 * 1024 * 1024; // 500MB total request size
        
        if (contentLength && parseInt(contentLength) > maxSize) {
            return NextResponse.json({ 
                error: 'Total upload size too large. Maximum allowed is 500MB.' 
            }, { status: 413 });
        }

        let formData;
        try {
            // console.log('🔍 Step 3: Parsing form data...');
            formData = await request.formData();
            // console.log('✅ Form data parsed successfully');
            
            // Log all form fields for debugging
            // console.log('📝 Form fields received:');
            for (const [key, value] of formData.entries()) {
                if (value instanceof File) {
                    // console.log(`  ${key}: [File] ${value.name} (${value.size} bytes, ${value.type})`);
                } else {
                    // console.log(`  ${key}: ${value}`);
                }
            }
        } catch (error) {
            // console.error('❌ Failed to parse form data:', error);
            if (error.message.includes('size')) {
                return NextResponse.json({ 
                    error: 'Files are too large. Please reduce file sizes and try again.' 
                }, { status: 413 });
            }
            return NextResponse.json({ 
                error: 'Failed to parse form data. Please try again.',
                details: error.message 
            }, { status: 400 });
        }

        const formType = formData.get('formType');
        // console.log(`🔍 Step 4: Processing form type: ${formType}`);

        if (!formType) {
            // console.error('❌ No formType provided');
            return NextResponse.json({ 
                error: 'Form type is required' 
            }, { status: 400 });
        }

        if (!['regular', 'notes', 'rooms'].includes(formType)) {
            // console.error(`❌ Invalid formType: ${formType}`);
            return NextResponse.json({ 
                error: 'Invalid form type. Must be: regular, notes, or rooms' 
            }, { status: 400 });
        }

        let dataToInsert = {};
        let tableName = '';

        // console.log('🔍 Step 5: Processing image uploads...');
        // Upload images to ImgBB (filter out empty files)
        const imageFiles = formData.getAll('images').filter(file => file.size > 0);
        let imageUrls = [];
        
        // console.log(`Processing ${imageFiles.length} image files for upload...`);
        
        if (imageFiles.length > 0) {
            try {
                imageUrls = await Promise.all(
                    imageFiles.map(async (file, index) => {
                        // console.log(`Uploading image ${index + 1}: ${file.name} (${file.size} bytes)`);
                        const url = await uploadImageToImgBB(file);
                        // console.log(`✅ Image ${index + 1} uploaded successfully: ${url}`);
                        return url;
                    })
                );
                // console.log('All images uploaded successfully:', imageUrls);
            } catch (error) {
                // console.error('Image upload failed:', error);
                return NextResponse.json({ 
                    error: `Image upload failed: ${error.message}` 
                }, { status: 400 });
            }
        } else {
            // console.log('No image files to upload');
        }

        if (formType === 'regular') {
            tableName = 'products';
            
            // Clean and validate URLs for PostgreSQL arrays
            const cleanImageUrls = imageUrls.filter(url => url && typeof url === 'string' && url.trim());
            
            // console.log('Clean URLs for products insertion:', {
            // // //     originalImages: imageUrls,
            // // //     cleanImages: cleanImageUrls
            // // // });
            // //
            // // // Validate required fields for products
            // // const requiredFields = {
                // // title: formData.get('title'),
                // // college: formData.get('college'),
                // // category: formData.get('category'),
                // // condition: formData.get('condition'),
                // // price: formData.get('price'),
                // // location: formData.get('location')
            // // };
            // //
            // // const missingFields = Object.entries(requiredFields)
                // // .filter(([key, value]) => !value || value.toString().trim() === '')
                // // .map(([key]) => key);
            // //
            // // if (missingFields.length > 0) {
                // // return NextResponse.json({
                    // // error: `Missing required fields: ${missingFields.join(', ')}`
                // // }, { status: 400 });
            // // }
            // //
            // // // Validate and parse location
            // // let locationData;
            // // try {
                // // locationData = JSON.parse(formData.get('location'));
                // // if (!locationData || !locationData.lat || !locationData.lng) {
                    // // return NextResponse.json({
                        // // error: 'Invalid location data: Missing coordinates'
                    // // }, { status: 400 });
                // // }
            // // } catch (error) {
                // // return NextResponse.json({
                    // // error: 'Invalid location data: Cannot parse location JSON'
                // // }, { status: 400 });
            // // }
            // //
            // // // Validate price
            // // const priceValue = parseFloat(formData.get('price'));
            // // if (isNaN(priceValue) || priceValue < 0) {
                // // return NextResponse.json({
                    // // error: 'Invalid price: Must be a valid positive number'
                // // }, { status: 400 });
            // // }
            // //
            // // // console.log('Products form validation passed. Required fields:', requiredFields);
            // //
            // // // Prepare data for database insertion
            // // // Handle images based on database schema (JSONB vs TEXT[])
            // // let imagesForDb;
            // // if (cleanImageUrls.length === 0) {
                // // imagesForDb = null; // or [] - depends on your schema
            // // } else {
                // // // Try JSONB format first (current schema), fallback to TEXT[] if needed
                // // imagesForDb = cleanImageUrls;
            // // }
            // //
            // // dataToInsert = {
                // // seller_id: userId,
                // // title: formData.get('title').trim(),
                // // description: formData.get('description') || '',
                // // price: priceValue,
                // // category: formData.get('category').trim(),
                // // condition: formData.get('condition').trim(),
                // // college: formData.get('college').trim(),
                // // location: locationData, // Should work with JSONB
                // // images: imagesForDb,
                // // is_sold: false,
            // // };
            // //
            // // // console.log('Final products data structure before insertion:', {
            // // //     seller_id: dataToInsert.seller_id,
            // // //     title: dataToInsert.title,
            // // //     images_type: typeof dataToInsert.images,
            // // //     images_isArray: Array.isArray(dataToInsert.images),
            // // //     images_length: dataToInsert.images ? dataToInsert.images.length : 0,
            // // //     images_content: dataToInsert.images,
            // // //     category: dataToInsert.category,
            // // //     price: dataToInsert.price
            // // // });
        // // } else if (formType === 'notes') {
            // // tableName = 'notes';
            // //
            // // // Handle multiple PDF files using Google Drive - TEMPORARILY DISABLED
            // // const pdfFiles = formData.getAll('pdfs').filter(file => file.size > 0);
            // // let pdfUrls = [];
            // //
            // // // console.log(`Processing ${pdfFiles.length} PDF files - TEMPORARILY SKIPPING UPLOAD`);
            // //
            // // if (pdfFiles.length > 0) {
                // // // console.log('⚠️ PDF upload temporarily disabled due to Google Drive issues');
                // // // console.log('PDF files provided but skipped:', pdfFiles.map(f => f.name));
                // // // Skip the upload entirely for now
                // // pdfUrls = []; // Empty array to prevent errors
            // // } else {
                // // // console.log('No PDF files to upload');
            // // }
            // //
            // // // Clean and validate URLs for PostgreSQL arrays - more robust approach
            // // const cleanImageUrls = imageUrls
                // // .filter(url => url && typeof url === 'string' && url.trim())
                // // .map(url => url.trim())
                // // .filter(url => url.startsWith('http')); // Ensure valid URLs
            // //
            // // const cleanPdfUrls = pdfUrls
                // // .filter(url => url && typeof url === 'string' && url.trim())
                // // .map(url => url.trim())
                // // .filter(url => url.startsWith('http')); // Ensure valid URLs
            // //
            // // // console.log('Clean URLs for insertion:', {
            // // //     originalImages: imageUrls,
            // // //     cleanImages: cleanImageUrls,
            // // //     originalPdfs: pdfUrls,
            // // //     cleanPdfs: cleanPdfUrls
            // // // });
            // //
            // // // Validate that we have at least some content if files were uploaded
            // // if (imageFiles.length > 0 && cleanImageUrls.length === 0) {
                // // // console.error('Image files were uploaded but no valid URLs generated');
                // // return NextResponse.json({
                    // // error: 'Image upload succeeded but URLs are invalid. Please try again.'
                // // }, { status: 400 });
            // // }
            // //
            // // if (pdfFiles.length > 0 && cleanPdfUrls.length === 0) {
                // // // console.error('PDF files were uploaded but no valid URLs generated');
                // // return NextResponse.json({
                    // // error: 'PDF upload succeeded but URLs are invalid. Please try again.'
                // // }, { status: 400 });
            // // }
            // //
            // // // Validate required fields for notes
            // // const requiredFields = {
                // // title: formData.get('title'),
                // // college: formData.get('college'),
                // // academic_year: formData.get('academic_year'),
                // // subject: formData.get('subject'),
                // // category: formData.get('category'),
                // // price: formData.get('price')
            // // };
            // //
            // // // console.log('=== Notes field validation ===');
            // // // console.log('Required fields received:', requiredFields);
            // //
            // // const missingFields = Object.entries(requiredFields)
                // // .filter(([key, value]) => {
                    // // const isEmpty = !value || value.toString().trim() === '';
                    // // if (isEmpty) {
                        // // // console.log(`❌ Missing or empty field: ${key} = "${value}"`);
                    // // }
                    // // return isEmpty;
                // // })
                // // .map(([key]) => key);
            // //
            // // if (missingFields.length > 0) {
                // // // console.error(`❌ Missing required fields: ${missingFields.join(', ')}`);
                // // return NextResponse.json({
                    // // error: `Missing required fields: ${missingFields.join(', ')}`,
                    // // debug: {
                        // // receivedFields: requiredFields,
                        // // missingFields: missingFields
                    // // }
                // // }, { status: 400 });
            // // }
            // //
            // // // console.log('✅ Notes form validation passed');
            // //
            // // dataToInsert = {
                // // seller_id: userId,
                // // title: formData.get('title').trim(),
                // // description: formData.get('description') || '',
                // // price: parseFloat(formData.get('price')),
                // // // DO NOT include ANY URL fields in the initial insert - test with minimal data
                // // college: formData.get('college').trim(),
                // // course_subject: formData.get('subject').trim(),
                // // academic_year: formData.get('academic_year').trim(),
                // // category: formData.get('category').trim(),
            // // };
            // //
            // // // Store ALL URL-related data separately for the update step
            // // dataToInsert._images_for_update = cleanImageUrls;
            // // dataToInsert._pdf_urls_for_update = cleanPdfUrls;
            // // dataToInsert._pdfUrl_for_update = cleanPdfUrls.length > 0 ? cleanPdfUrls[0] : null;
            // //
            // // // console.log('Final notes data structure before insertion:', {
            // // //     seller_id: dataToInsert.seller_id,
            // // //     title: dataToInsert.title,
            // // //     images_type: typeof dataToInsert.images,
            // // //     images_isArray: Array.isArray(dataToInsert.images),
            // // //     images_length: dataToInsert.images ? dataToInsert.images.length : 0,
            // // //     images_content: dataToInsert.images,
            // // //     pdf_urls_type: typeof dataToInsert.pdf_urls,
            // // //     pdf_urls_isArray: Array.isArray(dataToInsert.pdf_urls),
            // // //     pdf_urls_length: dataToInsert.pdf_urls ? dataToInsert.pdf_urls.length : 0,
            // // //     pdf_urls_content: dataToInsert.pdf_urls,
            // // //     pdfUrl: dataToInsert.pdfUrl
            // // // });
        // // } else if (formType === 'rooms') {
            // // tableName = 'rooms';
            // //
            // // // Clean and validate URLs for PostgreSQL arrays
            // // const cleanImageUrls = imageUrls.filter(url => url && typeof url === 'string' && url.trim());
            // //
            // // // console.log('Clean URLs for rooms insertion:', {
            // // //     originalImages: imageUrls,
            // // //     cleanImages: cleanImageUrls
            // // // });
            // //
            // // // Validate required fields for rooms - using actual form field names
            // // const requiredFields = {
                // // hostel_name: formData.get('hostel_name'),
                // // college: formData.get('college'),
                // // fees: formData.get('fees'),
                // // owner_name: formData.get('owner_name'),
                // // contact_primary: formData.get('contact_primary')
            // // };
            // //
            // // // Check if location exists and is valid JSON
            // // const locationStr = formData.get('location');
            // // let locationData = null;
            // // if (locationStr && locationStr !== '{}') {
                // // try {
                    // // locationData = JSON.parse(locationStr);
                    // // if (!locationData.lat || !locationData.lng) {
                        // // // console.error('❌ Location is missing lat/lng coordinates');
                        // // return NextResponse.json({
                            // // error: 'Please select a location on the map'
                        // // }, { status: 400 });
                    // // }
                // // } catch (e) {
                    // // // console.error('❌ Invalid location JSON:', locationStr);
                    // // return NextResponse.json({
                        // // error: 'Invalid location data'
                    // // }, { status: 400 });
                // // }
            // // } else {
                // // // console.error('❌ No location provided');
                // // return NextResponse.json({
                    // // error: 'Please select a location on the map'
                // // }, { status: 400 });
            // // }
            // //
            // // const missingFields = Object.entries(requiredFields)
                // // .filter(([key, value]) => !value || value.toString().trim() === '')
                // // .map(([key]) => key);
            // //
            // // if (missingFields.length > 0) {
                // // // console.error(`❌ Missing required fields: ${missingFields.join(', ')}`);
                // // return NextResponse.json({
                    // // error: `Missing required fields: ${missingFields.join(', ')}`
                // // }, { status: 400 });
            // // }
            // //
            // // // console.log('✅ Rooms form validation passed. Required fields:', requiredFields);
            // //
            // // dataToInsert = {
                // // seller_id: userId,
                // // title: formData.get('hostel_name').trim(),
                // // description: formData.get('description') || '',
                // // price: parseFloat(formData.get('fees')),
                // // images: cleanImageUrls, // Clean array - using consistent column name
                // // college: formData.get('college').trim(),
                // // location: locationData,
                // // category: formData.get('category') || 'Rooms/Hostel',
                // // room_type: formData.get('room_type') || '',
                // // occupancy: formData.get('occupancy') || '',
                // // distance: formData.get('distance') || '',
                // // deposit: parseFloat(formData.get('deposit')) || null,
                // // fees_include_mess: formData.get('mess_included') === 'true',
                // // mess_fees: parseFloat(formData.get('mess_fees')) || null,
                // // owner_name: formData.get('owner_name').trim(),
                // // contact1: formData.get('contact_primary').trim(),
                // // contact2: formData.get('contact_secondary') || '',
                // // amenities: formData.getAll('amenities'),
            // // };
            // //
            // // // console.log('Final rooms data structure before insertion:', {
            // // //     seller_id: dataToInsert.seller_id,
            // // //     title: dataToInsert.title,
            // // //     images_type: typeof dataToInsert.images,
            // // //     images_isArray: Array.isArray(dataToInsert.images),
            // // //     images_length: dataToInsert.images ? dataToInsert.images.length : 0,
            // // //     images_content: dataToInsert.images,
            // // //     price: dataToInsert.price,
            // // //     owner_name: dataToInsert.owner_name,
            // // //     contact1: dataToInsert.contact1
            // // // });
        // // } else {
            // // return NextResponse.json({ error: 'Invalid form type' }, { status: 400 });
        // // }
// //
        // // // console.log('Final data to insert:', {
        // // //     tableName,
        // // //     dataToInsert: JSON.stringify(dataToInsert, null, 2)
        // // // });
// //
        // // // Insert data into database - use different approach for notes to avoid array issues
        // // // console.log(`Attempting to insert into ${tableName}...`);
        // //
        // // let insertedData, insertError;
        // //
        // // if (tableName === 'notes') {
            // // // For notes, ALWAYS use two-step approach to avoid array literal issues
            // // // console.log('Inserting notes data using two-step approach...');
            // //
            // // // Step 1: Extract arrays and URL fields, insert base data without any URL/array fields
            // // const { _images_for_update, _pdf_urls_for_update, _pdfUrl_for_update, ...baseData } = dataToInsert;
            // //
            // // // console.log('Step 1: Inserting base data without arrays...');
            // // // console.log('Base data:', baseData);
            // //
            // // const { data: baseInsertData, error: baseInsertError } = await supabaseAdmin
                // // .from(tableName)
                // // .insert(baseData)
                // // .select('id')
                // // .single();
            // //
            // // if (baseInsertError) {
                // // // console.error('Base insertion failed:', baseInsertError);
                // // insertedData = null;
                // // insertError = baseInsertError;
            // // } else {
                // // // console.log('✅ Step 1 successful, ID:', baseInsertData.id);
                // // insertedData = baseInsertData;
                // //
                // // // Step 2: Update with arrays if they exist
                // // if ((_images_for_update && _images_for_update.length > 0) || (_pdf_urls_for_update && _pdf_urls_for_update.length > 0) || _pdfUrl_for_update) {
                    // // // console.log('Step 2: Updating with arrays and URLs using individual field updates...');
                    // //
                    // // // Try updating arrays one field at a time to isolate the issue
                    // // let updateSuccess = true;
                    // //
                    // // // Update pdfUrl first (simple text field)
                    // // if (_pdfUrl_for_update) {
                        // // // console.log('Updating pdfUrl field:', _pdfUrl_for_update);
                        // //
                        // // const { error: pdfUrlError } = await supabaseAdmin
                            // // .from('notes')
                            // // .update({ pdfurl: _pdfUrl_for_update })
                            // // .eq('id', baseInsertData.id);
                        // //
                        // // if (pdfUrlError) {
                            // // // console.error('pdfUrl update failed:', pdfUrlError);
                            // // updateSuccess = false;
                        // // } else {
                            // // // console.log('✅ pdfUrl updated successfully');
                        // // }
                    // // }
                    // //
                    // // if (_images_for_update && _images_for_update.length > 0) {
                        // // // console.log('Updating images array:', _images_for_update);
                        // //
                        // // // Clean the URLs and ensure they're proper strings
                        // // const cleanImages = _images_for_update
                            // // .map(url => String(url).trim())
                            // // .filter(url => url.length > 0);
                        // //
                        // // // console.log('Clean images for update:', cleanImages);
                        // //
                        // // const { error: imgError } = await supabaseAdmin
                            // // .from('notes')
                            // // .update({ images: cleanImages })
                            // // .eq('id', baseInsertData.id);
                        // //
                        // // if (imgError) {
                            // // // console.error('Images update failed:', imgError);
                            // // updateSuccess = false;
                        // // } else {
                            // // // console.log('✅ Images updated successfully');
                        // // }
                    // // }
                    // //
                    // // if (_pdf_urls_for_update && _pdf_urls_for_update.length > 0) {
                        // // // console.log('Updating pdf_urls array:', _pdf_urls_for_update);
                        // //
                        // // // Clean the URLs and ensure they're proper strings
                        // // const cleanPdfs = _pdf_urls_for_update
                            // // .map(url => String(url).trim())
                            // // .filter(url => url.length > 0);
                        // //
                        // // // console.log('Clean PDFs for update:', cleanPdfs);
                        // //
                        // // const { error: pdfError } = await supabaseAdmin
                            // // .from('notes')
                            // // .update({ pdf_urls: cleanPdfs })
                            // // .eq('id', baseInsertData.id);
                        // //
                        // // if (pdfError) {
                            // // // console.error('PDFs update failed:', pdfError);
                            // // // console.error('Detailed PDF error:', {
                            // // //     message: pdfError.message,
                            // // //     code: pdfError.code,
                            // // //     details: pdfError.details,
                            // // //     hint: pdfError.hint,
                            // // //     cleanPdfs: cleanPdfs,
                            // // //     cleanPdfsLength: cleanPdfs.length,
                            // // //     originalPdfs: _pdf_urls_for_update
                            // // // });
                            // // updateSuccess = false;
                        // // } else {
                            // // // console.log('✅ PDF URLs updated successfully');
                        // // }
                    // // }
                    // //
                    // // if (updateSuccess) {
                        // // // console.log('✅ Step 2 successful - all fields updated!');
                        // // insertError = null;
                    // // } else {
                        // // // console.warn('Some field updates failed, but base record was created');
                        // // insertError = null; // Don't fail the whole operation
                    // // }
                // // } else {
                    // // // console.log('No arrays to update');
                    // // insertError = null;
                // // }
            // // }
        // // } else {
            // // // For other tables, use normal insert
            // // // console.log(`Inserting data into ${tableName}:`, JSON.stringify(dataToInsert, null, 2));
            // //
            // // const insertResult = await supabaseAdmin
                // // .from(tableName)
                // // .insert(dataToInsert)
                // // .select('id')
                // // .single();
            // //
            // // insertedData = insertResult.data;
            // // insertError = insertResult.error;
            // //
            // // // Log detailed error information
            // // if (insertError) {
                // // console.error('Detailed database error:', {
                    // // message: insertError.message,
                    // // code: insertError.code,
                    // // details: insertError.details,
                    // // hint: insertError.hint,
                    // // tableName: tableName,
                    // // dataToInsert: dataToInsert
                // // });
            // }
        // }
// 
        // if (insertError) {
            // // console.error('Database insertion error:', insertError);
            // // console.error('Data being inserted:', JSON.stringify(dataToInsert, null, 2));
            // // console.error('Table name:', tableName);
            // 
            // // Log to console for debugging (visible in Vercel logs)
            // console.error('DATABASE ERROR:', {
                // table: tableName,
                // error: insertError,
                // data: dataToInsert
            // });
            
            // Provide more specific error messages
            if (insertError.message.includes('note_year') || insertError.message.includes('null value in column "note_year"')) {
                // console.error('note_year column error detected!');
                // console.error('This suggests the database has a note_year column with NOT NULL constraint');
                
                return NextResponse.json({ 
                    error: 'Database schema mismatch: note_year column issue. Please run the database fix script.',
                    details: insertError.message,
                    suggestion: 'Run the safe_schema_fix.sql script in your Supabase SQL editor'
                }, { status: 500 });
            } else if (insertError.message.includes('violates not-null constraint')) {
                const match = insertError.message.match(/column "([^"]+)"/);
                const columnName = match ? match[1] : 'unknown';
                
                return NextResponse.json({ 
                    error: `Missing required field: ${columnName}`,
                    details: insertError.message,
                    suggestion: `Please provide a value for the ${columnName} field`
                }, { status: 400 });
            } else if (insertError.message.includes('column') && insertError.message.includes('does not exist')) {
                const match = insertError.message.match(/column "([^"]+)"/);
                const columnName = match ? match[1] : 'unknown';
                
                return NextResponse.json({ 
                    error: `Database schema issue: Missing column ${columnName}`,
                    details: insertError.message,
                    suggestion: 'The database schema needs to be updated. Please run the schema fix script.'
                }, { status: 500 });
            } else if (insertError.message.includes('invalid input syntax for type')) {
                return NextResponse.json({ 
                    error: 'Data format error: Invalid data type provided',
                    details: insertError.message,
                    suggestion: 'Please check that all numeric fields contain valid numbers and arrays are properly formatted.'
                }, { status: 400 });
            } else {
                // Generic database error with more details
                let errorMessage = 'Database error occurred while saving your listing.';
                let solution = undefined;
                
                // Provide specific guidance for foreign key constraint errors
                if (insertError.code === '23503') {
                    if (insertError.message.includes('users_id_fkey')) {
                        errorMessage = 'Development database not configured. Please run the setup script.';
                        solution = 'Run the SQL commands in remove_all_fk_constraints_for_dev.sql to configure database for development.';
                    } else if (insertError.message.includes('seller_id_fkey')) {
                        errorMessage = 'User reference constraint error. Please run the setup script.';
                        solution = 'Run the SQL commands in remove_all_fk_constraints_for_dev.sql to configure database for development.';
                    }
                }
                
                return NextResponse.json({ 
                    error: errorMessage,
                    details: insertError.message,
                    code: insertError.code,
                    table: tableName,
                    solution: solution
                }, { status: 500 });
            }
        }
        
        // console.log('✅ Successfully inserted record with ID:', insertedData?.id);
        
        // Verify that the data was actually saved correctly
        if (insertedData?.id) {
            // console.log(`🔍 Verifying saved data in ${tableName} table...`);
            
            let selectColumns;
            if (tableName === 'notes') {
                selectColumns = 'id, title, images, pdf_urls, pdfUrl';
            } else if (tableName === 'products') {
                selectColumns = 'id, title, images, category, price, is_sold';
            } else if (tableName === 'rooms') {
                selectColumns = 'id, title, images, price, owner_name, contact1';
            } else {
                selectColumns = 'id, title';
            }
            
            const { data: savedRecord, error: verifyError } = await supabase
                .from(tableName)
                .select(selectColumns)
                .eq('id', insertedData.id)
                .single();
            
            if (verifyError) {
                // console.error(`❌ Failed to verify saved ${tableName} record:`, verifyError);
            } else {
                // console.log(`✅ Verified saved ${tableName} data:`, savedRecord);
                
                // Check if images array is saved correctly for all types
                if (!savedRecord.images || savedRecord.images.length === 0) {
                    // console.warn(`⚠️ WARNING: Images array is empty in ${tableName} table!`);
                } else {
                    // console.log(`✅ Images successfully saved in ${tableName}:`, savedRecord.images);
                }
                
                // Additional checks for notes
                if (tableName === 'notes') {
                    if (!savedRecord.pdf_urls || savedRecord.pdf_urls.length === 0) {
                        // console.warn('⚠️ WARNING: PDF URLs array is empty in notes table!');
                    }
                    if (!savedRecord.pdfUrl) {
                        // console.warn('⚠️ WARNING: pdfUrl field is empty in notes table!');
                    }
                }
            }
        }
        
        // Update user profile with college information if provided
        const collegeFromForm = formData.get('college');
        if (collegeFromForm && collegeFromForm.trim()) {
            try {
                // console.log('🔍 Updating user profile with college:', collegeFromForm);
                const { error: updateError } = await supabaseAdmin
                    .from('users')
                    .update({ 
                        college: collegeFromForm.trim(),
                        updated_at: new Date().toISOString() 
                    })
                    .eq('id', userId);
                
                if (updateError) {
                    // console.warn('⚠️ Could not update user college:', updateError.message);
                } else {
                    // console.log('✅ User profile updated with college information');
                }
            } catch (error) {
                // console.warn('⚠️ Error updating user profile:', error);
            }
        }

        return NextResponse.json({ 
            message: 'Listing created successfully!',
            id: insertedData?.id
        }, { status: 201 });

    } catch (error) {
        console.error('🚨 API ERROR CAUGHT:', error);
        console.error('🚨 Error message:', error.message);
        console.error('🚨 Error stack:', error.stack);
        console.error('🚨 Error name:', error.name);
        
        // Ensure we always return JSON
        return NextResponse.json({ 
            error: error.message || 'An unexpected error occurred.',
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
            errorName: error.name,
            timestamp: new Date().toISOString()
        }, { 
            status: 500,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }
}
