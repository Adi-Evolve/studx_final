'use client';

import { useState } from 'react';
import ImageUpload from '../ImageUpload';
import FileUpload from '../FileUpload';
import { colleges } from '../../lib/colleges';
// import toast from 'react-hot-toast';

// Placeholder data
const academicYears = ['8th', '9th', '10th', '11th', '12th', 'Undergraduate', 'Postgraduate', 'PhD'];
const subjects = ['Physics', 'Chemistry', 'Mathematics', 'Computer Science', 'Data Structures'];
const categories = ['Laptops', 'Project Equipment', 'Books', 'Cycle/Bike', 'Hostel Equipment', 'Notes', 'Rooms/Hostel', 'Furniture', 'Others'];

export default function NotesForm({ initialData = {}, onSubmit }) {
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

        const data = new FormData();
        for (const key in formData) {
            if (key === 'images') {
                formData.images.forEach(file => { if (file instanceof File) data.append('images', file); });
            } else if (key === 'pdfs') {
                formData.pdfs.forEach(file => { if (file instanceof File) data.append('pdfs', file); });
            } else if (formData[key] !== null) {
                data.append(key, formData[key]);
            }
        }

        if (onSubmit) {
            data.append('type', 'note');
            await onSubmit(data);
        } else {
            data.append('formType', 'notes');
            try {
                const response = await fetch('/api/sell', {
                    method: 'POST',
                    body: data,
                });
                
                const result = await response.json();
                
                if (!response.ok) {
                    throw new Error(result.error || `HTTP ${response.status}: ${response.statusText}`);
                }
                
                alert('Notes listed successfully!');
                e.target.reset();
                // Reset form data state
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
            } catch (error) {
                console.error('Submission error:', error);
                alert(`Error: ${error.message}`);
            }
        }

        setIsSubmitting(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            <div>
                <h2 className="text-2xl font-semibold text-gray-800">List Notes</h2>
                <p className="text-gray-600">Share your knowledge with fellow students.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title of Notes</label>
                    <input type="text" name="title" id="title" required value={formData.title} className="mt-1 block w-full rounded-md border-black text-black shadow-sm" onChange={handleChange} />
                </div>
                <div>
                    <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price (₹)</label>
                    <input type="number" name="price" id="price" required value={formData.price} className="mt-1 block w-full rounded-md border-black text-black shadow-sm" onChange={handleChange} />
                </div>
                <div>
                    <label htmlFor="college" className="block text-sm font-medium text-gray-700">College</label>
                    <select name="college" id="college" required value={formData.college} className="mt-1 block w-full rounded-md border-black text-black shadow-sm" onChange={handleChange}>
                        <option value="" disabled>Select College</option>
                        {colleges.sort((a, b) => a.name.localeCompare(b.name)).map(c => <option key={c.short} value={c.short}>{c.name}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="academic_year" className="block text-sm font-medium text-gray-700">Academic Year</label>
                    <select name="academic_year" id="academic_year" required value={formData.academic_year} className="mt-1 block w-full rounded-md border-black text-black shadow-sm" onChange={handleChange}>
                        <option value="" disabled>Select Year</option>
                        {academicYears.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                </div>
                <div className="md:col-span-2">
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700">Course / Subject</label>
                    <select name="subject" id="subject" required value={formData.subject} className="mt-1 block w-full rounded-md border-black text-black shadow-sm" onChange={handleChange}>
                        <option value="" disabled>Select Subject</option>
                        {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                <div className="md:col-span-2">
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
                    <select name="category" id="category" required value={formData.category} className="mt-1 block w-full rounded-md border-black text-black shadow-sm" onChange={handleChange}>
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Upload Preview Images (up to 5)</label>
                <ImageUpload onFilesChange={handleImagesChange} maxFiles={5} />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Upload Notes (PDFs)</label>
                <FileUpload onFilesChange={handlePdfsChange} />
            </div>

            <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                <textarea name="description" id="description" rows="4" value={formData.description} className="mt-1 block w-full rounded-md border-black text-black shadow-sm" onChange={handleChange}></textarea>
            </div>

            <div className="flex justify-end">
                <button type="submit" disabled={isSubmitting} className="bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 transition duration-300 disabled:bg-gray-400">
                    {isSubmitting ? 'Submitting...' : (initialData.id ? 'Update Notes' : 'List Notes')}
                </button>
            </div>
        </form>
    );
}
