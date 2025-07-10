'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import Link from 'next/link';

// The list of categories for the dropdown
const categories = [
    { value: 'regular', label: 'Laptop' },
    { value: 'regular', label: 'Project Equipment' },
    { value: 'regular', label: 'Books' },
    { value: 'regular', label: 'Cycle/Bike' },
    { value: 'regular', label: 'Hostel Equipment' },
    { value: 'notes', label: 'Notes' },
    { value: 'rooms', label: 'Rooms/Hostel' },
    { value: 'regular', label: 'Others' },
    { value: 'regular', label: 'Electronics' }
];

export default function SellPage() {
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
                    console.log('❌ No valid session found');
                    setUserStatus('no-email');
                    setLoading(false);
                    return;
                }

                const currentUser = session.user;
                const currentUserEmail = currentUser.email;
                setUserEmail(currentUserEmail);
                
                console.log('🔍 Checking user in database:', currentUserEmail);

                // First check by user ID (more reliable)
                const { data: userDataById, error: errorById } = await supabase
                    .from('users')
                    .select('id, email, phone, name')
                    .eq('id', currentUser.id)
                    .single();

                let userData = userDataById;
                let error = errorById;

                // If not found by ID, check by email as fallback
                if (error || !userData) {
                    console.log('🔍 User not found by ID, checking by email...');
                    const { data: userDataByEmail, error: errorByEmail } = await supabase
                        .from('users')
                        .select('id, email, phone, name')
                        .eq('email', currentUserEmail)
                        .single();
                    
                    userData = userDataByEmail;
                    error = errorByEmail;
                }

                if (error || !userData) {
                    console.log('❌ User not found in users table, attempting to sync...');
                    
                    // Attempt to create the user record
                    const newUserData = {
                        id: currentUser.id,
                        email: currentUser.email,
                        name: currentUser.user_metadata?.name || 
                              currentUser.user_metadata?.full_name || 
                              currentUser.user_metadata?.display_name || 
                              currentUser.email?.split('@')[0],
                        avatar_url: currentUser.user_metadata?.picture || 
                                   currentUser.user_metadata?.avatar_url || 
                                   currentUser.user_metadata?.photo || 
                                   currentUser.user_metadata?.image,
                        phone: currentUser.phone,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    };

                    console.log('📝 Creating user record:', newUserData);

                    const { data: createdUser, error: createError } = await supabase
                        .from('users')
                        .upsert(newUserData, { onConflict: 'id' })
                        .select()
                        .single();

                    if (createError) {
                        console.error('❌ Failed to create user record:', createError);
                        setUserStatus('no-email');
                    } else {
                        console.log('✅ User record created successfully');
                        userData = createdUser;
                    }
                }

                if (userData) {
                    console.log('✅ User found:', userData);
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
                console.error('❌ Error checking user in database:', error);
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
        
        const selectedCategory = categories.find(c => c.label === category);
        if (selectedCategory) {
            router.push(`/sell/new?type=${selectedCategory.value}&category=${encodeURIComponent(category)}`);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
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
                        You need to sign in to sell items on our platform. Please sign in with your account.
                    </p>
                    <Link 
                        href="/login" 
                        className="block w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-300 text-sm sm:text-base"
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
                    <h1 className="text-xl sm:text-2xl font-bold text-orange-600 dark:text-orange-400 mb-4">Phone Number Required</h1>
                    <p className="mb-4 text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                        To sell items on our platform, you need to add your phone number to your profile.
                    </p>
                    <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
                        Email: {userEmail}
                    </p>
                    <Link 
                        href="/profile" 
                        className="block w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-300 text-sm sm:text-base"
                    >
                        Add Phone Number in Profile
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
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">List an Item for Sale</h1>
                        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">Let's start by choosing the right category for your item.</p>
                    </div>
                    
                    <div className="mb-6 sm:mb-8">
                        <label htmlFor="category" className="block text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-3">
                            What are you selling?
                        </label>
                        <select
                            id="category"
                            name="category"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full px-3 py-3 sm:py-4 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 dark:text-white"
                        >
                            <option value="" disabled className="text-gray-500 dark:text-gray-400">Select a category</option>
                            {categories.sort((a, b) => a.label.localeCompare(b.label)).map((cat) => (
                                <option key={cat.label} value={cat.label} className="text-gray-900 dark:text-white">{cat.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex justify-center sm:justify-end">
                        <button
                            onClick={handleNext}
                            className="w-full sm:w-auto bg-blue-600 text-white font-bold py-3 px-6 sm:px-8 rounded-lg hover:bg-blue-700 transition duration-300 disabled:bg-gray-400 disabled:opacity-70 text-sm sm:text-base"
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
