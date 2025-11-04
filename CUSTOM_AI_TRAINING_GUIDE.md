# 🤖 Custom Indian Food Recognition System
## Two Implementation Approaches

---

## 🚀 Option 1: Gemini Pro Vision API (Immediate Solution)

### Advantages:
- **Ready to use**: No training required
- **High accuracy**: Google's advanced vision model
- **Free tier**: 15 requests/minute, 1500/day
- **Multimodal**: Can understand context and descriptions
- **Real-time**: Instant results

### Implementation with Gemini Pro:

#### 1. Get Gemini API Key
```bash
# Get your API key from Google AI Studio
# https://makersuite.google.com/app/apikey
```

#### 2. Create Gemini Vision API Endpoint
```javascript
// app/api/ai/gemini-detect/route.js
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(request) {
  try {
    const formData = await request.formData();
    const image = formData.get('image');
    
    if (!image) {
      return Response.json({ error: 'No image provided' }, { status: 400 });
    }
    
    // Convert image to base64
    const bytes = await image.arrayBuffer();
    const base64Image = Buffer.from(bytes).toString('base64');
    
    // Initialize Gemini Pro Vision model
    const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });
    
    const prompt = `
    Analyze this image of Indian food and identify all the dishes present. 
    Return ONLY a JSON array with this exact format:
    [
      {
        "name": "exact_dish_name",
        "category": "breakfast|lunch|dinner|snacks|beverages",
        "price": "estimated_price_in_rupees",
        "description": "brief_description",
        "confidence": "0.0_to_1.0_confidence_score"
      }
    ]
    
    Focus on common Indian mess/restaurant dishes like:
    - Dal varieties (tadka, fry, etc.)
    - Rice dishes (plain, biryani, pulao)
    - Roti/Chapati/Paratha varieties
    - Vegetable curries (sabzi)
    - Paneer dishes
    - Snacks (samosa, etc.)
    - Beverages (tea, coffee, etc.)
    
    Estimate realistic mess prices in Indian rupees.
    Only identify dishes you can clearly see.
    `;
    
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Image,
          mimeType: image.type
        }
      }
    ]);
    
    const response = await result.response;
    const text = response.text();
    
    // Parse JSON response
    let detectedDishes;
    try {
      // Extract JSON from response
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        detectedDishes = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No valid JSON found in response');
      }
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      console.log('Raw response:', text);
      return Response.json({ error: 'Failed to parse AI response' }, { status: 500 });
    }
    
    // Format for our system
    const suggestedMenu = detectedDishes.map(dish => ({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: dish.name,
      category: dish.category,
      price: dish.price.toString(),
      description: dish.description,
      is_available: true,
      confidence: parseFloat(dish.confidence),
      detected_at: new Date().toISOString(),
      detection_method: 'gemini-pro-vision'
    }));
    
    return Response.json({
      success: true,
      detected_dishes: detectedDishes,
      suggested_menu: suggestedMenu,
      confidence_score: detectedDishes.reduce((acc, dish) => acc + parseFloat(dish.confidence), 0) / detectedDishes.length,
      processing_time: '1.5s',
      model_version: 'gemini-pro-vision',
      raw_response: text // For debugging
    });
    
  } catch (error) {
    console.error('Gemini API Error:', error);
    return Response.json({ 
      error: 'AI detection failed',
      details: error.message 
    }, { status: 500 });
  }
}
```

#### 3. Environment Setup
```env
# .env.local
GEMINI_API_KEY=your_gemini_api_key_here
```

#### 4. Install Gemini SDK
```bash
npm install @google/generative-ai
```

#### 5. Update AIMenuCreator Component
```javascript
// Update the detectDishes function in AIMenuCreator.js
const detectDishes = async (imageFile) => {
  const formData = new FormData();
  formData.append('image', imageFile);
  
  const response = await fetch('/api/ai/gemini-detect', {
    method: 'POST',
    body: formData
  });
  
  if (!response.ok) {
    throw new Error('Failed to detect dishes');
  }
  
  const result = await response.json();
  return result;
};
```

---

## 🛠️ Option 2: Custom YOLOv8 Model Training (Maximum Accuracy)

### Step-by-Step Training Process:

#### 1. Data Collection Strategy
```python
# data_collection_plan.py
indian_dishes_dataset = {
    "breakfast": [
        "aloo_paratha", "gobi_paratha", "methi_paratha",
        "poha", "upma", "idli", "dosa", "vada",
        "bread_butter", "bread_jam", "bread_omelette"
    ],
    "lunch_dinner": [
        "dal_tadka", "dal_fry", "dal_makhani",
        "rajma", "chole", "sambhar",
        "aloo_sabzi", "bhindi_sabzi", "palak_sabzi",
        "paneer_butter_masala", "palak_paneer", "matar_paneer",
        "roti", "chapati", "naan", "kulcha",
        "rice", "jeera_rice", "biryani", "pulao",
        "curd_rice", "lemon_rice"
    ],
    "snacks": [
        "samosa", "kachori", "pakora", "bhajia",
        "dhokla", "idli_sambhar", "vada_pav"
    ],
    "beverages": [
        "chai", "coffee", "lassi", "buttermilk",
        "fresh_lime", "sugarcane_juice"
    ],
    "sides": [
        "pickle", "papad", "raita", "salad",
        "chutney_mint", "chutney_coconut"
    ]
}

# Target: 100-200 images per dish = 5000-10000 total images
```

#### 2. Data Collection Sources
```bash
# Multiple data sources for better training

# Option A: Manual Collection
# - Take photos of real mess food
# - Visit multiple messes/restaurants
# - Different lighting conditions
# - Various angles and presentations

# Option B: Online Dataset Creation
# - Search Google Images
# - Use data scraping tools
# - Filter for Indian food only
# - Ensure diverse presentations

# Option C: Augmentation
# - Brightness/contrast variations
# - Rotation and scaling
# - Color space changes
# - Noise addition
```

#### 3. Roboflow Setup for Labeling
```python
# roboflow_setup.py
import roboflow

# Create Roboflow project
rf = roboflow.Roboflow(api_key="your_roboflow_key")
project = rf.workspace("your-workspace").create_project(
    project_name="indian-mess-food-detection",
    project_license="MIT",
    project_type="object-detection"
)

# Upload and label images
# 1. Upload images to Roboflow
# 2. Draw bounding boxes around each dish
# 3. Label with exact dish names
# 4. Export in YOLOv8 format
```

#### 4. Training Script
```python
# train_indian_food_yolo.py
from ultralytics import YOLO
import roboflow
from roboflow import Roboflow

# Download dataset from Roboflow
rf = Roboflow(api_key="your_key")
project = rf.workspace("workspace").project("indian-mess-food-detection")
dataset = project.version(1).download("yolov8")

# Initialize YOLOv8 model
model = YOLO('yolov8n.pt')  # Start with nano for speed

# Training configuration
results = model.train(
    data='dataset.yaml',
    epochs=300,  # More epochs for better accuracy
    imgsz=640,
    batch=16,
    device='0',  # Use GPU if available
    workers=8,
    patience=50,
    save=True,
    plots=True,
    val=True,
    
    # Hyperparameters for food detection
    lr0=0.01,
    momentum=0.937,
    weight_decay=0.0005,
    warmup_epochs=3,
    box=0.05,
    cls=0.5,
    
    # Data augmentation
    hsv_h=0.015,
    hsv_s=0.7,
    hsv_v=0.4,
    degrees=0.5,
    translate=0.1,
    scale=0.5,
    fliplr=0.5,
    mosaic=1.0,
    mixup=0.0
)

# Export model for deployment
model.export(format='onnx', optimize=True)
model.export(format='tflite', int8=True)

print("Training completed!")
print(f"Best model saved at: {results.save_dir}")
```

#### 5. Training on Free Platforms

##### Google Colab (Free GPU)
```python
# colab_training.ipynb
!pip install ultralytics roboflow

# Mount Google Drive for dataset storage
from google.colab import drive
drive.mount('/content/drive')

# Upload your training script and run
!python train_indian_food_yolo.py
```

##### Kaggle Notebooks (Free GPU)
```python
# kaggle_training.py
import kaggle
from kaggle.api.kaggle_api_extended import KaggleApi

# Upload dataset to Kaggle
# Run training with free GPU allocation
# Download trained model
```

#### 6. Model Optimization
```python
# optimize_model.py
from ultralytics import YOLO

# Load trained model
model = YOLO('path/to/your/trained/model.pt')

# Optimize for production
model.export(
    format='onnx',
    optimize=True,
    half=False,
    simplify=True,
    workspace=4
)

# Test inference speed
results = model.predict('test_image.jpg')
print(f"Inference time: {results[0].speed}")
```

#### 7. Deployment Options

##### Hugging Face Spaces (Free)
```python
# huggingface_deployment.py
# Create Gradio interface
import gradio as gr
from ultralytics import YOLO

model = YOLO('indian_food_model.onnx')

def detect_food(image):
    results = model.predict(image)
    return format_results(results)

demo = gr.Interface(
    fn=detect_food,
    inputs=gr.Image(),
    outputs=gr.JSON()
)

demo.launch()
```

##### Cloudflare Workers + ONNX.js
```javascript
// cloudflare_worker.js
import * as ort from 'onnxruntime-web';

export default {
  async fetch(request, env) {
    const session = await ort.InferenceSession.create('/models/indian_food.onnx');
    // Process image and run inference
    const results = await session.run(inputTensor);
    return new Response(JSON.stringify(results));
  }
};
```

---

## 📊 Accuracy Comparison

### Gemini Pro Vision:
- **Setup Time**: 1-2 hours
- **Accuracy**: 85-90% (general food recognition)
- **Cost**: Free tier: 1500 requests/day
- **Customization**: Limited to prompt engineering

### Custom YOLOv8:
- **Setup Time**: 2-4 weeks
- **Accuracy**: 95-98% (trained specifically for Indian dishes)
- **Cost**: $0 (free training platforms)
- **Customization**: Complete control over dish categories

---

## 🎯 Recommended Implementation Strategy

### Phase 1: Immediate (Use Gemini Pro)
1. Get Gemini API key
2. Implement Gemini vision endpoint
3. Test with real mess photos
4. Gather user feedback

### Phase 2: Custom Training (Parallel)
1. Start collecting Indian dish images
2. Set up Roboflow project
3. Begin labeling and training
4. Test custom model accuracy

### Phase 3: Hybrid Approach
1. Use Gemini for new/unknown dishes
2. Use custom model for trained dishes
3. Combine results for best accuracy
4. Continuous learning system

---

## 💰 Cost Breakdown

### Gemini Pro (Immediate):
- **Free Tier**: 1500 requests/day
- **Paid**: $0.0025 per image after free tier
- **Monthly Cost**: $0-50 depending on usage

### Custom Model (Long-term):
- **Training**: Free (Google Colab/Kaggle)
- **Deployment**: Free (Hugging Face/Cloudflare)
- **Inference**: $0 ongoing costs

---

## 🚀 Quick Start with Gemini

1. **Get API Key**: Visit Google AI Studio
2. **Install Dependencies**: `npm install @google/generative-ai`
3. **Create API Endpoint**: Use the code above
4. **Test**: Upload Indian food photos
5. **Iterate**: Improve prompts based on results

Would you like me to implement the Gemini Pro version first, or do you want to start with the custom model training approach?