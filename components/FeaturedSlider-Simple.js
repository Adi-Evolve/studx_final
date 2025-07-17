'use client';

import React from 'react';
import Image from 'next/image';

export default function FeaturedSlider({ listings }) {
    // console.log('FeaturedSlider received listings:', listings);
    
    if (!listings || listings.length === 0) {
        return (
            <div className="p-8 text-center">
                <p className="text-gray-500">No featured items to display</p>
            </div>
        );
    }

    return (
        <div className="w-full max-w-6xl mx-auto p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {listings.map((item, index) => (
                    <div key={item.id || index} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                        <div className="h-48 bg-gray-200 dark:bg-gray-700 relative">
                            {item.images && item.images[0] ? (
                                <Image
                                    src={item.images[0]}
                                    alt={item.title || 'Featured Item'}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full">
                                    <span className="text-4xl text-gray-400">📦</span>
                                </div>
                            )}
                        </div>
                        
                        <div className="p-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                {item.title || 'Untitled Item'}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                {item.description || 'No description available'}
                            </p>
                            <div className="flex items-center justify-between">
                                <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                    ₹{item.price || 0}
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {item.college || 'Unknown College'}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
