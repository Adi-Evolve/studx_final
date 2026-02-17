// Enhanced Thali Recognition Hook with Database Integration
// File: hooks/useThaliRecognition.js

import { useState, useCallback } from 'react';

export const useThaliRecognition = () => {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [detectedItems, setDetectedItems] = useState([]);

    const recognizeThali = useCallback(async (imageFile, options = {}) => {
        setLoading(true);
        setError(null);
        setResult(null);
        setDetectedItems([]);

        try {
            // Convert file to base64
            const base64Image = await fileToBase64(imageFile);
            
            const response = await fetch('/api/thali-recognition', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    image: base64Image,
                    detection_mode: options.detection_mode || 'comprehensive'
                })
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Thali recognition failed');
            }

            setResult(data);
            setDetectedItems(data.items || []);
            
            // Auto-save to database if enabled
            if (options.auto_save && data.success) {
                await saveThaliToDatabase(data, options.mess_id);
            }

            return data;

        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const saveThaliToDatabase = useCallback(async (recognitionData, messId) => {
        try {
            const response = await fetch('/api/thali/save', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    mess_id: messId,
                    recognition_data: recognitionData,
                    items: recognitionData.items,
                    thali_analysis: recognitionData.thali_analysis,
                    timestamp: new Date().toISOString()
                })
            });

            if (!response.ok) {
                throw new Error('Failed to save to database');
            }

            const saveResult = await response.json();
            return saveResult;

        } catch (error) {
            console.error('Database save error:', error);
            throw error;
        }
    }, []);

    const updateItemDetails = useCallback((itemId, updates) => {
        setDetectedItems(prev => 
            prev.map(item => 
                item.item_id === itemId 
                    ? { ...item, ...updates, manually_verified: true }
                    : item
            )
        );
    }, []);

    const removeItem = useCallback((itemId) => {
        setDetectedItems(prev => 
            prev.filter(item => item.item_id !== itemId)
        );
    }, []);

    const addManualItem = useCallback((newItem) => {
        const item = {
            item_id: Date.now(), // Temporary ID
            ...newItem,
            manually_added: true,
            confidence: 100
        };
        setDetectedItems(prev => [...prev, item]);
    }, []);

    const getThaliSummary = useCallback(() => {
        if (!result) return null;

        return {
            total_items: detectedItems.length,
            categories: [...new Set(detectedItems.map(item => item.category))],
            estimated_price: detectedItems.reduce((sum, item) => 
                sum + (item.estimated_price?.estimated_min || 0) * item.quantity, 0
            ),
            estimated_calories: detectedItems.reduce((sum, item) => {
                const calorieMap = {
                    'main_dish': 200, 'rice': 150, 'bread': 80, 
                    'dal': 120, 'vegetable': 100, 'sides': 50
                };
                return sum + (calorieMap[item.category] || 100) * item.quantity;
            }, 0),
            dietary_info: {
                vegetarian_items: detectedItems.filter(item => item.dietary === 'vegetarian').length,
                non_vegetarian_items: detectedItems.filter(item => item.dietary === 'non-vegetarian').length,
                is_fully_vegetarian: detectedItems.every(item => item.dietary !== 'non-vegetarian')
            }
        };
    }, [result, detectedItems]);

    return {
        recognizeThali,
        saveThaliToDatabase,
        updateItemDetails,
        removeItem,
        addManualItem,
        getThaliSummary,
        loading,
        result,
        error,
        detectedItems,
        clearResult: () => {
            setResult(null);
            setDetectedItems([]);
            setError(null);
        }
    };
};

// Helper function to convert file to base64
const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
};