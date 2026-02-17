# 📸 Dataset Collection Tools - StudXchange Indian Food Detection
## Automated Image Collection and Labeling Utilities

import os
import cv2
import numpy as np
import requests
import json
import time
import hashlib
from datetime import datetime
from pathlib import Path
import urllib.parse
from PIL import Image, ImageDraw, ImageFont
import roboflow

class ImageCollector:
    """Automated image collection for Indian food dataset"""
    
    def __init__(self, project_config):
        self.config = project_config
        self.collected_images = []
        self.duplicates_found = 0
        
    def setup_directories(self):
        """Create organized directory structure for collection"""
        base_dir = Path("data/raw_collection")
        
        directories = [
            "breakfast", "lunch", "dinner", "snacks", "beverages",
            "verified", "needs_review", "rejected", "duplicates"
        ]
        
        for dir_name in directories:
            (base_dir / dir_name).mkdir(parents=True, exist_ok=True)
        
        print(f"📁 Created collection directories in {base_dir}")
        return base_dir
    
    def collect_from_camera(self, dish_name, target_count=20):
        """Collect images using webcam with guided capture"""
        print(f"📷 Starting camera collection for: {dish_name}")
        print("Instructions:")
        print("- Press SPACE to capture image")
        print("- Press 'q' to quit")
        print("- Press 'r' to reject last image")
        print("- Try different angles, lighting, portions")
        
        cap = cv2.VideoCapture(0)
        captured_count = 0
        session_images = []
        
        # Create session directory
        session_dir = Path(f"data/raw_collection/{dish_name}_session_{int(time.time())}")
        session_dir.mkdir(exist_ok=True)
        
        while captured_count < target_count:
            ret, frame = cap.read()
            if not ret:
                break
            
            # Add overlay with instructions
            overlay = frame.copy()
            cv2.putText(overlay, f"Dish: {dish_name}", (10, 30), 
                       cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
            cv2.putText(overlay, f"Captured: {captured_count}/{target_count}", (10, 70), 
                       cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
            cv2.putText(overlay, "SPACE: Capture | Q: Quit | R: Reject last", (10, 110), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
            
            cv2.imshow('Food Collection', overlay)
            
            key = cv2.waitKey(1) & 0xFF
            
            if key == ord(' '):  # Space to capture
                # Check image quality
                if self.validate_image_quality(frame):
                    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S_%f")
                    filename = f"{dish_name}_{timestamp}.jpg"
                    filepath = session_dir / filename
                    
                    cv2.imwrite(str(filepath), frame)
                    session_images.append(str(filepath))
                    captured_count += 1
                    
                    print(f"✅ Captured: {filename}")
                    
                    # Brief flash effect
                    white_frame = np.ones_like(frame) * 255
                    cv2.imshow('Food Collection', white_frame)
                    cv2.waitKey(100)
                else:
                    print("⚠️  Image quality too low, try again")
            
            elif key == ord('r') and session_images:  # Reject last
                last_image = session_images.pop()
                os.remove(last_image)
                captured_count -= 1
                print(f"🗑️  Rejected: {os.path.basename(last_image)}")
            
            elif key == ord('q'):  # Quit
                break
        
        cap.release()
        cv2.destroyAllWindows()
        
        print(f"📸 Collection session complete: {captured_count} images")
        return session_images
    
    def validate_image_quality(self, image):
        """Basic image quality validation"""
        # Check blur
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        blur_score = cv2.Laplacian(gray, cv2.CV_64F).var()
        
        # Check brightness
        brightness = np.mean(gray)
        
        # Check if image is too dark or bright
        if brightness < 50 or brightness > 200:
            return False
        
        # Check if image is too blurry
        if blur_score < 100:
            return False
        
        return True
    
    def detect_duplicates(self, image_dir):
        """Detect and handle duplicate images"""
        print("🔍 Scanning for duplicate images...")
        
        image_hashes = {}
        duplicates = []
        
        for img_file in Path(image_dir).glob("*.{jpg,jpeg,png}"):
            try:
                # Calculate image hash
                img = cv2.imread(str(img_file))
                img_hash = hashlib.md5(img.tobytes()).hexdigest()
                
                if img_hash in image_hashes:
                    duplicates.append((str(img_file), image_hashes[img_hash]))
                    print(f"🔍 Duplicate found: {img_file.name}")
                else:
                    image_hashes[img_hash] = str(img_file)
                    
            except Exception as e:
                print(f"❌ Error processing {img_file}: {e}")
        
        # Move duplicates
        if duplicates:
            duplicate_dir = Path("data/raw_collection/duplicates")
            duplicate_dir.mkdir(exist_ok=True)
            
            for duplicate_file, original_file in duplicates:
                duplicate_path = Path(duplicate_file)
                new_path = duplicate_dir / duplicate_path.name
                duplicate_path.rename(new_path)
                self.duplicates_found += 1
        
        print(f"🗑️  Moved {len(duplicates)} duplicates")
        return len(duplicates)

class LabelingAssistant:
    """AI-powered labeling assistance and validation"""
    
    def __init__(self):
        self.dish_categories = {
            'breakfast': ['aloo_paratha', 'plain_paratha', 'poha', 'upma', 'idli', 'dosa', 'bread_butter', 'tea'],
            'lunch_dinner': ['dal_tadka', 'dal_fry', 'rajma', 'chole', 'rice', 'roti', 'chapati', 'aloo_sabzi', 'bhindi_sabzi', 'paneer_butter_masala'],
            'sides': ['curd', 'pickle', 'papad', 'raita', 'salad'],
            'beverages': ['tea', 'coffee'],
            'snacks': ['samosa', 'pakora']
        }
        
        # Color ranges for Indian dishes (HSV)
        self.food_colors = {
            'yellow_foods': ([15, 100, 100], [35, 255, 255]),  # Dal, turmeric dishes
            'brown_foods': ([5, 50, 50], [15, 255, 200]),      # Rotis, parathas
            'red_foods': ([0, 100, 100], [10, 255, 255]),      # Tomato-based curries
            'green_foods': ([40, 50, 50], [80, 255, 255]),     # Sabzi, chutneys
            'white_foods': ([0, 0, 180], [180, 30, 255])       # Rice, curd
        }
    
    def suggest_dish_type(self, image_path):
        """Analyze image and suggest likely dish type"""
        img = cv2.imread(image_path)
        hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
        
        color_scores = {}
        total_pixels = img.shape[0] * img.shape[1]
        
        for color_name, (lower, upper) in self.food_colors.items():
            mask = cv2.inRange(hsv, np.array(lower), np.array(upper))
            color_pixels = cv2.countNonZero(mask)
            color_scores[color_name] = color_pixels / total_pixels
        
        # Determine most likely category based on colors
        dominant_color = max(color_scores, key=color_scores.get)
        
        suggestions = {
            'yellow_foods': ['dal_tadka', 'dal_fry', 'turmeric-based dishes'],
            'brown_foods': ['roti', 'chapati', 'paratha', 'bread'],
            'red_foods': ['rajma', 'chole', 'tomato curry'],
            'green_foods': ['sabzi', 'palak dishes', 'green vegetables'],
            'white_foods': ['rice', 'curd', 'raita']
        }
        
        return suggestions.get(dominant_color, ['unknown'])
    
    def auto_suggest_bounding_boxes(self, image_path):
        """Automatically suggest bounding box locations"""
        img = cv2.imread(image_path)
        original_img = img.copy()
        
        # Convert to different color spaces for better detection
        hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        # Create combined mask for food detection
        food_mask = np.zeros(gray.shape, dtype=np.uint8)
        
        for color_name, (lower, upper) in self.food_colors.items():
            color_mask = cv2.inRange(hsv, np.array(lower), np.array(upper))
            food_mask = cv2.bitwise_or(food_mask, color_mask)
        
        # Morphological operations to clean up mask
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
        food_mask = cv2.morphologyEx(food_mask, cv2.MORPH_CLOSE, kernel)
        food_mask = cv2.morphologyEx(food_mask, cv2.MORPH_OPEN, kernel)
        
        # Find contours
        contours, _ = cv2.findContours(food_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        suggested_boxes = []
        min_area = 1000  # Minimum area for a valid dish
        
        for contour in contours:
            area = cv2.contourArea(contour)
            if area > min_area:
                # Get bounding rectangle
                x, y, w, h = cv2.boundingRect(contour)
                
                # Convert to YOLO format (normalized coordinates)
                img_h, img_w = img.shape[:2]
                x_center = (x + w/2) / img_w
                y_center = (y + h/2) / img_h
                width = w / img_w
                height = h / img_h
                
                # Validate reasonable proportions
                if 0.05 < width < 0.8 and 0.05 < height < 0.8:
                    suggested_boxes.append({
                        'bbox': [x_center, y_center, width, height],
                        'confidence': min(area / 10000, 1.0),  # Confidence based on size
                        'visual_coords': [x, y, w, h]  # For visualization
                    })
        
        return suggested_boxes
    
    def create_labeling_preview(self, image_path, suggested_boxes, dish_suggestions):
        """Create preview image with suggested labels"""
        img = cv2.imread(image_path)
        preview = img.copy()
        
        # Draw suggested bounding boxes
        for i, box_info in enumerate(suggested_boxes):
            x, y, w, h = box_info['visual_coords']
            confidence = box_info['confidence']
            
            # Color based on confidence
            color = (0, int(255 * confidence), int(255 * (1 - confidence)))
            
            # Draw rectangle
            cv2.rectangle(preview, (x, y), (x + w, y + h), color, 2)
            
            # Add label
            label = f"Box {i+1} ({confidence:.2f})"
            cv2.putText(preview, label, (x, y - 10), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)
        
        # Add dish suggestions
        y_offset = 30
        cv2.putText(preview, "Suggested dishes:", (10, y_offset), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 255), 2)
        
        for i, dish in enumerate(dish_suggestions[:3]):  # Top 3 suggestions
            y_offset += 30
            cv2.putText(preview, f"{i+1}. {dish}", (10, y_offset), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
        
        # Save preview
        preview_path = image_path.replace('.jpg', '_preview.jpg')
        cv2.imwrite(preview_path, preview)
        
        return preview_path

class DatasetValidator:
    """Comprehensive dataset validation before training"""
    
    def __init__(self, dataset_path):
        self.dataset_path = Path(dataset_path)
        self.essential_dishes = [
            'aloo_paratha', 'plain_paratha', 'poha', 'upma', 'idli', 'dosa', 
            'bread_butter', 'tea', 'dal_tadka', 'dal_fry', 'rajma', 'chole',
            'rice', 'roti', 'chapati', 'aloo_sabzi', 'bhindi_sabzi', 
            'paneer_butter_masala', 'curd', 'pickle', 'coffee', 'samosa', 
            'papad', 'raita', 'salad'
        ]
    
    def validate_dataset_structure(self):
        """Validate YOLO dataset structure"""
        required_dirs = [
            'images/train', 'images/val', 'images/test',
            'labels/train', 'labels/val', 'labels/test'
        ]
        
        structure_valid = True
        missing_dirs = []
        
        for dir_path in required_dirs:
            full_path = self.dataset_path / dir_path
            if not full_path.exists():
                structure_valid = False
                missing_dirs.append(dir_path)
        
        if missing_dirs:
            print(f"❌ Missing directories: {missing_dirs}")
        else:
            print("✅ Dataset structure is valid")
        
        return structure_valid
    
    def count_samples_per_class(self):
        """Count training samples for each dish class"""
        class_counts = {}
        
        train_labels_dir = self.dataset_path / 'labels' / 'train'
        if not train_labels_dir.exists():
            return class_counts
        
        for label_file in train_labels_dir.glob('*.txt'):
            with open(label_file, 'r') as f:
                for line in f:
                    if line.strip():
                        class_id = int(line.strip().split()[0])
                        dish_name = self.essential_dishes[class_id] if class_id < len(self.essential_dishes) else f'class_{class_id}'
                        class_counts[dish_name] = class_counts.get(dish_name, 0) + 1
        
        return class_counts
    
    def generate_collection_plan(self):
        """Generate plan for additional data collection"""
        class_counts = self.count_samples_per_class()
        target_per_class = 100
        
        collection_plan = {}
        total_needed = 0
        
        for dish in self.essential_dishes:
            current_count = class_counts.get(dish, 0)
            needed = max(0, target_per_class - current_count)
            
            if needed > 0:
                collection_plan[dish] = {
                    'current': current_count,
                    'needed': needed,
                    'priority': 'HIGH' if current_count < 20 else 'MEDIUM' if current_count < 50 else 'LOW'
                }
                total_needed += needed
        
        # Save collection plan
        plan_file = self.dataset_path / 'collection_plan.json'
        with open(plan_file, 'w') as f:
            json.dump(collection_plan, f, indent=2)
        
        print(f"📋 Collection plan saved: {plan_file}")
        print(f"📊 Total images needed: {total_needed}")
        
        return collection_plan
    
    def export_collection_checklist(self, collection_plan):
        """Export human-readable collection checklist"""
        checklist_file = self.dataset_path / 'collection_checklist.md'
        
        with open(checklist_file, 'w') as f:
            f.write("# 📸 StudXchange Food Collection Checklist\n\n")
            f.write("## High Priority Dishes (< 20 samples)\n")
            
            high_priority = [dish for dish, info in collection_plan.items() if info['priority'] == 'HIGH']
            for dish in high_priority:
                info = collection_plan[dish]
                f.write(f"- [ ] **{dish}**: {info['current']}/{100} samples (need {info['needed']})\n")
            
            f.write("\n## Medium Priority Dishes (20-50 samples)\n")
            medium_priority = [dish for dish, info in collection_plan.items() if info['priority'] == 'MEDIUM']
            for dish in medium_priority:
                info = collection_plan[dish]
                f.write(f"- [ ] **{dish}**: {info['current']}/{100} samples (need {info['needed']})\n")
            
            f.write("\n## Low Priority Dishes (50+ samples)\n")
            low_priority = [dish for dish, info in collection_plan.items() if info['priority'] == 'LOW']
            for dish in low_priority:
                info = collection_plan[dish]
                f.write(f"- [ ] **{dish}**: {info['current']}/{100} samples (need {info['needed']})\n")
            
            f.write("\n## Collection Tips\n")
            f.write("- 📷 Use natural lighting when possible\n")
            f.write("- 🔄 Vary angles: top-down, 45-degree, side views\n")
            f.write("- 🍽️ Include different portion sizes\n")
            f.write("- 🎨 Vary backgrounds and plates\n")
            f.write("- ✨ Ensure sharp focus and good contrast\n")
        
        print(f"📝 Collection checklist saved: {checklist_file}")

# Main collection workflow
def main_collection_workflow():
    """Main workflow for dataset collection"""
    print("🍛 StudXchange Dataset Collection Workflow")
    print("=" * 50)
    
    # Initialize tools
    collector = ImageCollector({})
    assistant = LabelingAssistant()
    validator = DatasetValidator("data/labeled_dataset")
    
    # Setup directories
    base_dir = collector.setup_directories()
    
    # Menu for collection options
    while True:
        print("\n📋 Collection Options:")
        print("1. 📷 Collect images with camera")
        print("2. 🔍 Process collected images")
        print("3. 🏷️ Get labeling suggestions")
        print("4. ✅ Validate dataset")
        print("5. 📊 Generate collection plan")
        print("6. 🚪 Exit")
        
        choice = input("\nSelect option (1-6): ").strip()
        
        if choice == '1':
            dish_name = input("Enter dish name: ").strip().lower().replace(' ', '_')
            target_count = int(input("Target images (default 20): ") or 20)
            collector.collect_from_camera(dish_name, target_count)
            
        elif choice == '2':
            image_dir = input("Enter image directory path: ").strip()
            if os.path.exists(image_dir):
                collector.detect_duplicates(image_dir)
                print("✅ Image processing complete")
            else:
                print("❌ Directory not found")
                
        elif choice == '3':
            image_path = input("Enter image path for suggestions: ").strip()
            if os.path.exists(image_path):
                suggestions = assistant.suggest_dish_type(image_path)
                boxes = assistant.auto_suggest_bounding_boxes(image_path)
                preview = assistant.create_labeling_preview(image_path, boxes, suggestions)
                
                print(f"💡 Dish suggestions: {suggestions}")
                print(f"📦 Found {len(boxes)} potential bounding boxes")
                print(f"🖼️ Preview saved: {preview}")
            else:
                print("❌ Image not found")
                
        elif choice == '4':
            if validator.validate_dataset_structure():
                class_counts = validator.count_samples_per_class()
                print("\n📊 Current dataset stats:")
                for dish, count in sorted(class_counts.items()):
                    status = "✅" if count >= 50 else "⚠️" if count >= 20 else "❌"
                    print(f"  {status} {dish}: {count} samples")
            
        elif choice == '5':
            collection_plan = validator.generate_collection_plan()
            validator.export_collection_checklist(collection_plan)
            
        elif choice == '6':
            print("👋 Collection workflow complete!")
            break
        
        else:
            print("❌ Invalid option")

if __name__ == "__main__":
    main_collection_workflow()