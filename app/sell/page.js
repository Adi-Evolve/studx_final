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
            <div className="container mx-auto text-center py-20 px-4">
                <h1 className="text-2xl font-bold text-red-600 mb-4">Phone Number Required</h1>
                <p className="mb-6 text-lg">
                    To ensure the safety and reliability of our community, you must add a phone number to your profile before you can sell an item.
                </p>
                <Link href="/profile" className="bg-primary text-white font-bold py-3 px-6 rounded-lg hover:bg-secondary transition-colors duration-300">
                    Go to Your Profile to Add a Phone Number
                </Link>
            </div>
        );
    }

    // If the check passes, render the original sell form
    return (
        <div className="bg-light-bg">
            <main className="flex-grow container mx-auto px-4 py-12">
                <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-lg">
                    <h1 className="text-3xl font-bold text-accent mb-2">List an Item for Sale</h1>
                    <p className="text-secondary mb-8">Let's start by choosing the right category for your item.</p>
                    
                    <div className="mb-6">
                        <label htmlFor="category" className="block text-lg font-medium text-primary mb-2">
                            What are you selling?
                        </label>
                        <select
                            id="category"
                            name="category"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="mt-1 block w-full pl-3 pr-10 py-3 text-base border-black text-black focus:outline-none focus:ring-accent focus:border-accent sm:text-sm rounded-md"
                        >
                            <option value="" disabled className="text-gray-500">Select a category</option>
                            {categories.sort((a, b) => a.label.localeCompare(b.label)).map((cat) => (
                                <option key={cat.label} value={cat.label} className="text-black">{cat.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex justify-end">
                        <button
                            onClick={handleNext}
                            className="bg-accent text-white font-bold py-3 px-8 rounded-lg hover:bg-primary transition duration-300 disabled:bg-secondary disabled:opacity-70"
                            disabled={!category}
                        >
                            Next
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}