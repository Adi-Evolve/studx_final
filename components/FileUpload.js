'use client';

import { useState, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilePdf, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
// // import toast from 'react-hot-toast';

export default function FileUpload({ onFilesChange, accept = 'application/pdf', maxSize = 100 * 1024 * 1024 }) { // Updated to 100MB per file
    const [files, setFiles] = useState([]);
    const fileInputRef = useRef(null);

    const handleFileChange = (event) => {
        const selectedFiles = Array.from(event.target.files);
        
        // Validate file sizes
        const validFiles = [];
        const invalidFiles = [];
        
        selectedFiles.forEach(file => {
            if (file.size > maxSize) {
                invalidFiles.push(file.name);
            } else {
                validFiles.push(file);
            }
        });
        
        // Show error for invalid files
        if (invalidFiles.length > 0) {
            const maxSizeMB = Math.round(maxSize / (1024 * 1024));
            alert(`The following files are too large (max ${maxSizeMB}MB):\n${invalidFiles.join('\n')}`);
        }
        
        // Add only valid files
        const newFiles = [...files, ...validFiles];
        setFiles(newFiles);
        onFilesChange(newFiles);
    };

    const removeFile = (index) => {
        const newFiles = files.filter((_, i) => i !== index);
        setFiles(newFiles);
        onFilesChange(newFiles);

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
                <FontAwesomeIcon icon={faFilePdf} className="text-4xl text-gray-400 mb-2" />
                <p className="text-gray-600">Drag & drop PDFs here, or click to select files</p>
                <p className="text-sm text-gray-500">Multiple PDFs allowed • Max 100MB per file</p>
                <input
                    type="file"
                    multiple
                    accept={accept}
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                />
            </div>
            {files.length > 0 && (
                <div className="mt-4 space-y-2">
                    {files.map((file, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-100 p-2 rounded-lg">
                            <div className="flex-1 truncate">
                                <span className="text-sm text-gray-700 truncate">{file.name}</span>
                                <div className="text-xs text-gray-500">
                                    {(file.size / (1024 * 1024)).toFixed(1)} MB
                                </div>
                            </div>
                            <button 
                                type="button"
                                onClick={() => removeFile(index)} 
                                className="text-red-500 hover:text-red-700 ml-2"
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
