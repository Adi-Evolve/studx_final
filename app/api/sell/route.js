import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// Helper function to upload a file to Supabase Storage
async function uploadFile(supabase, file, bucket) {
    const fileName = `${Date.now()}-${file.name}`;
    const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file);

    if (error) {
        throw new Error(`Storage Error: ${error.message}`);
    }

    // Get public URL for the uploaded file
    const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);
    
    return publicUrl;
}

export async function POST(request) {
    const supabase = createRouteHandlerClient({ cookies });

    // 1. Check for authenticated user
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = session.user.id;

    try {
        const formData = await request.formData();
        const formType = formData.get('formType');
        const formCategory = formData.get('category');

        let dataToInsert = {};
        let tableName = '';

        // 2. Upload files and get URLs
        const imageFiles = formData.getAll('images');
        const imageUrls = await Promise.all(
            imageFiles.map(file => uploadFile(supabase, file, 'product_images'))
        );

        // 3. Prepare data based on form type
                if (formType === 'regular') {
            tableName = 'regular_products';
            dataToInsert = {
                seller_id: userId,
                title: formData.get('title'),
                college: formData.get('college'),
                price: parseFloat(formData.get('price')),
                condition: formData.get('condition'),
                description: formData.get('description'),
                location: JSON.parse(formData.get('location')), // Location is sent as a JSON string
                image_urls: imageUrls,
                category: formCategory,
            };
                } else if (formType === 'notes') {
            tableName = 'notes';
            const pdfFiles = formData.getAll('pdfs');
            const pdfUrls = await Promise.all(
                pdfFiles.map(file => uploadFile(supabase, file, 'notes_pdfs'))
            );
            dataToInsert = {
                seller_id: userId,
                title: formData.get('title'),
                college: formData.get('college'),
                academic_year: formData.get('academicYear'),
                course_subject: formData.get('subject'),
                price: parseFloat(formData.get('price')),
                description: formData.get('description'),
                image_urls: imageUrls,
                pdf_urls: pdfUrls,
                category: formCategory,
            };
                } else if (formType === 'rooms') {
            tableName = 'rooms';
            dataToInsert = {
                seller_id: userId,
                hostel_name: formData.get('hostelName'),
                college: formData.get('college'),
                room_type: formData.get('roomType'),
                deposit_amount: parseFloat(formData.get('deposit')) || null,
                fees: parseFloat(formData.get('fees')),
                fees_period: formData.get('feesPeriod'),
                mess_included: formData.get('messIncluded') === 'true',
                mess_fees: parseFloat(formData.get('messFees')) || null,
                description: formData.get('description'),
                distance_from_college: formData.get('distance'),
                occupancy: formData.get('occupancy'),
                owner_name: formData.get('ownerName'),
                contact_primary: formData.get('contactPrimary'),
                contact_secondary: formData.get('contactSecondary'),
                amenities: formData.getAll('amenities'),
                location: JSON.parse(formData.get('location')),
                image_urls: imageUrls,
                category: formCategory,
            };
        } else {
            return NextResponse.json({ error: 'Invalid form type' }, { status: 400 });
        }

        // 4. Insert data into the database
        const { error: insertError } = await supabase.from(tableName).insert(dataToInsert);

        if (insertError) {
            throw new Error(`Database Error: ${insertError.message}`);
        }

        return NextResponse.json({ message: 'Listing created successfully!' }, { status: 201 });

    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: error.message || 'An unexpected error occurred.' }, { status: 500 });
    }
}
