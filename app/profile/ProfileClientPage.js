'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import ListingCard from '@/components/ListingCard';

// Reusable UI Components
const TabButton = ({ active, onClick, children }) => (
    <button 
        onClick={onClick}
        className={`px-4 py-2 font-semibold rounded-t-lg transition-colors duration-300 ${active ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}>
        {children}
    </button>
);

const EditProfileModal = ({ user, onClose, onSave }) => {
    const [name, setName] = useState(user.name || '');
    const [phoneNumber, setPhoneNumber] = useState(user.phone_number || '');
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        await onSave({ fullName, phoneNumber });
        setIsSaving(false);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md">
                <h2 className="text-2xl font-bold text-primary mb-6">Edit Profile</h2>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Full Name</label>
                        <input type="text" id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" />
                    </div>
                    <div>
                        <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">Phone Number</label>
                        <input type="tel" id="phoneNumber" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary" />
                    </div>
                </div>
                <div className="mt-8 flex justify-end space-x-4">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button>
                    <button onClick={handleSave} disabled={isSaving} className="px-4 py-2 bg-accent text-white rounded-md hover:bg-primary disabled:bg-gray-400">
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default function ProfileClientPage({ serverUser, serverProducts, serverNotes, serverRooms }) {
    const [user, setUser] = useState(serverUser);
    const [products, setProducts] = useState(serverProducts);
    const [notes, setNotes] = useState(serverNotes);
    const [rooms, setRooms] = useState(serverRooms);
    const [activeTab, setActiveTab] = useState('products');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const supabase = createSupabaseBrowserClient();

    const handleSaveProfile = async ({ fullName, phoneNumber }) => {
        const { data, error } = await supabase
            .from('users')
            .update({ name: name, phone: phoneNumber })
            .eq('id', user.id)
            .select()
            .single();

        if (error) {
            alert('Error updating profile: ' + error.message);
        } else if (data) {
            setUser(prev => ({ ...prev, ...data }));
            setIsModalOpen(false);
        }
    };

    const handleRemove = async (id, type) => {
        if (!confirm('Are you sure you want to remove this item?')) return;

        const response = await fetch('/api/item/delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, type }),
        });

        if (response.ok) {
            if (type === 'product') setProducts(products.filter(p => p.id !== id));
            if (type === 'note') setNotes(notes.filter(n => n.id !== id));
            if (type === 'room') setRooms(rooms.filter(r => r.id !== id));
        } else {
            alert('Failed to remove item.');
        }
    };

    const handleMarkAsSold = async (id) => {
        const response = await fetch('/api/item/mark-sold', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id }),
        });

        if (response.ok) {
            setProducts(products.map(p => p.id === id ? { ...p, is_sold: true } : p));
        } else {
            alert('Failed to mark as sold.');
        }
    };

    const renderItems = () => {
        let items, type;
        switch (activeTab) {
            case 'notes': items = notes; type = 'note'; break;
            case 'rooms': items = rooms; type = 'room'; break;
            default: items = products; type = 'product';
        }

        if (items.length === 0) {
            return <p className="text-center text-gray-500 py-10">You have no items in this category.</p>;
        }

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {items.map(item => (
                    <div key={item.id} className={`bg-white rounded-lg shadow-md overflow-hidden group ${item.is_sold ? 'grayscale' : ''}`}>
                        <ListingCard item={item} />
                        <div className="p-4 border-t">
                            <div className="flex space-x-2">
                                <Link href={`/edit/${item.id}?type=${type}`} className="flex-1 bg-blue-500 text-white font-bold py-2 px-3 rounded-lg hover:bg-blue-600 transition duration-300 text-sm text-center">Edit</Link>
                                <button onClick={() => handleRemove(item.id, type)} className="flex-1 bg-red-500 text-white font-bold py-2 px-3 rounded-lg hover:bg-red-600 transition duration-300 text-sm">Remove</button>
                                {type === 'product' && (
                                    <button 
                                        onClick={() => handleMarkAsSold(item.id)}
                                        disabled={item.is_sold}
                                        className={`flex-1 text-white font-bold py-2 px-3 rounded-lg transition duration-300 text-sm ${item.is_sold ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'}`}>
                                        {item.is_sold ? 'Sold' : 'Mark as Sold'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="container mx-auto px-4 py-12 bg-gray-50 min-h-screen">
            {isModalOpen && <EditProfileModal user={user} onClose={() => setIsModalOpen(false)} onSave={handleSaveProfile} />}
            
            <div className="bg-white p-8 rounded-2xl shadow-lg mb-10 flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 border border-gray-200">
                <div className="relative w-24 h-24 rounded-full overflow-hidden ring-4 ring-primary ring-opacity-50">
                    <Image src={user.avatar_url} alt={user.name} width={96} height={96} className="object-cover" unoptimized />
                </div>
                <div className="text-center sm:text-left">
                    <h1 className="text-3xl font-bold text-primary">{user.name}</h1>
                    <p className="text-gray-500 text-lg">{user.email}</p>
                    {user.phone_number && <p className="text-gray-600 mt-1">Phone: {user.phone_number}</p>}
                    <button onClick={() => setIsModalOpen(true)} className="mt-4 bg-accent text-white font-bold py-2 px-4 rounded-full hover:bg-primary transition duration-300 shadow-md">
                        Edit Profile
                    </button>
                </div>
            </div>

            <div>
                <div className="mb-6 border-b border-gray-300">
                    <TabButton active={activeTab === 'products'} onClick={() => setActiveTab('products')}>Products</TabButton>
                    <TabButton active={activeTab === 'notes'} onClick={() => setActiveTab('notes')}>Notes</TabButton>
                    <TabButton active={activeTab === 'rooms'} onClick={() => setActiveTab('rooms')}>Rooms</TabButton>
                </div>
                {renderItems()}
            </div>
        </div>
    );
}
