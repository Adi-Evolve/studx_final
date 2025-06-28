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
        .from('product_pdfs') // Using product_pdfs bucket as specified
        .upload(fileName, file);

    if (error) {
        throw new Error(`Storage Error: ${error.message}`);
    }

    const { data: { publicUrl } } = supabase.storage
        .from('product_pdfs')
        .getPublicUrl(fileName);
    
    return publicUrl;
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

        const imageFiles = formData.getAll('images');
        const imageUrls = await Promise.all(
            imageFiles.map(file => uploadImageToImgBB(file))
        );

        if (formType === 'regular') {
            tableName = 'product';
            dataToInsert = {
                seller_id: userId,
                title: formData.get('title'),
                description: formData.get('description'),
                price: parseFloat(formData.get('price')),
                category: formData.get('category'),
                condition: formData.get('condition'),
                college: formData.get('college'),
                location: JSON.parse(formData.get('location')),
                images: imageUrls,
                is_sold: false, // Default value
            };
        } else if (formType === 'notes') {
            tableName = 'notes';
            const pdfFile = formData.get('pdfs'); // Assuming single PDF for now
            let pdfUrl = null;
            if (pdfFile && pdfFile.size > 0) {
                pdfUrl = await uploadPdfToSupabase(supabase, pdfFile);
            }
            
            dataToInsert = {
                seller_id: userId,
                title: formData.get('title'),
                description: formData.get('description'),
                price: parseFloat(formData.get('price')),
                images: imageUrls,
                college: formData.get('college'),
                course: formData.get('subject'), // Mapping subject to course
                subject: formData.get('subject'),
                category: formData.get('category'),
                pdfUrl: pdfUrl,
                note_year: formData.get('academicYear'),
            };
        } else if (formType === 'rooms') {
            tableName = 'rooms';
            dataToInsert = {
                seller_id: userId,
                title: formData.get('hostelName'),
                roomName: formData.get('hostelName'),
                description: formData.get('description'),
                price: parseFloat(formData.get('fees')),
                images: imageUrls,
                college: formData.get('college'),
                location: JSON.parse(formData.get('location')),
                category: formData.get('category'),
                amenities: formData.getAll('amenities'),
                contact1: formData.get('contactPrimary'),
                contact2: formData.get('contactSecondary'),
                distance: formData.get('distance'),
                fees: parseFloat(formData.get('fees')),
                feesIncludeMess: formData.get('messIncluded') === 'true',
                occupancy: formData.get('occupancy'),
                ownerName: formData.get('ownerName'),
                roomType: formData.get('roomType'),
                deposit: parseFloat(formData.get('deposit')) || null,
            };
        } else {
            return NextResponse.json({ error: 'Invalid form type' }, { status: 400 });
        }

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
