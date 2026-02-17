// Food Recognition Demo Component
// File: components/FoodRecognitionDemo.jsx

'use client';

import React, { useState, useRef } from 'react';
import { useFoodRecognition } from '../hooks/useFoodRecognition';

const FoodRecognitionDemo = () => {
    const [selectedImage, setSelectedImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const fileInputRef = useRef(null);
    
    const { recognizeFood, loading, result, error, clearResult } = useFoodRecognition();

    const handleImageSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedImage(file);
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
            clearResult();
        }
    };

    const handleRecognize = async () => {
        if (!selectedImage) return;
        
        try {
            await recognizeFood(selectedImage);
        } catch (err) {
            console.error('Recognition failed:', err);
        }
    };

    const renderResults = () => {
        if (!result) return null;

        return (
            <div className="mt-6 p-4 border rounded-lg bg-gray-50">
                <h3 className="text-lg font-semibold mb-4">Recognition Results</h3>
                
                {result.recognition_type === 'high_confidence' && (
                    <div className="mb-4">
                        <span className="inline-block px-3 py-1 text-sm bg-green-100 text-green-800 rounded-full">
                            High Confidence
                        </span>
                    </div>
                )}

                {result.recognition_type === 'medium_confidence' && (
                    <div className="mb-4">
                        <span className="inline-block px-3 py-1 text-sm bg-yellow-100 text-yellow-800 rounded-full">
                            Medium Confidence - Please Verify
                        </span>
                    </div>
                )}

                {result.recognition_type === 'low_confidence' && (
                    <div className="mb-4">
                        <span className="inline-block px-3 py-1 text-sm bg-red-100 text-red-800 rounded-full">
                            Low Confidence
                        </span>
                        <p className="mt-2 text-sm text-gray-600">{result.message}</p>
                        {result.suggestions && (
                            <div className="mt-2">
                                <p className="text-sm font-medium">Suggestions:</p>
                                <ul className="list-disc list-inside text-sm text-gray-600">
                                    {result.suggestions.map((suggestion, index) => (
                                        <li key={index}>{suggestion}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}

                {result.predictions && result.predictions.length > 0 && (
                    <div className="space-y-4">
                        {result.predictions.map((prediction, index) => (
                            <div key={index} className="p-4 border rounded-lg bg-white">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="text-lg font-medium text-gray-900">
                                        {prediction.dish_name}
                                    </h4>
                                    <span className="text-sm font-semibold text-blue-600">
                                        {prediction.confidence}% confident
                                    </span>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="font-medium">Category:</span> {prediction.category}
                                    </div>
                                    <div>
                                        <span className="font-medium">Dietary:</span> {prediction.dietary}
                                    </div>
                                    <div>
                                        <span className="font-medium">Region:</span> {prediction.region}
                                    </div>
                                </div>
                                
                                {prediction.ingredients && prediction.ingredients.length > 0 && (
                                    <div className="mt-2">
                                        <span className="font-medium text-sm">Ingredients:</span>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {prediction.ingredients.map((ingredient, idx) => (
                                                <span 
                                                    key={idx}
                                                    className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded"
                                                >
                                                    {ingredient}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                
                                {prediction.description && (
                                    <p className="mt-2 text-sm text-gray-600">
                                        {prediction.description}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {result.notes && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-800">
                            <span className="font-medium">Notes:</span> {result.notes}
                        </p>
                    </div>
                )}

                {result.fallback_suggestions && result.fallback_suggestions.length > 0 && (
                    <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                        <p className="text-sm font-medium text-yellow-800 mb-2">
                            Alternative suggestions:
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {result.fallback_suggestions.map((suggestion, index) => (
                                <span 
                                    key={index}
                                    className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded"
                                >
                                    {suggestion}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="max-w-2xl mx-auto p-6">
            <h2 className="text-2xl font-bold text-center mb-6">
                🍛 AI Food Recognition Demo
            </h2>
            
            {/* Image Upload */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageSelect}
                    accept="image/*"
                    className="hidden"
                />
                
                {previewUrl ? (
                    <div className="space-y-4">
                        <img 
                            src={previewUrl} 
                            alt="Selected food" 
                            className="max-h-64 mx-auto rounded-lg"
                        />
                        <div className="space-x-3">
                            <button
                                onClick={handleRecognize}
                                disabled={loading}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                            >
                                {loading ? 'Analyzing...' : 'Recognize Food'}
                            </button>
                            <button
                                onClick={() => {
                                    setSelectedImage(null);
                                    setPreviewUrl(null);
                                    clearResult();
                                }}
                                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                            >
                                Clear
                            </button>
                        </div>
                    </div>
                ) : (
                    <div>
                        <p className="mb-4">Upload an image of Indian food to test recognition</p>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                        >
                            Choose Image
                        </button>
                    </div>
                )}
            </div>

            {/* Loading State */}
            {loading && (
                <div className="text-center mt-6">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="mt-2 text-gray-600">Analyzing food image...</p>
                </div>
            )}

            {/* Error State */}
            {error && (
                <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-800">Error: {error}</p>
                </div>
            )}

            {/* Results */}
            {renderResults()}
        </div>
    );
};

export default FoodRecognitionDemo;