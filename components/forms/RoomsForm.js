'use client';

import { useState } from 'react';
import ImageUpload from '../ImageUpload';
import dynamic from 'next/dynamic';
import toast from 'react-hot-toast';

const MapPicker = dynamic(() => import('../MapPicker'), { ssr: false });

// Placeholder data
const colleges = ['IIT Bombay', 'IIT Delhi', 'VIT Vellore', 'SRM University', 'All'];
const roomTypes = ['Single Room', 'Double Room', '1 BHK', '2 BHK', '3 BHK', 'Shared Apartment'];
const amenitiesList = ['AC', 'WiFi', 'Washing Machine', 'Furnished', 'Refrigerator', 'Parking', 'Hot Water'];
const categories = ['Laptops', 'Project Equipment', 'Books', 'Cycle/Bike', 'Hostel Equipment', 'Notes', 'Rooms/Hostel', 'Others'];

export default function RoomsForm({ onFormSubmit }) {
    const [formData, setFormData] = useState({
        hostelName: '',
        college: '',
        roomType: '',
        deposit: '',
        fees: '',
        feesPeriod: 'Monthly',
        messIncluded: false,
        messFees: '',
        description: '',
        distance: '',
        occupancy: '',
        ownerName: '',
        contactPrimary: '',
        contactSecondary: '',
        amenities: [],
        images: [],
        location: null,
        category: 'Rooms/Hostel', // Default to 'Rooms/Hostel'
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (type === 'checkbox') {
            if (name === 'messIncluded') {
                setFormData(prev => ({ ...prev, messIncluded: checked }));
            } else {
                const newAmenities = checked 
                    ? [...formData.amenities, value] 
                    : formData.amenities.filter(a => a !== value);
                setFormData(prev => ({ ...prev, amenities: newAmenities }));
            }
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
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
        const toastId = toast.loading('Adding your room listing...');

        const data = new FormData();
        data.append('formType', 'rooms');
        data.append('category', formData.category);
        data.append('hostelName', formData.hostelName);
        data.append('college', formData.college);
        data.append('roomType', formData.roomType);
        data.append('deposit', formData.deposit);
        data.append('fees', formData.fees);
        data.append('feesPeriod', formData.feesPeriod);
        data.append('messIncluded', formData.messIncluded);
        data.append('messFees', formData.messFees);
        data.append('description', formData.description);
        data.append('distance', formData.distance);
        data.append('occupancy', formData.occupancy);
        data.append('ownerName', formData.ownerName);
        data.append('contactPrimary', formData.contactPrimary);
        data.append('contactSecondary', formData.contactSecondary);
        data.append('location', JSON.stringify(formData.location));

        formData.amenities.forEach(amenity => {
            data.append('amenities', amenity);
        });
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

            toast.success('Room listed successfully!', { id: toastId });
        } catch (error) {
            toast.error(error.message, { id: toastId });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            <div>
                <h2 className="text-2xl font-semibold text-gray-800">List a Room/Hostel</h2>
                <p className="text-gray-600">Provide details about the accommodation.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                    <label htmlFor="hostelName">Hostel/Apartment Name</label>
                    <input type="text" name="hostelName" id="hostelName" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" onChange={handleChange} />
                </div>
                <div>
                    <label htmlFor="college">Nearest College</label>
                    <select name="college" id="college" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" onChange={handleChange}>
                        <option value="" disabled>Select College</option>
                        {colleges.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="roomType">Room Type</label>
                    <select name="roomType" id="roomType" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" onChange={handleChange}>
                        <option value="" disabled>Select Room Type</option>
                        {roomTypes.map(rt => <option key={rt} value={rt}>{rt}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
                    <select name="category" id="category" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" onChange={handleChange} value={formData.category}>
                        {categories.map(c => <option key={c} value={c}>{c}</option>)} 
                    </select>
                </div>
                <div>
                    <label htmlFor="fees">Fees (₹)</label>
                    <div className="flex">
                        <input type="number" name="fees" id="fees" required className="mt-1 block w-full rounded-l-md border-gray-300 shadow-sm" onChange={handleChange} />
                        <select name="feesPeriod" className="mt-1 block rounded-r-md border-gray-300 border-l-0 shadow-sm bg-gray-50" onChange={handleChange}>
                            <option>Monthly</option>
                            <option>Yearly</option>
                        </select>
                    </div>
                </div>
                <div>
                    <label htmlFor="deposit">Deposit Amount (₹)</label>
                    <input type="number" name="deposit" id="deposit" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" onChange={handleChange} />
                </div>
                 <div>
                    <label htmlFor="distance">Distance from College</label>
                    <input type="text" name="distance" id="distance" placeholder="e.g., 500m, 1km" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" onChange={handleChange} />
                </div>
                 <div>
                    <label htmlFor="occupancy">Occupancy</label>
                    <input type="text" name="occupancy" id="occupancy" placeholder="e.g., Single, 2 people" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" onChange={handleChange} />
                </div>
            </div>

            <div>
                <div className="flex items-center">
                    <input type="checkbox" name="messIncluded" id="messIncluded" className="h-4 w-4 text-blue-600 border-gray-300 rounded" onChange={handleChange} />
                    <label htmlFor="messIncluded" className="ml-2 block text-sm text-gray-900">Mess Fees Included</label>
                </div>
                {!formData.messIncluded && (
                    <div className="mt-4">
                        <label htmlFor="messFees">Mess Fees (₹ per month)</label>
                        <input type="number" name="messFees" id="messFees" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" onChange={handleChange} />
                    </div>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Amenities</label>
                <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4">
                    {amenitiesList.map(amenity => (
                        <div key={amenity} className="flex items-center">
                            <input type="checkbox" id={amenity} name="amenities" value={amenity} onChange={handleChange} className="h-4 w-4 text-blue-600 border-gray-300 rounded" />
                            <label htmlFor={amenity} className="ml-2 block text-sm text-gray-900">{amenity}</label>
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                    <label htmlFor="ownerName">Owner Name</label>
                    <input type="text" name="ownerName" id="ownerName" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" onChange={handleChange} />
                </div>
                 <div>
                    <label htmlFor="contactPrimary">Contact Number</label>
                    <input type="tel" name="contactPrimary" id="contactPrimary" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" onChange={handleChange} />
                </div>
                 <div>
                    <label htmlFor="contactSecondary">Secondary Contact (Optional)</label>
                    <input type="tel" name="contactSecondary" id="contactSecondary" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" onChange={handleChange} />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Upload Images (up to 10)</label>
                <ImageUpload onFilesChange={handleImagesChange} maxFiles={10} />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Set Location</label>
                <MapPicker onLocationChange={handleLocationChange} initialPosition={formData.location} />
            </div>

            <div>
                <label htmlFor="description">Description</label>
                <textarea name="description" id="description" rows="4" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" onChange={handleChange}></textarea>
            </div>

            <div className="flex justify-end">
                <button type="submit" className="bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 transition duration-300">
                    List Room
                </button>
            </div>
        </form>
    );
}
