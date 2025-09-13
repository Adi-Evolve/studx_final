'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import PriceDisplay from './PriceDisplay';

const getListingUrl = (item) => {
    const type = item.type;
    if (type === 'room') return `/products/rooms/${item.id}`;
    if (type === 'note') return `/products/notes/${item.id}`;
    if (type === 'rental') return `/products/rentals/${item.id}`;
    if (type === 'arduino_kit') return `/products/arduino/${item.id}`;
    return `/products/regular/${item.id}`;
};

// Simple Featured Product Card
const FeaturedProductCard = ({ item, onClick }) => {
    if (!item) return null;

    const imageUrl = (Array.isArray(item.images) && item.images.length > 0 && item.images[0])
        || (Array.isArray(item.image_urls) && item.image_urls.length > 0 && item.image_urls[0])
        || `https://i.pravatar.cc/400?u=${item.id}`;

    const title = item.title || item.name || item.hostel_name || 'Untitled';
    const price = item.price || item.fees || 0;

    return (
        <div 
            className="cursor-pointer h-full"
            onClick={() => onClick(item)}
        >
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm hover:shadow-md border border-gray-200 dark:border-gray-700 transition-shadow duration-200 overflow-hidden h-full">
                
                {/* Image */}
                <div className="relative h-48 bg-gray-100 dark:bg-gray-800">
                    <Image 
                        src={imageUrl}
                        alt={title}
                        fill
                        className="object-cover"
                    />
                    
                    {/* Featured Badge */}
                    <div className="absolute top-2 left-2">
                        <span className="bg-orange-500 text-white text-xs font-medium px-2 py-1 rounded">
                            FEATURED
                        </span>
                    </div>

                    {/* Price */}
                    <div className="absolute bottom-2 right-2">
                        <div className="bg-white dark:bg-gray-900 rounded px-2 py-1 shadow-sm">
                            <PriceDisplay 
                                price={price}
                                className="text-sm font-semibold text-gray-900 dark:text-white"
                            />
                            {item.type === 'room' && (
                                <span className="text-xs text-gray-500 dark:text-gray-400">/mo</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-4">
                    <h3 className="font-medium text-gray-900 dark:text-white text-base mb-2 line-clamp-2">
                        {title}
                    </h3>
                    
                    <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {item.college && (
                            <div className="flex items-center gap-1">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                </svg>
                                <span className="truncate">{item.college}</span>
                            </div>
                        )}
                    </div>

                    <button className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 py-2 rounded text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors">
                        View Details
                    </button>
                </div>
            </div>
        </div>
    );
};

export default function FeaturedSlider({ listings }) {
    const router = useRouter();

    const handleSlideClick = (item) => {
        if (!item) return;
        const url = getListingUrl(item);
        router.push(url);
    };

    if (!listings || listings.length === 0) {
        return (
            <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="text-4xl mb-4">✨</div>
                <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">No Featured Items Yet</h3>
                <p className="text-gray-500 dark:text-gray-400">Check back soon for featured products!</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {listings.map((item, index) => (
                <FeaturedProductCard 
                    key={`featured-${item.type}-${item.id}-${index}`}
                    item={item} 
                    onClick={handleSlideClick}
                />
            ))}
        </div>
    );
}
