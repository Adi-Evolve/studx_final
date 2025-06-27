'use client';

import { useState, useEffect } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
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
    const [loading, setLoading] = useState(true);
    const [hasPhoneNumber, setHasPhoneNumber] = useState(false);
    const [category, setCategory] = useState(''); // State for the selected category
    const supabase = createSupabaseBrowserClient();
    const router = useRouter();

    useEffect(() => {
        const checkUserProfile = async () => {
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                router.push('/login');
                return;
            }

            const { data: profile, error } = await supabase
                .from('users')
                .select('phone')
                .eq('id', session.user.id)
                .single();

            if (error) {
                console.error('Error fetching user profile:', error);
            }

            if (profile && profile.phone) {
                setHasPhoneNumber(true);
            }

            setLoading(false);
        };

        checkUserProfile();
    }, [supabase, router]);

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
        return <div className="text-center py-20">Verifying your profile...</div>;
    }

    if (!hasPhoneNumber) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-6 sm:p-8 text-center">
                    <div className="text-6xl mb-4">📱</div>
                    <h1 className="text-xl sm:text-2xl font-bold text-red-600 mb-4">Phone Number Required</h1>
                    <p className="mb-6 text-sm sm:text-base text-gray-600 leading-relaxed">
                        To ensure the safety and reliability of our community, you must add a phone number to your profile before you can sell an item.
                    </p>
                    <Link 
                        href="/profile" 
                        className="block w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-300 text-sm sm:text-base"
                    >
                        Go to Your Profile
                    </Link>
                </div>
            </div>
        );
    }

    // If the check passes, render the original sell form
    return (
        <div className="min-h-screen bg-gray-50 py-4 sm:py-8 lg:py-12">
            <div className="container mx-auto px-4">
                <div className="max-w-2xl mx-auto bg-white p-4 sm:p-6 lg:p-8 rounded-lg shadow-lg">
                    <div className="text-center mb-6 sm:mb-8">
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">List an Item for Sale</h1>
                        <p className="text-sm sm:text-base text-gray-600">Let's start by choosing the right category for your item.</p>
                    </div>
                    
                    <div className="mb-6 sm:mb-8">
                        <label htmlFor="category" className="block text-base sm:text-lg font-medium text-gray-900 mb-3">
                            What are you selling?
                        </label>
                        <select
                            id="category"
                            name="category"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full px-3 py-3 sm:py-4 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                        >
                            <option value="" disabled className="text-gray-500">Select a category</option>
                            {categories.sort((a, b) => a.label.localeCompare(b.label)).map((cat) => (
                                <option key={cat.label} value={cat.label} className="text-gray-900">{cat.label}</option>
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