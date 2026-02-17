# 🚀 Custom Indian Food Recognition Model - Implementation Plan
## Building StudXchange's Own AI System

---

## 🎯 Project Overview

### Goal: Train a YOLOv8 model specifically for Indian mess dishes
- **Target Accuracy**: 90-95% for common Indian dishes
- **Deployment**: Free hosting on Hugging Face Spaces
- **Cost**: $0 for training and deployment
- **Timeline**: 2-3 weeks for complete implementation

---

## 📋 Phase 1: Data Collection & Setup (Week 1)

### 1.1 Create Roboflow Project
```python
# setup_roboflow_project.py
import roboflow

rf = roboflow.Roboflow(api_key="your_roboflow_key")

# Create project for StudXchange
project = rf.workspace("studxchange").create_project(
    project_name="indian-mess-food-detection",
    project_license="MIT", 
    project_type="object-detection",
    annotation_format="yolov8"
)

print(f"Project created: {project.id}")
print("Upload your images and start labeling!")
```

### 1.2 Target Dish Categories (Priority Order)
```python
# Priority 1: Most Common Mess Dishes (MUST TRAIN)
essential_dishes = [
    # Breakfast (8 dishes)
    "aloo_paratha", "plain_paratha", "poha", "upma",
    "idli", "dosa", "bread_butter", "tea",
    
    # Lunch/Dinner Staples (12 dishes)  
    "dal_tadka", "dal_fry", "rajma", "chole",
    "rice", "roti", "chapati", "aloo_sabzi",
    "bhindi_sabzi", "paneer_butter_masala", "curd", "pickle",
    
    # Beverages & Snacks (5 dishes)
    "coffee", "samosa", "papad", "raita", "salad"
]

# Priority 2: Regional Varieties (NICE TO HAVE)
extended_dishes = [
    "gobi_paratha", "methi_paratha", "vada", "sambhar", 
    "jeera_rice", "biryani", "palak_paneer", "matar_paneer",
    "naan", "kulcha", "pakora", "dhokla", "lassi"
]

# Total: 25 essential + 13 extended = 38 dish categories
```

### 1.3 Data Collection Strategy
```bash
# Method 1: Direct Photography (Week 1)
- Target: 50-100 images per essential dish
- Equipment: Smartphone camera
- Locations: Local messes, restaurants, home cooking
- Variations: Different lighting, angles, portions

# Method 2: Online Dataset Augmentation
- Search existing food datasets
- Filter for Indian dishes only
- Supplement with web scraping (legally)
- Quality control all images

# Method 3: Community Contribution
- Create contribution feature in app
- Incentivize users to upload labeled photos
- Manual verification process
- Gradual dataset expansion
```

---

## 🏷️ Phase 2: Data Labeling & Preparation (Week 1-2)

### 2.1 Roboflow Labeling Workflow
```python
# labeling_guidelines.py
labeling_rules = {
    "bounding_box": "Tight around dish, exclude plate/background",
    "naming_convention": "snake_case_only",
    "multiple_dishes": "Label all visible items in single image", 
    "consistency": "Same dish = same label always",
    "quality_threshold": "Clear, identifiable dishes only"
}

# Example labeling session
def label_image_batch(image_batch):
    for image in image_batch:
        # 1. Draw bounding boxes around each dish
        # 2. Assign correct label from our dish list
        # 3. Mark confidence level (easy/medium/hard)
        # 4. Add to training dataset
        pass
```

### 2.2 Dataset Validation
```python
# validate_dataset.py
import os
from collections import Counter

def validate_dataset(dataset_path):
    """Ensure dataset quality before training"""
    
    # Check image counts per class
    label_counts = Counter()
    for label_file in os.listdir(f"{dataset_path}/labels/train"):
        with open(f"{dataset_path}/labels/train/{label_file}") as f:
            for line in f:
                class_id = int(line.strip().split()[0])
                label_counts[class_id] += 1
    
    # Validation criteria
    min_samples_per_class = 50
    target_samples_per_class = 100
    
    print("Dataset Validation Report:")
    print(f"Total classes: {len(label_counts)}")
    print(f"Total annotations: {sum(label_counts.values())}")
    
    for class_id, count in label_counts.most_common():
        status = "✅" if count >= min_samples_per_class else "⚠️"
        print(f"{status} Class {class_id}: {count} samples")
    
    # Ready for training check
    ready_classes = sum(1 for count in label_counts.values() if count >= min_samples_per_class)
    print(f"\nTraining Ready: {ready_classes}/{len(label_counts)} classes")
    
    return ready_classes >= 20  # Need at least 20 well-represented classes
```

---

## 🤖 Phase 3: Model Training (Week 2)

### 3.1 Training Infrastructure Setup
```python
# training_setup.py
import torch
from ultralytics import YOLO
import wandb  # For experiment tracking

# Check GPU availability
device = 'cuda' if torch.cuda.is_available() else 'cpu'
print(f"Training device: {device}")

# Initialize Weights & Biases for tracking
wandb.init(
    project="studxchange-food-detection",
    config={
        "model": "yolov8n",
        "epochs": 300,
        "batch_size": 16,
        "image_size": 640
    }
)
```

### 3.2 Custom Training Script
```python
# train_studxchange_model.py
from ultralytics import YOLO
import wandb
from datetime import datetime

def train_indian_food_model():
    """Train YOLOv8 model specifically for Indian mess food"""
    
    # Initialize model
    model = YOLO('yolov8n.pt')  # Start with nano for speed
    
    # Training configuration optimized for food detection
    results = model.train(
        # Dataset
        data='studxchange_dataset.yaml',
        
        # Training parameters
        epochs=300,
        batch=16,
        imgsz=640,
        device='0',  # GPU
        workers=8,
        
        # Optimization
        optimizer='AdamW',
        lr0=0.001,  # Lower learning rate for food
        momentum=0.937,
        weight_decay=0.0005,
        warmup_epochs=5,
        
        # Loss function weights (tuned for food)
        box=0.05,
        cls=0.3,    # Lower class loss for similar dishes
        dfl=1.5,
        
        # Data augmentation (food-specific)
        hsv_h=0.01,   # Minimal hue changes (food colors important)
        hsv_s=0.5,    # Moderate saturation changes
        hsv_v=0.3,    # Lighting variations
        degrees=5,    # Small rotations only
        translate=0.1,
        scale=0.3,
        fliplr=0.5,   # Horizontal flip OK for food
        mosaic=0.8,   # Reduced mosaic for food clarity
        mixup=0.1,    # Light mixup
        
        # Validation & saving
        val=True,
        save=True,
        plots=True,
        patience=50,
        
        # Experiment tracking
        project='studxchange_training',
        name=f'indian_food_v1_{datetime.now().strftime("%Y%m%d_%H%M")}',
        
        # Callbacks
        wandb=True
    )
    
    print(f"Training completed!")
    print(f"Best model: {results.save_dir}/weights/best.pt")
    print(f"mAP@0.5: {results.box.map50}")
    
    return results

if __name__ == "__main__":
    results = train_indian_food_model()
```

### 3.3 Free Training Platforms Setup

#### Google Colab Training Notebook
```python
# studxchange_colab_training.ipynb
!pip install ultralytics wandb roboflow

# Authentication
from roboflow import Roboflow
rf = Roboflow(api_key="your_key")

# Download dataset
project = rf.workspace("studxchange").project("indian-mess-food-detection")
dataset = project.version(1).download("yolov8")

# Run training
!python train_studxchange_model.py

# Download results
from google.colab import files
files.download('runs/detect/train/weights/best.pt')
files.download('runs/detect/train/weights/last.pt')
```

#### Kaggle Training Setup
```python
# kaggle_training.py
import kaggle
import os

# Upload dataset to Kaggle
def setup_kaggle_training():
    # Create dataset metadata
    dataset_metadata = {
        "title": "StudXchange Indian Food Detection",
        "id": "your-username/studxchange-indian-food",
        "licenses": [{"name": "MIT"}]
    }
    
    # Upload and train
    os.system("kaggle datasets create -p ./dataset")
    os.system("kaggle kernels push -p ./training_kernel")
```

---

## 🚀 Phase 4: Model Optimization & Deployment (Week 2-3)

### 4.1 Model Optimization
```python
# optimize_model.py
from ultralytics import YOLO
import torch

def optimize_trained_model(model_path):
    """Optimize model for production deployment"""
    
    # Load trained model
    model = YOLO(model_path)
    
    # Export to different formats
    formats = ['onnx', 'tflite', 'torchscript']
    
    for format_type in formats:
        print(f"Exporting to {format_type}...")
        
        if format_type == 'onnx':
            model.export(
                format='onnx',
                optimize=True,
                half=False,  # Keep FP32 for compatibility
                simplify=True,
                workspace=4
            )
        elif format_type == 'tflite':
            model.export(
                format='tflite',
                int8=True,  # Quantization for mobile
                data='val_images.yaml'
            )
        elif format_type == 'torchscript':
            model.export(format='torchscript')
    
    print("Optimization complete!")
    
    # Test inference speed
    import time
    test_image = 'test_food.jpg'
    
    start_time = time.time()
    results = model.predict(test_image)
    inference_time = time.time() - start_time
    
    print(f"Inference time: {inference_time:.3f} seconds")
    return inference_time < 2.0  # Target: sub-2-second inference
```

### 4.2 Hugging Face Deployment
```python
# huggingface_deployment.py
import gradio as gr
from ultralytics import YOLO
import cv2
import numpy as np

# Load optimized model
model = YOLO('studxchange_indian_food_best.onnx')

# Dish information database
DISH_INFO = {
    0: {"name": "Aloo Paratha", "category": "breakfast", "price": 25},
    1: {"name": "Dal Tadka", "category": "lunch", "price": 40},
    2: {"name": "Rice", "category": "lunch", "price": 20},
    # ... add all trained dishes
}

def detect_indian_food(image):
    """Detect Indian dishes in uploaded image"""
    
    # Run inference
    results = model(image)
    
    # Parse results
    detected_dishes = []
    for result in results:
        boxes = result.boxes
        if boxes is not None:
            for box in boxes:
                class_id = int(box.cls[0])
                confidence = float(box.conf[0])
                
                if confidence > 0.5:  # Confidence threshold
                    dish_info = DISH_INFO.get(class_id, {})
                    detected_dishes.append({
                        "name": dish_info.get("name", f"Dish_{class_id}"),
                        "category": dish_info.get("category", "unknown"),
                        "price": dish_info.get("price", 30),
                        "confidence": confidence
                    })
    
    return detected_dishes

# Create Gradio interface
demo = gr.Interface(
    fn=detect_indian_food,
    inputs=gr.Image(type="pil"),
    outputs=gr.JSON(),
    title="StudXchange Indian Food Detection",
    description="Upload a photo of Indian food to automatically detect dishes and generate menu items.",
    examples=["example_dal_rice.jpg", "example_breakfast.jpg"]
)

if __name__ == "__main__":
    demo.launch()
```

### 4.3 API Integration with StudXchange
```python
# studxchange_model_api.py
import requests
from PIL import Image
import io
import base64

class StudXchangeFoodDetector:
    def __init__(self, huggingface_url):
        self.api_url = huggingface_url
    
    def detect_dishes(self, image_file):
        """Detect dishes using our custom trained model"""
        
        # Convert image to base64
        if isinstance(image_file, str):
            with open(image_file, 'rb') as f:
                image_data = f.read()
        else:
            image_data = image_file.read()
        
        # Send to Hugging Face API
        response = requests.post(
            self.api_url,
            files={"image": image_data},
            timeout=30
        )
        
        if response.status_code == 200:
            return response.json()
        else:
            raise Exception(f"API call failed: {response.status_code}")
    
    def format_for_studxchange(self, detections):
        """Format detection results for StudXchange menu system"""
        
        menu_items = []
        for detection in detections:
            menu_item = {
                "id": f"custom_{len(menu_items)}_{int(time.time())}",
                "name": detection["name"],
                "category": detection["category"],
                "price": str(detection["price"]),
                "description": f"Fresh {detection['name']} prepared with care",
                "is_available": True,
                "confidence": detection["confidence"],
                "detected_at": datetime.now().isoformat(),
                "detection_method": "studxchange-custom-model"
            }
            menu_items.append(menu_item)
        
        return menu_items
```

---

## 📊 Phase 5: Testing & Validation (Week 3)

### 5.1 Model Performance Testing
```python
# test_model_performance.py
from ultralytics import YOLO
import cv2
import time
from pathlib import Path

def comprehensive_model_test(model_path, test_dataset_path):
    """Comprehensive testing of trained model"""
    
    model = YOLO(model_path)
    
    # 1. Accuracy Testing
    results = model.val(data=f"{test_dataset_path}/dataset.yaml")
    
    metrics = {
        "mAP_50": results.box.map50,
        "mAP_50_95": results.box.map,
        "precision": results.box.mp,
        "recall": results.box.mr
    }
    
    print("Accuracy Metrics:")
    for metric, value in metrics.items():
        print(f"{metric}: {value:.3f}")
    
    # 2. Speed Testing
    test_images = list(Path(f"{test_dataset_path}/images/test").glob("*.jpg"))[:50]
    
    inference_times = []
    for img_path in test_images:
        start = time.time()
        results = model(str(img_path))
        inference_time = time.time() - start
        inference_times.append(inference_time)
    
    avg_inference_time = sum(inference_times) / len(inference_times)
    print(f"\nSpeed Metrics:")
    print(f"Average inference time: {avg_inference_time:.3f} seconds")
    print(f"FPS: {1/avg_inference_time:.1f}")
    
    # 3. Real-world Testing
    print(f"\nReal-world Test Results:")
    print(f"Model ready for production: {metrics['mAP_50'] > 0.8 and avg_inference_time < 2.0}")
    
    return metrics, avg_inference_time
```

### 5.2 User Acceptance Testing
```python
# user_testing_framework.py
def setup_user_testing():
    """Framework for testing with real mess owners"""
    
    test_scenarios = [
        {
            "name": "Common Breakfast",
            "dishes": ["aloo_paratha", "tea", "pickle"],
            "expected_accuracy": "> 90%"
        },
        {
            "name": "Standard Lunch",
            "dishes": ["dal_tadka", "rice", "roti", "sabzi"],
            "expected_accuracy": "> 85%"
        },
        {
            "name": "Mixed Plate",
            "dishes": ["multiple dishes on single plate"],
            "expected_accuracy": "> 75%"
        }
    ]
    
    # Collect feedback forms
    feedback_template = {
        "image_quality": "1-5 rating",
        "detection_accuracy": "1-5 rating", 
        "menu_usefulness": "1-5 rating",
        "suggestions": "text feedback",
        "would_use_daily": "yes/no"
    }
    
    return test_scenarios, feedback_template
```

---

## 🔄 Phase 6: Integration & Production (Week 3)

### 6.1 Update StudXchange API
```javascript
// app/api/ai/custom-detect/route.js
export async function POST(request) {
  try {
    const formData = await request.formData();
    const image = formData.get('image');
    
    if (!image) {
      return Response.json({ error: 'No image provided' }, { status: 400 });
    }
    
    // Call our custom model on Hugging Face
    const huggingFaceUrl = process.env.STUDXCHANGE_MODEL_URL;
    
    const modelResponse = await fetch(huggingFaceUrl, {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${process.env.HUGGINGFACE_TOKEN}`
      }
    });
    
    const detections = await modelResponse.json();
    
    // Format for StudXchange
    const suggestedMenu = formatDetectionsForMenu(detections);
    
    return Response.json({
      success: true,
      detected_dishes: detections,
      suggested_menu: suggestedMenu,
      confidence_score: calculateAverageConfidence(detections),
      processing_time: '1.2s',
      model_version: 'studxchange-custom-v1.0',
      dishes_found: detections.length
    });
    
  } catch (error) {
    console.error('Custom model error:', error);
    return Response.json({ error: 'Detection failed' }, { status: 500 });
  }
}
```

### 6.2 A/B Testing Setup
```javascript
// Enable A/B testing between Gemini and Custom model
const useCustomModel = Math.random() < 0.5; // 50/50 split

const apiEndpoint = useCustomModel 
  ? '/api/ai/custom-detect' 
  : '/api/ai/gemini-detect';
```

---

## 📈 Success Metrics & KPIs

### Technical Metrics:
- **mAP@0.5**: Target >85% (Excellent: >90%)
- **Inference Speed**: <2 seconds per image
- **Model Size**: <100MB for easy deployment
- **False Positive Rate**: <10%

### Business Metrics:
- **User Adoption**: >80% of mess owners use AI feature
- **Accuracy Satisfaction**: >90% user approval
- **Time Savings**: 90% reduction in menu creation time
- **Error Correction Rate**: <5% manual corrections needed

### Timeline Milestones:
- **Week 1**: 1000+ labeled images, Roboflow setup complete
- **Week 2**: Model training complete, >85% mAP achieved  
- **Week 3**: Deployed to Hugging Face, integrated with StudXchange
- **Week 4**: User testing, feedback collection, model refinement

---

This comprehensive plan will give you a world-class custom AI model specifically trained for Indian mess food recognition! Ready to start with the data collection phase? 🚀