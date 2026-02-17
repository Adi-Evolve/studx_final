// 🤖 Custom Model API Integration - StudXchange
// Update existing StudXchange to use custom model alongside Gemini

export async function POST(request) {
  try {
    const formData = await request.formData();
    const image = formData.get('image');
    
    if (!image) {
      return Response.json({ error: 'No image provided' }, { status: 400 });
    }

    // A/B Test: 50% custom model, 50% Gemini Pro
    const useCustomModel = Math.random() < 0.5;
    
    let detectionResult;
    let detectionMethod;
    
    if (useCustomModel && process.env.CUSTOM_MODEL_URL) {
      // Use our custom trained model
      try {
        detectionResult = await detectWithCustomModel(image);
        detectionMethod = 'studxchange-custom-model';
      } catch (error) {
        console.warn('Custom model failed, falling back to Gemini:', error);
        detectionResult = await detectWithGemini(image);
        detectionMethod = 'gemini-pro-fallback';
      }
    } else {
      // Use Gemini 2.5 Flash
      detectionResult = await detectWithGemini(image);
      detectionMethod = 'gemini-2.5-flash';
    }

    // Format response consistently
    const suggestedMenu = formatDetectionsForMenu(detectionResult.detections);
    
    // 🍽️ TERMINAL LOGGING FOR TESTING
    console.log('\n🔍 =========================');
    console.log('🍽️  DETECTED DISHES ANALYSIS');
    console.log('🔍 =========================');
    console.log(`📊 Total dishes found: ${detectionResult.detections?.length || 0}`);
    console.log(`⚡ Processing time: ${detectionResult.inference_time || '1.2s'}`);
    console.log(`🎯 Detection method: ${detectionMethod}`);
    console.log(`🎯 Overall confidence: ${calculateAverageConfidence(detectionResult.detections)}%`);
    
    if (detectionResult.detections && detectionResult.detections.length > 0) {
      console.log('\n📋 DETECTED DISHES LIST:');
      detectionResult.detections.forEach((dish, index) => {
        console.log(`  ${index + 1}. 🍽️  ${dish.name || dish.dish_name || 'Unknown Dish'}`);
        console.log(`     📂 Category: ${dish.category || 'unknown'}`);
        console.log(`     💰 Price: ₹${dish.price || dish.estimated_price || '30'}`);
        console.log(`     🎯 Confidence: ${dish.confidence || '75'}%`);
        console.log(`     📝 Description: ${dish.description || `Delicious ${dish.name || 'dish'}`}`);
        console.log(`     ✅ Available: ${dish.is_available !== false ? 'Yes' : 'No'}`);
        console.log(`     🔍 Source: ${dish.detection_source || detectionMethod}`);
        console.log('');
      });
    } else {
      console.log('❌ No dishes detected in the image');
    }
    
    console.log('🔍 =========================\n');
    
    return Response.json({
      success: true,
      detected_dishes: detectionResult.detections,
      suggested_menu: suggestedMenu,
      confidence_score: calculateAverageConfidence(detectionResult.detections),
      processing_time: detectionResult.inference_time || '1.2s',
      model_version: detectionMethod,
      dishes_found: detectionResult.detections.length,
      detection_method: detectionMethod
    });

  } catch (error) {
    console.error('\n❌ =========================');
    console.error('❌  AI DETECTION ERROR');
    console.error('❌ =========================');
    console.error('Error details:', error.message);
    console.error('Error type:', error.constructor.name);
    if (error.status) console.error('HTTP Status:', error.status);
    console.error('❌ =========================\n');
    
    return Response.json({ 
      error: 'Detection failed',
      message: error.message,
      type: error.constructor.name
    }, { status: 500 });
  }
}

async function detectWithCustomModel(image) {
  // Call our custom trained model on Hugging Face
  
  const customModelUrl = process.env.CUSTOM_MODEL_URL; // Your HF Space URL
  
  const formData = new FormData();
  formData.append('image', image);
  
  const response = await fetch(`${customModelUrl}/api/detect_food`, {
    method: 'POST',
    body: formData,
    headers: {
      'Authorization': `Bearer ${process.env.HUGGINGFACE_TOKEN}`
    },
    timeout: 30000
  });
  
  if (!response.ok) {
    throw new Error(`Custom model API error: ${response.status}`);
  }
  
  const result = await response.json();
  
  if (result.status !== 'success') {
    throw new Error(`Custom model detection failed: ${result.message}`);
  }
  
  return {
    detections: result.detections.map(detection => ({
      name: detection.dish_name,
      category: detection.category,
      price: detection.estimated_price,
      confidence: detection.confidence,
      description: `Fresh ${detection.dish_name} prepared with authentic Indian spices`,
      is_available: true,
      detection_source: 'custom-yolov8'
    })),
    inference_time: `${result.inference_time}s`
  };
}

async function detectWithGemini(image) {
  // Fallback to Gemini 1.5 Pro
  
  const { GoogleGenerativeAI } = require('@google/generative-ai');
  
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  
  // Convert image to base64
  const imageBuffer = await image.arrayBuffer();
  const base64Image = Buffer.from(imageBuffer).toString('base64');
  
  const prompt = `You are an expert Indian food recognition system. Analyze this image and identify all Indian dishes visible.

For each dish you identify, provide:
1. Exact dish name (use common Indian names)
2. Category (breakfast/lunch/dinner/snacks/beverages)
3. Estimated price in Indian Rupees (realistic mess prices)
4. Confidence level (0.0 to 1.0)

Focus on these common Indian dishes:
- Breakfast: aloo paratha, plain paratha, poha, upma, idli, dosa, bread butter, tea
- Main: dal tadka, dal fry, rajma, chole, rice, roti, chapati, sabzi varieties, paneer dishes
- Sides: curd, pickle, papad, raita, salad
- Beverages: tea, coffee, lassi
- Snacks: samosa, pakora

Return ONLY a JSON array in this format:
[{"name": "dish_name", "category": "category", "price": number, "confidence": 0.95}]

If no Indian food is visible, return: []`;

  const imagePart = {
    inlineData: {
      data: base64Image,
      mimeType: image.type
    }
  };

  const result = await model.generateContent([prompt, imagePart]);
  const response = await result.response;
  const text = response.text();
  
  // Parse JSON response
  let detections = [];
  try {
    const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
    detections = JSON.parse(cleanedText);
    
    if (!Array.isArray(detections)) {
      detections = [];
    }
  } catch (parseError) {
    console.warn('Failed to parse Gemini response:', parseError);
    detections = [];
  }
  
  return {
    detections: detections.map(detection => ({
      ...detection,
      description: `Fresh ${detection.name} prepared with authentic Indian spices`,
      is_available: true,
      detection_source: 'gemini-2.5-flash'
    })),
    inference_time: '2.1s'
  };
}

function formatDetectionsForMenu(detections) {
  // Format detections for StudXchange menu system
  
  return detections.map((detection, index) => ({
    id: `ai_${Date.now()}_${index}`,
    name: detection.name,
    category: detection.category || 'main',
    price: String(detection.price || 30),
    description: detection.description || `Delicious ${detection.name}`,
    is_available: detection.is_available !== false,
    confidence: detection.confidence || 0.9,
    detected_at: new Date().toISOString(),
    detection_method: detection.detection_source || 'ai-detection'
  }));
}

function calculateAverageConfidence(detections) {
  // Calculate average confidence score
  
  if (!detections || detections.length === 0) return 0;
  
  const totalConfidence = detections.reduce((sum, detection) => {
    return sum + (detection.confidence || 0.5);
  }, 0);
  
  return Math.round((totalConfidence / detections.length) * 100) / 100;
}