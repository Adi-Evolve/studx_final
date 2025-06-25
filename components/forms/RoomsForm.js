'use client';

import { useState, useEffect } from 'react';
import ImageUpload from '../ImageUpload';
import dynamic from 'next/dynamic';
import toast from 'react-hot-toast';
import { colleges } from '../../lib/colleges';

const MapPicker = dynamic(() => import('../MapPicker'), { ssr: false });

// Placeholder data

const roomTypes = ['Single Room', 'Double Room', '1 BHK', '2 BHK', '3 BHK', 'Shared Apartment'];
const amenitiesList = ['AC', 'WiFi', 'Washing Machine', 'Furnished', 'Refrigerator', 'Parking', 'Hot Water'];
const categories = ['Laptops', 'Project Equipment', 'Books', 'Cycle/Bike', 'Hostel Equipment', 'Notes', 'Rooms/Hostel', 'Furniture', 'Others'];

export default function RoomsForm({ initialData = {}, onSubmit }) {
    const [formData, setFormData] = useState({
        hostel_name: initialData.hostel_name || '',
        college: initialData.college || '',
        room_type: initialData.room_type || '',
        deposit: initialData.deposit || '',
        fees: initialData.fees || '',
        fees_period: initialData.fees_period || 'Monthly',
        mess_included: initialData.mess_included || false,
        mess_fees: initialData.mess_fees || '',
        description: initialData.description || '',
        distance: initialData.distance || '',
        occupancy: initialData.occupancy || '',
        owner_name: initialData.owner_name || '',
        contact_primary: initialData.contact_primary || '',
        contact_secondary: initialData.contact_secondary || '',
        amenities: initialData.amenities || [],
        images: initialData.images || [],
        location: initialData.location || null,
        category: initialData.category || 'Rooms/Hostel',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        // This effect ensures the form state is updated if initialData changes after the component mounts.
        setFormData({
            hostel_name: initialData.hostel_name || '',
            college: initialData.college || '',
            room_type: initialData.room_type || '',
            deposit: initialData.deposit || '',
            fees: initialData.fees || '',
            fees_period: initialData.fees_period || 'Monthly',
            mess_included: initialData.mess_included || false,
            mess_fees: initialData.mess_fees || '',
            description: initialData.description || '',
            distance: initialData.distance || '',
            occupancy: initialData.occupancy || '',
            owner_name: initialData.owner_name || '',
            contact_primary: initialData.contact_primary || '',
            contact_secondary: initialData.contact_secondary || '',
            amenities: initialData.amenities || [],
            images: initialData.images || [],
            location: initialData.location || null,
            category: initialData.category || 'Rooms/Hostel',
        });
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (type === 'checkbox') {
            if (name === 'mess_included') {
                setFormData(prev => ({ ...prev, mess_included: checked }));
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;
        setIsSubmitting(true);

        const data = new FormData();
        // Append all form data
        Object.keys(formData).forEach(key => {
            const value = formData[key];
            if (key === 'images') {
                value.forEach(file => {
                    if (file instanceof File) {
                        data.append('images', file);
                    }
                });
            } else if (key === 'amenities') {
                value.forEach(amenity => data.append('amenities', amenity));
            } else if (key === 'location' && value) {
                data.append('location', JSON.stringify(value));
            } else if (value !== null && value !== undefined) {
                data.append(key, value);
            }
        });

        if (onSubmit) {
            data.append('type', 'room'); // Add type for the update API
            await onSubmit(data);
        } else {
            data.append('formType', 'rooms'); // For the original sell API
            const toastId = toast.loading('Adding your room listing...');
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
                e.target.reset(); // Reset form on successful submission
            } catch (error) {
                toast.error(error.message, { id: toastId });
            }
        }

        setIsSubmitting(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            <div>
                <h2 className="text-2xl font-semibold text-gray-800">List a Room/Hostel</h2>
                <p className="text-gray-600">Provide details about the room or hostel you want to list.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="hostel_name" className="block text-sm font-medium text-gray-700">Hostel/Building Name</label>
                    <input type="text" name="hostel_name" id="hostel_name" required value={formData.hostel_name} onChange={handleChange} className="mt-1 block w-full rounded-md border-black text-black shadow-sm" />
                </div>
                <div>
                    <label htmlFor="college">Nearest College</label>
                    <select name="college" id="college" required value={formData.college} onChange={handleChange} className="mt-1 block w-full rounded-md border-black text-black shadow-sm">
                        <option value="" disabled>Select College</option>
                        {colleges.sort((a, b) => a.name.localeCompare(b.name)).map(c => <option key={c.short} value={c.short}>{c.name}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="room_type">Room Type</label>
                    <select name="room_type" id="room_type" required value={formData.room_type} onChange={handleChange} className="mt-1 block w-full rounded-md border-black text-black shadow-sm">
                        <option value="" disabled>Select Room Type</option>
                        {roomTypes.map(rt => <option key={rt} value={rt}>{rt}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="fees">Fees (₹)</label>
                    <div className="flex">
                        <input type="number" name="fees" id="fees" required value={formData.fees} onChange={handleChange} className="mt-1 block w-full rounded-l-md border-black text-black shadow-sm" />
                        <select name="fees_period" value={formData.fees_period} onChange={handleChange} className="mt-1 block rounded-r-md border-black text-black border-l-0 shadow-sm bg-gray-50">
                            <option>Monthly</option>
                            <option>Yearly</option>
                        </select>
                    </div>
                </div>
                <div>
                    <label htmlFor="deposit">Deposit Amount (₹)</label>
                    <input type="number" name="deposit" id="deposit" required value={formData.deposit} onChange={handleChange} className="mt-1 block w-full rounded-md border-black text-black shadow-sm" />
                </div>
                <div>
                    <label htmlFor="distance">Distance from College</label>
                    <input type="text" name="distance" id="distance" placeholder="e.g., 500m, 1km" value={formData.distance} onChange={handleChange} className="mt-1 block w-full rounded-md border-black text-black shadow-sm" />
                </div>
                <div>
                    <label htmlFor="occupancy">Occupancy</label>
                    <input type="text" name="occupancy" id="occupancy" placeholder="e.g., Single, 2 people" value={formData.occupancy} onChange={handleChange} className="mt-1 block w-full rounded-md border-black text-black shadow-sm" />
                </div>
            </div>

            <div>
                <div className="flex items-center">
                    <input type="checkbox" name="mess_included" id="mess_included" checked={formData.mess_included} onChange={handleChange} className="h-4 w-4 text-blue-600 border-black rounded" />
                    <label htmlFor="mess_included" className="ml-2 block text-sm text-gray-900">Mess Fees Included</label>
                </div>
                {!formData.mess_included && (
                    <div className="mt-4">
                        <label htmlFor="mess_fees">Mess Fees (₹ per month)</label>
                        <input type="number" name="mess_fees" id="mess_fees" value={formData.mess_fees} onChange={handleChange} className="mt-1 block w-full rounded-md border-black text-black shadow-sm" />
                    </div>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Amenities</label>
                <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4">
                    {amenitiesList.map(amenity => (
                        <div key={amenity} className="flex items-center">
                            <input type="checkbox" id={amenity} name="amenities" value={amenity} checked={formData.amenities.includes(amenity)} onChange={handleChange} className="h-4 w-4 text-blue-600 border-black rounded" />
                            <label htmlFor={amenity} className="ml-2 block text-sm text-gray-900">{amenity}</label>
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="owner_name">Owner Name</label>
                    <input type="text" name="owner_name" id="owner_name" required value={formData.owner_name} onChange={handleChange} className="mt-1 block w-full rounded-md border-black text-black shadow-sm" />
                </div>
                <div>
                    <label htmlFor="contact_primary">Contact Number</label>
                    <input type="tel" name="contact_primary" id="contact_primary" required value={formData.contact_primary} onChange={handleChange} className="mt-1 block w-full rounded-md border-black text-black shadow-sm" />
                </div>
                <div>
                    <label htmlFor="contact_secondary">Secondary Contact (Optional)</label>
                    <input type="tel" name="contact_secondary" id="contact_secondary" value={formData.contact_secondary} onChange={handleChange} className="mt-1 block w-full rounded-md border-black text-black shadow-sm" />
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
                <textarea name="description" id="description" rows="4" value={formData.description} onChange={handleChange} className="mt-1 block w-full rounded-md border-black text-black shadow-sm"></textarea>
            </div>

            <div className="flex justify-end">
                <button type="submit" disabled={isSubmitting} className="bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 transition duration-300 disabled:bg-gray-400">
                    {isSubmitting ? 'Submitting...' : (initialData.id ? 'Update Room' : 'List Room')}
                </button>
            </div>
        </form>
    );
}
