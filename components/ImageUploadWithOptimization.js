'use client';

import { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload, faImage, faTrash, faSpinner, faCheck, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { optimizeImage, validateImage, formatFileSize, batchOptimizeImages } from '@/lib/imageOptimization';

export default function ImageUploadWithOptimization({
    onImagesOptimized,
    onImagesChange,
    maxImages = 5,
    maxSizeInMB = 10,
    showPreview = true,
    allowMultiple = true,
    optimizationOptions = {},
    existingImages = [] // Add support for existing images
}) {
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [optimizedFiles, setOptimizedFiles] = useState([]);
    const [previews, setPreviews] = useState([]);
    const [existingPreviews, setExistingPreviews] = useState([]);
    const [isOptimizing, setIsOptimizing] = useState(false);
    const [optimizationResults, setOptimizationResults] = useState([]);
    const [errors, setErrors] = useState([]);
    const fileInputRef = useRef(null);

    const defaultOptimizationOptions = {
        maxWidth: 1200,
        maxHeight: 800,
        quality: 0.8,
        outputFormat: 'jpeg',
        maxSizeInMB,
        ...optimizationOptions
    };

    // Handle existing images
    useEffect(() => {
        if (existingImages && existingImages.length > 0) {
            const existingPreviews = existingImages.map((url, index) => ({
                id: `existing-${index}`,
                url,
                isExisting: true
            }));
            setExistingPreviews(existingPreviews);
            
            // Notify parent about existing images
            if (onImagesChange) {
                onImagesChange(existingImages);
            }
        }
    }, [existingImages, onImagesChange]);

    const handleFileSelect = async (event) => {
        const files = Array.from(event.target.files);
        
        if (!allowMultiple && files.length > 1) {
            setErrors(['Please select only one image']);
            return;
        }

        if (selectedFiles.length + files.length + existingPreviews.length > maxImages) {
            setErrors([`Maximum ${maxImages} images allowed (including existing images)`]);
            return;
        }

        setErrors([]);
        setIsOptimizing(true);

        try {
            // Validate files
            const validationResults = files.map(file => ({
                file,
                validation: validateImage(file, defaultOptimizationOptions)
            }));

            const invalidFiles = validationResults.filter(result => !result.validation.isValid);
            if (invalidFiles.length > 0) {
                const errorMessages = invalidFiles.map(result => 
                    `${result.file.name}: ${result.validation.errors.join(', ')}`
                );
                setErrors(errorMessages);
                setIsOptimizing(false);
                return;
            }

            // Create previews
            const newPreviews = await Promise.all(
                files.map(file => createPreview(file))
            );

            // Optimize images
            const optimizationResults = await batchOptimizeImages(files, defaultOptimizationOptions);
            const successful = optimizationResults.filter(result => result.success);
            const failed = optimizationResults.filter(result => !result.success);

            if (failed.length > 0) {
                const failedMessages = failed.map(result => 
                    `${result.original.name}: ${result.error}`
                );
                setErrors(failedMessages);
            }

            // Update state
            setSelectedFiles(prev => [...prev, ...files]);
            setOptimizedFiles(prev => [...prev, ...successful.map(r => r.optimized)]);
            setPreviews(prev => [...prev, ...newPreviews]);
            setOptimizationResults(prev => [...prev, ...optimizationResults]);

            // Notify parent components
            const allOptimizedFiles = [...optimizedFiles, ...successful.map(r => r.optimized)];
            const allImages = [...existingImages, ...allOptimizedFiles];
            if (onImagesOptimized) {
                onImagesOptimized(allOptimizedFiles);
            }
            if (onImagesChange) {
                onImagesChange(allImages);
            }

        } catch (error) {
            setErrors([`Optimization failed: ${error.message}`]);
        } finally {
            setIsOptimizing(false);
        }
    };

    const createPreview = (file) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve({
                id: Date.now() + Math.random(),
                file,
                url: e.target.result
            });
            reader.readAsDataURL(file);
        });
    };

    const removeExistingImage = (index) => {
        const newExistingPreviews = existingPreviews.filter((_, i) => i !== index);
        setExistingPreviews(newExistingPreviews);

        const newExistingImages = newExistingPreviews.map(preview => preview.url);
        const allImages = [...newExistingImages, ...optimizedFiles];
        
        if (onImagesChange) {
            onImagesChange(allImages);
        }
    };

    const removeImage = (index) => {
        const newSelectedFiles = selectedFiles.filter((_, i) => i !== index);
        const newOptimizedFiles = optimizedFiles.filter((_, i) => i !== index);
        const newPreviews = previews.filter((_, i) => i !== index);
        const newResults = optimizationResults.filter((_, i) => i !== index);

        setSelectedFiles(newSelectedFiles);
        setOptimizedFiles(newOptimizedFiles);
        setPreviews(newPreviews);
        setOptimizationResults(newResults);

        const existingImages = existingPreviews.map(preview => preview.url);
        const allImages = [...existingImages, ...newOptimizedFiles];

        if (onImagesOptimized) {
            onImagesOptimized(newOptimizedFiles);
        }
        if (onImagesChange) {
            onImagesChange(allImages);
        }
    };

    const clearAll = () => {
        setSelectedFiles([]);
        setOptimizedFiles([]);
        setPreviews([]);
        setExistingPreviews([]);
        setOptimizationResults([]);
        setErrors([]);
        
        if (onImagesOptimized) {
            onImagesOptimized([]);
        }
        if (onImagesChange) {
            onImagesChange([]);
        }
    };

    return (
        <div className="space-y-4">
            {/* Upload Area */}
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-primary-400 transition-colors">
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple={allowMultiple}
                    onChange={handleFileSelect}
                    className="hidden"
                />
                
                <div className="space-y-4">
                    <div className="mx-auto w-12 h-12 text-gray-400">
                        <FontAwesomeIcon icon={faUpload} className="w-full h-full" />
                    </div>
                    
                    <div>
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isOptimizing || selectedFiles.length >= maxImages}
                            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isOptimizing ? (
                                <>
                                    <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
                                    Optimizing...
                                </>
                            ) : (
                                <>
                                    <FontAwesomeIcon icon={faImage} className="mr-2" />
                                    Select Images
                                </>
                            )}
                        </button>
                        
                        <p className="text-sm text-gray-500 mt-2">
                            {allowMultiple ? `Choose up to ${maxImages} images` : 'Choose one image'} 
                            {' '}(Max {maxSizeInMB}MB each)
                        </p>
                        <p className="text-xs text-gray-400">
                            Images will be automatically optimized for web
                        </p>
                    </div>
                </div>
            </div>

            {/* Error Messages */}
            {errors.length > 0 && (
                <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <div className="flex items-start">
                        <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-500 mr-2 mt-0.5" />
                        <div>
                            <h4 className="text-sm font-medium text-red-800 dark:text-red-200">
                                Upload Errors
                            </h4>
                            <ul className="mt-1 text-sm text-red-700 dark:text-red-300 list-disc list-inside">
                                {errors.map((error, index) => (
                                    <li key={index}>{error}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            {/* Optimization Results Summary */}
            {optimizationResults.length > 0 && (
                <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <div className="flex items-center">
                        <FontAwesomeIcon icon={faCheck} className="text-green-500 mr-2" />
                        <div>
                            <h4 className="text-sm font-medium text-green-800 dark:text-green-200">
                                Optimization Complete
                            </h4>
                            <p className="text-sm text-green-700 dark:text-green-300">
                                {optimizationResults.length} image(s) optimized successfully
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Image Previews */}
            {showPreview && (existingPreviews.length > 0 || previews.length > 0) && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            Images ({existingPreviews.length + previews.length})
                        </h4>
                        {(existingPreviews.length > 0 || previews.length > 0) && (
                            <button
                                onClick={clearAll}
                                className="text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                            >
                                Clear All
                            </button>
                        )}
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {/* Existing Images */}
                        {existingPreviews.map((preview, index) => (
                            <div key={preview.id} className="relative group">
                                <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                                    <img
                                        src={preview.url}
                                        alt={`Existing ${index + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                    
                                    {/* Existing image badge */}
                                    <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                                        Existing
                                    </div>
                                    
                                    {/* Remove button */}
                                    <button
                                        onClick={() => removeExistingImage(index)}
                                        className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                    >
                                        <FontAwesomeIcon icon={faTrash} className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                        ))}
                        
                        {/* New Images */}
                        {previews.map((preview, index) => (
                            <div key={preview.id} className="relative group">
                                <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                                    <img
                                        src={preview.url}
                                        alt={`New ${index + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                    
                                    {/* New image badge */}
                                    <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                                        New
                                    </div>
                                    
                                    {/* Remove button */}
                                    <button
                                        onClick={() => removeImage(index)}
                                        className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                    >
                                        <FontAwesomeIcon icon={faTrash} className="w-3 h-3" />
                                    </button>
                                </div>
                                
                                {/* Optimization info */}
                                {optimizationResults[index] && (
                                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                        <div className="flex justify-between">
                                            <span>Original: {optimizationResults[index].originalSize}</span>
                                            <span>Optimized: {optimizationResults[index].optimizedSize}</span>
                                        </div>
                                        <div className="text-green-600 dark:text-green-400">
                                            Saved: {optimizationResults[index].compressionRatio}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
