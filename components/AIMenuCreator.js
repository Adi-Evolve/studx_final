'use client';

import { useState, useRef, useEffect } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

export default function AIMenuCreator({ mess, onUpdate }) {
  const [image, setImage] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  const getCurrentMealType = () => {
    const now = new Date();
    const hour = now.getHours();
    if (hour >= 5 && hour < 11) return 'breakfast';
    if (hour >= 11 && hour < 16) return 'lunch';
    return 'dinner';
  };

  // Camera functions
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' } // Use back camera on mobile
      });
      setStream(mediaStream);
      setShowCamera(true);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      alert('Camera access denied or not available: ' + error.message);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0);
      
      // Convert canvas to blob
      canvas.toBlob((blob) => {
        const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
        const reader = new FileReader();
        reader.onload = (e) => {
          setImage({ file, preview: e.target.result, name: file.name, size: file.size });
          setPrediction(null);
          stopCamera();
          // Auto-detect after capture
          setTimeout(() => {
            detectMenuItems(file);
          }, 100);
        };
        reader.readAsDataURL(file);
      }, 'image/jpeg', 0.8);
    }
  };

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImage({ file, preview: e.target.result, name: file.name, size: file.size });
        setPrediction(null);
      };
      reader.readAsDataURL(file);
      
      // Automatically start detection after image is loaded
      setTimeout(() => {
        detectMenuItems(file);
      }, 100);
    }
  };

  const detectMenuItems = async (file = null) => {
    const imageFile = file || image?.file;
    if (!imageFile) return;
    
    setIsLoading(true);
    setUploadProgress('🔍 Analyzing menu image...');
    
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      
      setUploadProgress('🤖 Smart detection in progress...');
      const response = await fetch('/api/ai-detection', { method: 'POST', body: formData });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('AI Detection failed:', response.status, errorText);
        throw new Error(`Detection failed: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('✅ AI Detection result:', result);
      
      // Show success message based on detection method
      if (result.detection_method === 'pattern_based') {
        setUploadProgress('✅ Menu items detected using smart pattern analysis!');
      } else if (result.detection_method === 'fallback') {
        setUploadProgress('📋 Showing sample menu items - you can edit these!');
      } else {
        setUploadProgress('✅ Menu analysis complete!');
      }
      
      setUploadProgress('📤 Uploading image...');
      const uploadFormData = new FormData();
      uploadFormData.append('image', imageFile);
      
      console.log('📤 Attempting to upload image...');
      const uploadResponse = await fetch('/api/upload-image', { method: 'POST', body: uploadFormData });
      
      if (!uploadResponse.ok) {
        const uploadError = await uploadResponse.json();
        console.error('❌ Image upload failed:', uploadError);
        
        // Check if it's an API key issue
        if (uploadError.error && uploadError.error.includes('API key')) {
          alert('⚠️ Image upload is not configured. Please add IMGBB_API_KEY to your environment variables.\n\nYou can still use the detected menu items without uploading the image.');
          
          // Use detected items without image URL
          const enhancedPrediction = {
            ...result,
            imageUrl: null,
            mealType: getCurrentMealType(),
            detectedAt: new Date().toISOString(),
            confidence: result.confidence || 'medium',
            uploadSkipped: true
          };
          setPrediction(enhancedPrediction);
          setUploadProgress('⚠️ Detection completed (image upload skipped)');
          setIsLoading(false);
          return;
        }
        
        throw new Error(`Upload failed: ${uploadResponse.status} - ${uploadError.error || 'Unknown error'}`);
      }
      
      const imageResult = await uploadResponse.json();
      console.log('✅ Image uploaded:', imageResult);
      
      const enhancedPrediction = {
        ...result,
        imageUrl: imageResult.data.url,
        mealType: getCurrentMealType(),
        detectedAt: new Date().toISOString(),
        confidence: result.confidence || 'medium'
      };
      setPrediction(enhancedPrediction);
      setUploadProgress('✅ Detection completed!');
      
      // Clear progress message after 2 seconds
      setTimeout(() => setUploadProgress(''), 2000);
      
    } catch (error) {
      console.error('Detection error:', error);
      setUploadProgress('❌ Detection failed');
      alert('Error: ' + error.message);
      
      // Clear error message after 3 seconds
      setTimeout(() => setUploadProgress(''), 3000);
    } finally {
      setIsLoading(false);
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
      const { error } = await supabase
        .from('mess')
        .update({
          current_menu: unifiedMenu,
          menu_meal_type: mealType,
          menu_image_url: prediction.imageUrl,
          last_menu_update: new Date().toISOString()
        })
        .eq('id', mess.id);
      if (error) throw error;
      if (onUpdate) {
        onUpdate({ ...mess, current_menu: unifiedMenu, menu_meal_type: mealType, menu_image_url: prediction.imageUrl });
      }
      alert('Menu saved successfully!');
      setImage(null);
      setPrediction(null);
    } catch (error) {
      alert('Save error: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-800 rounded-xl shadow-lg p-6 mb-6 border border-blue-200 dark:border-gray-600">
      <div className="flex items-center mb-4">
        <span className="text-2xl mr-3">🤖</span>
        <h3 className="text-xl font-bold text-blue-600 dark:text-blue-400">AI Menu Detection</h3>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          📸 Upload Menu Image or Take Photo
        </label>
        
        <div className="flex gap-3 mb-3">
          <input 
            ref={fileInputRef}
            type="file" 
            accept="image/*" 
            onChange={handleImageUpload} 
            className="flex-1 text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-gray-600 dark:file:text-gray-200 cursor-pointer"
            disabled={isLoading}
          />
          
          <button
            onClick={startCamera}
            disabled={isLoading || showCamera}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <span>📱</span>
            Camera
          </button>
        </div>
      </div>
      
      {/* Camera Interface */}
      {showCamera && (
        <div className="mb-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200">📷 Camera</h4>
            <button
              onClick={stopCamera}
              className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm"
            >
              ✕ Close
            </button>
          </div>
          
          <div className="relative">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-64 bg-black rounded-lg object-cover"
            />
            
            <button
              onClick={capturePhoto}
              className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-16 h-16 bg-white hover:bg-gray-100 rounded-full shadow-lg border-4 border-blue-500 flex items-center justify-center text-2xl transition-all"
            >
              📸
            </button>
          </div>
          
          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>
      )}
      
      {uploadProgress && (
        <div className="mb-4 p-3 bg-blue-100 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200 font-medium">{uploadProgress}</p>
        </div>
      )}
      
      {isLoading && (
        <div className="mb-4 flex items-center justify-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-blue-600 dark:text-blue-400 font-medium">Processing image...</span>
        </div>
      )}
      
      {image && (
        <div className="mb-4">
          <div className="flex items-center mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">📷 Preview:</span>
          </div>
          <img 
            src={image.preview} 
            alt="Menu preview" 
            className="w-32 h-32 object-cover rounded-lg border-2 border-gray-200 dark:border-gray-600 shadow-md" 
          />
        </div>
      )}
      {prediction && (
        <div className="mb-4 p-4 border rounded">
          <h4 className="font-bold mb-2">Detected Items:</h4>
          {prediction.dishes?.map((dish, i) => (
            <div key={i} className="p-2 bg-gray-50 rounded mb-1">{dish.name || dish}</div>
          ))}
          <button onClick={saveMenu} disabled={isLoading} className="bg-green-600 text-white px-4 py-2 rounded mt-2">
            Save Menu
          </button>
        </div>
      )}
    </div>
  );
}
