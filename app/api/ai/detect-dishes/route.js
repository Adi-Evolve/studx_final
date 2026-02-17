import { NextResponse } from 'next/server';

// Mock AI dish detection endpoint
// In production, this would call your trained YOLO model
export async function POST(request) {
  try {
    const formData = await request.formData();
    const image = formData.get('image');
    
    if (!image) {
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      );
    }
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock detection results based on common Indian mess dishes
    const mockDetections = [
      { class: 'dal_tadka', confidence: 0.89, bbox: [100, 100, 200, 200] },
      { class: 'rice', confidence: 0.92, bbox: [300, 100, 400, 200] },
      { class: 'roti', confidence: 0.85, bbox: [150, 300, 250, 400] },
      { class: 'aloo_sabzi', confidence: 0.78, bbox: [350, 300, 450, 400] }
    ];
    
    // Randomly select 2-4 dishes for variety
    const numDetections = Math.floor(Math.random() * 3) + 2;
    const selectedDetections = mockDetections
      .sort(() => 0.5 - Math.random())
      .slice(0, numDetections);
    
    // Dish information database
    const dishDatabase = {
      'aloo_paratha': { price: 25, category: 'breakfast', description: 'Potato stuffed flatbread' },
      'plain_paratha': { price: 15, category: 'breakfast', description: 'Plain flatbread' },
      'poha': { price: 20, category: 'breakfast', description: 'Flattened rice with spices' },
      'upma': { price: 18, category: 'breakfast', description: 'Semolina porridge with vegetables' },
      'dal_tadka': { price: 40, category: 'lunch', description: 'Tempered yellow lentils' },
      'dal_fry': { price: 38, category: 'lunch', description: 'Dry spiced lentils' },
      'rajma': { price: 50, category: 'lunch', description: 'Kidney beans curry' },
      'chole': { price: 45, category: 'lunch', description: 'Chickpea curry' },
      'aloo_sabzi': { price: 35, category: 'lunch', description: 'Potato vegetable curry' },
      'bhindi_sabzi': { price: 40, category: 'lunch', description: 'Okra vegetable curry' },
      'paneer_butter_masala': { price: 80, category: 'lunch', description: 'Cottage cheese in rich tomato gravy' },
      'palak_paneer': { price: 75, category: 'lunch', description: 'Cottage cheese in spinach gravy' },
      'roti': { price: 8, category: 'lunch', description: 'Whole wheat flatbread' },
      'chapati': { price: 8, category: 'lunch', description: 'Thin whole wheat bread' },
      'rice': { price: 20, category: 'lunch', description: 'Steamed rice' },
      'biryani': { price: 80, category: 'lunch', description: 'Fragrant rice with spices' },
      'curd_rice': { price: 30, category: 'lunch', description: 'Rice mixed with yogurt' },
      'samosa': { price: 15, category: 'snacks', description: 'Fried pastry with filling' },
      'tea': { price: 10, category: 'beverages', description: 'Indian milk tea' },
      'coffee': { price: 12, category: 'beverages', description: 'Indian filter coffee' },
    };
    
    // Generate menu items from detections
    const suggestedMenu = selectedDetections
      .filter(dish => dish.confidence > 0.7)
      .map(dish => {
        const dishInfo = dishDatabase[dish.class];
        if (!dishInfo) return null;
        
        return {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          name: formatDishName(dish.class),
          category: dishInfo.category,
          price: dishInfo.price.toString(),
          description: dishInfo.description,
          is_available: true,
          confidence: dish.confidence,
          detected_at: new Date().toISOString()
        };
      })
      .filter(Boolean);
    
    const avgConfidence = selectedDetections.reduce((acc, dish) => acc + dish.confidence, 0) / selectedDetections.length;
    
    return NextResponse.json({
      success: true,
      detected_dishes: selectedDetections,
      suggested_menu: suggestedMenu,
      confidence_score: avgConfidence,
      processing_time: '2.1s',
      model_version: 'mess-yolo-v1.0-beta'
    });
    
  } catch (error) {
    console.error('Error in AI detection:', error);
    return NextResponse.json(
      { error: 'Internal server error during detection' },
      { status: 500 }
    );
  }
}

function formatDishName(className) {
  return className
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}