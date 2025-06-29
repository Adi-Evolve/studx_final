import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const IMGBB_API_KEY = '272785e1c6e6221d927bad99483ff9ed';

// Helper function to upload an image to ImgBB
async function uploadImageToImgBB(file) {
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

// Helper function to upload a file to Supabase Storage (for PDFs)
async function uploadPdfToSupabase(supabase, file) {
    const fileName = `${Date.now()}-${file.name}`;
    const { data, error } = await supabase.storage
        .from('product_pdfs') // Using product_pdfs bucket as specified in previous requirements
        .upload(fileName, file);

    if (error) {
        console.error('Storage upload error:', error);
        throw new Error(`Storage Error: ${error.message}`);
    }

    // Return the file path for signed URL generation later
    return data.path;
}

export async function POST(request) {
    const supabase = createRouteHandlerClient({ cookies });

    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = session.user.id;

    try {
        const formData = await request.formData();
        const formType = formData.get('formType');

        let dataToInsert = {};
        let tableName = '';

        // Upload images to ImgBB
        const imageFiles = formData.getAll('images');
        const imageUrls = await Promise.all(
            imageFiles.map(file => uploadImageToImgBB(file))
        );

        if (formType === 'regular') {
            tableName = 'products';
            dataToInsert = {
                seller_id: userId,
                title: formData.get('title'),
                description: formData.get('description'),
                price: parseFloat(formData.get('price')),
                category: formData.get('category'),
                condition: formData.get('condition'),
                college: formData.get('college'),
                location: JSON.parse(formData.get('location')),
                images: imageUrls, // Using consistent column name
                is_sold: false,
            };
        } else if (formType === 'notes') {
            tableName = 'notes';
            const pdfFile = formData.get('pdfs');
            let pdfUrl = null;
            if (pdfFile && pdfFile.size > 0) {
                pdfUrl = await uploadPdfToSupabase(supabase, pdfFile);
            }
            
            dataToInsert = {
                seller_id: userId,
                title: formData.get('title'),
                description: formData.get('description'),
                price: parseFloat(formData.get('price')),
                images: imageUrls, // Using consistent column name
                college: formData.get('college'),
                course_subject: formData.get('subject'),
                academic_year: formData.get('academic_year'),
                category: formData.get('category'),
                pdfUrl: pdfUrl, // Single PDF URL for signed URL generation
            };
        } else if (formType === 'rooms') {
            tableName = 'rooms';
            dataToInsert = {
                seller_id: userId,
                title: formData.get('hostelName'),
                description: formData.get('description'),
                price: parseFloat(formData.get('fees')),
                images: imageUrls, // Using consistent column name
                college: formData.get('college'),
                location: JSON.parse(formData.get('location')),
                category: formData.get('category'),
                room_type: formData.get('roomType'),
                occupancy: formData.get('occupancy'),
                distance: formData.get('distance'),
                deposit: parseFloat(formData.get('deposit')) || null,
                fees_include_mess: formData.get('messIncluded') === 'true',
                mess_fees: parseFloat(formData.get('messFees')) || null,
                owner_name: formData.get('ownerName'),
                contact1: formData.get('contactPrimary'),
                contact2: formData.get('contactSecondary'),
                amenities: formData.getAll('amenities'),
            };
        } else {
            return NextResponse.json({ error: 'Invalid form type' }, { status: 400 });
        }

        const { error: insertError } = await supabase.from(tableName).insert(dataToInsert);

        if (insertError) {
            console.error('Database insertion error:', insertError);
            console.error('Data being inserted:', dataToInsert);
            console.error('Table name:', tableName);
            throw new Error(`Database Error: ${insertError.message}`);
        }

        return NextResponse.json({ message: 'Listing created successfully!' }, { status: 201 });

    } catch (error) {
        console.error('API Error:', error);
        console.error('Error stack:', error.stack);
        
        // Ensure we always return JSON
        return NextResponse.json({ 
            error: error.message || 'An unexpected error occurred.',
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }, { 
            status: 500,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }
}
