'use client';
import { useState, useRef } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
export default function MenuCreator({ mess, onUpdate }) {
  const [image, setImage] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);
  const getCurrentMealType = () => {
    const now = new Date();
    const hour = now.getHours();
    if (hour >= 5 && hour < 11) {
      return 'breakfast';
    } else if (hour >= 11 && hour < 16) {
      return 'lunch';
    } else {
      return 'dinner';
    }
  };
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImage({
          file: file,
          preview: e.target.result,
          name: file.name,
          size: file.size
        });
        setPrediction(null);
      };
      reader.readAsDataURL(file);
    }
  };
  const detectMenuItems = async () => {
    if (!image) return;
    setIsLoading(true);
    setUploadProgress(0);
    try {
      console.log('Uploading image for AI detection');
      const formData = new FormData();
      formData.append('image', image.file);
      setUploadProgress(20);
      const response = await fetch('/api/ai-detection', {
        method: 'POST',
        body: formData,
      });
      setUploadProgress(60);
      if (!response.ok) {
        throw new Error(`Detection failed: ${response.statusText}`);
      }
      const result = await response.json();
      console.log('AI Detection Results:', result);
      setUploadProgress(80);
      console.log('Uploading image to ImgBB...');
      const uploadFormData = new FormData();
      uploadFormData.append('image', image.file);
      const uploadResponse = await fetch('/api/upload-image', {
        method: 'POST',
        body: uploadFormData,
      });
      if (!uploadResponse.ok) {
        throw new Error('Image upload failed');
      }
      const imageResult = await uploadResponse.json();
      console.log('Image uploaded successfully:', imageResult.data.url);
      setUploadProgress(100);
      const enhancedPrediction = {
        ...result,
        imageUrl: imageResult.data.url,
        mealType: getCurrentMealType(),
        detectedAt: new Date().toISOString(),
        confidence: result.confidence || 'medium'
      };
      setPrediction(enhancedPrediction);
    } catch (error) {
      console.error('Detection error:', error);
      alert('Detection failed: ' + error.message);
    } finally {
      setIsLoading(false);
      setUploadProgress(0);
    }
  };
  const saveMenu = async () => {
    if (!prediction || !mess.id) return;
    setIsLoading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const mealType = getCurrentMealType();
      const unifiedMenu = {
        meal_type: mealType,
        dishes: prediction.dishes || [],
        image_url: prediction.imageUrl,
        detected_at: prediction.detectedAt,
        confidence: prediction.confidence,
        detection_method: 'gemini-vision'
      };
      const { data, error } = await supabase
        .from('mess')
        .update({
          current_menu: unifiedMenu,
          menu_meal_type: mealType,
          menu_image_url: prediction.imageUrl,
          last_menu_update: new Date().toISOString()
        })
        .eq('id', mess.id)
        .select();
      if (error) {
        console.error('Database error:', error);
        throw error;
      }
      console.log('Menu saved with new schema:', {
        unified_menu: unifiedMenu,
        meal_type: mealType,
        image_url: prediction.imageUrl
      });
      if (onUpdate) {
        onUpdate({
          ...mess,
          current_menu: unifiedMenu,
          menu_meal_type: mealType,
          menu_image_url: prediction.imageUrl
        });
      }
      alert(`${mealType.charAt(0).toUpperCase() + mealType.slice(1)} menu saved successfully!`);
      setImage(null);
      setPrediction(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save menu: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    React.createElement('div', { className: "bg-white rounded-lg shadow-lg p-6 mb-6" },
      React.createElement('div', { className: "flex items-center justify-between mb-4" },
        React.createElement('h3', { className: "text-xl font-bold text-gray-800" }, "AI Menu Creator"),
        React.createElement('span', { className: "text-sm text-gray-500" },
          "Current: " + getCurrentMealType().charAt(0).toUpperCase() + getCurrentMealType().slice(1)
        )
      ),
      React.createElement('div', { className: "mb-6" },
        React.createElement('label', { className: "block text-sm font-medium text-gray-700 mb-2" },
          "Upload Menu Image"
        ),
        React.createElement('input', {
          ref: fileInputRef,
          type: "file",
          accept: "image/*",
          onChange: handleImageUpload,
          className: "block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        })
      ),
      image && React.createElement('div', { className: "mb-6" },
        React.createElement('h4', { className: "text-sm font-medium text-gray-700 mb-2" }, "Preview:"),
        React.createElement('div', { className: "flex items-center space-x-4" },
          React.createElement('img', {
            src: image.preview,
            alt: "Menu preview",
            className: "w-32 h-32 object-cover rounded-lg border"
          }),
          React.createElement('div', { className: "flex-1" },
            React.createElement('p', { className: "text-sm text-gray-600" }, "Name: " + image.name),
            React.createElement('p', { className: "text-sm text-gray-600" }, "Size: " + (image.size / 1024 / 1024).toFixed(2) + " MB"),
            React.createElement('button', {
              onClick: detectMenuItems,
              disabled: isLoading,
              className: "mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            }, isLoading ? 'Detecting...' : 'Detect Menu Items')
          )
        )
      ),
      isLoading && React.createElement('div', { className: "mb-6" },
        React.createElement('div', { className: "flex justify-between text-sm text-gray-600 mb-1" },
          React.createElement('span', null, "Processing..."),
          React.createElement('span', null, uploadProgress + "%")
        ),
        React.createElement('div', { className: "w-full bg-gray-200 rounded-full h-2" },
          React.createElement('div', {
            className: "bg-blue-600 h-2 rounded-full transition-all duration-500",
            style: { width: uploadProgress + "%" }
          })
        )
      ),
      prediction && React.createElement('div', { className: "mb-6 p-4 border border-gray-200 rounded-lg" },
        React.createElement('h4', { className: "text-lg font-medium text-gray-800 mb-3" },
          "Detected Items (" + prediction.mealType + "):"
        ),
        prediction.dishes && prediction.dishes.length > 0 ?
          React.createElement('div', { className: "space-y-2 mb-4" },
            prediction.dishes.map((dish, index) =>
              React.createElement('div', { key: index, className: "flex items-center justify-between p-2 bg-gray-50 rounded" },
                React.createElement('span', { className: "font-medium" }, dish.name || dish),
                dish.confidence && React.createElement('span', { className: "text-sm text-gray-500" },
                  Math.round(dish.confidence * 100) + "% confidence"
                )
              )
            )
          ) :
          React.createElement('p', { className: "text-gray-600 mb-4" }, "No specific items detected, but image processed successfully."),
        React.createElement('div', { className: "flex items-center justify-between" },
          React.createElement('div', { className: "text-sm text-gray-600" },
            React.createElement('p', null, "Confidence: " + prediction.confidence),
            React.createElement('p', null, "Detection Method: " + (prediction.detection_method || 'Gemini Vision'))
          ),
          React.createElement('button', {
            onClick: saveMenu,
            disabled: isLoading,
            className: "bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          }, isLoading ? 'Saving...' : `Save ${prediction.mealType} Menu`)
        )
      ),
      mess.current_menu && React.createElement('div', { className: "mt-6 p-4 bg-blue-50 rounded-lg" },
        React.createElement('h4', { className: "text-lg font-medium text-blue-800 mb-2" },
          "Current Menu (" + (mess.menu_meal_type || 'Unknown') + "):"
        ),
        mess.current_menu.dishes && mess.current_menu.dishes.length > 0 ?
          React.createElement('div', { className: "grid grid-cols-2 gap-2 mb-3" },
            mess.current_menu.dishes.map((dish, index) =>
              React.createElement('span', { key: index, className: "text-sm bg-white px-2 py-1 rounded text-blue-700" },
                dish.name || dish
              )
            )
          ) :
          React.createElement('p', { className: "text-blue-600 mb-3" }, "No dishes listed"),
        mess.current_menu.image_url && React.createElement('img', {
          src: mess.current_menu.image_url,
          alt: "Current menu",
          className: "w-24 h-24 object-cover rounded-lg border"
        }),
        React.createElement('p', { className: "text-xs text-blue-600 mt-2" },
          "Last updated: " + (mess.last_menu_update ? new Date(mess.last_menu_update).toLocaleString() : 'Unknown')
        )
      )
    )
  );
}
