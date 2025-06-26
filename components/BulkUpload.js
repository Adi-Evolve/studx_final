'use client';

import { useState, useRef } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faUpload, 
    faDownload, 
    faFileExcel, 
    faTrash, 
    faCheck, 
    faTimes, 
    faSpinner,
    faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';

export default function BulkUpload({ onUploadComplete }) {
    const [file, setFile] = useState(null);
    const [uploadSession, setUploadSession] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState({ processed: 0, total: 0, failed: 0 });
    const [errors, setErrors] = useState([]);
    const [showTemplate, setShowTemplate] = useState(false);
    const fileInputRef = useRef(null);
    const supabase = createSupabaseBrowserClient();

    const csvTemplate = [
        'name,description,price,category,condition,location,contact_info,image_urls',
        'iPhone 13 Pro,Excellent condition iPhone 13 Pro 128GB,45000,Electronics,Excellent,New Delhi,+91-9876543210,https://example.com/image1.jpg',
        'Study Notes - Physics,Complete physics notes for JEE preparation,500,Notes,Good,Mumbai,physics.notes@email.com,https://example.com/notes1.jpg',
        'Single Room,Spacious single room near campus,8000,Rooms,Good,Bangalore,room.owner@email.com,https://example.com/room1.jpg'
    ].join('\n');

    const downloadTemplate = () => {
        const blob = new Blob([csvTemplate], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'studxchange_bulk_upload_template.csv';
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const handleFileSelect = (event) => {
        const selectedFile = event.target.files[0];
        if (selectedFile && selectedFile.type === 'text/csv') {
            setFile(selectedFile);
            setErrors([]);
        } else {
            alert('Please select a valid CSV file');
        }
    };

    const parseCSV = (csvText) => {
        const lines = csvText.split('\n').filter(line => line.trim());
        if (lines.length === 0) return [];

        const headers = lines[0].split(',').map(h => h.trim());
        const requiredHeaders = ['name', 'description', 'price', 'category', 'condition'];
        
        const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
        if (missingHeaders.length > 0) {
            throw new Error(`Missing required columns: ${missingHeaders.join(', ')}`);
        }

        const items = [];
        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => v.trim());
            const item = {};
            
            headers.forEach((header, index) => {
                item[header] = values[index] || '';
            });

            // Validate required fields
            const missingFields = requiredHeaders.filter(field => !item[field]);
            if (missingFields.length > 0) {
                throw new Error(`Row ${i + 1}: Missing required fields: ${missingFields.join(', ')}`);
            }

            // Validate price
            const price = parseFloat(item.price);
            if (isNaN(price) || price <= 0) {
                throw new Error(`Row ${i + 1}: Invalid price value`);
            }

            // Validate category
            const validCategories = ['Electronics', 'Books', 'Clothing', 'Sports', 'Furniture', 'Notes', 'Rooms', 'Other'];
            if (!validCategories.includes(item.category)) {
                throw new Error(`Row ${i + 1}: Invalid category. Must be one of: ${validCategories.join(', ')}`);
            }

            // Set defaults and process data
            item.price = price;
            item.type = item.category === 'Notes' ? 'notes' : item.category === 'Rooms' ? 'rooms' : 'regular';
            item.image_urls = item.image_urls ? item.image_urls.split('|').filter(url => url.trim()) : [];
            
            items.push(item);
        }

        return items;
    };

    const createUploadSession = async (items) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const { data, error } = await supabase
            .from('bulk_upload_sessions')
            .insert({
                user_id: user.id,
                session_name: `Bulk Upload ${new Date().toLocaleString()}`,
                total_items: items.length,
                upload_data: { items }
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    };

    const processUpload = async () => {
        if (!file) return;

        setUploading(true);
        setProgress({ processed: 0, total: 0, failed: 0 });
        setErrors([]);

        try {
            // Read and parse CSV file
            const csvText = await file.text();
            const items = parseCSV(csvText);
            
            // Create upload session
            const session = await createUploadSession(items);
            setUploadSession(session);
            setProgress({ processed: 0, total: items.length, failed: 0 });

            const { data: { user } } = await supabase.auth.getUser();
            const uploadErrors = [];
            let processed = 0;
            let failed = 0;

            // Process items in batches
            for (let i = 0; i < items.length; i++) {
                const item = items[i];
                
                try {
                    // Insert product
                    const { error: insertError } = await supabase
                        .from('products')
                        .insert({
                            name: item.name,
                            description: item.description,
                            price: item.price,
                            category: item.category,
                            condition: item.condition,
                            location: item.location || null,
                            contact_info: item.contact_info || null,
                            type: item.type,
                            seller_id: user.id,
                            images: item.image_urls
                        });

                    if (insertError) {
                        throw insertError;
                    }

                    processed++;
                } catch (error) {
                    failed++;
                    uploadErrors.push(`Row ${i + 2}: ${error.message}`);
                }

                // Update progress
                setProgress({ processed, total: items.length, failed });
                
                // Small delay to prevent overwhelming the database
                await new Promise(resolve => setTimeout(resolve, 100));
            }

            // Update session status
            await supabase
                .from('bulk_upload_sessions')
                .update({
                    processed_items: processed,
                    failed_items: failed,
                    status: failed === 0 ? 'completed' : 'completed_with_errors',
                    error_log: uploadErrors.join('\n')
                })
                .eq('id', session.id);

            setErrors(uploadErrors);

            // Create notification
            await supabase
                .from('notifications')
                .insert({
                    user_id: user.id,
                    type: 'system',
                    title: 'Bulk Upload Complete',
                    message: `Uploaded ${processed} items successfully${failed > 0 ? ` with ${failed} errors` : ''}.`,
                    action_url: '/profile'
                });

            if (onUploadComplete) {
                onUploadComplete({
                    total: items.length,
                    processed,
                    failed,
                    errors: uploadErrors
                });
            }

        } catch (error) {
            console.error('Upload error:', error);
            setErrors([error.message]);
            
            if (uploadSession) {
                await supabase
                    .from('bulk_upload_sessions')
                    .update({
                        status: 'failed',
                        error_log: error.message
                    })
                    .eq('id', uploadSession.id);
            }
        } finally {
            setUploading(false);
        }
    };

    const resetUpload = () => {
        setFile(null);
        setUploadSession(null);
        setProgress({ processed: 0, total: 0, failed: 0 });
        setErrors([]);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="card p-6">
            <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Bulk Upload Items</h2>
                <p className="text-gray-600">Upload multiple items at once using a CSV file</p>
            </div>

            {/* Template Download */}
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start gap-3">
                    <FontAwesomeIcon icon={faFileExcel} className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div className="flex-1">
                        <h3 className="font-medium text-blue-900 mb-1">Download Template</h3>
                        <p className="text-sm text-blue-700 mb-3">
                            Use our CSV template to format your data correctly
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={downloadTemplate}
                                className="btn-primary btn-sm"
                            >
                                <FontAwesomeIcon icon={faDownload} className="w-4 h-4 mr-2" />
                                Download Template
                            </button>
                            <button
                                onClick={() => setShowTemplate(!showTemplate)}
                                className="btn-secondary btn-sm"
                            >
                                {showTemplate ? 'Hide' : 'Show'} Format
                            </button>
                        </div>
                    </div>
                </div>

                {/* Template Preview */}
                {showTemplate && (
                    <div className="mt-4 p-3 bg-white rounded border">
                        <h4 className="font-medium text-gray-900 mb-2">Required Columns:</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                            <div><strong>name:</strong> Item name</div>
                            <div><strong>description:</strong> Item description</div>
                            <div><strong>price:</strong> Price in rupees</div>
                            <div><strong>category:</strong> Electronics, Books, etc.</div>
                            <div><strong>condition:</strong> New, Good, Fair, etc.</div>
                            <div><strong>location:</strong> Your location (optional)</div>
                            <div><strong>contact_info:</strong> Phone/email (optional)</div>
                            <div><strong>image_urls:</strong> URLs separated by | (optional)</div>
                        </div>
                        <div className="text-xs text-gray-600">
                            <strong>Valid Categories:</strong> Electronics, Books, Clothing, Sports, Furniture, Notes, Rooms, Other
                        </div>
                    </div>
                )}
            </div>

            {/* File Upload */}
            {!uploadSession && (
                <div className="mb-6">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-400 transition-colors">
                        <FontAwesomeIcon icon={faUpload} className="w-12 h-12 text-gray-400 mb-4" />
                        
                        {file ? (
                            <div className="space-y-3">
                                <div className="flex items-center justify-center gap-2">
                                    <FontAwesomeIcon icon={faFileExcel} className="w-5 h-5 text-green-600" />
                                    <span className="font-medium text-gray-900">{file.name}</span>
                                </div>
                                <p className="text-sm text-gray-600">
                                    File size: {(file.size / 1024).toFixed(1)} KB
                                </p>
                                <div className="flex gap-2 justify-center">
                                    <button
                                        onClick={processUpload}
                                        disabled={uploading}
                                        className="btn-primary"
                                    >
                                        {uploading ? (
                                            <>
                                                <FontAwesomeIcon icon={faSpinner} className="w-4 h-4 mr-2 animate-spin" />
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                <FontAwesomeIcon icon={faUpload} className="w-4 h-4 mr-2" />
                                                Start Upload
                                            </>
                                        )}
                                    </button>
                                    <button
                                        onClick={resetUpload}
                                        disabled={uploading}
                                        className="btn-secondary"
                                    >
                                        <FontAwesomeIcon icon={faTrash} className="w-4 h-4 mr-2" />
                                        Remove
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <h3 className="text-lg font-medium text-gray-900">
                                    Select CSV File
                                </h3>
                                <p className="text-gray-600">
                                    Choose a CSV file with your items data
                                </p>
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="btn-primary"
                                >
                                    <FontAwesomeIcon icon={faUpload} className="w-4 h-4 mr-2" />
                                    Choose File
                                </button>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".csv"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                />
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Upload Progress */}
            {uploading && progress.total > 0 && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-gray-900">Upload Progress</h3>
                        <span className="text-sm text-gray-600">
                            {progress.processed} / {progress.total} items
                        </span>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
                        <div 
                            className="bg-primary-600 h-3 rounded-full transition-all duration-300"
                            style={{ width: `${(progress.processed / progress.total) * 100}%` }}
                        ></div>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                        <span className="text-green-600">
                            <FontAwesomeIcon icon={faCheck} className="w-4 h-4 mr-1" />
                            {progress.processed} successful
                        </span>
                        {progress.failed > 0 && (
                            <span className="text-red-600">
                                <FontAwesomeIcon icon={faTimes} className="w-4 h-4 mr-1" />
                                {progress.failed} failed
                            </span>
                        )}
                    </div>
                </div>
            )}

            {/* Upload Complete */}
            {uploadSession && !uploading && (
                <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-start gap-3">
                        <FontAwesomeIcon icon={faCheck} className="w-5 h-5 text-green-600 mt-0.5" />
                        <div className="flex-1">
                            <h3 className="font-medium text-green-900 mb-1">Upload Complete</h3>
                            <p className="text-sm text-green-700 mb-2">
                                Successfully processed {progress.processed} out of {progress.total} items
                                {progress.failed > 0 && ` (${progress.failed} failed)`}
                            </p>
                            <button
                                onClick={resetUpload}
                                className="btn-primary btn-sm"
                            >
                                Upload More Items
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Errors */}
            {errors.length > 0 && (
                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                    <div className="flex items-start gap-3">
                        <FontAwesomeIcon icon={faExclamationTriangle} className="w-5 h-5 text-red-600 mt-0.5" />
                        <div className="flex-1">
                            <h3 className="font-medium text-red-900 mb-2">Upload Errors</h3>
                            <div className="space-y-1 text-sm text-red-700 max-h-32 overflow-y-auto">
                                {errors.map((error, index) => (
                                    <div key={index} className="flex items-start gap-2">
                                        <span className="text-red-500">•</span>
                                        <span>{error}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}