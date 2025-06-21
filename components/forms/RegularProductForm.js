'use client';

import { useState } from 'react';
import ImageUpload from '../ImageUpload';
import dynamic from 'next/dynamic';
// import toast from 'react-hot-toast';

// Dynamically import the MapPicker to avoid SSR issues with Leaflet
const MapPicker = dynamic(() => import('../MapPicker'), { ssr: false });

// Placeholder data - in a real app, this would come from a database
const colleges = ['IIT Bombay', 'IIT Delhi', 'VIT Vellore', 'SRM University', 'All'];
const conditions = ['New', 'Like New', 'Used', 'Refurbished'];
const categories = ['Laptops', 'Project Equipment', 'Books', 'Cycle/Bike', 'Hostel Equipment', 'Notes', 'Rooms/Hostel', 'Others'];

export default function RegularProductForm({ onFormSubmit }) {
    const [formData, setFormData] = useState({
        title: '',
        college: '',
        price: '',
        condition: '',
        description: '',
        images: [],
        location: null,
        category: '',
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
        // const toastId = toast.loading('Creating your listing...');

        const data = new FormData();
        data.append('formType', 'regular');
        data.append('category', formData.category);
        data.append('title', formData.title);
        data.append('college', formData.college);
        data.append('price', formData.price);
        data.append('condition', formData.condition);
        data.append('description', formData.description);
        data.append('location', JSON.stringify(formData.location));

        formData.images.forEach(image => {
            data.append('images', image);
        });

        try {
            const response = await fetch('/api/sell', {
                method: 'POST',
                body: data,
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Something went wrong');
            }

            // toast.success('Listing created successfully!', { id: toastId });
            // Optionally redirect user after success
            // router.push('/home');
        } catch (error) {
            // toast.error(error.message, { id: toastId });
        } finally {
            setIsSubmitting(false);
        }
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
                    <input type="text" name="title" id="title" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" onChange={handleChange} />
                </div>
                <div>
                    <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price (₹)</label>
                    <input type="number" name="price" id="price" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" onChange={handleChange} />
                </div>
                <div>
                    <label htmlFor="college" className="block text-sm font-medium text-gray-700">College</label>
                    <select name="college" id="college" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" onChange={handleChange}>
                        <option value="" disabled>Select College</option>
                        {colleges.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="condition" className="block text-sm font-medium text-gray-700">Condition</label>
                    <select name="condition" id="condition" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" onChange={handleChange}>
                        <option value="" disabled>Select Condition</option>
                        {conditions.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
                    <select name="category" id="category" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" onChange={handleChange}>
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
                <MapPicker onLocationChange={handleLocationChange} />
            </div>

            <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                <textarea name="description" id="description" rows="4" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" onChange={handleChange}></textarea>
            </div>

            <div className="flex justify-end">
                <button type="submit" className="bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 transition duration-300">
                    List Item
                </button>
            </div>
        </form>
    );
}
