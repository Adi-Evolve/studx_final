'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ImageUploadWithOptimization from '../ImageUploadWithOptimization';
import FileUpload from '../FileUpload';
import { colleges } from '../../lib/colleges';
import toast from 'react-hot-toast';

// Placeholder data
const academicYears = ['8th', '9th', '10th', '11th', '12th', 'Undergraduate', 'Postgraduate', 'PhD'];
const subjects = ['Physics', 'Chemistry', 'Mathematics', 'Computer Science', 'Data Structures'];
const categories = ['Laptops', 'Project Equipment', 'Books', 'Cycle/Bike', 'Hostel Equipment', 'Notes', 'Rooms/Hostel', 'Furniture', 'Others'];

export default function NotesForm({ initialData = {}, onSubmit }) {
    const router = useRouter();
    const [formData, setFormData] = useState({
        title: initialData.title || '',
        college: initialData.college || '',
        academic_year: initialData.academic_year || '',
        subject: initialData.subject || '',
        price: initialData.price || '',
        description: initialData.description || '',
        images: initialData.images || [],
        pdfs: initialData.pdfUrl ? [initialData.pdfUrl] : [], // Handle existing PDF
        category: initialData.category || 'Notes',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImagesChange = (files) => {
        setFormData(prev => ({ ...prev, images: files }));
    };

    const handlePdfsChange = (files) => {
        setFormData(prev => ({ ...prev, pdfs: files }));
    };

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;
        setIsSubmitting(true);

        // Let the API handle authentication - no frontend check needed
        // console.log('✅ Proceeding with upload - letting API handle authentication');

        const toastId = toast.loading('Uploading your notes...');

        if (onSubmit) {
            // Handle editing mode
            const data = new FormData();
            
            // Add all the form fields
            Object.keys(formData).forEach(key => {
                const value = formData[key];
                if (key === 'images') {
                    value.forEach(file => {
                        if (file instanceof File) {
                            data.append('images', file);
                        }
                    });
                } else if (key === 'pdfs') {
                    value.forEach(file => {
                        if (file instanceof File) {
                            data.append('pdfs', file);
                        }
                    });
                } else if (value !== null && value !== undefined) {
                    data.append(key, value);
                }
            });

            data.append('type', 'notes'); // Add type for the update API
            await onSubmit(data);
        } else {
            // Handle new note submission
            const data = new FormData();
            
            // Add all the form fields
            Object.keys(formData).forEach(key => {
                const value = formData[key];
                if (key === 'images') {
                    value.forEach(file => {
                        if (file instanceof File) {
                            data.append('images', file);
                        }
                    });
                } else if (key === 'pdfs') {
                    value.forEach(file => {
                        if (file instanceof File) {
                            data.append('pdfs', file);
                        }
                    });
                } else if (value !== null && value !== undefined) {
                    data.append(key, value);
                }
            });

            data.append('formType', 'notes'); // For the original sell API

            try {
                const response = await fetch('/api/sell', {
                    method: 'POST',
                    body: data,
                });
                const result = await response.json();
                if (!response.ok) {
                    // Handle specific error codes
                    if (result.code === 'NOT_AUTHENTICATED') {
                        toast.error('Please log in to list your notes');
                        setTimeout(() => {
                            router.push('/login');
                        }, 2000);
                        return;
                    } else if (result.code === 'PROFILE_INCOMPLETE') {
                        const missingFields = result.missingFields || ['profile information'];
                        toast.error(`Please add your ${missingFields.join(' and ')} to your profile first`);
                        setTimeout(() => {
                            router.push('/profile');
                        }, 2000);
                        return;
                    } else if (result.code === 'PHONE_REQUIRED') {
                        toast.error('Please add your phone number to your profile first');
                        setTimeout(() => {
                            router.push('/profile');
                        }, 2000);
                        return;
                    }
                    throw new Error(result.error || 'Something went wrong');
                }
                toast.success('Notes uploaded successfully! Redirecting to homepage...', { 
                    id: toastId,
                    duration: 3000 
                });
                
                // Reset form on successful submission
                setFormData({
                    title: '',
                    college: '',
                    academic_year: '',
                    subject: '',
                    price: '',
                    description: '',
                    images: [],
                    pdfs: [],
                    category: 'Notes',
                });
                
                // Redirect to homepage after successful submission
                setTimeout(() => {
                    router.push('/');
                }, 2000);
            } catch (error) {
                // console.error('Submission error:', error);
                toast.error(error.message || 'Failed to upload notes', { id: toastId });
            }
        }

        setIsSubmitting(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            <div>
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">List Notes</h2>
                <p className="text-gray-600 dark:text-gray-400">Share your knowledge with fellow students.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Title of Notes</label>
                    <input 
                        type="text" 
                        id="title" 
                        name="title" 
                        required 
                        value={formData.title} 
                        onChange={handleChange} 
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-black dark:text-white bg-white dark:bg-gray-800 focus:outline-none focus:ring-blue-500 focus:border-blue-500" 
                        placeholder="Enter descriptive title"
                    />
                </div>
                <div>
                    <label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Price (₹)</label>
                    <input 
                        type="number" 
                        id="price" 
                        name="price" 
                        required 
                        value={formData.price} 
                        onChange={handleChange} 
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-black dark:text-white bg-white dark:bg-gray-800 focus:outline-none focus:ring-blue-500 focus:border-blue-500" 
                        placeholder="0"
                    />
                </div>
                <div>
                    <label htmlFor="college" className="block text-sm font-medium text-gray-700 dark:text-gray-300">College</label>
                    <select 
                        name="college" 
                        id="college" 
                        required 
                        value={formData.college} 
                        onChange={handleChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-black dark:text-white bg-white dark:bg-gray-800 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="" disabled>Select College</option>
                        {colleges.sort((a, b) => a.name.localeCompare(b.name)).map(c => <option key={c.short} value={c.short}>{c.name}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="academic_year" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Academic Year</label>
                    <select 
                        name="academic_year" 
                        id="academic_year" 
                        required 
                        value={formData.academic_year} 
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-black dark:text-white bg-white dark:bg-gray-800 focus:outline-none focus:ring-blue-500 focus:border-blue-500" 
                        onChange={handleChange}
                    >
                        <option value="" disabled>Select Year</option>
                        {academicYears.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                </div>
                <div className="md:col-span-2">
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Course / Subject</label>
                    <select 
                        name="subject" 
                        id="subject" 
                        required 
                        value={formData.subject} 
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-black dark:text-white bg-white dark:bg-gray-800 focus:outline-none focus:ring-blue-500 focus:border-blue-500" 
                        onChange={handleChange}
                    >
                        <option value="" disabled>Select Subject</option>
                        {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                <div className="md:col-span-2">
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
                    <select 
                        name="category" 
                        id="category" 
                        required 
                        value={formData.category} 
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-black dark:text-white bg-white dark:bg-gray-800 focus:outline-none focus:ring-blue-500 focus:border-blue-500" 
                        onChange={handleChange}
                    >
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Upload Preview Images (up to 5)</label>
                <ImageUploadWithOptimization 
                    onImagesOptimized={handleImagesChange} 
                    maxImages={5}
                    maxSizeInMB={10}
                    showPreview={true}
                    allowMultiple={true}
                    optimizationOptions={{
                        maxWidth: 1200,
                        maxHeight: 800,
                        quality: 0.8
                    }}
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Upload PDF Files (up to 10)</label>
                <FileUpload onFilesChange={handlePdfsChange} maxFiles={10} accept=".pdf" fileType="PDF" />
            </div>

            <div className="md:col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                <textarea 
                    id="description" 
                    name="description" 
                    rows={4} 
                    value={formData.description} 
                    onChange={handleChange} 
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-black dark:text-white bg-white dark:bg-gray-800 focus:outline-none focus:ring-blue-500 focus:border-blue-500" 
                    placeholder="Describe your notes in detail..."
                />
            </div>

            <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white py-3 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isSubmitting ? 'Uploading...' : 'Upload Notes'}
            </button>
        </form>
    );
}
