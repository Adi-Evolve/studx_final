'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '../../../lib/supabase/client';
import RegularProductForm from '../../../components/forms/RegularProductForm';
import NotesForm from '../../../components/forms/NotesForm';
import RoomsForm from '../../../components/forms/RoomsForm';

export default function EditForm({ item, type }) {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [authError, setAuthError] = useState(null);
    const supabase = createSupabaseBrowserClient();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                // Get user data from users table using the stored email
                const userEmail = localStorage.getItem('userEmail');
                if (!userEmail) {
                    setAuthError('Please log in to edit items');
                    setIsLoading(false);
                    return;
                }

                const { data: userData, error } = await supabase
                    .from('users')
                    .select('id, email, name')
                    .eq('email', userEmail)
                    .single();

                if (error || !userData) {
                    setAuthError('User not found. Please log in again.');
                    setIsLoading(false);
                    return;
                }

                // Check if user owns this item
                if (item.seller_id !== userData.id) {
                    setAuthError('You do not have permission to edit this item.');
                    setIsLoading(false);
                    return;
                }

                setUser(userData);
            } catch (error) {
                console.error('Error fetching user:', error);
                setAuthError('Authentication error. Please try again.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchUser();
    }, [item.seller_id, supabase]);

    const handleSubmit = async (formData) => {
        if (!user) {
            alert('Authentication error. Please refresh and try again.');
            return;
        }

        // The form components create a FormData object, but for updates (without file changes yet)
        // we need a plain JSON object. We'll extract the fields.
        const data = {};
        for (let [key, value] of formData.entries()) {
            // We don't want to update file inputs for now
            if (!(value instanceof File)) {
                data[key] = value;
            }
        }
        
        // Remove fields that should not be updated directly
        delete data.images;
        delete data.pdf;
        delete data.type;
        delete data.id;
        delete data.seller_id;
        delete data.created_at;

        try {
            const response = await fetch('/api/item/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    id: item.id, 
                    type, 
                    data,
                    userEmail: user.email 
                }),
            });

            const result = await response.json();

            if (response.ok) {
                alert(`Item "${result.item?.title || item.title}" updated successfully!`);
                router.push('/profile');
                router.refresh(); // To see the changes on the profile page
            } else {
                console.error('Update failed:', result);
                alert(`Failed to update item: ${result.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error updating item:', error);
            alert('Failed to update item due to network error.');
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
                    <p className="text-slate-600 dark:text-gray-300">Loading...</p>
                </div>
            </div>
        );
    }

    if (authError) {
        return (
            <div className="text-center py-12">
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 max-w-md mx-auto">
                    <h2 className="text-xl font-bold text-red-800 dark:text-red-200 mb-2">Access Denied</h2>
                    <p className="text-red-600 dark:text-red-300 mb-4">{authError}</p>
                    <button 
                        onClick={() => router.push('/profile')}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                    >
                        Go Back to Profile
                    </button>
                </div>
            </div>
        );
    }

    const renderForm = () => {
        switch (type) {
            case 'product':
                return <RegularProductForm initialData={item} onSubmit={handleSubmit} category={item.category} />;
            case 'note':
                return <NotesForm initialData={item} onSubmit={handleSubmit} category={item.category} />;
            case 'room':
                return <RoomsForm initialData={item} onSubmit={handleSubmit} category={item.category} />;
            default:
                return <p className="text-red-600">Invalid item type.</p>;
        }
    };

    return (
        <div>
            <div className="mb-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-blue-800 dark:text-blue-200">
                    <strong>Editing:</strong> {item.title} (ID: {item.id})
                </p>
                <p className="text-blue-600 dark:text-blue-300 text-sm mt-1">
                    Make your changes and click save to update your listing.
                </p>
            </div>
            {renderForm()}
        </div>
    );
}
