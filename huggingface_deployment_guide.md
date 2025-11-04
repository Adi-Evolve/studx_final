# 🚀 Hugging Face Spaces Deployment Guide
## Deploy StudXchange Custom Model for Free

---

## 📋 Quick Deployment Steps

### 1. Create Hugging Face Account
1. Go to [huggingface.co](https://huggingface.co)
2. Sign up with GitHub (recommended)
3. Verify email address

### 2. Create New Space
1. Click "New" → "Space"
2. Fill in details:
   - **Space name**: `studxchange-food-detection`
   - **License**: `MIT`
   - **SDK**: `Gradio`
   - **Hardware**: `CPU basic` (free tier)
   - **Visibility**: `Public`

### 3. Upload Model Files
```bash
# Clone your space repository
git clone https://huggingface.co/spaces/[YOUR_USERNAME]/studxchange-food-detection
cd studxchange-food-detection

# Copy your trained model files
cp studxchange_model.pt ./
cp class_names.yaml ./
cp huggingface_gradio_app.py ./app.py
```

### 4. Create Requirements File
```text
# requirements.txt
ultralytics==8.0.196
gradio==3.50.0
opencv-python-headless==4.8.1.78
Pillow==10.0.1
PyYAML==6.0.1
torch==2.1.0
torchvision==0.16.0
numpy==1.24.3
```

### 5. Create App Configuration
```python
# app.py (rename from huggingface_gradio_app.py)
import gradio as gr
import torch
from ultralytics import YOLO
# ... (rest of the code from huggingface_gradio_app.py)

if __name__ == "__main__":
    app.launch()  # Remove server configs for HF Spaces
```

### 6. Deploy to Spaces
```bash
# Add files to git
git add .
git commit -m "Deploy StudXchange Food Detection Model"
git push origin main
```

---

## 🔧 Advanced Configuration Files

### README.md for Hugging Face Space
```markdown
---
title: StudXchange Food Detection
emoji: 🍛
colorFrom: green
colorTo: blue
sdk: gradio
sdk_version: 3.50.0
app_file: app.py
pinned: false
license: mit
---

# 🍛 StudXchange Indian Food Detection

Automatically detect Indian dishes and generate menu items using a custom-trained YOLOv8 model.

## Features

- 🎯 **25+ Indian Dishes**: Detects common breakfast, lunch, dinner, and snack items
- ⚡ **Real-time Detection**: Fast inference with high accuracy
- 💰 **Price Estimation**: Automatic price estimation for detected dishes
- 📋 **Menu Generation**: Convert detections to structured menu items
- 🎨 **Visual Results**: Annotated images with bounding boxes

## Supported Dishes

**Breakfast**: Aloo Paratha, Plain Paratha, Poha, Upma, Idli, Dosa, Bread Butter, Tea

**Main Course**: Dal Tadka, Dal Fry, Rajma, Chole, Rice, Roti, Chapati, Aloo Sabzi, Bhindi Sabzi, Paneer Butter Masala

**Sides & Others**: Curd, Pickle, Coffee, Samosa, Papad, Raita, Salad

## How to Use

1. Upload an image of Indian food
2. Adjust confidence threshold if needed
3. Click "Detect Dishes" or wait for auto-detection
4. View results with bounding boxes and menu items

## Model Information

- **Architecture**: Custom YOLOv8 trained specifically for Indian food
- **Training Data**: 2500+ manually labeled images
- **Accuracy**: 90%+ on Indian mess food
- **Speed**: ~0.5 seconds per image

## API Usage

Send POST requests to the `/api/detect_food` endpoint with image files for programmatic access.

## About StudXchange

StudXchange is a comprehensive student marketplace platform. This AI model powers the automatic menu creation feature for mess owners.
```

### Dockerfile (Optional - for custom deployments)
```dockerfile
# Dockerfile
FROM python:3.9-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application files
COPY . .

# Expose port
EXPOSE 7860

# Run the application
CMD ["python", "app.py"]
```

---

## 🌐 Alternative Deployment Options

### Option 1: Hugging Face Spaces (Recommended - Free)

**Pros:**
- ✅ Completely free hosting
- ✅ Automatic HTTPS and CDN
- ✅ Easy sharing and embedding
- ✅ Built-in analytics
- ✅ Version control with Git

**Cons:**
- ⚠️ CPU-only on free tier
- ⚠️ Limited to 16GB storage
- ⚠️ Public by default

**Best for:** Public demos, portfolio projects, community sharing

### Option 2: Railway App

```yaml
# railway.toml
[build]
builder = "DOCKERFILE"

[deploy]
healthcheckPath = "/"
healthcheckTimeout = 300
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10
```

**Pricing:** $5/month for basic plan
**Features:** Private deployments, custom domains, PostgreSQL

### Option 3: Render

```yaml
# render.yaml
services:
  - type: web
    name: studxchange-food-detection
    env: python
    buildCommand: pip install -r requirements.txt
    startCommand: python app.py
    envVars:
      - key: PORT
        value: 7860
```

**Pricing:** Free tier available (750 hours/month)
**Features:** Automatic deploys, custom domains, SSL

### Option 4: Google Cloud Run

```yaml
# cloudbuild.yaml
steps:
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/$PROJECT_ID/studxchange-food-detection', '.']
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/$PROJECT_ID/studxchange-food-detection']
  - name: 'gcr.io/cloud-builders/gcloud'
    args: ['run', 'deploy', 'studxchange-food-detection',
           '--image', 'gcr.io/$PROJECT_ID/studxchange-food-detection',
           '--platform', 'managed', '--region', 'us-central1']
```

**Pricing:** Pay-per-use (very cheap for demos)
**Features:** Serverless, auto-scaling, enterprise-grade

---

## 🔗 API Integration Examples

### JavaScript (Frontend Integration)
```javascript
// frontend-integration.js
async function detectFoodFromImage(imageFile) {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    try {
        const response = await fetch('https://[YOUR_USERNAME]-studxchange-food-detection.hf.space/api/detect_food', {
            method: 'POST',
            body: formData
        });
        
        const result = await response.json();
        
        if (result.status === 'success') {
            console.log('Detected dishes:', result.detections);
            return result.detections;
        } else {
            console.error('Detection failed:', result.message);
            return [];
        }
    } catch (error) {
        console.error('API call failed:', error);
        return [];
    }
}

// Usage example
document.getElementById('imageInput').addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (file) {
        const detections = await detectFoodFromImage(file);
        displayDetections(detections);
    }
});
```

### Python (Backend Integration)
```python
# backend-integration.py
import requests
import json

def detect_food_api(image_path, api_url):
    """Call StudXchange food detection API"""
    
    with open(image_path, 'rb') as image_file:
        files = {'image': image_file}
        
        try:
            response = requests.post(f"{api_url}/api/detect_food", files=files, timeout=30)
            
            if response.status_code == 200:
                result = response.json()
                
                if result['status'] == 'success':
                    return {
                        'success': True,
                        'detections': result['detections'],
                        'total_dishes': result['total_dishes']
                    }
                else:
                    return {'success': False, 'error': result['message']}
            else:
                return {'success': False, 'error': f'HTTP {response.status_code}'}
                
        except Exception as e:
            return {'success': False, 'error': str(e)}

# Usage example
api_url = "https://[YOUR_USERNAME]-studxchange-food-detection.hf.space"
result = detect_food_api("food_image.jpg", api_url)

if result['success']:
    print(f"Found {result['total_dishes']} dishes:")
    for dish in result['detections']:
        print(f"- {dish['dish_name']}: ₹{dish['estimated_price']} ({dish['confidence']:.1%})")
else:
    print(f"Detection failed: {result['error']}")
```

### cURL (Command Line Testing)
```bash
# Test API with cURL
curl -X POST \
  https://[YOUR_USERNAME]-studxchange-food-detection.hf.space/api/detect_food \
  -F "image=@food_image.jpg" \
  -H "Content-Type: multipart/form-data"
```

---

## 📊 Monitoring and Analytics

### Usage Tracking
```python
# Add to your Gradio app for basic analytics
import json
from datetime import datetime

def log_detection(detections, inference_time):
    """Log detection statistics"""
    log_entry = {
        'timestamp': datetime.now().isoformat(),
        'total_dishes': len(detections),
        'inference_time': inference_time,
        'dishes': [d['dish_name'] for d in detections]
    }
    
    # Append to log file
    with open('usage_logs.jsonl', 'a') as f:
        f.write(json.dumps(log_entry) + '\n')
```

### Performance Monitoring
```python
# Monitor model performance
def monitor_model_health():
    """Basic health check for the model"""
    try:
        # Test with a dummy image
        test_result = detector.detect_food(np.zeros((640, 640, 3), dtype=np.uint8))
        return test_result['success']
    except:
        return False

# Add health endpoint
@app.get("/health")
def health_check():
    return {
        "status": "healthy" if monitor_model_health() else "unhealthy",
        "model_loaded": detector.model is not None,
        "timestamp": datetime.now().isoformat()
    }
```

---

## 🔧 Troubleshooting Common Issues

### Issue 1: Model File Too Large
```bash
# Solution: Use Git LFS for large files
git lfs track "*.pt"
git lfs track "*.onnx"
git add .gitattributes
git add studxchange_model.pt
git commit -m "Add model with Git LFS"
```

### Issue 2: CUDA/GPU Errors on CPU-only hosting
```python
# Solution: Force CPU inference
model = YOLO('studxchange_model.pt')
model.to('cpu')  # Ensure CPU inference

# Or modify the model loading
device = 'cpu' if not torch.cuda.is_available() else 'cuda'
model = YOLO('studxchange_model.pt').to(device)
```

### Issue 3: Memory Issues
```python
# Solution: Optimize memory usage
import gc

def detect_food_optimized(image, confidence_threshold=0.5):
    """Memory-optimized detection"""
    try:
        # Clear GPU cache if available
        if torch.cuda.is_available():
            torch.cuda.empty_cache()
        
        # Run inference
        results = model(image, conf=confidence_threshold)
        
        # Process results immediately
        detections = process_results(results)
        
        # Clear variables
        del results
        gc.collect()
        
        return detections
        
    except Exception as e:
        gc.collect()  # Clean up on error
        raise e
```

---

## 🎯 Next Steps After Deployment

1. **Test the deployment** with various Indian food images
2. **Share the link** with mess owners for feedback
3. **Monitor usage** and performance metrics
4. **Collect feedback** for model improvements
5. **Plan model updates** based on real-world usage

**Deployment URL Template**: 
`https://[YOUR_USERNAME]-studxchange-food-detection.hf.space`

Ready to deploy your custom AI model for free! 🚀