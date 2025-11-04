# 🔬 Google Colab Training Environment - StudXchange Custom Model
## Free GPU Training Setup for Indian Food Detection

"""
StudXchange Indian Food Detection Training
==========================================

This notebook trains a custom YOLOv8 model specifically for Indian mess food detection.
Designed to run on Google Colab's free GPU tier.

Setup: Runtime > Change runtime type > Hardware accelerator: GPU
"""

# ====================================================================
# SECTION 1: Environment Setup and Installation
# ====================================================================

# Install required packages
# !pip install ultralytics
# !pip install roboflow
# !pip install wandb
# !pip install opencv-python
# !pip install pillow

# Verify GPU availability
try:
    import torch
    print(f"CUDA available: {torch.cuda.is_available()}")
    if torch.cuda.is_available():
        print(f"GPU: {torch.cuda.get_device_name(0)}")
        print(f"VRAM: {torch.cuda.get_device_properties(0).total_memory / 1e9:.1f} GB")
except ImportError:
    print("PyTorch not installed. Please install with: pip install torch")

# ====================================================================
# SECTION 2: Dataset Download and Setup
# ====================================================================

# Connect to Roboflow and download dataset
try:
    import roboflow
except ImportError:
    print("Roboflow not installed. Please install with: pip install roboflow")
    roboflow = None

# Replace with your API key and project details
ROBOFLOW_API_KEY = "your_roboflow_api_key_here"
WORKSPACE = "studxchange-ai"
PROJECT = "indian-mess-food-detection"
VERSION = 1

rf = roboflow.Roboflow(api_key=ROBOFLOW_API_KEY)
project = rf.workspace(WORKSPACE).project(PROJECT)
dataset = project.version(VERSION).download("yolov8")

print(f"📁 Dataset downloaded to: {dataset.location}")

# ====================================================================
# SECTION 3: Weights & Biases Setup (Optional but Recommended)
# ====================================================================

# Initialize Weights & Biases for experiment tracking
try:
    import wandb
except ImportError:
    print("Weights & Biases not installed. Please install with: pip install wandb")
    wandb = None

# Login to wandb (run this and follow the prompts)
# !wandb login

# Initialize wandb project
wandb.init(
    project="studxchange-indian-food-detection",
    name=f"colab_training_v{VERSION}",
    config={
        "model": "yolov8n",
        "epochs": 200,  # Reduced for free tier
        "batch_size": 16,
        "image_size": 640,
        "platform": "google_colab"
    }
)

# ====================================================================
# SECTION 4: Training Configuration
# ====================================================================

# Import YOLOv8 and training utilities
try:
    from ultralytics import YOLO
except ImportError:
    print("Ultralytics not installed. Please install with: pip install ultralytics")
    YOLO = None
import yaml
import os
from datetime import datetime

# Training configuration optimized for Colab free tier
TRAINING_CONFIG = {
    # Model settings
    'model_size': 'n',  # nano for faster training on free tier
    
    # Training parameters (optimized for free tier)
    'epochs': 200,  # Reduced from 300 for free tier limits
    'batch_size': 16,  # Conservative batch size
    'image_size': 640,
    'patience': 30,  # Early stopping
    
    # Hardware settings
    'workers': 2,  # Conservative for Colab
    'device': '0',  # GPU
    
    # Optimization
    'optimizer': 'AdamW',
    'learning_rate': 0.001,
    'momentum': 0.937,
    'weight_decay': 0.0005,
    'warmup_epochs': 3,  # Reduced for faster start
    
    # Loss weights (food-specific)
    'box_loss': 0.05,
    'cls_loss': 0.3,
    'dfl_loss': 1.5,
    
    # Augmentation (conservative for food)
    'hsv_h': 0.01,
    'hsv_s': 0.5,
    'hsv_v': 0.3,
    'degrees': 5,
    'translate': 0.1,
    'scale': 0.3,
    'fliplr': 0.5,
    'mosaic': 0.8,
    'mixup': 0.1
}

print("⚙️ Training configuration loaded")

# ====================================================================
# SECTION 5: Model Training
# ====================================================================

def train_studxchange_model():
    """Train the custom Indian food detection model"""
    
    print("🚀 Starting StudXchange Indian Food Detection Training")
    print("=" * 60)
    
    # Initialize model
    model = YOLO(f'yolov8{TRAINING_CONFIG["model_size"]}.pt')
    
    # Start training
    results = model.train(
        # Dataset
        data=f'{dataset.location}/data.yaml',
        
        # Training duration
        epochs=TRAINING_CONFIG['epochs'],
        patience=TRAINING_CONFIG['patience'],
        
        # Batch and image size
        batch=TRAINING_CONFIG['batch_size'],
        imgsz=TRAINING_CONFIG['image_size'],
        
        # Hardware
        device=TRAINING_CONFIG['device'],
        workers=TRAINING_CONFIG['workers'],
        
        # Optimization
        optimizer=TRAINING_CONFIG['optimizer'],
        lr0=TRAINING_CONFIG['learning_rate'],
        momentum=TRAINING_CONFIG['momentum'],
        weight_decay=TRAINING_CONFIG['weight_decay'],
        warmup_epochs=TRAINING_CONFIG['warmup_epochs'],
        
        # Loss weights
        box=TRAINING_CONFIG['box_loss'],
        cls=TRAINING_CONFIG['cls_loss'],
        dfl=TRAINING_CONFIG['dfl_loss'],
        
        # Augmentation
        hsv_h=TRAINING_CONFIG['hsv_h'],
        hsv_s=TRAINING_CONFIG['hsv_s'],
        hsv_v=TRAINING_CONFIG['hsv_v'],
        degrees=TRAINING_CONFIG['degrees'],
        translate=TRAINING_CONFIG['translate'],
        scale=TRAINING_CONFIG['scale'],
        fliplr=TRAINING_CONFIG['fliplr'],
        mosaic=TRAINING_CONFIG['mosaic'],
        mixup=TRAINING_CONFIG['mixup'],
        
        # Validation and saving
        val=True,
        save=True,
        plots=True,
        cache=True,  # Cache images for faster training
        
        # Project settings
        project='studxchange_training',
        name=f'indian_food_colab_{datetime.now().strftime("%Y%m%d_%H%M")}',
        exist_ok=True,
        
        # Tracking
        wandb=True
    )
    
    return results

# Run training
training_results = train_studxchange_model()

# ====================================================================
# SECTION 6: Training Results Analysis
# ====================================================================

import matplotlib.pyplot as plt
from IPython.display import Image, display

print("\n📊 Training Results Summary:")
print("=" * 40)
print(f"✅ Training completed!")
print(f"📁 Results saved to: {training_results.save_dir}")
print(f"📊 Best mAP@0.5: {training_results.box.map50:.3f}")
print(f"📊 Best mAP@0.5:0.95: {training_results.box.map:.3f}")
print(f"🏆 Best fitness: {training_results.best_fitness:.3f}")

# Display training curves
results_dir = training_results.save_dir
if os.path.exists(f"{results_dir}/results.png"):
    print("\n📈 Training Curves:")
    display(Image(f"{results_dir}/results.png"))

# Display validation predictions
if os.path.exists(f"{results_dir}/val_batch0_pred.jpg"):
    print("\n🎯 Validation Predictions:")
    display(Image(f"{results_dir}/val_batch0_pred.jpg"))

# ====================================================================
# SECTION 7: Model Evaluation and Testing
# ====================================================================

# Load best model for evaluation
best_model = YOLO(f"{results_dir}/weights/best.pt")

# Run validation
print("\n🔬 Running final validation...")
val_results = best_model.val()

print(f"📊 Final Validation Results:")
print(f"   mAP@0.5: {val_results.box.map50:.3f}")
print(f"   mAP@0.5:0.95: {val_results.box.map:.3f}")
print(f"   Precision: {val_results.box.mp:.3f}")
print(f"   Recall: {val_results.box.mr:.3f}")

# Test inference speed
import time
test_image_path = f"{dataset.location}/test/images"
if os.path.exists(test_image_path):
    test_images = [f for f in os.listdir(test_image_path) if f.endswith(('.jpg', '.jpeg', '.png'))]
    
    if test_images:
        sample_image = os.path.join(test_image_path, test_images[0])
        
        # Benchmark inference speed
        start_time = time.time()
        results = best_model(sample_image)
        inference_time = time.time() - start_time
        
        print(f"\n⚡ Inference Speed Test:")
        print(f"   Time per image: {inference_time:.3f} seconds")
        print(f"   FPS: {1/inference_time:.1f}")

# ====================================================================
# SECTION 8: Model Export and Download
# ====================================================================

print("\n📦 Exporting model for deployment...")

# Export to ONNX for better inference speed
onnx_path = best_model.export(format='onnx', optimize=True, simplify=True)
print(f"✅ ONNX model exported: {onnx_path}")

# Export to TensorFlow Lite for mobile deployment
try:
    tflite_path = best_model.export(format='tflite', int8=True)
    print(f"✅ TensorFlow Lite model exported: {tflite_path}")
except Exception as e:
    print(f"⚠️ TFLite export failed: {e}")

# Create deployment package
import zipfile
import shutil

deployment_dir = "studxchange_deployment"
os.makedirs(deployment_dir, exist_ok=True)

# Copy important files
files_to_copy = [
    (f"{results_dir}/weights/best.pt", "studxchange_model.pt"),
    (onnx_path, "studxchange_model.onnx"),
    (f"{dataset.location}/data.yaml", "class_names.yaml"),
    (f"{results_dir}/results.png", "training_curves.png")
]

for src, dst in files_to_copy:
    if os.path.exists(src):
        shutil.copy2(src, os.path.join(deployment_dir, dst))

# Create deployment info
deployment_info = {
    "model_name": "StudXchange Indian Food Detection",
    "version": f"v1.0_colab_{datetime.now().strftime('%Y%m%d')}",
    "training_date": datetime.now().isoformat(),
    "metrics": {
        "mAP_50": float(val_results.box.map50),
        "mAP_50_95": float(val_results.box.map),
        "precision": float(val_results.box.mp),
        "recall": float(val_results.box.mr)
    },
    "inference_time_seconds": inference_time,
    "model_files": {
        "pytorch": "studxchange_model.pt",
        "onnx": "studxchange_model.onnx",
        "classes": "class_names.yaml"
    },
    "usage_example": {
        "python": "model = YOLO('studxchange_model.pt'); results = model('food_image.jpg')",
        "api_endpoint": "/api/ai/custom-detect"
    }
}

with open(os.path.join(deployment_dir, "deployment_info.json"), "w") as f:
    import json
    json.dump(deployment_info, f, indent=2)

# Create zip for download
zip_filename = f"studxchange_model_{datetime.now().strftime('%Y%m%d_%H%M')}.zip"
with zipfile.ZipFile(zip_filename, 'w') as zipf:
    for root, dirs, files in os.walk(deployment_dir):
        for file in files:
            file_path = os.path.join(root, file)
            arc_path = os.path.relpath(file_path, deployment_dir)
            zipf.write(file_path, arc_path)

print(f"\n📥 Deployment package created: {zip_filename}")
print("💾 Download this file to deploy your model!")

# ====================================================================
# SECTION 9: Download Files (Run in Colab)
# ====================================================================

# Uncomment these lines when running in Colab to download files
"""
from google.colab import files

# Download the deployment package
files.download(zip_filename)

# Download individual model files if needed
files.download(f"{results_dir}/weights/best.pt")
files.download(onnx_path)
"""

# ====================================================================
# SECTION 10: Model Testing with Sample Images
# ====================================================================

def test_model_on_samples():
    """Test the trained model on sample images"""
    
    print("\n🧪 Testing model on sample images...")
    
    # Get test images
    test_dir = f"{dataset.location}/test/images"
    if not os.path.exists(test_dir):
        test_dir = f"{dataset.location}/valid/images"
    
    if os.path.exists(test_dir):
        test_images = [f for f in os.listdir(test_dir) if f.endswith(('.jpg', '.jpeg', '.png'))][:5]
        
        for img_file in test_images:
            img_path = os.path.join(test_dir, img_file)
            
            # Run inference
            results = best_model(img_path)
            
            # Display results
            print(f"\n📸 Image: {img_file}")
            for r in results:
                if r.boxes is not None:
                    for box in r.boxes:
                        class_id = int(box.cls[0])
                        confidence = float(box.conf[0])
                        class_name = r.names[class_id]
                        print(f"   🍛 Detected: {class_name} (confidence: {confidence:.2f})")
                else:
                    print("   🔍 No dishes detected")
            
            # Save annotated image
            annotated = results[0].plot()
            output_path = f"test_result_{img_file}"
            import cv2
            cv2.imwrite(output_path, annotated)
            
            # Display in Colab
            display(Image(output_path))

# Run sample testing
test_model_on_samples()

# ====================================================================
# FINAL SUMMARY
# ====================================================================

print("\n" + "="*60)
print("🎉 STUDXCHANGE TRAINING COMPLETE!")
print("="*60)
print(f"✅ Model trained successfully")
print(f"📊 Final mAP@0.5: {val_results.box.map50:.3f}")
print(f"⚡ Inference speed: {inference_time:.3f}s per image")
print(f"📦 Deployment package: {zip_filename}")
print(f"🚀 Ready for production deployment!")
print("="*60)

# Finish wandb run
wandb.finish()

print("\n💡 Next steps:")
print("1. Download the deployment package")
print("2. Upload to Hugging Face Spaces")
print("3. Integrate with StudXchange API")
print("4. Test with real mess photos!")