# 🏷️ Roboflow Project Setup - StudXchange Indian Food Detection
## Complete Setup Guide for Data Labeling Platform

---

## 🚀 Quick Start

### Step 1: Create Roboflow Account
1. Go to [roboflow.com](https://roboflow.com)
2. Sign up with GitHub/Google (recommended for easy integration)
3. Choose "Computer Vision" > "Object Detection"
4. Select "Free Plan" (includes 1,000 images/month)

### Step 2: Create StudXchange Project
```python
# setup_roboflow_project.py
import roboflow

# Get API key from: https://app.roboflow.com/settings/api
rf = roboflow.Roboflow(api_key="your_roboflow_api_key_here")

# Create workspace
workspace = rf.workspace("studxchange-ai")

# Create project for Indian food detection
project = workspace.create_project(
    project_name="indian-mess-food-detection",
    project_license="MIT",
    project_type="object-detection",
    annotation_format="yolov8"
)

print(f"✅ Project created: {project.id}")
print(f"📁 Project URL: https://app.roboflow.com/{workspace.workspace_url}/{project.project_url}")
```

---

## 📋 Dish Categories Configuration

### Essential Categories (Priority 1)
```python
# indian_food_classes.py
ESSENTIAL_DISHES = {
    # Breakfast Items (8 classes)
    0: "aloo_paratha",      # Potato stuffed flatbread
    1: "plain_paratha",     # Regular flatbread  
    2: "poha",              # Flattened rice dish
    3: "upma",              # Semolina porridge
    4: "idli",              # Steamed rice cake
    5: "dosa",              # Fermented crepe
    6: "bread_butter",      # Bread with butter
    7: "tea",               # Indian tea
    
    # Main Course (12 classes)
    8: "dal_tadka",         # Tempered lentils
    9: "dal_fry",           # Fried lentils
    10: "rajma",            # Kidney bean curry
    11: "chole",            # Chickpea curry
    12: "rice",             # Steamed rice
    13: "roti",             # Whole wheat flatbread
    14: "chapati",          # Thin flatbread
    15: "aloo_sabzi",       # Potato curry
    16: "bhindi_sabzi",     # Okra curry
    17: "paneer_butter_masala", # Cottage cheese curry
    18: "curd",             # Yogurt
    19: "pickle",           # Indian pickle
    
    # Beverages & Sides (5 classes)
    20: "coffee",           # Indian coffee
    21: "samosa",           # Fried pastry
    22: "papad",            # Thin wafer
    23: "raita",            # Yogurt salad
    24: "salad"             # Fresh salad
}

# Extended dishes for future training
EXTENDED_DISHES = {
    25: "gobi_paratha",     # Cauliflower paratha
    26: "methi_paratha",    # Fenugreek paratha
    27: "vada",             # Fried lentil donut
    28: "sambhar",          # South Indian lentil soup
    29: "jeera_rice",       # Cumin rice
    30: "biryani",          # Spiced rice dish
    31: "palak_paneer",     # Spinach cottage cheese
    32: "matar_paneer",     # Peas cottage cheese
    33: "naan",             # Leavened flatbread
    34: "kulcha",           # Stuffed naan
    35: "pakora",           # Fritters
    36: "dhokla",           # Steamed gram flour cake
    37: "lassi"             # Yogurt drink
}

# Total: 38 classes for comprehensive Indian food recognition
```

### Create Classes in Roboflow
```python
# configure_roboflow_classes.py
import roboflow

def setup_food_classes():
    rf = roboflow.Roboflow(api_key="your_api_key")
    project = rf.workspace("studxchange-ai").project("indian-mess-food-detection")
    
    # Add all essential dish classes
    for class_id, dish_name in ESSENTIAL_DISHES.items():
        try:
            project.add_class(dish_name)
            print(f"✅ Added class: {dish_name}")
        except Exception as e:
            print(f"⚠️  Class {dish_name} may already exist: {e}")
    
    print(f"📊 Total classes configured: {len(ESSENTIAL_DISHES)}")
    return project

if __name__ == "__main__":
    project = setup_food_classes()
```

---

## 📸 Image Collection Strategy

### Method 1: Direct Photography Guidelines
```python
# photography_guidelines.py
PHOTO_REQUIREMENTS = {
    "resolution": "minimum 640x640, prefer 1280x1280",
    "format": "JPG/JPEG preferred",
    "lighting": "natural light preferred, avoid harsh shadows",
    "angle": "45-degree top-down angle ideal",
    "background": "vary backgrounds (plates, tables, trays)",
    "portions": "show typical mess serving sizes",
    "quality": "sharp focus, avoid blur",
    "variations": "different preparations of same dish"
}

COLLECTION_TARGETS = {
    "images_per_essential_dish": 100,  # Minimum for good training
    "images_per_extended_dish": 50,    # For future expansion
    "total_target": 3800,              # 38 dishes × 100 images
    "weekly_target": 500,              # Realistic collection rate
    "timeline": "7-8 weeks for complete dataset"
}

# Collection checklist for each dish
def create_collection_checklist(dish_name):
    return {
        "basic_shots": 20,      # Standard presentation
        "angle_variations": 15,  # Different camera angles
        "portion_sizes": 15,     # Small, medium, large portions
        "lighting_conditions": 15, # Morning, afternoon, evening
        "background_variations": 15, # Different plates/surfaces
        "quality_variations": 10, # Fresh vs. partially eaten
        "context_shots": 10      # With other dishes visible
    }
```

### Method 2: Online Dataset Augmentation
```python
# online_dataset_collection.py
import requests
from bs4 import BeautifulSoup
import os
from urllib.parse import urlparse

def search_food_images(dish_name, count=50):
    """Ethically collect food images from public sources"""
    
    # Search engines with appropriate filters
    search_sources = [
        f"https://www.pexels.com/search/{dish_name}%20indian%20food/",
        f"https://unsplash.com/s/photos/{dish_name}-indian",
        f"https://pixabay.com/images/search/{dish_name}%20indian/"
    ]
    
    collected_images = []
    
    for source in search_sources:
        print(f"Searching {source}...")
        # Implementation would respect robots.txt and terms of service
        # Focus on royalty-free, properly licensed images
        pass
    
    return collected_images

# Always verify licensing and attribution
LICENSING_REQUIREMENTS = {
    "creative_commons": "CC0, CC BY acceptable",
    "royalty_free": "Pexels, Unsplash, Pixabay preferred",
    "attribution": "Always provide proper attribution",
    "commercial_use": "Ensure commercial use allowed",
    "modification": "Ensure modification allowed for training"
}
```

---

## 🏷️ Labeling Workflow

### Labeling Best Practices
```python
# labeling_guidelines.py
LABELING_STANDARDS = {
    "bounding_box_rules": {
        "tight_fit": "Box should tightly encompass the dish",
        "exclude_plate": "Don't include plate/bowl unless it's part of the dish identity",
        "include_garnish": "Include garnishes that are part of the dish",
        "multiple_items": "Label each distinct food item separately",
        "partial_visibility": "Label even if partially hidden"
    },
    
    "naming_consistency": {
        "use_predefined_classes": "Only use classes from ESSENTIAL_DISHES",
        "snake_case": "Always use underscore format (dal_tadka not Dal Tadka)",
        "no_variations": "aloo_paratha not aloo_parantha",
        "consistent_spelling": "Maintain exact spelling across all labels"
    },
    
    "quality_control": {
        "minimum_size": "Bounding box should be at least 32x32 pixels",
        "clear_visibility": "Dish should be clearly identifiable",
        "no_ambiguity": "If unsure of dish type, skip labeling",
        "double_check": "Review each labeled image before submitting"
    }
}

def validate_label_quality(image_path, labels):
    """Validate labeling quality before submission"""
    checks = []
    
    # Check label format
    for label in labels:
        class_id, x_center, y_center, width, height = label
        
        # Validate class exists
        if class_id not in ESSENTIAL_DISHES:
            checks.append(f"❌ Invalid class ID: {class_id}")
        
        # Validate coordinates (0-1 range)
        if not (0 <= x_center <= 1 and 0 <= y_center <= 1):
            checks.append(f"❌ Invalid coordinates: {x_center}, {y_center}")
        
        # Validate size (reasonable dimensions)
        if width < 0.05 or height < 0.05:
            checks.append(f"⚠️  Very small bounding box: {width}x{height}")
    
    return checks
```

### Labeling Efficiency Tools
```python
# labeling_automation.py
import cv2
import numpy as np

def suggest_bounding_boxes(image_path):
    """Use basic computer vision to suggest bounding box locations"""
    
    # Load image
    img = cv2.imread(image_path)
    
    # Convert to HSV for better food detection
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    
    # Create mask for food-like colors (browns, yellows, reds)
    food_colors = [
        ([10, 50, 50], [30, 255, 255]),    # Yellows/oranges
        ([0, 50, 50], [10, 255, 255]),     # Reds
        ([110, 50, 50], [130, 255, 255])   # Browns
    ]
    
    combined_mask = np.zeros(hsv.shape[:2], dtype=np.uint8)
    
    for lower, upper in food_colors:
        mask = cv2.inRange(hsv, np.array(lower), np.array(upper))
        combined_mask = cv2.bitwise_or(combined_mask, mask)
    
    # Find contours
    contours, _ = cv2.findContours(combined_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    # Filter and convert to bounding boxes
    suggested_boxes = []
    for contour in contours:
        area = cv2.contourArea(contour)
        if area > 1000:  # Minimum area threshold
            x, y, w, h = cv2.boundingRect(contour)
            
            # Convert to YOLO format (normalized)
            img_h, img_w = img.shape[:2]
            x_center = (x + w/2) / img_w
            y_center = (y + h/2) / img_h
            width = w / img_w
            height = h / img_h
            
            suggested_boxes.append([x_center, y_center, width, height])
    
    return suggested_boxes

# Batch labeling assistant
def batch_label_similar_images(image_dir, template_labels):
    """Apply similar labels to a batch of similar images"""
    
    # This would use image similarity to suggest labels
    # for images of the same dish type
    pass
```

---

## 📊 Dataset Validation & Export

### Pre-Training Validation
```python
# dataset_validation.py
import os
import json
from collections import Counter, defaultdict

def comprehensive_dataset_validation(dataset_path):
    """Complete validation before training"""
    
    # Load dataset structure
    train_images = os.listdir(f"{dataset_path}/images/train")
    val_images = os.listdir(f"{dataset_path}/images/val")
    test_images = os.listdir(f"{dataset_path}/images/test")
    
    # Count annotations per class
    class_counts = {
        "train": Counter(),
        "val": Counter(), 
        "test": Counter()
    }
    
    for split in ["train", "val", "test"]:
        label_dir = f"{dataset_path}/labels/{split}"
        for label_file in os.listdir(label_dir):
            with open(f"{label_dir}/{label_file}") as f:
                for line in f:
                    class_id = int(line.strip().split()[0])
                    class_counts[split][class_id] += 1
    
    # Generate validation report
    report = {
        "dataset_summary": {
            "total_images": len(train_images) + len(val_images) + len(test_images),
            "train_images": len(train_images),
            "val_images": len(val_images),
            "test_images": len(test_images)
        },
        "class_distribution": class_counts,
        "recommendations": [],
        "ready_for_training": True
    }
    
    # Validation checks
    total_classes = len(set(class_counts["train"].keys()))
    min_samples_per_class = 30
    
    for class_id in ESSENTIAL_DISHES.keys():
        train_count = class_counts["train"].get(class_id, 0)
        val_count = class_counts["val"].get(class_id, 0)
        
        if train_count < min_samples_per_class:
            report["recommendations"].append(
                f"⚠️  Class {ESSENTIAL_DISHES[class_id]} needs more training images: {train_count}/{min_samples_per_class}"
            )
            if train_count < 10:
                report["ready_for_training"] = False
        
        if val_count == 0:
            report["recommendations"].append(
                f"⚠️  Class {ESSENTIAL_DISHES[class_id]} missing validation images"
            )
    
    # Class balance check
    train_counts = list(class_counts["train"].values())
    if max(train_counts) / min(train_counts) > 10:
        report["recommendations"].append("⚠️  Dataset is imbalanced. Consider data augmentation.")
    
    # Export report
    with open(f"{dataset_path}/validation_report.json", "w") as f:
        json.dump(report, f, indent=2)
    
    print("📊 Dataset Validation Report:")
    print(f"Total Images: {report['dataset_summary']['total_images']}")
    print(f"Total Classes: {total_classes}")
    print(f"Ready for Training: {'✅' if report['ready_for_training'] else '❌'}")
    
    for rec in report["recommendations"][:5]:  # Show top 5 recommendations
        print(rec)
    
    return report

def export_to_yolo_format(roboflow_project, version=1):
    """Export Roboflow dataset in YOLOv8 format"""
    
    dataset = roboflow_project.version(version).download("yolov8")
    
    print(f"✅ Dataset exported to: {dataset.location}")
    print(f"📁 Train images: {len(os.listdir(f'{dataset.location}/train/images'))}")
    print(f"📁 Validation images: {len(os.listdir(f'{dataset.location}/valid/images'))}")
    print(f"📁 Test images: {len(os.listdir(f'{dataset.location}/test/images'))}")
    
    return dataset.location
```

---

## ⚡ Quick Start Checklist

### Week 1: Setup & Initial Collection
- [ ] Create Roboflow account and project
- [ ] Configure 25 essential dish classes
- [ ] Collect 500+ images (20+ per essential dish)  
- [ ] Label 200+ images to test workflow
- [ ] Run dataset validation

### Week 2: Scale Collection & Labeling
- [ ] Collect 1500+ more images 
- [ ] Complete labeling for 15+ dish classes
- [ ] Implement labeling quality checks
- [ ] Export first dataset version

### Week 3: Complete Dataset & Begin Training
- [ ] Reach 2500+ labeled images
- [ ] Validate dataset quality (>90% classes ready)
- [ ] Export final training dataset
- [ ] Begin model training setup

---

Ready to start building your custom Indian food detection dataset! The Roboflow platform will make the labeling process much more efficient. 🚀

Next step: Create your Roboflow account and run the setup script!