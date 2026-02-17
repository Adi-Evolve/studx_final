'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import Link from 'next/link';

// The list of categories for rental - focused on regular products only
const rentalCategories = [
    { value: 'laptop', label: 'Laptop' },
    { value: 'project_equipment', label: 'Project Equipment' },
    { value: 'books', label: 'Books' },
    { value: 'cycle_bike', label: 'Cycle/Bike' },
    { value: 'hostel_equipment', label: 'Hostel Equipment' },
    { value: 'electronics', label: 'Electronics' },
    { value: 'furniture', label: 'Furniture' },
    { value: 'lab_equipment', label: 'Lab Equipment' },
    { value: 'sports_equipment', label: 'Sports Equipment' },
    { value: 'others', label: 'Others' }
];

export default function RentPage() {
    const [category, setCategory] = useState('');
    const [loading, setLoading] = useState(true);
    const [userStatus, setUserStatus] = useState('checking'); // 'checking', 'no-email', 'no-phone', 'ready'
    const [userEmail, setUserEmail] = useState('');
    const router = useRouter();
    const supabase = createSupabaseBrowserClient();

    useEffect(() => {
        const checkUserInDatabase = async () => {
            try {
                // Get the current session to get user details
                const { data: { session } } = await supabase.auth.getSession();
                
                if (!session || !session.user || !session.user.email) {
                    // console.log('❌ No valid session found');
                    setUserStatus('no-email');
                    setLoading(false);
                    return;
                }

                const currentUser = session.user;
                const currentUserEmail = currentUser.email;
                setUserEmail(currentUserEmail);
                
                // console.log('🔍 Checking user in database:', currentUserEmail);

                // Query the users table to check if the user exists
                let { data: userData, error } = await supabase
                    .from('users')
                    .select('*')
                    .eq('id', currentUser.id)
                    .single();

                if (error && error.code === 'PGRST116') {
                    // User doesn't exist, create new user record
                    // console.log('📝 Creating new user record...');
                    const { data: createdUser, error: createError } = await supabase
                        .from('users')
                        .insert([
                            {
                                id: currentUser.id,
                                email: currentUserEmail,
                                name: currentUser.user_metadata?.full_name || currentUser.user_metadata?.name || 'User',
                                created_at: new Date().toISOString(),
                                updated_at: new Date().toISOString()
                            }
                        ])
                        .select()
                        .single();

                    if (createError) {
                        // console.error('❌ Error creating user:', createError);
                        setUserStatus('no-email');
                        setLoading(false);
                        return;
                    } else {
                        // console.log('✅ User created successfully:', createdUser);
                        userData = createdUser;
                    }
                }

                if (userData) {
                    // console.log('✅ User found:', userData);
                    if (!userData.phone || userData.phone.trim() === '') {
                        // User exists but phone is null or empty
                        setUserStatus('no-phone');
                    } else {
                        // User exists and has phone number
                        setUserStatus('ready');
                    }
                } else {
                    setUserStatus('no-email');
                }

            } catch (error) {
                // console.error('❌ Error checking user in database:', error);
                setUserStatus('no-email');
            }

            setLoading(false);
        };

        checkUserInDatabase();
    }, [supabase]);

    // Handler for the 'Next' button
    const handleNext = () => {
        if (!category) {
            alert('Please select a category to continue.');
            return;
        }
        
        const selectedCategory = rentalCategories.find(c => c.label === category);
        if (selectedCategory) {
            // Navigate to rental form with category
            router.push(`/rent/new?type=${selectedCategory.value}&category=${encodeURIComponent(category)}`);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-300">Checking your profile...</p>
                </div>
            </div>
        );
    }

    if (userStatus === 'no-email') {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
                <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sm:p-8 text-center">
                    <div className="text-6xl mb-4">🔐</div>
                    <h1 className="text-xl sm:text-2xl font-bold text-red-600 dark:text-red-400 mb-4">Sign In Required</h1>
                    <p className="mb-6 text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                        You need to sign in to rent items on our platform. Please sign in with your account.
                    </p>
                    <Link 
                        href="/login" 
                        className="block w-full bg-emerald-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-emerald-700 transition-colors duration-300 text-sm sm:text-base"
                    >
                        Sign In
                    </Link>
                </div>
            </div>
        );
    }

    if (userStatus === 'no-phone') {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
                <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sm:p-8 text-center">
                    <div className="text-6xl mb-4">📱</div>
                    <h1 className="text-xl sm:text-2xl font-bold text-yellow-600 dark:text-yellow-400 mb-4">Phone Number Required</h1>
                    <p className="mb-6 text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                        To rent items on our platform, you need to add a phone number to your profile so renters can contact you.
                    </p>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-6 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                        <strong>Email:</strong> {userEmail}
                    </div>
                    <Link 
                        href="/profile" 
                        className="block w-full bg-emerald-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-emerald-700 transition-colors duration-300 text-sm sm:text-base"
                    >
                        Update Profile
                    </Link>
                </div>
            </div>
        );
    }

    // If user status is 'ready', show the category selection
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-4 sm:py-8 lg:py-12">
            <div className="container mx-auto px-4">
                <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 p-4 sm:p-6 lg:p-8 rounded-lg shadow-lg">
                    <div className="text-center mb-6 sm:mb-8">
                        <div className="text-6xl mb-4">🏠</div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">List an Item for Rent</h1>
                        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                            Share your items with other students and earn money through rentals.
                        </p>
                        <div className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                            <p className="text-sm text-emerald-700 dark:text-emerald-400">
                                💡 <strong>Rental Benefits:</strong> Flexible duration, secure deposits, recurring income
                            </p>
                        </div>
                    </div>
                    
                    <div className="mb-6 sm:mb-8">
                        <label htmlFor="category" className="block text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-3">
                            What are you renting out?
                        </label>
                        <select
                            id="category"
                            name="category"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full px-3 py-3 sm:py-4 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white dark:bg-gray-700 dark:text-white"
                        >
                            <option value="" disabled className="text-gray-500 dark:text-gray-400">Select a category</option>
                            {rentalCategories.sort((a, b) => a.label.localeCompare(b.label)).map((cat) => (
                                <option key={cat.label} value={cat.label} className="text-gray-900 dark:text-white">{cat.label}</option>
                            ))}
                        </select>
                        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                            Choose the category that best matches your item
                        </p>
                    </div>
                    
                    <div className="flex justify-center sm:justify-end">
                        <button
                            onClick={handleNext}
                            className="w-full sm:w-auto bg-emerald-600 text-white font-bold py-3 px-6 sm:px-8 rounded-lg hover:bg-emerald-700 transition duration-300 disabled:bg-gray-400 disabled:opacity-70 text-sm sm:text-base"
                            disabled={!category}
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
