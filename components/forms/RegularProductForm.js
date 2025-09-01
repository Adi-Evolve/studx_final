'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import ImageUploadWithOptimization from '../ImageUploadWithOptimization';
import dynamic from 'next/dynamic';
import { colleges } from '../../lib/colleges';
import { getAvailableCategories, getUserPrivileges, isPrivilegedUser } from '../../lib/privilegedUsers';
import toast from 'react-hot-toast';

// Dynamically import the MapPicker to avoid SSR issues with Leaflet
const MapPicker = dynamic(() => import('../MapPicker'), { 
    ssr: false,
    loading: () => <div className="animate-pulse bg-gray-200 rounded-lg h-64 flex items-center justify-center">Loading map...</div>
});

// Placeholder data - in a real app, this would come from a database
const conditions = ['New', 'Used', 'Refurbished'];
const baseCategories = ['Laptops', 'Project Equipment', 'Books', 'Cycle/Bike', 'Hostel Equipment', 'Notes', 'Rooms/Hostel', 'Furniture', 'Assignments/Projects', 'Others'];

export default function RegularProductForm({ initialData = {}, onSubmit, category = '' }) {
    const router = useRouter();
    const supabase = createSupabaseBrowserClient();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [authLoading, setAuthLoading] = useState(true);
    const [userEmail, setUserEmail] = useState('');
    const [availableCategories, setAvailableCategories] = useState(baseCategories);
    const [userPrivileges, setUserPrivileges] = useState(null);
    
    const [formData, setFormData] = useState({
        title: initialData.title || '',
        college: initialData.college || '',
        price: initialData.price || '',
        condition: initialData.condition || '',
        description: initialData.description || '',
        images: initialData.images || [],
        location: initialData.location ? (typeof initialData.location === 'string' ? JSON.parse(initialData.location) : initialData.location) : null,
        category: category || initialData.category || '',
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

    // Check authentication status
    useEffect(() => {
        const checkAuth = async () => {
            // console.log('🔍 [ProductForm] Checking authentication...');
            try {
                const { data: { session }, error } = await supabase.auth.getSession();
                
                if (error) {
                    // console.error('❌ [ProductForm] Auth error:', error);
                    setIsAuthenticated(false);
                    setAuthLoading(false);
                    return;
                }
                
                // console.log('🔍 [ProductForm] Session data:', {
                //     hasSession: !!session,
                //     hasUser: !!session?.user,
                //     userEmail: session?.user?.email,
                //     userId: session?.user?.id
                // });

                // Only check for email presence in auth
                if (session?.user?.email) {
                    setIsAuthenticated(true);
                    setUserEmail(session.user.email);
                    
                    // Set available categories based on user privileges
                    const categories = getAvailableCategories(session.user.email);
                    setAvailableCategories(categories);
                    
                    // Set user privileges
                    const privileges = getUserPrivileges(session.user.email);
                    setUserPrivileges(privileges);
                    
                    // console.log('✅ [ProductForm] User authenticated with email:', session.user.email);
                    // console.log('📋 [ProductForm] Available categories:', categories);
                    // console.log('🔑 [ProductForm] User privileges:', privileges);
                    
                    // Auto-fill form data from user profile if available
                    if (session.user.user_metadata?.college) {
                        setFormData(prev => ({
                            ...prev,
                            college: prev.college || session.user.user_metadata.college
                        }));
                    }
                } else {
                    // console.log('❌ [ProductForm] No email found in session');
                    setIsAuthenticated(false);
                    setUserEmail('');
                    setAvailableCategories(baseCategories);
                    setUserPrivileges(null);
                }
                
                setAuthLoading(false);
            } catch (authError) {
                // console.error('❌ [ProductForm] Auth check exception:', authError);
                setIsAuthenticated(false);
                setAuthLoading(false);
            }
        };

        checkAuth();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            // console.log('🔄 [ProductForm] Auth state changed:', event, !!session?.user?.email);
            if (session?.user?.email) {
                setIsAuthenticated(true);
                setUserEmail(session.user.email);
                
                // Update available categories based on user privileges
                const categories = getAvailableCategories(session.user.email);
                setAvailableCategories(categories);
                
                // Update user privileges
                const privileges = getUserPrivileges(session.user.email);
                setUserPrivileges(privileges);
            } else {
                setIsAuthenticated(false);
                setUserEmail('');
                setAvailableCategories(baseCategories);
                setUserPrivileges(null);
            }
        });

        return () => subscription.unsubscribe();
    }, [supabase.auth]);

    // Load user profile data to prefill form
    useEffect(() => {
        const loadUserProfile = async () => {
            if (!isAuthenticated) return;
            
            try {
                const { data: { session }, error } = await supabase.auth.getSession();
                if (session?.user?.email) {
                    // Fetch user profile from users table
                    const { data: profile, error: profileError } = await supabase
                        .from('users')
                        .select('college, phone, name')
                        .eq('email', session.user.email)
                        .single();
                    
                    if (profile && !profileError) {
                        // Prefill college if user has it in their profile
                        if (profile.college && !formData.college) {
                            setFormData(prev => ({ 
                                ...prev, 
                                college: profile.college 
                            }));
                        }
                    }
                }
            } catch (error) {
                // console.log('ℹ️ [ProductForm] Could not load user profile:', error);
            }
        };

        if (isAuthenticated && !authLoading) {
            loadUserProfile();
        }
    }, [isAuthenticated, authLoading, formData.college, supabase]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;

        // console.log('📦 [ProductForm] Starting submission...');

        // ============================================================================
        // 1. ENHANCED EMAIL-BASED AUTHENTICATION CHECK
        // ============================================================================
        
        if (!isAuthenticated) {
            // console.log('❌ [ProductForm] Not authenticated, redirecting to login');
            toast.error('Please log in to submit your product listing');
            router.push('/login');
            return;
        }

        // Get current session and verify email
        let currentUser = null;
        try {
            const { data: { session }, error } = await supabase.auth.getSession();
            
            if (error) {
                // console.error('❌ [ProductForm] Session error:', error);
                toast.error('Authentication error. Please try logging in again.');
                return;
            }

            // console.log('🔍 [ProductForm] Session check:', {
            //     hasSession: !!session,
            //     hasUser: !!session?.user,
            //     userEmail: session?.user?.email,
            //     userId: session?.user?.id
            // });
            
            if (!session?.user?.email) {
                // console.log('❌ [ProductForm] No email found in session');
                toast.error('Invalid authentication. Please log in with a valid email.');
                router.push('/login');
                return;
            }

            // Fetch current user data to include phone number
            let userProfile = null;
            try {
                const { data: profile } = await supabase
                    .from('users')
                    .select('phone')
                    .eq('id', session.user.id)
                    .single();
                userProfile = profile;
            } catch (err) {
                // console.log('ℹ️ [ProductForm] Could not fetch user profile phone:', err);
            }
            
            currentUser = {
                id: session.user.id,
                email: session.user.email,
                name: session.user.user_metadata?.name || session.user.user_metadata?.full_name || session.user.email.split('@')[0],
                avatar_url: session.user.user_metadata?.avatar_url,
                college: formData.college,
                phone: userProfile?.phone || null // Include phone to preserve it in API upsert
            };

            // console.log('✅ [ProductForm] User data prepared:', currentUser);
        } catch (sessionError) {
            // console.error('❌ [ProductForm] Session check failed:', sessionError);
            toast.error('Failed to verify authentication. Please try again.');
            return;
        }

        // ============================================================================
        // 2. FORM VALIDATION
        // ============================================================================
        
        if (!formData.title || !formData.price || !formData.college || !formData.category || !formData.condition) {
            toast.error('Please fill in all required fields');
            return;
        }

        if (isNaN(parseFloat(formData.price)) || parseFloat(formData.price) <= 0) {
            toast.error('Please enter a valid price');
            return;
        }

        if (!formData.location || !formData.location.lat || !formData.location.lng) {
            toast.error('Please select a location on the map');
            return;
        }

        // console.log('✅ [ProductForm] Form validation passed');
        setIsSubmitting(true);

        const toastId = toast.loading('Adding your product listing...');

        try {
            // ============================================================================
            // 3. PREPARE SUBMISSION DATA
            // ============================================================================
            
            const submissionData = {
                type: 'product',
                user: currentUser,
                title: formData.title,
                description: formData.description,
                price: parseFloat(formData.price),
                category: formData.category,
                condition: formData.condition,
                college: formData.college,
                location: formData.location,
                images: formData.images || []
            };

            // console.log('📤 [ProductForm] Sending to API:', JSON.stringify(submissionData, null, 2));

            // ============================================================================
            // 4. SUBMIT TO API
            // ============================================================================
            
            // Create FormData to handle File uploads
            const formDataToSend = new FormData();
            
            // Add basic data
            formDataToSend.append('type', 'product');
            formDataToSend.append('user', JSON.stringify(currentUser));
            formDataToSend.append('title', formData.title);
            formDataToSend.append('description', formData.description);
            formDataToSend.append('price', parseFloat(formData.price));
            formDataToSend.append('category', formData.category);
            formDataToSend.append('condition', formData.condition);
            formDataToSend.append('college', formData.college);
            
            if (formData.location) {
                formDataToSend.append('location', JSON.stringify(formData.location));
            }
            
            // Add images as File objects
            if (formData.images && formData.images.length > 0) {
                formData.images.forEach((image, index) => {
                    formDataToSend.append(`images`, image);
                });
            }

            // console.log('📤 [ProductForm] Sending FormData to API with', formData.images?.length || 0, 'images');

            const response = await fetch('/api/sell', {
                method: 'POST',
                body: formDataToSend, // Send FormData instead of JSON
            });

            const result = await response.json();

            // console.log('📥 [ProductForm] API response:', {
            //     status: response.status,
            //     ok: response.ok,
            //     result: result
            // });

            if (!response.ok) {
                // console.error('❌ [ProductForm] API error:', result);
                
                // Handle specific error codes
                if (result.code === 'AUTH_MISSING_EMAIL' || result.code === 'AUTH_EMAIL_NOT_FOUND') {
                    toast.error('Authentication required. Please sign in first.');
                    router.push('/login');
                    return;
                }
                
                if (result.code === 'AUTH_EMAIL_UNREGISTERED') {
                    toast.error('Email not registered. Please create an account first.');
                    router.push('/signup');
                    return;
                }
                
                if (result.code === 'DATABASE_RLS_ERROR') {
                    toast.error('Database security error. Please contact support.');
                    return;
                }
                
                // Generic error message
                toast.error(result.error || 'Failed to submit product listing. Please try again.');
                return;
            }

            // ============================================================================
            // 5. SUCCESS HANDLING
            // ============================================================================
            
            // console.log('✅ [ProductForm] Product listing submitted successfully:', result.data);
            
            // Show success message
            toast.success(
                `🎉 ${result.message || 'Product listing submitted successfully!'}\nYour ${result.data?.title || 'product'} is now live!`,
                {
                    duration: 4000,
                    style: {
                        background: '#10b981',
                        color: '#ffffff',
                        fontWeight: '500',
                    },
                }
            );
            
            // Reset form
            setFormData({
                title: '',
                college: formData.college, // Keep college for next submission
                price: '',
                condition: '',
                description: '',
                images: [],
                location: null,
                category: '',
            });

            // Redirect to homepage after showing success message
            setTimeout(() => {
                router.push('/');
            }, 2000);

        } catch (fetchError) {
            // console.error('❌ [ProductForm] Fetch error:', fetchError);
            toast.error('Network error. Please check your connection and try again.');
        } finally {
            setIsSubmitting(false);
            toast.dismiss(toastId);
        }
    };

    // Show loading state while checking authentication
    if (authLoading) {
        return (
            <div className="space-y-8">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-4"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-64"></div>
                </div>
                <div className="text-center py-8">
                    <div className="text-gray-600 dark:text-gray-400">Checking authentication...</div>
                </div>
            </div>
        );
    }

    // Show login prompt if not authenticated
    if (!isAuthenticated) {
        return (
            <div className="space-y-8">
                <div>
                    <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">Authentication Required</h2>
                    <p className="text-gray-600 dark:text-gray-400">Please log in to list your product.</p>
                </div>
                <div className="text-center py-8">
                    <button
                        onClick={() => router.push('/login')}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                    >
                        Log In to Continue
                    </button>
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {/* Enhanced Header for Privileged Users */}
            <div className={`${userPrivileges ? 'bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border border-purple-200 dark:border-purple-700 rounded-lg p-4' : ''}`}>
                <h2 className={`text-2xl font-semibold mb-2 ${userPrivileges ? 'text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400' : 'text-gray-800 dark:text-gray-200'}`}>
                    {userPrivileges ? `✨ Premium Seller - List Your Arduino & Electronics` : 'List a Regular Product'}
                </h2>
                {userPrivileges && (
                    <div className="flex items-center space-x-2 text-sm text-purple-600 dark:text-purple-400">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                            🔥 {userPrivileges.features.featuredBadge}
                        </span>
                        <span>Your products get priority display! Perfect for Arduino kits, sensors & electronics.</span>
                    </div>
                )}
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Title</label>
                    <input 
                        type="text" 
                        name="title" 
                        id="title" 
                        required 
                        value={formData.title} 
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-black dark:text-white bg-white dark:bg-gray-800 focus:outline-none focus:ring-blue-500 focus:border-blue-500" 
                        onChange={handleChange} 
                    />
                </div>
                <div>
                    <label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Price (₹)</label>
                    <input 
                        type="number" 
                        name="price" 
                        id="price" 
                        required 
                        value={formData.price} 
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-black dark:text-white bg-white dark:bg-gray-800 focus:outline-none focus:ring-blue-500 focus:border-blue-500" 
                        onChange={handleChange} 
                    />
                </div>
                <div>
                    <label htmlFor="college" className="block text-sm font-medium text-gray-700 dark:text-gray-300">College</label>
                    <select 
                        name="college" 
                        id="college" 
                        required 
                        value={formData.college} 
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-black dark:text-white bg-white dark:bg-gray-800 focus:outline-none focus:ring-blue-500 focus:border-blue-500" 
                        onChange={handleChange}
                    >
                        <option value="" disabled>Select College</option>
                        {colleges.sort((a, b) => a.name.localeCompare(b.name)).map(c => <option key={c.short} value={c.short}>{c.name}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Category {userPrivileges && <span className="text-purple-600 dark:text-purple-400 text-xs font-medium">(Use "Project Equipment" for Arduino & Electronics)</span>}
                    </label>
                    <select 
                        name="category" 
                        id="category" 
                        required 
                        value={formData.category} 
                        className={`mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-black dark:text-white bg-white dark:bg-gray-800 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${userPrivileges ? 'ring-2 ring-purple-200 dark:ring-purple-700' : ''}`}
                        onChange={handleChange}
                    >
                        <option value="" disabled>Select Category</option>
                        {availableCategories.map(c => (
                            <option 
                                key={c} 
                                value={c}
                                className={c === 'Project Equipment' && userPrivileges ? 'font-bold text-purple-600 bg-purple-50' : ''}
                            >
                                {c === 'Project Equipment' && userPrivileges ? '⚡ Project Equipment (Recommended for Arduino & Electronics)' : c}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="condition" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Condition</label>
                    <select 
                        name="condition" 
                        id="condition" 
                        required 
                        value={formData.condition} 
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-black dark:text-white bg-white dark:bg-gray-800 focus:outline-none focus:ring-blue-500 focus:border-blue-500" 
                        onChange={handleChange}
                    >
                        <option value="" disabled>Select Condition</option>
                        {conditions.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Upload Images (up to 5)</label>
                <ImageUploadWithOptimization 
                    onImagesOptimized={handleImagesChange} 
                    maxImages={5}
                    maxSizeInMB={10}
                    showPreview={true}
                    allowMultiple={true}
                    existingImages={initialData.images || []}
                    optimizationOptions={{
                        maxWidth: 1200,
                        maxHeight: 800,
                        quality: 0.8
                    }}
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Set Location</label>
                <MapPicker onLocationChange={handleLocationChange} initialLocation={formData.location} />
            </div>

            <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                <textarea 
                    name="description" 
                    id="description" 
                    rows="4" 
                    value={formData.description} 
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-black dark:text-white bg-white dark:bg-gray-800 focus:outline-none focus:ring-blue-500 focus:border-blue-500" 
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
