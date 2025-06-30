'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ImageUpload from '../ImageUpload';
import dynamic from 'next/dynamic';
import { colleges } from '../../lib/colleges';
import toast from 'react-hot-toast';

// Dynamically import the MapPicker to avoid SSR issues with Leaflet
const MapPicker = dynamic(() => import('../MapPicker'), { ssr: false });

// Placeholder data - in a real app, this would come from a database
const conditions = ['New', 'Used', 'Refurbished'];
const categories = ['Laptops', 'Project Equipment', 'Books', 'Cycle/Bike', 'Hostel Equipment', 'Notes', 'Rooms/Hostel', 'Furniture', 'Others'];

export default function RegularProductForm({ initialData = {}, onSubmit }) {
    const router = useRouter();
    const [formData, setFormData] = useState({
        title: initialData.title || '',
        college: initialData.college || '',
        price: initialData.price || '',
        condition: initialData.condition || '',
        description: initialData.description || '',
        images: initialData.images || [],
        location: initialData.location ? (typeof initialData.location === 'string' ? JSON.parse(initialData.location) : initialData.location) : null,
        category: initialData.category || '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImagesChange = (files) => {
        setFormData(prev => ({ ...prev, images: files }));
    };

    const handleLocationChange = (location) => {
        setFormData(prev => ({ ...prev, location }));
    };

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;
        setIsSubmitting(true);

        const data = new FormData();
        // Append all form data
        for (const key in formData) {
            if (key === 'images') {
                formData.images.forEach(image => {
                    if (image instanceof File) { // Only append new file uploads
                        data.append('images', image);
                    }
                });
            } else if (key === 'location' && formData.location) {
                data.append('location', JSON.stringify(formData.location));
            } else if (formData[key] !== null) {
                data.append(key, formData[key]);
            }
        }

        if (onSubmit) {
            data.append('type', 'product');
            await onSubmit(data);
        } else {
            data.append('formType', 'regular');
            try {
                const response = await fetch('/api/sell', {
                    method: 'POST',
                    body: data,
                });
                if (!response.ok) {
                    const result = await response.json();
                    // Handle specific error codes
                    if (result.code === 'NOT_AUTHENTICATED') {
                        toast.error('Please log in to list your product');
                        setTimeout(() => {
                            router.push('/login');
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
                
                toast.success('Product listed successfully! Redirecting to homepage...', { 
                    duration: 3000 
                });
                
                // Reset form
                setFormData({
                    title: '',
                    college: '',
                    price: '',
                    condition: '',
                    description: '',
                    images: [],
                    location: null,
                    category: '',
                });
                
                // Redirect to homepage after successful submission
                setTimeout(() => {
                    router.push('/');
                }, 2000);
            } catch (error) {
                alert(`Error: ${error.message}`);
            }
        }

        setIsSubmitting(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            <div>
                <h2 className="text-2xl font-semibold text-gray-800">List a Regular Product</h2>
                <p className="text-gray-600">Please fill out the details below.</p>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
                    <input 
                        type="text" 
                        name="title" 
                        id="title" 
                        required 
                        value={formData.title} 
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-black bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500" 
                        onChange={handleChange} 
                    />
                </div>
                <div>
                    <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price (₹)</label>
                    <input 
                        type="number" 
                        name="price" 
                        id="price" 
                        required 
                        value={formData.price} 
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-black bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500" 
                        onChange={handleChange} 
                    />
                </div>
                <div>
                    <label htmlFor="college" className="block text-sm font-medium text-gray-700">College</label>
                    <select 
                        name="college" 
                        id="college" 
                        required 
                        value={formData.college} 
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-black bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500" 
                        onChange={handleChange}
                    >
                        <option value="" disabled>Select College</option>
                        {colleges.sort((a, b) => a.name.localeCompare(b.name)).map(c => <option key={c.short} value={c.short}>{c.name}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="condition" className="block text-sm font-medium text-gray-700">Condition</label>
                    <select 
                        name="condition" 
                        id="condition" 
                        required 
                        value={formData.condition} 
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-black bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500" 
                        onChange={handleChange}
                    >
                        <option value="" disabled>Select Condition</option>
                        {conditions.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
                    <select 
                        name="category" 
                        id="category" 
                        required 
                        value={formData.category} 
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-black bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500" 
                        onChange={handleChange}
                    >
                        <option value="" disabled>Select Category</option>
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Upload Images (up to 5)</label>
                <ImageUpload onFilesChange={handleImagesChange} maxFiles={5} />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Set Location</label>
                <MapPicker onLocationChange={handleLocationChange} initialLocation={formData.location} />
            </div>

            <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                <textarea 
                    name="description" 
                    id="description" 
                    rows="4" 
                    value={formData.description} 
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-black bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500" 
                    onChange={handleChange}
                ></textarea>
            </div>

            <div className="flex justify-end">
                <button type="submit" disabled={isSubmitting} className="bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 transition duration-300 disabled:bg-gray-400">
                    {isSubmitting ? 'Submitting...' : (initialData.id ? 'Update Item' : 'List Item')}
                </button>
            </div>
        </form>
    );
}
