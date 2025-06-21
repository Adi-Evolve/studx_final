'use client';

import { useState, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faImage, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
// // import toast from 'react-hot-toast';

export default function ImageUpload({ onFilesChange, maxFiles = 5 }) {
    const [files, setFiles] = useState([]);
    const [previews, setPreviews] = useState([]);
    const fileInputRef = useRef(null);

    const handleFileChange = (event) => {
        const selectedFiles = Array.from(event.target.files);
        if (files.length + selectedFiles.length > maxFiles) {
            // // toast.error(`You can only upload a maximum of ${maxFiles} images.`);
            return;
        }

        const newFiles = [...files, ...selectedFiles];
        setFiles(newFiles);
        onFilesChange(newFiles);

        const newPreviews = selectedFiles.map(file => URL.createObjectURL(file));
        setPreviews(prev => [...prev, ...newPreviews]);
    };

    const removeFile = (index) => {
        const newFiles = files.filter((_, i) => i !== index);
        const newPreviews = previews.filter((_, i) => i !== index);
        setFiles(newFiles);
        setPreviews(newPreviews);
        onFilesChange(newFiles);

        // Reset file input to allow re-selection of the same file
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div>
            <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 transition-colors"
                onClick={() => fileInputRef.current.click()}
            >
                <FontAwesomeIcon icon={faImage} className="text-4xl text-gray-400 mb-2" />
                <p className="text-gray-600">Drag & drop images here, or click to select files</p>
                <p className="text-sm text-gray-500">Maximum {maxFiles} images</p>
                <input
                    type="file"
                    multiple
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                />
            </div>
            {previews.length > 0 && (
                <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                    {previews.map((src, index) => (
                        <div key={index} className="relative group">
                            <img src={src} alt={`Preview ${index}`} className="w-full h-24 object-cover rounded-lg" />
                            <button 
                                type="button"
                                onClick={() => removeFile(index)} 
                                className="absolute top-0 right-0 -mt-2 -mr-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <FontAwesomeIcon icon={faTimesCircle} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
