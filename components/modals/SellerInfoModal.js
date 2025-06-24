'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Image from 'next/image';
import Link from 'next/link';

export default function SellerInfoModal({ seller, soldProducts, onClose, isLoading }) {
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
                            alt={seller.name || 'User avatar'}
                            layout="fill"
                            objectFit="cover"
                        />
                    </div>
                    <div>
                        <p className="font-bold text-xl text-primary">{seller.name}</p>
                        <p className="text-secondary">{seller.email}</p>
                        {seller.phone && <p className="text-secondary">{seller.phone}</p>}
                        {/* Add member since and rating when available */}
                    </div>
                </div>

                <h3 className="font-bold text-lg text-primary mb-4">Sold Items from this Seller:</h3>
                {isLoading ? (
                    <p className="text-gray-500">Loading sold items...</p>
                ) : (
                    <div className="space-y-4 max-h-64 overflow-y-auto p-2 bg-gray-50 rounded-lg">
                        {soldProducts.length > 0 ? soldProducts.map(item => (
                            <div key={item.id} className="flex items-center space-x-4 p-2 rounded-lg bg-white shadow-sm">
                                <Image 
                                    src={(item.images && item.images[0]) || (item.image_urls && item.image_urls[0]) || 'https://source.unsplash.com/random/100x100?item'}
                                    alt={item.title || item.name || 'Sold Item'}
                                    width={50} 
                                    height={50} 
                                    className="rounded-md object-cover"
                                />
                                <div>
                                    <p className="font-semibold text-primary">{item.title || item.name}</p>
                                    <p className="text-accent font-bold">₹{item.price || item.fees}</p>
                                </div>
                            </div>
                        )) : (
                            <p className="text-gray-500">No sold items found for this seller.</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
