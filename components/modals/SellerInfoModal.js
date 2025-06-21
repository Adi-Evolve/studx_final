'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Image from 'next/image';
import Link from 'next/link';

export default function SellerInfoModal({ seller, sellerId, onClose }) {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClientComponentClient();

    useEffect(() => {
        const fetchListings = async () => {
            if (!sellerId) return;

            const tables = ['regular_products', 'notes', 'rooms'];
            let allListings = [];

            for (const table of tables) {
                const { data, error } = await supabase
                    .from(table)
                    .select('*')
                    .eq('seller_id', sellerId);
                
                if (data) {
                    allListings = [...allListings, ...data];
                }
            }

            setListings(allListings);
            setLoading(false);
        };

        fetchListings();
    }, [sellerId, supabase]);

    if (!seller) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-2xl p-8 max-w-2xl w-full" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-primary">Seller Information</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
                </div>

                <div className="flex items-center space-x-4 mb-6">
                    <div className="relative w-16 h-16 rounded-full overflow-hidden">
                        <Image 
                            src={seller.avatar_url || '/default-avatar.png'} 
                            alt={seller.full_name || 'User avatar'}
                            layout="fill"
                            objectFit="cover"
                        />
                    </div>
                    <div>
                        <p className="font-bold text-xl text-primary">{seller.full_name}</p>
                        <p className="text-secondary">{seller.email}</p>
                        {/* Add member since and rating when available */}
                    </div>
                </div>

                <h3 className="font-bold text-lg text-primary mb-4">Other items from this seller:</h3>
                {loading ? (
                    <p>Loading listings...</p>
                ) : (
                    <div className="space-y-4 max-h-64 overflow-y-auto">
                        {listings.length > 0 ? listings.map(item => (
                            <Link href={`/products/${item.id}`} key={`${item.id}-${item.title}`}>
                                <div className="flex items-center space-x-4 p-2 rounded-lg hover:bg-gray-100 cursor-pointer">
                                    <Image src={item.image_urls?.[0] || 'https://source.unsplash.com/random/100x100?item'} alt={item.title || item.hostel_name} width={50} height={50} className="rounded-md" />
                                    <div>
                                        <p className="font-semibold text-primary">{item.title || item.hostel_name}</p>
                                        <p className="text-accent font-bold">₹{item.price || item.fees}</p>
                                    </div>
                                </div>
                            </Link>
                        )) : (
                            <p className="text-gray-500">No other listings found.</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
