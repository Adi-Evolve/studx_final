'use client';

import React, { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import Image from 'next/image';
import PriceDisplay from './PriceDisplay';

// SVG Icons
const ChevronLeftIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
    </svg>
);

const ChevronRightIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
    </svg>
);

const getListingUrl = (item) => {
    const type = item.type;
    if (type === 'room') return `/products/rooms/${item.id}`;
    if (type === 'note') return `/products/notes/${item.id}`;
    return `/products/regular/${item.id}`;
};

// Simple & Clean Featured Product Card
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

                    {/* Sold Out */}
                    {item.is_sold && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <span className="bg-red-500 text-white px-3 py-1 rounded font-medium text-sm">
                                SOLD OUT
                            </span>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="p-4">
                    {/* Type Badge */}
                    <div className="mb-2">
                        <span className={`inline-block text-xs font-medium px-2 py-1 rounded ${
                            item.type === 'room' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                            item.type === 'note' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                            'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                        }`}>
                            {item.type === 'room' ? 'Room' : item.type === 'note' ? 'Notes' : 'Product'}
                        </span>
                    </div>

                    {/* Title */}
                    <h3 className="font-medium text-gray-900 dark:text-white text-base mb-2 line-clamp-2">
                        {title}
                    </h3>

                    {/* Details */}
                    <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {/* Condition */}
                        {item.condition && item.type !== 'room' && (
                            <div className="flex items-center gap-1">
                                <div className={`w-1.5 h-1.5 rounded-full ${
                                    item.condition === 'New' ? 'bg-green-500' :
                                    item.condition === 'Like New' ? 'bg-blue-500' :
                                    item.condition === 'Good' ? 'bg-yellow-500' : 'bg-gray-400'
                                }`}></div>
                                <span>{item.condition}</span>
                            </div>
                        )}

                        {/* Location */}
                        {item.college && (
                            <div className="flex items-center gap-1">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                </svg>
                                <span className="truncate">{item.college}</span>
                            </div>
                        )}
                    </div>

                    {/* View Button */}
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
    const [emblaRef, emblaApi] = useEmblaCarousel(
        {
            loop: true,
            align: 'start',
            draggable: false,
        },
        [Autoplay({ delay: 5000, stopOnInteraction: false, stopOnMouseEnter: true })]
    );

    const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
    const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

    const handleSlideClick = useCallback((item) => {
        if (!item) return;
        const url = getListingUrl(item);
        router.push(url);
    }, [router]);

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
        <div className="relative group">
            <div className="overflow-hidden" ref={emblaRef}>
                <div className="flex -ml-4">
                    {listings.map((item, index) => (
                        <div
                            className="flex-shrink-0 w-full sm:w-1/2 lg:w-1/3 xl:w-1/4 pl-4"
                            key={`featured-${item.type}-${item.id}-${index}`}
                        >
                            <FeaturedProductCard 
                                item={item} 
                                onClick={handleSlideClick}
                            />
                        </div>
                    ))}
                </div>
            </div>
            
            {/* Navigation Buttons */}
            <button
                onClick={scrollPrev}
                className="absolute top-1/2 -left-4 transform -translate-y-1/2 w-8 h-8 bg-white dark:bg-gray-800 rounded-full shadow-md hover:shadow-lg transition-shadow opacity-0 group-hover:opacity-100 border border-gray-200 dark:border-gray-700"
                aria-label="Previous"
            >
                <ChevronLeftIcon className="w-4 h-4 text-gray-600 dark:text-gray-400 mx-auto" />
            </button>
            
            <button
                onClick={scrollNext}
                className="absolute top-1/2 -right-4 transform -translate-y-1/2 w-8 h-8 bg-white dark:bg-gray-800 rounded-full shadow-md hover:shadow-lg transition-shadow opacity-0 group-hover:opacity-100 border border-gray-200 dark:border-gray-700"
                aria-label="Next"
            >
                <ChevronRightIcon className="w-4 h-4 text-gray-600 dark:text-gray-400 mx-auto" />
            </button>

            {/* Indicators */}
            <div className="flex justify-center mt-4 gap-1">
                {listings.map((_, index) => (
                    <button
                        key={index}
                        className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                        onClick={() => emblaApi && emblaApi.scrollTo(index)}
                    />
                ))}
            </div>
        </div>
    );
}
