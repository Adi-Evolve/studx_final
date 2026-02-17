# 📸 Custom AI Model Training - Data Collection Guide
## Building Your Own Indian Food Recognition System

---

## 🎯 Training Data Requirements

### Target Dataset Size:
- **Minimum**: 50 images per dish (basic accuracy)
- **Recommended**: 100-200 images per dish (high accuracy) 
- **Professional**: 300+ images per dish (commercial grade)

### Total Dataset Target: **5,000-10,000 images**

---

## 📋 Dish Categories for Training

### Priority 1: Common Mess Items (Must Have)
```python
breakfast_dishes = [
    "aloo_paratha", "gobi_paratha", "methi_paratha", "plain_paratha",
    "poha", "upma", "idli", "dosa", "vada",
    "bread_butter", "bread_jam", "tea", "coffee"
]

lunch_dinner_dishes = [
    "dal_tadka", "dal_fry", "dal_makhani", "sambhar",
    "rajma", "chole", "aloo_sabzi", "bhindi_sabzi", "palak_sabzi",
    "paneer_butter_masala", "palak_paneer", "matar_paneer",
    "roti", "chapati", "naan", "rice", "jeera_rice", "biryani"
]

snacks_beverages = [
    "samosa", "pakora", "dhokla", "vada_pav",
    "lassi", "buttermilk", "fresh_lime"
]

sides = [
    "pickle", "papad", "raita", "salad", "chutney"
]
```

### Priority 2: Regional Specialties (Nice to Have)
- Local dishes specific to your area
- Regional variations of common items
- Festival/special occasion foods

---

## 📸 Data Collection Strategy

### Method 1: Direct Photography (Recommended)
```bash
# Equipment needed:
- Smartphone with good camera
- Natural lighting setup
- Multiple backgrounds/plates
- Varied portions and presentations

# Photography guidelines:
- Take 10-15 photos per dish per session
- Vary angles: top-down, 45-degree, side view
- Different lighting: morning, afternoon, evening
- Various backgrounds: plates, bowls, banana leaf
- Different portions: full plate, half plate, single serving
```

### Method 2: Partner with Mess Owners
```bash
# Collaboration approach:
- Partner with 5-10 mess owners
- Give them photography guidelines
- Collect photos regularly (weekly)
- Provide incentives (free listing, premium features)
- Quality control their submissions
```

### Method 3: Crowdsourcing
```bash
# Community approach:
- Create "Contribute to AI" feature in app
- Users upload photos and tag dishes
- Gamify with points/rewards
- Manual verification of submissions
- Build dataset organically
```

---

## 🏷️ Data Labeling Process

### Using Roboflow (Recommended - Free Tier)
```python
# Setup Roboflow project
import roboflow

rf = roboflow.Roboflow(api_key="your_key")
project = rf.workspace("your-workspace").create_project(
    project_name="studxchange-indian-food",
    project_license="MIT",
    project_type="object-detection"
)

# Labeling guidelines:
# 1. Draw tight bounding boxes around each dish
# 2. Use consistent naming convention
# 3. Label multiple dishes in single image
# 4. Include partially visible dishes
# 5. Tag difficulty level (easy/medium/hard)
```

### Labeling Guidelines:
1. **Bounding Boxes**: Tight around dish, exclude plate/background
2. **Naming Convention**: Use snake_case (dal_tadka, not "Dal Tadka")
3. **Multiple Items**: Label all visible dishes
4. **Consistency**: Same dish should have same label across all images
5. **Context**: Include serving utensils, accompaniments

---

## 🤖 Training Pipeline

### Step 1: Dataset Preparation
```python
# dataset_preparation.py
import os
from roboflow import Roboflow

# Download dataset from Roboflow
rf = Roboflow(api_key="your_key")
project = rf.workspace("workspace").project("studxchange-indian-food")
dataset = project.version(1).download("yolov8")

# Verify dataset structure
print(f"Training images: {len(os.listdir('train/images'))}")
print(f"Validation images: {len(os.listdir('valid/images'))}")
print(f"Test images: {len(os.listdir('test/images'))}")
```

### Step 2: Model Training
```python
# train_studxchange_model.py
from ultralytics import YOLO

# Start with pre-trained model
model = YOLO('yolov8n.pt')  # Nano for speed, or 'yolov8s.pt' for accuracy

# Training configuration for Indian food
results = model.train(
    data='dataset.yaml',
    epochs=300,
    imgsz=640,
    batch=16,
    device='0',  # GPU if available
    
    # Food-specific hyperparameters
    lr0=0.01,          # Learning rate
    momentum=0.937,
    weight_decay=0.0005,
    warmup_epochs=3,
    
    # Loss function weights
    box=0.05,          # Box loss gain
    cls=0.5,           # Class loss gain
    dfl=1.5,           # DFL loss gain
    
    # Data augmentation
    hsv_h=0.015,       # Hue augmentation
    hsv_s=0.7,         # Saturation augmentation  
    hsv_v=0.4,         # Value augmentation
    degrees=0.5,       # Rotation range
    translate=0.1,     # Translation fraction
    scale=0.5,         # Scaling gain
    fliplr=0.5,        # Horizontal flip probability
    mosaic=1.0,        # Mosaic augmentation
    mixup=0.0,         # MixUp augmentation
    
    # Validation
    val=True,
    save=True,
    plots=True,
    patience=50,       # Early stopping patience
)

print(f"Training completed! Best model: {results.save_dir}/weights/best.pt")
```

### Step 3: Model Evaluation
```python
# evaluate_model.py
from ultralytics import YOLO

# Load trained model
model = YOLO('path/to/best.pt')

# Evaluate on test set
results = model.val(data='dataset.yaml', split='test')

print(f"mAP@0.5: {results.box.map50}")
print(f"mAP@0.5:0.95: {results.box.map}")

# Test on sample images
test_results = model.predict('test_images/', save=True, conf=0.5)
```

---

## 🚀 Free Training Platforms

### Google Colab (Recommended)
```python
# colab_training.ipynb
!pip install ultralytics roboflow

# Mount Google Drive
from google.colab import drive
drive.mount('/content/drive')

# Run training
!python train_studxchange_model.py

# Download trained model
from google.colab import files
files.download('runs/detect/train/weights/best.pt')
```

### Kaggle Notebooks
```python
# kaggle_setup.py
import kaggle
from kaggle.api.kaggle_api_extended import KaggleApi

# Upload dataset to Kaggle
# Use free GPU allocation for training
# Download results
```

### Paperspace Gradient (Free Tier)
```bash
# gradient_setup.sh
pip install ultralytics
python train_studxchange_model.py
```

---

## 📊 Expected Training Results

### Accuracy Targets:
- **Basic Model (50 images/dish)**: 80-85% mAP
- **Good Model (100 images/dish)**: 85-90% mAP  
- **Professional Model (200+ images/dish)**: 90-95% mAP

### Training Time:
- **Basic Dataset (2,000 images)**: 2-4 hours
- **Full Dataset (8,000 images)**: 8-12 hours
- **Professional Dataset (15,000+ images)**: 1-2 days

---

## 🔄 Continuous Improvement

### Feedback Loop:
```python
# feedback_collection.py
def collect_feedback(image_id, detected_dishes, user_corrections):
    """Store user corrections for model improvement"""
    feedback_data = {
        'image_id': image_id,
        'ai_prediction': detected_dishes,
        'user_correction': user_corrections,
        'timestamp': datetime.now(),
        'user_id': get_current_user_id()
    }
    
    # Store in database
    supabase.table('ai_feedback').insert(feedback_data).execute()
    
    # Retrain model monthly with feedback data
    if should_retrain():
        trigger_model_retraining()
```

### Active Learning:
1. **Collect edge cases** where AI fails
2. **Prioritize new training data** for difficult dishes
3. **Regular model updates** (monthly/quarterly)
4. **A/B testing** of model versions

---

## 💡 Pro Tips

### Photography Tips:
1. **Consistent lighting**: Use natural light when possible
2. **Multiple angles**: Top-down view is most important
3. **Clean backgrounds**: Avoid distracting elements
4. **Varied presentations**: Different plates, portions, garnishes
5. **Real-world conditions**: Include messy/realistic presentations

### Labeling Tips:
1. **Start simple**: Begin with most common dishes
2. **Quality over quantity**: Better to have fewer high-quality labels
3. **Regular breaks**: Avoid labeling fatigue
4. **Team effort**: Involve multiple people for consistency
5. **Validation**: Double-check random samples

### Training Tips:
1. **Start small**: Train on subset first to validate pipeline
2. **Monitor overfitting**: Use validation loss to guide training
3. **Experiment with hyperparameters**: Learning rate is most important
4. **Save checkpoints**: Regular model saves during training
5. **Document everything**: Keep detailed training logs

---

## 📈 Success Metrics

### Technical Metrics:
- **mAP@0.5**: >85% for production use
- **Inference Speed**: <2 seconds per image
- **Model Size**: <50MB for mobile deployment
- **False Positive Rate**: <10%

### Business Metrics:
- **User Adoption**: >80% of mess owners use AI feature
- **Time Savings**: 80% reduction in menu creation time
- **Accuracy Satisfaction**: >90% user approval of AI suggestions
- **Error Rate**: <5% completely wrong identifications

---

This comprehensive training approach will give you a world-class Indian food recognition system specifically tailored for your StudXchange platform! 🚀