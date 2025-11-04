'use client'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import ImageUploadWithOptimization from '../ImageUploadWithOptimization';
import dynamic from 'next/dynamic';
import { colleges } from '../../lib/colleges';
import toast from 'react-hot-toast';

// Dynamically import the GoogleMapPicker to avoid SSR issues
const GoogleMapPicker = dynamic(() => import('../GoogleMapPicker'), { 
    ssr: false,
    loading: () => <div className="h-96 w-full bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">Loading map...</div>
});

// Rental-specific data
const conditions = ['New', 'Used', 'Refurbished'];
const rentalDurations = [
    { value: 'hourly', label: 'Per Hour', minPeriod: 1 },
    { value: 'daily', label: 'Per Day', minPeriod: 1 },
    { value: 'weekly', label: 'Per Week', minPeriod: 1 },
    { value: 'monthly', label: 'Per Month', minPeriod: 1 }
];

export default function RentalProductForm({ initialData = {}, onSubmit, category = '' }) {
    const router = useRouter();
    const supabase = createSupabaseBrowserClient();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [authLoading, setAuthLoading] = useState(true);
    
    const [formData, setFormData] = useState({
        title: initialData.title || '',
        college: initialData.college || '',
        rental_price: initialData.rental_price || '',
        security_deposit: initialData.security_deposit || '0',
        condition: initialData.condition || '',
        rental_duration: initialData.rental_duration || 'daily',
        min_rental_period: initialData.min_rental_period || '1',
        max_rental_period: initialData.max_rental_period || '',
        description: initialData.description || '',
        rental_terms: initialData.rental_terms || '',
        images: initialData.images || [],
        location: initialData.location ? (typeof initialData.location === 'string' ? JSON.parse(initialData.location) : initialData.location) : null,
        category: category || initialData.category || '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImagesChange = (files) => {
        console.log('📸 handleImagesChange called with:', {
            filesCount: files?.length || 0,
            files: files?.map(f => ({
                name: f?.name,
                size: f?.size,
                type: f?.type,
                isFile: f instanceof File
            }))
        });
        setFormData(prev => ({ ...prev, images: files }));
    };

    const handleLocationChange = (location) => {
        setFormData(prev => ({ ...prev, location }));
    };

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Check authentication status
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const { data: { session }, error } = await supabase.auth.getSession();
                
                if (error) {
                    setIsAuthenticated(false);
                    setAuthLoading(false);
                    return;
                }

                if (session?.user?.email) {
                    setIsAuthenticated(true);
                    
                    // Auto-fill form data from user profile if available
                    if (session.user.user_metadata?.college) {
                        setFormData(prev => ({
                            ...prev,
                            college: prev.college || session.user.user_metadata.college
                        }));
                    }
                } else {
                    setIsAuthenticated(false);
                }
                
                setAuthLoading(false);
            } catch (authError) {
                setIsAuthenticated(false);
                setAuthLoading(false);
            }
        };

        checkAuth();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' && session?.user?.email) {
                setIsAuthenticated(true);
            } else if (event === 'SIGNED_OUT') {
                setIsAuthenticated(false);
            }
            setAuthLoading(false);
        });

        return () => subscription.unsubscribe();
    }, [supabase]);

    // Validation function
    const validateForm = () => {
        const requiredFields = ['title', 'college', 'rental_price', 'condition', 'rental_duration'];
        for (const field of requiredFields) {
            if (!formData[field] || formData[field].toString().trim() === '') {
                return `Please fill in the ${field.replace('_', ' ')} field.`;
            }
        }

        // Image validation - require at least 1 image
        if (!formData.images || formData.images.length === 0) {
            return 'Please upload at least 1 image of your rental item.';
        }

        if (parseFloat(formData.rental_price) <= 0) {
            return 'Rental price must be greater than 0.';
        }

        if (formData.security_deposit && parseFloat(formData.security_deposit) < 0) {
            return 'Security deposit cannot be negative.';
        }

        if (formData.min_rental_period && parseInt(formData.min_rental_period) <= 0) {
            return 'Minimum rental period must be greater than 0.';
        }

        if (formData.images.length === 0) {
            return 'Please add at least one image of your item.';
        }

        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const validationError = validateForm();
        if (validationError) {
            toast.error(validationError);
            return;
        }

        setIsSubmitting(true);

        try {
            // Create FormData object
            const formDataToSend = new FormData();
            
            // Add all form fields
            formDataToSend.append('title', formData.title);
            formDataToSend.append('college', formData.college);
            formDataToSend.append('rental_price', formData.rental_price);
            formDataToSend.append('security_deposit', formData.security_deposit || '0');
            formDataToSend.append('condition', formData.condition);
            formDataToSend.append('rental_duration', formData.rental_duration);
            formDataToSend.append('min_rental_period', formData.min_rental_period || '1');
            formDataToSend.append('max_rental_period', formData.max_rental_period || '');
            formDataToSend.append('description', formData.description);
            formDataToSend.append('rental_terms', formData.rental_terms);
            formDataToSend.append('category', formData.category);
            formDataToSend.append('location', JSON.stringify(formData.location));

            // Add images - ensure they're File objects
            console.log('Adding images to form:', formData.images);
            let imageCount = 0;
            formData.images.forEach((image, index) => {
                console.log(`Image ${index}:`, typeof image, image);
                if (image instanceof File) {
                    formDataToSend.append('images', image);
                    imageCount++;
                    console.log(`✅ Added image ${index} to FormData:`, image.name);
                } else {
                    console.warn(`❌ Image ${index} is not a File object:`, image);
                }
            });
            
            console.log(`📊 Total images added to FormData: ${imageCount}`);
            
            // Debug: Log all FormData entries
            console.log('📋 FormData entries:');
            for (let [key, value] of formDataToSend.entries()) {
                if (key === 'images') {
                    console.log(`  ${key}: File(${value.name}, ${value.size} bytes)`);
                } else {
                    console.log(`  ${key}: ${value}`);
                }
            }

            // Submit to API with authentication
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();
            console.log('Session status:', { session: !!session, sessionError, accessToken: !!session?.access_token });
            
            if (session?.access_token) {
                // Log first and last 10 characters of token for debugging
                const token = session.access_token;
                console.log('Token details:', {
                    length: token.length,
                    start: token.substring(0, 10),
                    end: token.substring(token.length - 10),
                    userId: session.user?.id
                });
            }
            
            if (!session || !session.access_token) {
                toast.error('Please log in to create a rental listing');
                setIsSubmitting(false);
                return;
            }

            const headers = {
                'Authorization': `Bearer ${session.access_token}`
            };

            const response = await fetch('/api/rent', {
                method: 'POST',
                body: formDataToSend,
                headers
            });

            console.log('API Response:', { status: response.status, statusText: response.statusText });
            const result = await response.json();
            console.log('API Result:', result);

            if (response.ok) {
                console.log('✅ Rental created successfully');
                
                // Show appropriate success message
                if (result.serviceIssue) {
                    toast.success('Rental listing created! Images are temporarily using placeholders due to service issues. You can update images later.', {
                        duration: 6000,
                    });
                } else {
                    toast.success('Rental listing created successfully!', {
                        duration: 4000,
                    });
                }
                
                // Reset form
                setFormData({
                    title: '',
                    college: '',
                    rental_price: '',
                    security_deposit: '0',
                    condition: '',
                    rental_duration: 'daily',
                    min_rental_period: '1',
                    max_rental_period: '',
                    description: '',
                    rental_terms: '',
                    images: [],
                    location: null,
                    category: category || '',
                });
                
                // Navigate to success page or rental listing
                router.push('/profile?tab=rental');
                
            } else {
                toast.error(result.error || 'Failed to create rental listing');
            }
        } catch (error) {
            console.error('Error submitting rental form:', error);
            toast.error('An error occurred while creating your rental listing. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Loading states
    if (authLoading) {
        return (
            <div className="flex-grow container mx-auto px-4 py-12 min-h-screen bg-gray-50 dark:bg-gray-900">
                <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
                    <div className="animate-pulse">
                        <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-1/3 mb-4"></div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
                        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="flex-grow container mx-auto px-4 py-12 min-h-screen bg-gray-50 dark:bg-gray-900">
                <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg text-center">
                    <div className="text-6xl mb-4">🔐</div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Authentication Required</h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">Please sign in to create a rental listing.</p>
                    <button 
                        onClick={() => router.push('/login')}
                        className="bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors"
                    >
                        Sign In
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-grow container mx-auto px-4 py-12 min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Create Rental Listing
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300">
                        Fill in the details to list your {category} for rent
                    </p>
                    <div className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                        <p className="text-sm text-emerald-700 dark:text-emerald-400">
                            💡 <strong>Tip:</strong> Add detailed photos and clear rental terms to attract more renters
                        </p>
                    </div>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Title */}
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Item Title *
                        </label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                            placeholder="e.g., MacBook Pro 16-inch for rent"
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-gray-700 dark:text-white"
                        />
                    </div>

                    {/* College */}
                    <div>
                        <label htmlFor="college" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            College/Location *
                        </label>
                        <select
                            id="college"
                            name="college"
                            value={formData.college}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-gray-700 dark:text-white"
                        >
                            <option value="">Select your college</option>
                            {colleges.sort((a, b) => a.name.localeCompare(b.name)).map((college) => (
                                <option key={college.short} value={college.name}>{college.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Pricing Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="rental_price" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Rental Price (₹) *
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                                <input
                                    type="number"
                                    id="rental_price"
                                    name="rental_price"
                                    value={formData.rental_price}
                                    onChange={handleChange}
                                    required
                                    min="1"
                                    step="0.01"
                                    placeholder="100"
                                    className="w-full pl-8 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-gray-700 dark:text-white"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="rental_duration" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Rental Duration *
                            </label>
                            <select
                                id="rental_duration"
                                name="rental_duration"
                                value={formData.rental_duration}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-gray-700 dark:text-white"
                            >
                                {rentalDurations.map((duration) => (
                                    <option key={duration.value} value={duration.value}>
                                        {duration.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Security Deposit and Rental Periods */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label htmlFor="security_deposit" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Security Deposit (₹)
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                                <input
                                    type="number"
                                    id="security_deposit"
                                    name="security_deposit"
                                    value={formData.security_deposit}
                                    onChange={handleChange}
                                    min="0"
                                    step="0.01"
                                    placeholder="0"
                                    className="w-full pl-8 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-gray-700 dark:text-white"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="min_rental_period" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Min Period
                            </label>
                            <input
                                type="number"
                                id="min_rental_period"
                                name="min_rental_period"
                                value={formData.min_rental_period}
                                onChange={handleChange}
                                min="1"
                                placeholder="1"
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-gray-700 dark:text-white"
                            />
                        </div>

                        <div>
                            <label htmlFor="max_rental_period" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Max Period (Optional)
                            </label>
                            <input
                                type="number"
                                id="max_rental_period"
                                name="max_rental_period"
                                value={formData.max_rental_period}
                                onChange={handleChange}
                                min="1"
                                placeholder="No limit"
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-gray-700 dark:text-white"
                            />
                        </div>
                    </div>

                    {/* Condition */}
                    <div>
                        <label htmlFor="condition" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Condition *
                        </label>
                        <select
                            id="condition"
                            name="condition"
                            value={formData.condition}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-gray-700 dark:text-white"
                        >
                            <option value="">Select condition</option>
                            {conditions.map((condition) => (
                                <option key={condition} value={condition}>{condition}</option>
                            ))}
                        </select>
                    </div>

                    {/* Description */}
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Description
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="4"
                            placeholder="Describe your item, its features, and any important details renters should know..."
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-gray-700 dark:text-white resize-vertical"
                        />
                    </div>

                    {/* Rental Terms */}
                    <div>
                        <label htmlFor="rental_terms" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Rental Terms & Conditions
                        </label>
                        <textarea
                            id="rental_terms"
                            name="rental_terms"
                            value={formData.rental_terms}
                            onChange={handleChange}
                            rows="3"
                            placeholder="e.g., No damage policy, return in same condition, late fees, etc..."
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-gray-700 dark:text-white resize-vertical"
                        />
                    </div>

                    {/* Images */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Images *
                        </label>
                        <ImageUploadWithOptimization 
                            onImagesOptimized={handleImagesChange}
                            existingImages={[]} 
                            maxImages={5}
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                            Add up to 5 high-quality images. First image will be the main display image.
                        </p>
                    </div>

                    {/* Location */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Location (Optional)
                        </label>
                        <div className="h-64 border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                            <GoogleMapPicker onLocationChange={handleLocationChange} initialLocation={formData.location} />
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                            Pin your exact location to help renters find you easily
                        </p>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-6">
                        <button 
                            type="submit" 
                            disabled={isSubmitting} 
                            className="w-full bg-emerald-600 text-white font-bold py-4 px-8 rounded-lg hover:bg-emerald-700 transition duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                                    Creating Rental Listing...
                                </>
                            ) : (
                                'Create Rental Listing'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
