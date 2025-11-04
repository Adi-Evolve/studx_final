# 🏁 Kaggle Training Environment - StudXchange Custom Model
## Alternative Free GPU Training Setup

"""
StudXchange Indian Food Detection - Kaggle Edition
=================================================

Alternative to Google Colab for training custom YOLOv8 model.
Kaggle provides 30 hours/week of free GPU time with more VRAM.

How to use:
1. Create account at kaggle.com
2. Create new notebook
3. Enable GPU accelerator
4. Copy-paste this code
"""

# ====================================================================
# KAGGLE SPECIFIC SETUP
# ====================================================================

# Kaggle datasets input (if you upload dataset to Kaggle)
import os
import sys

# Check if running on Kaggle
if 'KAGGLE_WORKING_DIR' in os.environ:
    print("🏁 Running on Kaggle")
    INPUT_PATH = "/kaggle/input"
    WORKING_PATH = "/kaggle/working"
else:
    print("💻 Running locally")
    INPUT_PATH = "./input"
    WORKING_PATH = "./working"

print(f"📁 Input path: {INPUT_PATH}")
print(f"📁 Working path: {WORKING_PATH}")

# ====================================================================
# INSTALLATION AND IMPORTS
# ====================================================================

# Install packages (Kaggle may have some pre-installed)
# !pip install ultralytics --quiet
# !pip install roboflow --quiet
# !pip install wandb --quiet

# Import required libraries
try:
    import torch
    import torchvision
    from ultralytics import YOLO
except ImportError as e:
    print(f"Missing required package: {e}")
    print("Please install with: pip install torch torchvision ultralytics")
import cv2
import numpy as np
import matplotlib.pyplot as plt
try:
    import pandas as pd
except ImportError:
    print("Pandas not installed. Some analysis features may not work.")
    pd = None
import json
import yaml
import zipfile
import shutil
from datetime import datetime
from pathlib import Path
import time

# Verify GPU
print(f"PyTorch version: {torch.__version__}")
print(f"CUDA available: {torch.cuda.is_available()}")
if torch.cuda.is_available():
    print(f"GPU: {torch.cuda.get_device_name(0)}")
    print(f"VRAM: {torch.cuda.get_device_properties(0).total_memory / 1e9:.1f} GB")

# ====================================================================
# DATASET SETUP (Multiple Methods)
# ====================================================================

def setup_dataset_from_roboflow():
    """Method 1: Download directly from Roboflow"""
    import roboflow
    
    # Replace with your credentials
    ROBOFLOW_API_KEY = "your_roboflow_api_key_here"
    WORKSPACE = "studxchange-ai"
    PROJECT = "indian-mess-food-detection"
    VERSION = 1
    
    rf = roboflow.Roboflow(api_key=ROBOFLOW_API_KEY)
    project = rf.workspace(WORKSPACE).project(PROJECT)
    dataset = project.version(VERSION).download("yolov8")
    
    return dataset.location

def setup_dataset_from_kaggle():
    """Method 2: Use dataset uploaded to Kaggle"""
    # If you uploaded your dataset to Kaggle as a dataset
    dataset_path = f"{INPUT_PATH}/studxchange-indian-food-dataset"
    
    if os.path.exists(dataset_path):
        print(f"📁 Found Kaggle dataset: {dataset_path}")
        return dataset_path
    else:
        print("❌ Kaggle dataset not found")
        return None

def setup_dataset_from_zip():
    """Method 3: Extract from uploaded zip file"""
    zip_files = [f for f in os.listdir(INPUT_PATH) if f.endswith('.zip')]
    
    if zip_files:
        zip_path = os.path.join(INPUT_PATH, zip_files[0])
        extract_path = f"{WORKING_PATH}/dataset"
        
        print(f"📦 Extracting dataset from: {zip_path}")
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            zip_ref.extractall(extract_path)
        
        return extract_path
    else:
        print("❌ No zip file found")
        return None

# Try different methods to get dataset
dataset_location = None

# Try Roboflow first
try:
    dataset_location = setup_dataset_from_roboflow()
    print(f"✅ Dataset loaded from Roboflow: {dataset_location}")
except:
    print("⚠️ Roboflow method failed, trying alternatives...")

# Try Kaggle dataset
if not dataset_location:
    dataset_location = setup_dataset_from_kaggle()

# Try zip extraction
if not dataset_location:
    dataset_location = setup_dataset_from_zip()

if not dataset_location:
    print("❌ Could not load dataset. Please check your setup.")
    sys.exit(1)

print(f"📁 Final dataset location: {dataset_location}")

# ====================================================================
# WANDB SETUP (OPTIONAL)
# ====================================================================

import wandb

# Login to wandb (optional - comment out if not using)
# wandb.login()

# Initialize project
wandb.init(
    project="studxchange-indian-food-kaggle",
    name=f"kaggle_training_v1_{datetime.now().strftime('%Y%m%d_%H%M')}",
    config={
        "platform": "kaggle",
        "model": "yolov8s",  # Use small model for better performance
        "epochs": 300,       # Kaggle allows longer training
        "batch_size": 32,    # Larger batch size due to more VRAM
        "image_size": 640
    }
)

# ====================================================================
# KAGGLE-OPTIMIZED TRAINING CONFIGURATION
# ====================================================================

# Kaggle has more resources, so we can use better settings
KAGGLE_CONFIG = {
    # Model (use small instead of nano for better accuracy)
    'model_size': 's',  # yolov8s for better accuracy on Kaggle
    
    # Training parameters (optimized for Kaggle's resources)
    'epochs': 300,      # Full training on Kaggle
    'batch_size': 32,   # Larger batch size
    'image_size': 640,
    'patience': 50,
    
    # Hardware
    'workers': 4,       # More workers
    'device': '0',
    
    # Optimization
    'optimizer': 'AdamW',
    'learning_rate': 0.001,
    'momentum': 0.937,
    'weight_decay': 0.0005,
    'warmup_epochs': 5,
    
    # Loss weights
    'box_loss': 0.05,
    'cls_loss': 0.3,
    'dfl_loss': 1.5,
    
    # Enhanced augmentation for better generalization
    'hsv_h': 0.015,
    'hsv_s': 0.7,
    'hsv_v': 0.4,
    'degrees': 10,
    'translate': 0.1,
    'scale': 0.5,
    'fliplr': 0.5,
    'mosaic': 1.0,
    'mixup': 0.2,
    'copy_paste': 0.1  # Additional augmentation
}

print("⚙️ Kaggle-optimized configuration loaded")

# ====================================================================
# DATASET VALIDATION
# ====================================================================

def validate_kaggle_dataset(dataset_path):
    """Validate dataset structure and content"""
    print("🔍 Validating dataset...")
    
    required_dirs = ['images/train', 'images/val', 'labels/train', 'labels/val']
    
    for dir_name in required_dirs:
        dir_path = os.path.join(dataset_path, dir_name)
        if os.path.exists(dir_path):
            count = len([f for f in os.listdir(dir_path) if not f.startswith('.')])
            print(f"✅ {dir_name}: {count} files")
        else:
            print(f"❌ Missing: {dir_name}")
    
    # Check data.yaml
    yaml_path = os.path.join(dataset_path, 'data.yaml')
    if os.path.exists(yaml_path):
        with open(yaml_path, 'r') as f:
            data_config = yaml.safe_load(f)
        print(f"✅ Found {data_config.get('nc', 0)} classes")
        return True
    else:
        print("❌ Missing data.yaml")
        return False

# Validate dataset
if not validate_kaggle_dataset(dataset_location):
    print("❌ Dataset validation failed")
    sys.exit(1)

# ====================================================================
# TRAINING FUNCTION
# ====================================================================

def train_studxchange_kaggle():
    """Train model optimized for Kaggle environment"""
    
    print("🚀 Starting StudXchange Training on Kaggle")
    print("=" * 60)
    
    # Initialize model with pre-trained weights
    model = YOLO(f'yolov8{KAGGLE_CONFIG["model_size"]}.pt')
    
    # Training arguments
    train_args = {
        # Dataset
        'data': os.path.join(dataset_location, 'data.yaml'),
        
        # Training duration
        'epochs': KAGGLE_CONFIG['epochs'],
        'patience': KAGGLE_CONFIG['patience'],
        
        # Batch and image size
        'batch': KAGGLE_CONFIG['batch_size'],
        'imgsz': KAGGLE_CONFIG['image_size'],
        
        # Hardware optimization
        'device': KAGGLE_CONFIG['device'],
        'workers': KAGGLE_CONFIG['workers'],
        'amp': True,  # Automatic Mixed Precision for faster training
        
        # Optimization
        'optimizer': KAGGLE_CONFIG['optimizer'],
        'lr0': KAGGLE_CONFIG['learning_rate'],
        'momentum': KAGGLE_CONFIG['momentum'],
        'weight_decay': KAGGLE_CONFIG['weight_decay'],
        'warmup_epochs': KAGGLE_CONFIG['warmup_epochs'],
        
        # Loss weights
        'box': KAGGLE_CONFIG['box_loss'],
        'cls': KAGGLE_CONFIG['cls_loss'],
        'dfl': KAGGLE_CONFIG['dfl_loss'],
        
        # Data augmentation
        'hsv_h': KAGGLE_CONFIG['hsv_h'],
        'hsv_s': KAGGLE_CONFIG['hsv_s'],
        'hsv_v': KAGGLE_CONFIG['hsv_v'],
        'degrees': KAGGLE_CONFIG['degrees'],
        'translate': KAGGLE_CONFIG['translate'],
        'scale': KAGGLE_CONFIG['scale'],
        'fliplr': KAGGLE_CONFIG['fliplr'],
        'mosaic': KAGGLE_CONFIG['mosaic'],
        'mixup': KAGGLE_CONFIG['mixup'],
        'copy_paste': KAGGLE_CONFIG['copy_paste'],
        
        # Validation and saving
        'val': True,
        'save': True,
        'plots': True,
        'cache': True,
        'resume': False,
        
        # Output directory
        'project': f'{WORKING_PATH}/runs',
        'name': f'studxchange_kaggle_{datetime.now().strftime("%Y%m%d_%H%M")}',
        'exist_ok': True,
        
        # Callbacks and tracking
        'wandb': True,
        'save_period': 25,  # Save checkpoint every 25 epochs
    }
    
    # Start training
    print("🔥 Training started...")
    results = model.train(**train_args)
    
    print("✅ Training completed!")
    return results, model

# ====================================================================
# MAIN TRAINING EXECUTION
# ====================================================================

# Record start time
start_time = time.time()

# Run training
training_results, trained_model = train_studxchange_kaggle()

# Calculate training time
training_time = time.time() - start_time
print(f"⏱️ Total training time: {training_time/3600:.2f} hours")

# ====================================================================
# RESULTS ANALYSIS
# ====================================================================

print("\n📊 Training Results Analysis")
print("=" * 40)

# Extract results
results_dir = training_results.save_dir
print(f"📁 Results directory: {results_dir}")

# Load best model
best_model = YOLO(f"{results_dir}/weights/best.pt")

# Final validation
print("\n🔬 Running final validation...")
val_results = best_model.val()

# Print metrics
metrics = {
    'mAP_50': val_results.box.map50,
    'mAP_50_95': val_results.box.map,
    'precision': val_results.box.mp,
    'recall': val_results.box.mr,
    'training_time_hours': training_time / 3600
}

print("\n🏆 Final Model Metrics:")
for metric, value in metrics.items():
    print(f"   {metric}: {value:.4f}")

# Save metrics to file
with open(f"{WORKING_PATH}/final_metrics.json", 'w') as f:
    json.dump(metrics, f, indent=2)

# ====================================================================
# MODEL EXPORT AND OPTIMIZATION
# ====================================================================

print("\n📦 Exporting optimized models...")

export_dir = f"{WORKING_PATH}/exported_models"
os.makedirs(export_dir, exist_ok=True)

# Export different formats
exported_models = {}

# ONNX export (best for production)
try:
    onnx_path = best_model.export(
        format='onnx',
        optimize=True,
        simplify=True,
        workspace=4
    )
    shutil.copy2(onnx_path, f"{export_dir}/studxchange_model.onnx")
    exported_models['onnx'] = 'studxchange_model.onnx'
    print("✅ ONNX export successful")
except Exception as e:
    print(f"❌ ONNX export failed: {e}")

# TensorFlow Lite (for mobile)
try:
    tflite_path = best_model.export(
        format='tflite',
        int8=True
    )
    shutil.copy2(tflite_path, f"{export_dir}/studxchange_model.tflite")
    exported_models['tflite'] = 'studxchange_model.tflite'
    print("✅ TensorFlow Lite export successful")
except Exception as e:
    print(f"❌ TFLite export failed: {e}")

# TorchScript (PyTorch optimized)
try:
    torchscript_path = best_model.export(format='torchscript')
    shutil.copy2(torchscript_path, f"{export_dir}/studxchange_model.torchscript")
    exported_models['torchscript'] = 'studxchange_model.torchscript'
    print("✅ TorchScript export successful")
except Exception as e:
    print(f"❌ TorchScript export failed: {e}")

# ====================================================================
# PERFORMANCE BENCHMARKING
# ====================================================================

def benchmark_model_performance():
    """Benchmark inference speed on different formats"""
    print("\n⚡ Benchmarking model performance...")
    
    # Test with sample images
    test_images_dir = os.path.join(dataset_location, 'images', 'val')
    test_images = [f for f in os.listdir(test_images_dir) if f.endswith(('.jpg', '.jpeg', '.png'))][:10]
    
    benchmark_results = {}
    
    # Test PyTorch model
    if test_images:
        sample_image = os.path.join(test_images_dir, test_images[0])
        
        # PyTorch benchmark
        start_time = time.time()
        for _ in range(10):
            results = best_model(sample_image, verbose=False)
        pytorch_time = (time.time() - start_time) / 10
        
        benchmark_results['pytorch'] = {
            'avg_time': pytorch_time,
            'fps': 1 / pytorch_time
        }
        
        print(f"🔥 PyTorch: {pytorch_time:.3f}s ({1/pytorch_time:.1f} FPS)")
        
        # ONNX benchmark (if available)
        if 'onnx' in exported_models:
            try:
                onnx_model = YOLO(f"{export_dir}/studxchange_model.onnx")
                start_time = time.time()
                for _ in range(10):
                    results = onnx_model(sample_image, verbose=False)
                onnx_time = (time.time() - start_time) / 10
                
                benchmark_results['onnx'] = {
                    'avg_time': onnx_time,
                    'fps': 1 / onnx_time,
                    'speedup': pytorch_time / onnx_time
                }
                
                print(f"⚡ ONNX: {onnx_time:.3f}s ({1/onnx_time:.1f} FPS) - {pytorch_time/onnx_time:.1f}x faster")
            except Exception as e:
                print(f"❌ ONNX benchmark failed: {e}")
    
    return benchmark_results

# Run benchmarks
benchmark_results = benchmark_model_performance()

# ====================================================================
# CREATE DEPLOYMENT PACKAGE
# ====================================================================

print("\n📦 Creating deployment package...")

# Create comprehensive deployment package
deployment_package_dir = f"{WORKING_PATH}/studxchange_deployment"
os.makedirs(deployment_package_dir, exist_ok=True)

# Copy model files
shutil.copy2(f"{results_dir}/weights/best.pt", f"{deployment_package_dir}/studxchange_model.pt")
shutil.copy2(f"{dataset_location}/data.yaml", f"{deployment_package_dir}/class_names.yaml")

# Copy exported models
for format_name, filename in exported_models.items():
    src_path = f"{export_dir}/{filename}"
    if os.path.exists(src_path):
        shutil.copy2(src_path, deployment_package_dir)

# Copy results and plots
if os.path.exists(f"{results_dir}/results.png"):
    shutil.copy2(f"{results_dir}/results.png", f"{deployment_package_dir}/training_curves.png")

# Create comprehensive deployment info
deployment_info = {
    "model_info": {
        "name": "StudXchange Indian Food Detection Model",
        "version": f"v1.0_kaggle_{datetime.now().strftime('%Y%m%d')}",
        "architecture": f"YOLOv8{KAGGLE_CONFIG['model_size']}",
        "training_platform": "Kaggle",
        "training_date": datetime.now().isoformat(),
        "training_time_hours": training_time / 3600
    },
    "performance_metrics": metrics,
    "benchmark_results": benchmark_results,
    "model_files": {
        "pytorch": "studxchange_model.pt",
        "class_names": "class_names.yaml",
        **exported_models
    },
    "usage_examples": {
        "python_inference": {
            "load": "model = YOLO('studxchange_model.pt')",
            "predict": "results = model('food_image.jpg')",
            "parse": "for r in results: print(r.boxes.cls, r.boxes.conf)"
        },
        "api_integration": {
            "endpoint": "/api/ai/custom-detect",
            "method": "POST",
            "format": "multipart/form-data with image file"
        }
    },
    "deployment_instructions": {
        "local": "Load the .pt or .onnx file with ultralytics YOLO",
        "huggingface": "Upload to Hugging Face Spaces with Gradio interface",
        "api_server": "Integrate with FastAPI or Flask backend",
        "mobile": "Use .tflite file for mobile deployment"
    }
}

# Save deployment info
with open(f"{deployment_package_dir}/deployment_info.json", 'w') as f:
    json.dump(deployment_info, f, indent=2)

# Create usage example script
usage_script = '''
"""
StudXchange Indian Food Detection - Usage Example
"""
from ultralytics import YOLO

# Load model
model = YOLO('studxchange_model.pt')

# Single image prediction
results = model('food_image.jpg')

# Process results
for r in results:
    boxes = r.boxes
    if boxes is not None:
        for box in boxes:
            class_id = int(box.cls[0])
            confidence = float(box.conf[0])
            class_name = r.names[class_id]
            print(f"Detected: {class_name} (confidence: {confidence:.2f})")

# Batch prediction
results = model(['image1.jpg', 'image2.jpg'], stream=True)
for r in results:
    # Process each result
    pass
'''

with open(f"{deployment_package_dir}/usage_example.py", 'w') as f:
    f.write(usage_script)

# Create zip package
zip_filename = f"studxchange_model_kaggle_{datetime.now().strftime('%Y%m%d_%H%M')}.zip"
zip_path = f"{WORKING_PATH}/{zip_filename}"

with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
    for root, dirs, files in os.walk(deployment_package_dir):
        for file in files:
            file_path = os.path.join(root, file)
            arc_path = os.path.relpath(file_path, deployment_package_dir)
            zipf.write(file_path, arc_path)

print(f"✅ Deployment package created: {zip_filename}")

# ====================================================================
# FINAL SUMMARY AND RECOMMENDATIONS
# ====================================================================

print("\n" + "="*70)
print("🎉 STUDXCHANGE KAGGLE TRAINING COMPLETED!")
print("="*70)

print(f"\n📊 Training Summary:")
print(f"   ⏱️  Training time: {training_time/3600:.2f} hours")
print(f"   🏆 Best mAP@0.5: {metrics['mAP_50']:.3f}")
print(f"   🎯 Best mAP@0.5:0.95: {metrics['mAP_50_95']:.3f}")
print(f"   ⚡ Inference speed: {benchmark_results.get('pytorch', {}).get('avg_time', 0):.3f}s")

print(f"\n📦 Deliverables:")
print(f"   📁 Deployment package: {zip_filename}")
print(f"   🤖 Model files: PyTorch (.pt), ONNX (.onnx), TFLite (.tflite)")
print(f"   📊 Training curves and metrics included")

print(f"\n🚀 Next Steps:")
print(f"   1. Download deployment package from Kaggle output")
print(f"   2. Upload to Hugging Face Spaces for free hosting")
print(f"   3. Integrate with StudXchange API")
print(f"   4. Test with real Indian food photos")

print(f"\n💡 Recommendations:")
if metrics['mAP_50'] > 0.85:
    print(f"   ✅ Excellent performance! Ready for production")
elif metrics['mAP_50'] > 0.75:
    print(f"   ✅ Good performance. Consider fine-tuning with more data")
else:
    print(f"   ⚠️  Consider collecting more training data or adjusting hyperparameters")

print("="*70)

# Finish wandb
wandb.finish()

# List output files for easy identification
print(f"\n📁 Output Files in {WORKING_PATH}:")
for file in os.listdir(WORKING_PATH):
    if file.endswith(('.zip', '.json', '.pt')):
        print(f"   📄 {file}")

print("\n🎯 Training complete! Download your files and deploy to StudXchange! 🚀")