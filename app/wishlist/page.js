'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Image from 'next/image';
import Link from 'next/link';

export default function WishlistPage() {
    const [wishlistItems, setWishlistItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const supabase = createClientComponentClient();

    useEffect(() => {
        const fetchWishlist = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                setUser(session.user);

                // Fetch wishlist items for the current user, joining with all three tables
                const { data, error } = await supabase
                    .from('wishlist')
                    .select(`
                        id,
                        product:products (*),
                        note:notes (*),
                        room:rooms (*)
                    `)
                    .eq('user_id', session.user.id);

                if (error) {
                    // console.error('Error fetching wishlist:', error);
                } else {
                    // Merge the results from the three tables into a single array
                    const items = data.map(item => {
                        if (item.product) return { ...item.product, type: 'product' };
                        if (item.note) return { ...item.note, type: 'note' };
                        if (item.room) return { ...item.room, type: 'room' };
                        return null;
                    }).filter(Boolean);
                    setWishlistItems(items);
                }
            } else {
                // Handle case where there is no active session
                setUser(null);
                setWishlistItems([]);
            }
            setLoading(false);
        };

        fetchWishlist();
    }, [supabase]);

    if (loading) {
        return <div className="text-center py-10 text-gray-900 dark:text-white">Loading your wishlist...</div>;
    }

    if (!user) {
        return <div className="text-center py-10 text-gray-900 dark:text-white">Please log in to see your wishlist.</div>;
    }

    return (
        <div className="container mx-auto px-4 py-12 bg-gray-50 dark:bg-gray-900 min-h-screen">
            <h1 className="text-3xl font-bold text-primary dark:text-white mb-8">Your Wishlist</h1>
            {wishlistItems.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {wishlistItems.map(item => (
                        <div key={item.id} className="group bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                            <div className="relative h-56 w-full">
                                <Image 
                                    src={item.images?.[0] || 'https://source.unsplash.com/random/400x300?placeholder'}
                                    alt={item.title}
                                    fill
                                    style={{ objectFit: 'cover' }}
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    priority={true} // Prioritize loading images in the viewport
                                />
                            </div>
                            <div className="p-4">
                                <h3 className="text-lg font-semibold text-primary dark:text-white mb-1 truncate">{item.title}</h3>
                                <p className="text-xl font-bold text-secondary dark:text-blue-400 mb-4">₹{item.price?.toLocaleString('en-IN') || 'N/A'}</p>
                                <Link href={`/products/${item.type}/${item.id}`} className="w-full text-center bg-primary hover:bg-secondary dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 block">
                                    View Details
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-center text-gray-500 dark:text-gray-400">Your wishlist is empty. Start adding items!</p>
            )}
        </div>
    );
}
