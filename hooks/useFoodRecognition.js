// Food Recognition Hook for React Components
// File: hooks/useFoodRecognition.js

import { useState, useCallback } from 'react';

export const useFoodRecognition = () => {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const recognizeFood = useCallback(async (imageFile, options = {}) => {
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            // Convert file to base64
            const base64Image = await fileToBase64(imageFile);
            
            const response = await fetch('/api/food-recognition', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    image: base64Image,
                    confidence_threshold: options.confidence_threshold || 0.6
                })
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Food recognition failed');
            }

            setResult(data);
            return data;

        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const recognizeFromCamera = useCallback(async (canvas, options = {}) => {
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const base64Image = canvas.toDataURL('image/jpeg', 0.8);
            
            const response = await fetch('/api/food-recognition', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    image: base64Image,
                    confidence_threshold: options.confidence_threshold || 0.6
                })
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Food recognition failed');
            }

            setResult(data);
            return data;

        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        recognizeFood,
        recognizeFromCamera,
        loading,
        result,
        error,
        clearResult: () => setResult(null),
        clearError: () => setError(null)
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