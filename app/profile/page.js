'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Image from 'next/image';
import Link from 'next/link';

export default function ProfilePage() {
    const [user, setUser] = useState(null);
    const [listedItems, setListedItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClientComponentClient();

    useEffect(() => {
        const fetchUserData = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                setUser(session.user);

                // Fetch user's listed items from all relevant tables
                const { data: regularProducts, error: regularError } = await supabase
                    .from('regular_products')
                    .select('*')
                    .eq('seller_id', session.user.id);

                if (regularError) {
                    console.error('Error fetching regular products:', regularError);
                } else {
                    setListedItems(regularProducts || []);
                }
            }
            setLoading(false);
        };

        fetchUserData();
    }, [supabase]);

    if (loading) {
        return <div className="text-center py-10">Loading profile...</div>;
    }

    if (!user) {
        return <div className="text-center py-10">Please log in to view your profile.</div>;
    }

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="bg-white p-8 rounded-lg shadow-lg mb-10 flex items-center space-x-6">
                <div className="relative w-24 h-24 rounded-full overflow-hidden">
                    <Image 
                        src={user.user_metadata.avatar_url || '/default-avatar.png'} 
                        alt={user.user_metadata.full_name || 'User avatar'}
                        layout="fill"
                        objectFit="cover"
                    />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-primary">{user.user_metadata.full_name || 'User'}</h1>
                    <p className="text-secondary">{user.email}</p>
                    <button className="mt-4 bg-accent text-white font-bold py-2 px-4 rounded-lg hover:bg-primary transition duration-300">
                        Edit Profile
                    </button>
                </div>
            </div>

            <div>
                <h2 className="text-2xl font-bold text-primary mb-6">Your Listed Items</h2>
                {listedItems.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {listedItems.map(item => (
                            <div key={item.id} className="group bg-white rounded-lg shadow-md overflow-hidden">
                                <div className="relative h-56 w-full">
                                    <Image 
                                        src={item.image_urls?.[0] || 'https://source.unsplash.com/random/400x300?placeholder'}
                                        alt={item.title}
                                        layout="fill"
                                        objectFit="cover"
                                    />
                                </div>
                                <div className="p-4">
                                    <h3 className="text-lg font-semibold text-primary mb-1 truncate">{item.title}</h3>
                                    <p className="text-xl font-bold text-secondary mb-4">₹{item.price}</p>
                                    <Link href={`/products/${item.id}`} className="w-full text-center bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-secondary transition-colors duration-300 block">
                                        View Details
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-gray-500">You haven't listed any items yet.</p>
                )}
            </div>
        </div>
    );
}
