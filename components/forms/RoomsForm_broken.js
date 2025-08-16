'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import ImageUploadWithOptimization from '../ImageUploadWithOptimization';
import dynamic from 'next/dynamic';
import toast from 'react-hot-toast';
import { colleges } from '../../lib/colleges';

// Dynamically import the MapPicker to avoid SSR issues with Leaflet
const MapPicker = dynamic(() => import('../MapPicker'), { 
    ssr: false,
    loading: () => <div className="animate-pulse bg-gray-200 rounded-lg h-64 flex items-center justify-center">Loading map...</div>
});

// Placeholder data

const roomTypes = ['Single Room', 'Double Room', '1 BHK', '2 BHK', '3 BHK', 'Shared Apartment'];
const amenitiesList = ['AC', 'WiFi', 'Washing Machine', 'Furnished', 'Refrigerator', 'Parking', 'Hot Water'];
const categories = ['Laptops', 'Project Equipment', 'Books', 'Cycle/Bike', 'Hostel Equipment', 'Notes', 'Rooms/Hostel', 'Furniture', 'Others'];

export default function RoomsForm({ initialData = {}, onSubmit, category = 'Rooms/Hostel' }) {
    const router = useRouter();
    const supabase = createSupabaseBrowserClient();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [authLoading, setAuthLoading] = useState(true);
    
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
        category: category || initialData.category || 'Rooms/Hostel',
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
                category: category || initialData.category || 'Rooms/Hostel',
            });
        } else {
            // console.log('RoomsForm: No meaningful initialData, keeping current form state');
        }
    }, [initialData]);

    // Check authentication status
    useEffect(() => {
        const checkAuth = async () => {
            // console.log('🔍 [RoomsForm] Checking authentication...');
            try {
                const { data: { session }, error } = await supabase.auth.getSession();
                
                if (error) {
                    // console.error('❌ [RoomsForm] Auth error:', error);
                    setIsAuthenticated(false);
                    setAuthLoading(false);
                    return;
                }
                
                // console.log('🔍 [RoomsForm] Session data:', {
                // // // //     hasSession: !!session,
                // // // //     hasUser: !!session?.user,
                // // // //     userEmail: session?.user?.email,
                // // // //     userId: session?.user?.id
                // // // // });
// // //
                // // // // Only check for email presence in auth
                // // // if (session?.user?.email) {
                    // // // setIsAuthenticated(true);
                    // // // // console.log('✅ [RoomsForm] User authenticated with email:', session.user.email);
                    // // //
                    // // // // Auto-fill form data from user profile if available
                    // // // if (session.user.user_metadata?.college) {
                        // // // setFormData(prev => ({
                            // // // ...prev,
                            // // // college: prev.college || session.user.user_metadata.college
                        // // // }));
                    // // // }
                // // // } else {
                    // // // // console.log('❌ [RoomsForm] No email found in session');
                    // // // setIsAuthenticated(false);
                // // // }
                // // //
                // // // setAuthLoading(false);
            // // // } catch (authError) {
                // // // // console.error('❌ [RoomsForm] Auth check exception:', authError);
                // // // setIsAuthenticated(false);
                // // // setAuthLoading(false);
            // // // }
        // // // };
// // //
        // // // checkAuth();
// // //
        // // // // Listen for auth changes
        // // // const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            // // // // console.log('🔄 [RoomsForm] Auth state changed:', event, !!session?.user?.email);
            // // // if (session?.user?.email) {
                // // // setIsAuthenticated(true);
            // // // } else {
                // // // setIsAuthenticated(false);
            // // // }
        // // // });
// //
        // // return () => subscription.unsubscribe();
    // // }, [supabase.auth]);
// //
    // // // Load user profile data to prefill form
    // // useEffect(() => {
        // // const loadUserProfile = async () => {
            // // if (!isAuthenticated) return;
            // //
            // // try {
                // // const { data: { user } } = await supabase.auth.getUser();
                // // if (user) {
                    // // // Fetch user profile from users table
                    // // const { data: profile, error } = await supabase
                        // // .from('users')
                        // // .select('college, phone, name')
                        // // .eq('id', user.id)
                        // // .single();
                    // //
                    // // if (profile && !error) {
                        // // // Prefill college if user has it in their profile
                        // // if (profile.college && !formData.college) {
                            // // setFormData(prev => ({
                                // // ...prev,
                                // // college: profile.college
                            // // }));
                        // // }
                        // //
                        // // // Note: Removed auto-fill for owner name and contact to prevent confusion
                        // // // Users should manually enter their preferred contact information for room listings
                    // // }
                // // }
            // // } catch (error) {
                // // // console.error('Error loading user profile:', error);
            // // }
        // // };
// //
        // // if (isAuthenticated && !authLoading) {
            // // loadUserProfile();
        // // }
    // // }, [isAuthenticated, authLoading, formData.college, supabase]);
// //
    // // const handleChange = (e) => {
        // // const { name, value, type, checked } = e.target;
        // // // console.log('RoomsForm handleChange:', { name, value, type, checked }); // Debug log
        // // // if (type === 'checkbox') {
            // // // if (name === 'mess_included') {
                // // // setFormData(prev => ({ ...prev, mess_included: checked }));
            // // // } else {
                // // // const newAmenities = checked
                    // // // ? [...formData.amenities, value]
                    // // // : formData.amenities.filter(a => a !== value);
                // // // setFormData(prev => ({ ...prev, amenities: newAmenities }));
            // // // }
        // // // } else {
            // // // setFormData(prev => ({ ...prev, [name]: value }));
        // // // }
    // // // };
// // //
    // // // const handleImagesChange = useCallback((files) => {
        // // // setFormData(prev => ({ ...prev, images: files }));
    // // // }, []);
// // //
    // // // const handleLocationChange = useCallback((location) => {
        // // // // console.log('RoomsForm: handleLocationChange called with:', location);
        // // // // console.log('RoomsForm: location type:', typeof location);
        // // // // console.log('RoomsForm: location.lat:', location?.lat, 'type:', typeof location?.lat);
        // // // // console.log('RoomsForm: location.lng:', location?.lng, 'type:', typeof location?.lng);
        // // //
        // // // // Validate that location has valid lat/lng
        // // // if (location && typeof location.lat === 'number' && typeof location.lng === 'number') {
            // // // setFormData(prev => ({ ...prev, location }));
            // // // // console.log('RoomsForm: Location successfully updated');
        // // // } else {
            // // // // console.error('RoomsForm: Invalid location data received:', location);
        // // // }
    // // // }, []);
// // //
    // // // const handleSubmit = async (e) => {
        // // // e.preventDefault();
        // // // if (isSubmitting) return;
// // //
        // // // // console.log('🏠 [RoomsForm] Starting submission...');
// // //
        // // // // ============================================================================
        // // // // 1. ENHANCED EMAIL-BASED AUTHENTICATION CHECK
        // // // // ============================================================================
        // // //
        // // // if (!isAuthenticated) {
            // // // // console.log('❌ [RoomsForm] Not authenticated, redirecting to login');
            // // // toast.error('Please log in to submit your room listing');
            // // // router.push('/login');
            // // // return;
        // // // }
// // //
        // // // // Get current session and verify email
        // // // let currentUser = null;
        // // // try {
            // // // const { data: { session }, error } = await supabase.auth.getSession();
            // // //
            // // // if (error) {
                // // // // console.error('❌ [RoomsForm] Session error:', error);
                // // // toast.error('Authentication error. Please try logging in again.');
                // // // return;
            // // // }
// // //
            // // // // console.log('🔍 [RoomsForm] Session check:', {
            // // // //     hasSession: !!session,
            // // // //     hasUser: !!session?.user,
            // // // //     userEmail: session?.user?.email,
            // // // //     userId: session?.user?.id
            // // // // });
            // // //
            // // // if (!session?.user?.email) {
                // // // // console.log('❌ [RoomsForm] No email found in session');
                // // // toast.error('Invalid authentication. Please log in with a valid email.');
                // // // router.push('/login');
                // // // return;
            // // // }
// // //
            // // // // Fetch current user data to include phone number
            // // // let userProfile = null;
            // // // try {
                // // // const { data: profile } = await supabase
                    // // // .from('users')
                    // // // .select('phone')
                    // // // .eq('id', session.user.id)
                    // // // .single();
                // // // userProfile = profile;
            // // // } catch (err) {
                // // // // console.log('ℹ️ [RoomsForm] Could not fetch user profile phone:', err);
            // // // }
            // // //
            // // // currentUser = {
                // // // id: session.user.id,
                // // // email: session.user.email,
                // // // name: session.user.user_metadata?.name || session.user.user_metadata?.full_name || session.user.email.split('@')[0],
                // // // avatar_url: session.user.user_metadata?.avatar_url,
                // // // college: formData.college,
                // // // phone: userProfile?.phone || null // Include phone to preserve it in API upsert
            // // // };
// // //
            // // // // console.log('✅ [RoomsForm] User data prepared:', currentUser);
        // // // } catch (sessionError) {
            // // // // console.error('❌ [RoomsForm] Session check failed:', sessionError);
            // // // toast.error('Failed to verify authentication. Please try again.');
            // // // return;
        // // // }
// // //
        // // // // ============================================================================
        // // // // 2. FORM VALIDATION
        // // // // ============================================================================
        // // //
        // // // if (!formData.hostel_name || !formData.fees || !formData.college || !formData.room_type || !formData.owner_name || !formData.contact_primary) {
            // // // toast.error('Please fill in all required fields');
            // // // return;
        // // // }
// // //
        // // // if (isNaN(parseFloat(formData.fees)) || parseFloat(formData.fees) <= 0) {
            // // // toast.error('Please enter a valid rent amount');
            // // // return;
        // // // }
// // //
        // // // if (!formData.location || !formData.location.lat || !formData.location.lng) {
            // // // toast.error('Please select a location on the map');
            // // // return;
        // // // }
// // //
        // // // // console.log('✅ [RoomsForm] Form validation passed');
        // // // setIsSubmitting(true);
// // //
        // // // const toastId = toast.loading('Adding your room listing...');
// // //
        // // // try {
            // // // // ============================================================================
            // // // // 3. PREPARE SUBMISSION DATA
            // // // // ============================================================================
            // // //
            // // // // ============================================================================
            // // // // 4. SUBMIT TO API
            // // // // ============================================================================
            // // //
            // // // // Create FormData to handle File uploads
            // // // const formDataToSend = new FormData();
            // // //
            // // // // Add basic data
            // // // formDataToSend.append('type', 'rooms');
            // // // formDataToSend.append('user', JSON.stringify(currentUser));
            // // // formDataToSend.append('title', formData.hostel_name);
            // // // formDataToSend.append('description', formData.description);
            // // // formDataToSend.append('price', parseFloat(formData.fees));
            // // // formDataToSend.append('college', formData.college);
            // // // formDataToSend.append('location', JSON.stringify(formData.location));
            // // // formDataToSend.append('roomType', formData.room_type);
            // // // formDataToSend.append('occupancy', formData.occupancy);
            // // // formDataToSend.append('ownerName', formData.owner_name);
            // // // formDataToSend.append('contact1', formData.contact_primary);
            // // //
            // // // if (formData.contact_secondary) {
                // // // formDataToSend.append('contact2', formData.contact_secondary);
            // // // }
            // // // if (formData.distance) {
                // // // formDataToSend.append('distance', formData.distance);
            // // // }
            // // // if (formData.deposit) {
                // // // formDataToSend.append('deposit', parseFloat(formData.deposit));
            // // // }
            // // //
            // // // formDataToSend.append('feesIncludeMess', formData.mess_included);
            // // // if (formData.mess_included && formData.mess_fees) {
                // // // formDataToSend.append('messType', formData.mess_fees);
            // // // }
            // // //
            // // // // Add amenities
            // // // if (formData.amenities && formData.amenities.length > 0) {
                // // // formData.amenities.forEach(amenity => {
                    // // // formDataToSend.append('amenities', amenity);
                // // // });
            // // }
            // //
            // // // Add images as File objects
            // // if (formData.images && formData.images.length > 0) {
                // // formData.images.forEach((image, index) => {
                    // // formDataToSend.append(`images`, image);
                // // });
            // }
// 
            // // console.log('📤 [RoomsForm] Sending FormData to API with', formData.images?.length || 0, 'images');
            // 
            // const response = await fetch('/api/sell', {
                // method: 'POST',
                // body: formDataToSend, // Send FormData instead of JSON
            // });

            const result = await response.json();

            // console.log('📥 [RoomsForm] API response:', {
            // //     status: response.status,
            // //     ok: response.ok,
            // //     result: result
            // // });
// 
            // if (!response.ok) {
                // // console.error('❌ [RoomsForm] API error:', result);
                // 
                // // Handle specific error codes
                // if (result.code === 'AUTH_MISSING_EMAIL' || result.code === 'AUTH_EMAIL_NOT_FOUND') {
                    // toast.error('Authentication required. Please sign in first.');
                    // router.push('/login');
                    // return;
                // }
                // 
                // if (result.code === 'AUTH_EMAIL_UNREGISTERED') {
                    // toast.error('Email not registered. Please create an account first.');
                    // router.push('/signup');
                    // return;
                // }
                // 
                // if (result.code === 'DATABASE_RLS_ERROR') {
                    // toast.error('Database security error. Please contact support.');
                    // return;
                // }
                // 
                // // Generic error message
                // toast.error(result.error || 'Failed to submit room listing. Please try again.');
                // return;
            // }
// 
            // // ============================================================================
            // // 5. SUCCESS HANDLING
            // // ============================================================================
            // 
            // // console.log('✅ [RoomsForm] Room listing submitted successfully:', result.data);
            // 
            // // Show success message
            // toast.success(
                // `🏠 ${result.message || 'Room listing submitted successfully!'}\nYour ${result.data?.title || 'room'} is now live!`,
                // {
                    // duration: 4000,
                    // style: {
                        // background: '#10b981',
                        // color: '#ffffff',
                        // fontWeight: '500',
                    // },
                // }
            // );
            // 
            // // Reset form
            // setFormData({
                // hostel_name: '',
                // college: formData.college, // Keep college for next submission
                // room_type: '',
                // deposit: '',
                // fees: '',
                // fees_period: 'Monthly',
                // mess_included: false,
                // mess_fees: '',
                // description: '',
                // distance: '',
                // occupancy: '',
                // owner_name: '',
                // contact_primary: '',
                // contact_secondary: '',
                // amenities: [],
                // images: [],
                // location: null,
                // category: category || 'Rooms/Hostel',
            // });

            // Redirect to homepage after showing success message
            setTimeout(() => {
                router.push('/');
            }, 2000);

        } catch (fetchError) {
            // console.error('❌ [RoomsForm] Fetch error:', fetchError);
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
                    <p className="text-gray-600 dark:text-gray-400">Please log in to list your room/hostel.</p>
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
                <ImageUploadWithOptimization 
                    onImagesOptimized={handleImagesChange} 
                    maxImages={10}
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
