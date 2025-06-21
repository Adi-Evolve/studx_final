'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

// // import toast from 'react-hot-toast';

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
    const router = useRouter();

    const handleNext = () => {
        if (!category) {
            // // toast.error('Please select a category first.');o continue.');
            return;
        }
        const selectedCategory = categories.find(c => c.label === category);
        const formType = selectedCategory.value;

        // // toast.success(`Selected category: ${category}. Proceeding to form.`);
        
        // We will redirect to a dynamic route that handles the specific form
        router.push(`/sell/new?type=${formType}&category=${encodeURIComponent(category)}`);
    };

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
                            className="mt-1 block w-full pl-3 pr-10 py-3 text-base border-gray-300 focus:outline-none focus:ring-accent focus:border-accent sm:text-sm rounded-md"
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
