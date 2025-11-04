// API endpoint for uploading images to ImgBB
// Uses the same ImgBB configuration as the rent listing API

export async function POST(request) {
  try {
    const imgbbApiKey = process.env.IMGBB_API_KEY;
    
    console.log('🔍 Checking ImgBB API Key:', imgbbApiKey ? 'Present' : 'Missing');
    
    if (!imgbbApiKey) {
      console.error('❌ IMGBB_API_KEY not found in environment variables');
      return Response.json({ 
        success: false, 
        error: 'ImgBB API key not configured. Please add IMGBB_API_KEY to your environment variables.' 
      }, { status: 500 });
    }

    const formData = await request.formData();
    const imageFile = formData.get('image');

    if (!imageFile) {
      console.error('❌ No image file in form data');
      return Response.json({ 
        success: false, 
        error: 'No image file provided' 
      }, { status: 400 });
    }

    // Validate file type
    if (!imageFile.type.startsWith('image/')) {
      console.error('❌ Invalid file type:', imageFile.type);
      return Response.json({ 
        success: false, 
        error: 'Please upload a valid image file' 
      }, { status: 400 });
    }

    // Validate file size (limit to 10MB)
    if (imageFile.size > 10 * 1024 * 1024) {
      console.error('❌ File too large:', imageFile.size);
      return Response.json({ 
        success: false, 
        error: 'Image too large. Maximum 10MB allowed.' 
      }, { status: 400 });
    }

    console.log('📤 Uploading image to ImgBB:', {
      name: imageFile.name,
      type: imageFile.type,
      size: `${(imageFile.size / (1024 * 1024)).toFixed(2)}MB`
    });

    // Convert to base64
    const arrayBuffer = await imageFile.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');

    console.log('✅ Image converted to base64, length:', base64.length);

    // Upload to ImgBB
    const uploadFormData = new FormData();
    uploadFormData.append('image', base64);

    console.log('🌐 Sending request to ImgBB...');

    const response = await fetch(`https://api.imgbb.com/1/upload?key=${imgbbApiKey}`, {
      method: 'POST',
      body: uploadFormData
    });

    console.log('📥 ImgBB response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ ImgBB upload failed:', response.status, errorText);
      throw new Error(`ImgBB upload failed: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    
    if (!result.success) {
      console.error('❌ ImgBB returned error:', result.error);
      throw new Error(`ImgBB upload error: ${result.error?.message || 'Unknown error'}`);
    }

    console.log('✅ Image uploaded successfully to ImgBB:', result.data.url);

    return Response.json({
      success: true,
      data: {
        url: result.data.url,
        display_url: result.data.display_url,
        delete_url: result.data.delete_url,
        size: result.data.size
      }
    });

  } catch (error) {
    console.error('🚨 Image upload error:', error.message);
    console.error('🚨 Full error:', error);
    return Response.json({ 
      success: false, 
      error: error.message || 'Failed to upload image' 
    }, { status: 500 });
  }
}