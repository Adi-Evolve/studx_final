'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
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
    const router = useRouter();
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
        // Only update form data if initialData actually has meaningful data
        // This prevents resetting the form when initialData is just an empty object
        const hasInitialData = Object.keys(initialData).length > 0 && 
                              Object.values(initialData).some(value => 
                                  value !== null && value !== undefined && value !== ''
                              );
        
        if (hasInitialData) {
            // console.log('RoomsForm: Updating form data with initialData:', initialData);
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
        } else {
            // console.log('RoomsForm: No meaningful initialData, keeping current form state');
        }
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        // console.log('RoomsForm handleChange:', { name, value, type, checked }); // Debug log
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

    const handleImagesChange = useCallback((files) => {
        setFormData(prev => ({ ...prev, images: files }));
    }, []);

    const handleLocationChange = useCallback((location) => {
        // console.log('RoomsForm: handleLocationChange called with:', location);
        // console.log('RoomsForm: location type:', typeof location);
        // console.log('RoomsForm: location.lat:', location?.lat, 'type:', typeof location?.lat);
        // console.log('RoomsForm: location.lng:', location?.lng, 'type:', typeof location?.lng);
        
        // Validate that location has valid lat/lng
        if (location && typeof location.lat === 'number' && typeof location.lng === 'number') {
            setFormData(prev => ({ ...prev, location }));
            // console.log('RoomsForm: Location successfully updated');
        } else {
            // console.error('RoomsForm: Invalid location data received:', location);
        }
    }, []);

    const handleSubmit = async (e) => {
        // console.log('=== SUBMIT BUTTON CLICKED ===');
        e.preventDefault();
        // console.log('Form submission prevented default behavior');
        // console.log('Current isSubmitting state:', isSubmitting);
        // console.log('Current form data location:', formData.location);
        
        if (isSubmitting) {
            // console.log('⚠️ Already submitting, returning early');
            return;
        }

        // Validate location before submission
        if (!formData.location || !formData.location.lat || !formData.location.lng) {
            // console.log('❌ Location validation failed:', formData.location);
            toast.error('Please select a location on the map');
            return;
        }
        
        // console.log('✅ Location validation passed');
        // console.log('✅ Proceeding with form submission');
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
                    // Handle specific error codes
                    if (result.code === 'NOT_AUTHENTICATED') {
                        toast.error('Please log in to list your room');
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
                toast.success('Room listed successfully! Redirecting to homepage...', { 
                    id: toastId,
                    duration: 3000 
                });
                
                // Reset form on successful submission
                setFormData({
                    hostel_name: '',
                    college: '',
                    room_type: '',
                    deposit: '',
                    fees: '',
                    fees_period: 'Monthly',
                    mess_included: false,
                    mess_fees: '',
                    description: '',
                    distance: '',
                    occupancy: '',
                    owner_name: '',
                    contact_primary: '',
                    contact_secondary: '',
                    amenities: [],
                    images: [],
                    location: null,
                    category: 'Rooms/Hostel',
                });
                
                // Redirect to homepage after successful submission
                setTimeout(() => {
                    router.push('/');
                }, 2000); // Wait 2 seconds to show the success message
            } catch (error) {
                // console.error('Room submission error:', error);
                toast.error(error.message, { id: toastId });
            }
        }

        setIsSubmitting(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            <div>
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">List a Room/Hostel</h2>
                <p className="text-gray-600 dark:text-gray-400">Provide details about the room or hostel you want to list.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="hostel_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Hostel/Building Name</label>
                    <input 
                        type="text" 
                        name="hostel_name" 
                        id="hostel_name" 
                        required 
                        value={formData.hostel_name} 
                        onChange={handleChange} 
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-black dark:text-white bg-white dark:bg-gray-800 focus:outline-none focus:ring-blue-500 focus:border-blue-500" 
                    />
                </div>
                <div>
                    <label htmlFor="college" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nearest College</label>
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
                    <label htmlFor="room_type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Room Type</label>
                    <select 
                        name="room_type" 
                        id="room_type" 
                        required 
                        value={formData.room_type} 
                        onChange={handleChange} 
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-black dark:text-white bg-white dark:bg-gray-800 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="" disabled>Select Room Type</option>
                        {roomTypes.map(rt => <option key={rt} value={rt}>{rt}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="fees" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Fees (₹)</label>
                    <div className="flex">
                        <input 
                            type="number" 
                            name="fees" 
                            id="fees" 
                            required 
                            value={formData.fees} 
                            onChange={handleChange} 
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-l-md shadow-sm text-black dark:text-white bg-white dark:bg-gray-800 focus:outline-none focus:ring-blue-500 focus:border-blue-500" 
                        />
                        <select 
                            name="fees_period" 
                            value={formData.fees_period} 
                            onChange={handleChange} 
                            className="mt-1 block px-3 py-2 border border-gray-300 dark:border-gray-600 border-l-0 rounded-r-md shadow-sm text-black dark:text-white bg-white dark:bg-gray-800 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option>Monthly</option>
                            <option>Yearly</option>
                        </select>
                    </div>
                </div>
                <div>
                    <label htmlFor="deposit" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Deposit Amount (₹)</label>
                    <input 
                        type="number" 
                        name="deposit" 
                        id="deposit" 
                        required 
                        value={formData.deposit} 
                        onChange={handleChange} 
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-black dark:text-white bg-white dark:bg-gray-800 focus:outline-none focus:ring-blue-500 focus:border-blue-500" 
                    />
                </div>
                <div>
                    <label htmlFor="distance" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Distance from College</label>
                    <input 
                        type="text" 
                        name="distance" 
                        id="distance" 
                        placeholder="e.g., 500m, 1km" 
                        value={formData.distance} 
                        onChange={handleChange} 
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-black dark:text-white bg-white dark:bg-gray-800 focus:outline-none focus:ring-blue-500 focus:border-blue-500" 
                    />
                </div>
                <div>
                    <label htmlFor="occupancy" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Occupancy</label>
                    <input 
                        type="text" 
                        name="occupancy" 
                        id="occupancy" 
                        placeholder="e.g., Single, 2 people" 
                        value={formData.occupancy} 
                        onChange={handleChange} 
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-black dark:text-white bg-white dark:bg-gray-800 focus:outline-none focus:ring-blue-500 focus:border-blue-500" 
                    />
                </div>
            </div>

            <div>
                <div className="flex items-center">
                    <input 
                        type="checkbox" 
                        name="mess_included" 
                        id="mess_included" 
                        checked={formData.mess_included} 
                        onChange={handleChange} 
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" 
                    />
                    <label htmlFor="mess_included" className="ml-2 block text-sm text-gray-900 dark:text-gray-100">Mess Fees Included</label>
                </div>
                {!formData.mess_included && (
                    <div className="mt-4">
                        <label htmlFor="mess_fees" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Mess Fees (₹ per month)</label>
                        <input 
                            type="number" 
                            name="mess_fees" 
                            id="mess_fees" 
                            value={formData.mess_fees} 
                            onChange={handleChange} 
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-black dark:text-white bg-white dark:bg-gray-800 focus:outline-none focus:ring-blue-500 focus:border-blue-500" 
                        />
                    </div>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Amenities</label>
                <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4">
                    {amenitiesList.map(amenity => (
                        <div key={amenity} className="flex items-center">
                            <input 
                                type="checkbox" 
                                id={amenity} 
                                name="amenities" 
                                value={amenity} 
                                checked={formData.amenities.includes(amenity)} 
                                onChange={handleChange} 
                                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" 
                            />
                            <label htmlFor={amenity} className="ml-2 block text-sm text-gray-900 dark:text-gray-100">{amenity}</label>
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="owner_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Owner Name</label>
                    <input 
                        type="text" 
                        name="owner_name" 
                        id="owner_name" 
                        required 
                        value={formData.owner_name} 
                        onChange={handleChange} 
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-black dark:text-white bg-white dark:bg-gray-800 focus:outline-none focus:ring-blue-500 focus:border-blue-500" 
                    />
                </div>
                <div>
                    <label htmlFor="contact_primary" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Contact Number</label>
                    <input 
                        type="tel" 
                        name="contact_primary" 
                        id="contact_primary" 
                        required 
                        value={formData.contact_primary} 
                        onChange={handleChange} 
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-black dark:text-white bg-white dark:bg-gray-800 focus:outline-none focus:ring-blue-500 focus:border-blue-500" 
                    />
                </div>
                <div>
                    <label htmlFor="contact_secondary" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Secondary Contact (Optional)</label>
                    <input 
                        type="tel" 
                        name="contact_secondary" 
                        id="contact_secondary" 
                        value={formData.contact_secondary} 
                        onChange={handleChange} 
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-black dark:text-white bg-white dark:bg-gray-800 focus:outline-none focus:ring-blue-500 focus:border-blue-500" 
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Upload Images (up to 10)</label>
                <ImageUpload onFilesChange={handleImagesChange} maxFiles={10} />
            </div>

            <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Set Location</label>
                {formData.location && typeof formData.location.lat === 'number' && typeof formData.location.lng === 'number' ? (
                    <div className="mb-2 p-2 bg-green-100 dark:bg-green-900 border border-green-300 dark:border-green-600 rounded text-sm text-green-700 dark:text-green-300">
                        ✓ Location selected: {formData.location.lat.toFixed(4)}, {formData.location.lng.toFixed(4)}
                    </div>
                ) : (
                    <div className="mb-2 p-2 bg-yellow-100 dark:bg-yellow-900 border border-yellow-300 dark:border-yellow-600 rounded text-sm text-yellow-700 dark:text-yellow-300">
                        ⚠ Please click on the map to set a location
                        {formData.location && (
                            <div className="text-xs mt-1">
                                Debug: {JSON.stringify(formData.location)}
                            </div>
                        )}
                    </div>
                )}
                <div className="mb-6">
                    <MapPicker onLocationChange={handleLocationChange} initialPosition={formData.location} />
                </div>
            </div>

            <div className="mt-8">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                <textarea 
                    name="description" 
                    id="description" 
                    rows="4" 
                    value={formData.description} 
                    onChange={handleChange} 
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-black dark:text-white bg-white dark:bg-gray-800 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Describe your room/hostel in detail..."
                ></textarea>
            </div>

            <div className="flex justify-end">
                <button type="submit" disabled={isSubmitting} className="bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 transition duration-300 disabled:bg-gray-400">
                    {isSubmitting ? 'Submitting...' : (initialData.id ? 'Update Room' : 'List Room')}
                </button>
            </div>
        </form>
    );
}
