// Enhanced Thali Recognition Component with Multi-Item Detection
// File: components/ThaliRecognitionComponent.jsx

'use client';

import React, { useState, useRef, useCallback } from 'react';
import { useThaliRecognition } from '../hooks/useThaliRecognition';

const ThaliRecognitionComponent = ({ messId, userId, onSaveComplete }) => {
    const [selectedImage, setSelectedImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [editingItem, setEditingItem] = useState(null);
    const [showManualAdd, setShowManualAdd] = useState(false);
    const fileInputRef = useRef(null);
    
    const {
        recognizeThali,
        updateItemDetails,
        removeItem,
        addManualItem,
        getThaliSummary,
        loading,
        result,
        error,
        detectedItems,
        clearResult
    } = useThaliRecognition();

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
            await recognizeThali(selectedImage, {
                detection_mode: 'comprehensive',
                auto_save: false // We'll save manually after review
            });
        } catch (err) {
            // console.error('Recognition failed:', err);
        }
    };

    const handleSaveToDatabase = async () => {
        if (!result || !messId) return;

        try {
            const response = await fetch('/api/thali/save', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    mess_id: messId,
                    user_id: userId,
                    recognition_data: result,
                    items: detectedItems,
                    thali_analysis: result.thali_analysis,
                    timestamp: new Date().toISOString()
                })
            });

            const saveResult = await response.json();
            
            if (saveResult.success) {
                onSaveComplete?.(saveResult);
                alert(`Thali saved successfully! ${saveResult.saved_items} items detected.`);
            } else {
                throw new Error(saveResult.message);
            }
        } catch (error) {
            alert(`Save failed: ${error.message}`);
        }
    };

    const handleEditItem = (item) => {
        setEditingItem({ ...item });
    };

    const handleUpdateItem = () => {
        if (editingItem) {
            updateItemDetails(editingItem.item_id, editingItem);
            setEditingItem(null);
        }
    };

    const handleAddManualItem = (newItem) => {
        addManualItem(newItem);
        setShowManualAdd(false);
    };

    const getCategoryColor = (category) => {
        const colors = {
            'main_dish': 'bg-red-100 text-red-800',
            'rice': 'bg-yellow-100 text-yellow-800',
            'bread': 'bg-orange-100 text-orange-800',
            'dal': 'bg-green-100 text-green-800',
            'vegetable': 'bg-emerald-100 text-emerald-800',
            'sides': 'bg-blue-100 text-blue-800',
            'beverage': 'bg-purple-100 text-purple-800',
            'unknown': 'bg-gray-100 text-gray-800'
        };
        return colors[category] || colors.unknown;
    };

    const getConfidenceColor = (confidence) => {
        if (confidence >= 80) return 'text-green-600';
        if (confidence >= 60) return 'text-yellow-600';
        return 'text-red-600';
    };

    const summary = getThaliSummary();

    return (
        <div className="max-w-6xl mx-auto p-6">
            <h2 className="text-3xl font-bold text-center mb-8">
                🍽️ AI Thali Recognition System
            </h2>
            
            {/* Image Upload Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Upload Area */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
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
                                alt="Thali to analyze" 
                                className="w-full max-h-80 object-contain rounded-lg"
                            />
                            <div className="flex space-x-3">
                                <button
                                    onClick={handleRecognize}
                                    disabled={loading}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {loading ? 'Analyzing Thali...' : 'Detect All Items'}
                                </button>
                                <button
                                    onClick={() => {
                                        setSelectedImage(null);
                                        setPreviewUrl(null);
                                        clearResult();
                                    }}
                                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                                >
                                    Clear
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center">
                            <div className="mb-4">
                                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <p className="text-lg mb-4">Upload a thali/combo meal image</p>
                            <p className="text-sm text-gray-500 mb-4">AI will detect all individual dishes</p>
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
                            >
                                Choose Thali Image
                            </button>
                        </div>
                    )}
                </div>

                {/* Summary Panel */}
                {summary && (
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6">
                        <h3 className="text-xl font-semibold mb-4">Thali Summary</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white rounded-lg p-4">
                                <div className="text-2xl font-bold text-blue-600">{summary.total_items}</div>
                                <div className="text-sm text-gray-600">Items Detected</div>
                            </div>
                            <div className="bg-white rounded-lg p-4">
                                <div className="text-2xl font-bold text-green-600">₹{summary.estimated_price}</div>
                                <div className="text-sm text-gray-600">Est. Price</div>
                            </div>
                            <div className="bg-white rounded-lg p-4">
                                <div className="text-2xl font-bold text-orange-600">{summary.estimated_calories}</div>
                                <div className="text-sm text-gray-600">Calories</div>
                            </div>
                            <div className="bg-white rounded-lg p-4">
                                <div className="text-sm">
                                    {summary.dietary_info.is_fully_vegetarian ? 
                                        <span className="text-green-600 font-semibold">🟢 Vegetarian</span> :
                                        <span className="text-red-600 font-semibold">🔴 Mixed</span>
                                    }
                                </div>
                                <div className="text-xs text-gray-600">Dietary Type</div>
                            </div>
                        </div>
                        
                        <div className="mt-4">
                            <div className="text-sm font-medium mb-2">Categories:</div>
                            <div className="flex flex-wrap gap-2">
                                {summary.categories.map(category => (
                                    <span 
                                        key={category}
                                        className={`px-2 py-1 rounded-full text-xs ${getCategoryColor(category)}`}
                                    >
                                        {category.replace('_', ' ')}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Loading State */}
            {loading && (
                <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <p className="mt-4 text-lg">Scanning thali for all food items...</p>
                    <p className="text-sm text-gray-500">This may take 10-15 seconds for comprehensive detection</p>
                </div>
            )}

            {/* Error State */}
            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-800">Error: {error}</p>
                </div>
            )}

            {/* Recognition Results */}
            {result && (
                <div className="space-y-6">
                    {/* Detection Quality */}
                    <div className="bg-white rounded-lg border p-4">
                        <h3 className="text-lg font-semibold mb-4">Detection Results</h3>
                        <div className="grid grid-cols-3 gap-4 mb-4">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-blue-600">{result.total_items_detected}</div>
                                <div className="text-sm text-gray-600">Items Found</div>
                            </div>
                            <div className="text-center">
                                <div className={`text-2xl font-bold ${getConfidenceColor(result.overall_confidence)}`}>
                                    {result.overall_confidence}%
                                </div>
                                <div className="text-sm text-gray-600">Confidence</div>
                            </div>
                            <div className="text-center">
                                <div className="text-sm">
                                    {result.quality_check?.image_clarity === 'good' ? 
                                        <span className="text-green-600">✓ Good Quality</span> :
                                        <span className="text-yellow-600">⚠ Fair Quality</span>
                                    }
                                </div>
                                <div className="text-xs text-gray-600">Image Quality</div>
                            </div>
                        </div>

                        {result.thali_analysis?.meal_completeness && (
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h4 className="font-medium mb-2">Meal Analysis</h4>
                                <div className="text-sm">
                                    <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                                    Completeness Score: {result.thali_analysis.meal_completeness.completeness_score}%
                                </div>
                                <div className="text-sm mt-1">
                                    {result.thali_analysis.meal_completeness.has_protein && <span className="text-green-600 mr-3">✓ Protein</span>}
                                    {result.thali_analysis.meal_completeness.has_carbs && <span className="text-green-600 mr-3">✓ Carbs</span>}
                                    {result.thali_analysis.meal_completeness.has_vegetables && <span className="text-green-600 mr-3">✓ Vegetables</span>}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Individual Items */}
                    <div className="bg-white rounded-lg border">
                        <div className="p-4 border-b flex justify-between items-center">
                            <h3 className="text-lg font-semibold">Detected Items</h3>
                            <button
                                onClick={() => setShowManualAdd(true)}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"
                            >
                                + Add Item
                            </button>
                        </div>
                        
                        <div className="divide-y">
                            {detectedItems.map((item, index) => (
                                <div key={item.item_id || index} className="p-4">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-3 mb-2">
                                                <h4 className="text-lg font-medium">{item.dish_name}</h4>
                                                <span className={`px-2 py-1 rounded-full text-xs ${getCategoryColor(item.category)}`}>
                                                    {item.category.replace('_', ' ')}
                                                </span>
                                                <span className={`text-sm font-medium ${getConfidenceColor(item.confidence)}`}>
                                                    {item.confidence}% confident
                                                </span>
                                            </div>
                                            
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                                <div>
                                                    <span className="font-medium">Quantity:</span> {item.quantity}
                                                </div>
                                                <div>
                                                    <span className="font-medium">Portion:</span> {item.estimated_portion}
                                                </div>
                                                <div>
                                                    <span className="font-medium">Dietary:</span> {item.dietary}
                                                </div>
                                                <div>
                                                    <span className="font-medium">Position:</span> {item.position}
                                                </div>
                                            </div>

                                            {item.estimated_price && (
                                                <div className="mt-2 text-sm">
                                                    <span className="font-medium">Est. Price:</span> 
                                                    ₹{item.estimated_price.estimated_min} - ₹{item.estimated_price.estimated_max}
                                                </div>
                                            )}

                                            {item.tags && item.tags.length > 0 && (
                                                <div className="mt-2">
                                                    <div className="flex flex-wrap gap-1">
                                                        {item.tags.map(tag => (
                                                            <span 
                                                                key={tag}
                                                                className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                                                            >
                                                                {tag}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        
                                        <div className="flex space-x-2 ml-4">
                                            <button
                                                onClick={() => handleEditItem(item)}
                                                className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm hover:bg-blue-200"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => removeItem(item.item_id)}
                                                className="px-3 py-1 bg-red-100 text-red-800 rounded text-sm hover:bg-red-200"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Save Button */}
                    {detectedItems.length > 0 && messId && (
                        <div className="text-center">
                            <button
                                onClick={handleSaveToDatabase}
                                className="px-8 py-3 bg-green-600 text-white rounded-lg text-lg font-semibold hover:bg-green-700"
                            >
                                Save Thali to Database ({detectedItems.length} items)
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Edit Item Modal */}
            {editingItem && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <h3 className="text-lg font-semibold mb-4">Edit Item</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Dish Name</label>
                                <input
                                    type="text"
                                    value={editingItem.dish_name}
                                    onChange={(e) => setEditingItem({...editingItem, dish_name: e.target.value})}
                                    className="w-full px-3 py-2 border rounded-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Quantity</label>
                                <input
                                    type="number"
                                    value={editingItem.quantity}
                                    onChange={(e) => setEditingItem({...editingItem, quantity: parseInt(e.target.value)})}
                                    className="w-full px-3 py-2 border rounded-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Category</label>
                                <select
                                    value={editingItem.category}
                                    onChange={(e) => setEditingItem({...editingItem, category: e.target.value})}
                                    className="w-full px-3 py-2 border rounded-lg"
                                >
                                    <option value="main_dish">Main Dish</option>
                                    <option value="rice">Rice</option>
                                    <option value="bread">Bread</option>
                                    <option value="dal">Dal</option>
                                    <option value="vegetable">Vegetable</option>
                                    <option value="sides">Sides</option>
                                    <option value="beverage">Beverage</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex space-x-3 mt-6">
                            <button
                                onClick={handleUpdateItem}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                Update
                            </button>
                            <button
                                onClick={() => setEditingItem(null)}
                                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Manual Add Modal */}
            {showManualAdd && (
                <ManualAddItemModal
                    onAdd={handleAddManualItem}
                    onClose={() => setShowManualAdd(false)}
                />
            )}
        </div>
    );
};

// Manual Add Item Modal Component
const ManualAddItemModal = ({ onAdd, onClose }) => {
    const [newItem, setNewItem] = useState({
        dish_name: '',
        category: 'main_dish',
        quantity: 1,
        dietary: 'vegetarian',
        estimated_portion: 'medium'
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (newItem.dish_name.trim()) {
            onAdd(newItem);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
                <h3 className="text-lg font-semibold mb-4">Add Manual Item</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Dish Name *</label>
                        <input
                            type="text"
                            value={newItem.dish_name}
                            onChange={(e) => setNewItem({...newItem, dish_name: e.target.value})}
                            className="w-full px-3 py-2 border rounded-lg"
                            placeholder="Enter dish name"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Category</label>
                        <select
                            value={newItem.category}
                            onChange={(e) => setNewItem({...newItem, category: e.target.value})}
                            className="w-full px-3 py-2 border rounded-lg"
                        >
                            <option value="main_dish">Main Dish</option>
                            <option value="rice">Rice</option>
                            <option value="bread">Bread</option>
                            <option value="dal">Dal</option>
                            <option value="vegetable">Vegetable</option>
                            <option value="sides">Sides</option>
                            <option value="beverage">Beverage</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Quantity</label>
                        <input
                            type="number"
                            value={newItem.quantity}
                            onChange={(e) => setNewItem({...newItem, quantity: parseInt(e.target.value)})}
                            className="w-full px-3 py-2 border rounded-lg"
                            min="1"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Dietary</label>
                        <select
                            value={newItem.dietary}
                            onChange={(e) => setNewItem({...newItem, dietary: e.target.value})}
                            className="w-full px-3 py-2 border rounded-lg"
                        >
                            <option value="vegetarian">Vegetarian</option>
                            <option value="non-vegetarian">Non-Vegetarian</option>
                            <option value="vegan">Vegan</option>
                        </select>
                    </div>
                    <div className="flex space-x-3 mt-6">
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                        >
                            Add Item
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ThaliRecognitionComponent;