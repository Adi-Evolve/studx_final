'use client';

import { useState } from 'react';
import ImageUpload from '../ImageUpload';
import FileUpload from '../FileUpload';
// import toast from 'react-hot-toast';

// Placeholder data
const colleges = ['IIT Bombay', 'IIT Delhi', 'VIT Vellore', 'SRM University', 'All'];
const academicYears = ['8th', '9th', '10th', '11th', '12th', 'Undergraduate', 'Postgraduate', 'PhD'];
const subjects = ['Physics', 'Chemistry', 'Mathematics', 'Computer Science', 'Data Structures'];
const categories = ['Laptops', 'Project Equipment', 'Books', 'Cycle/Bike', 'Hostel Equipment', 'Notes', 'Rooms/Hostel', 'Others'];

export default function NotesForm({ onFormSubmit }) {
    const [formData, setFormData] = useState({
        title: '',
        college: '',
        academicYear: '',
        subject: '',
        price: '',
        description: '',
        images: [],
        pdfs: [],
        category: 'Notes', // Default to 'Notes'
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
        // const toastId = toast.loading('Uploading your notes...');

        const data = new FormData();
        data.append('formType', 'notes');
        data.append('category', formData.category);
        data.append('title', formData.title);
        data.append('college', formData.college);
        data.append('academicYear', formData.academicYear);
        data.append('subject', formData.subject);
        data.append('price', formData.price);
        data.append('description', formData.description);

        formData.images.forEach(image => {
            data.append('images', image);
        });
        formData.pdfs.forEach(pdf => {
            data.append('pdfs', pdf);
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

            // toast.success('Notes listed successfully!', { id: toastId });
        } catch (error) {
            // toast.error(error.message, { id: toastId });
        } finally {
            setIsSubmitting(false);
        }
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
                    <input type="text" name="title" id="title" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" onChange={handleChange} />
                </div>
                <div>
                    <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price (₹)</label>
                    <input type="number" name="price" id="price" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" onChange={handleChange} />
                </div>
                <div>
                    <label htmlFor="college" className="block text-sm font-medium text-gray-700">College</label>
                    <select name="college" id="college" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" onChange={handleChange}>
                        <option value="" disabled>Select College</option>
                        {colleges.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="academicYear" className="block text-sm font-medium text-gray-700">Academic Year</label>
                    <select name="academicYear" id="academicYear" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" onChange={handleChange}>
                        <option value="" disabled>Select Year</option>
                        {academicYears.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                </div>
                <div className="md:col-span-2">
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700">Course / Subject</label>
                    <select name="subject" id="subject" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" onChange={handleChange}>
                         <option value="" disabled>Select Subject</option>
                         {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                <div className="md:col-span-2">
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
                    <select name="category" id="category" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" onChange={handleChange} value={formData.category}>
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
                <textarea name="description" id="description" rows="4" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" onChange={handleChange}></textarea>
            </div>

            <div className="flex justify-end">
                <button type="submit" className="bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 transition duration-300">
                    List Notes
                </button>
            </div>
        </form>
    );
}
