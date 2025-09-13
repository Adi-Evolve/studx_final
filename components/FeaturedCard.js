'use client';

import Link from 'next/link';
import Image from 'next/image';
import PriceDisplay from './PriceDisplay';
import { formatDistance } from '@/lib/locationUtils';

const getListingUrl = (item) => {
    const type = item.type;
    if (type === 'room') {
        return `/products/rooms/${item.id}`;
    }
    if (type === 'note') {
        return `/products/notes/${item.id}`;
    }
    if (type === 'rental') {
        return `/products/rentals/${item.id}`;
    }
    if (type === 'arduino_kit') {
        return `/products/arduino/${item.id}`;
    }
    return `/products/regular/${item.id}`;
};

export default function FeaturedCard({ item, index = 0, showDistance = false }) {
    if (!item) {
        return null;
    }

    // Get image URL with proper fallback handling
    const imageUrl = (Array.isArray(item.images) && item.images.length > 0 && item.images[0])
        || (Array.isArray(item.image_urls) && item.image_urls.length > 0 && item.image_urls[0])
        || `https://i.pravatar.cc/400?u=${item.id}`;

    const url = getListingUrl(item);
    
    // Handle different title fields based on item type
    const title = item.title || item.name || item.hostel_name || 'Untitled';
    
    // Handle different price fields
    const price = item.price || item.fees || 0;

    return (
        <Link href={url} className="block group">
            <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg dark:shadow-gray-900/50 overflow-hidden hover:shadow-2xl dark:hover:shadow-gray-700/50 transition-all duration-500 transform hover:scale-[1.02] h-full border border-orange-200 dark:border-orange-500/30 hover:border-orange-300 dark:hover:border-orange-400">
                
                {/* Featured Badge - Enhanced */}
                <div className="absolute top-3 right-3 z-20">
                    <div className="relative">
                        <div className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
                            <span className="flex items-center gap-1">
                                <span className="animate-pulse">⭐</span>
                                FEATURED
                            </span>
                        </div>
                        {/* Glowing effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 rounded-full blur-md opacity-30 animate-pulse"></div>
                    </div>
                </div>

                {/* Sponsored Number Badge */}
                <div className="absolute top-3 left-3 z-20">
                    <div className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-md border-2 border-orange-200 dark:border-orange-500/50">
                        #{index + 1}
                    </div>
                </div>

                {/* Sold Out Badge */}
                {item.is_sold && (
                    <div className="absolute top-3 left-1/2 transform -translate-x-1/2 z-20">
                        <div className="bg-red-500 dark:bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                            SOLD OUT
                        </div>
                    </div>
                )}

                {/* Image Container - More compact */}
                <div className="relative h-40 sm:h-48 md:h-52 overflow-hidden bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 dark:from-orange-900/20 dark:via-red-900/20 dark:to-pink-900/20">
                    <Image 
                        draggable="false" 
                        src={imageUrl}
                        alt={title}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        style={{ objectFit: 'cover' }}
                        className="transition-all duration-700 group-hover:scale-110 group-hover:rotate-1"
                    />
                    
                    {/* Enhanced overlay with gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    {/* Shimmer effect on hover */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                </div>

                {/* Content - More compact */}
                <div className="p-3 sm:p-4 md:p-5 flex-grow flex flex-col">
                    {/* Type Badge - More compact */}
                    <div className="mb-2">
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-bold rounded-full shadow-sm ${
                            item.type === 'room' ? 'bg-gradient-to-r from-emerald-100 to-green-100 dark:from-emerald-900 dark:to-green-900 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700' : 
                            item.type === 'note' ? 'bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700' : 
                            item.type === 'rental' ? 'bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-700' :
                            item.type === 'arduino_kit' ? 'bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900 dark:to-indigo-900 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-700' :
                            'bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-700'
                        }`}>
                            <span className="mr-1 text-xs">
                                {item.type === 'room' ? '🏠' : 
                                 item.type === 'note' ? '📚' : 
                                 item.type === 'rental' ? '�' :
                                 item.type === 'arduino_kit' ? '⚡' :
                                 '�📦'}
                            </span>
                            <span className="text-xs">
                                {item.type === 'room' ? 'Room' : 
                                 item.type === 'note' ? 'Notes' : 
                                 item.type === 'rental' ? 'Rental' :
                                 item.type === 'arduino_kit' ? 'Arduino Kit' :
                                 'Product'}
                            </span>
                        </span>
                    </div>

                    {/* Title - More compact */}
                    <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2 text-sm sm:text-base group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors duration-300 leading-tight" title={title}>
                        {title}
                    </h3>
                    
                    {/* Additional Info - More compact */}
                    <div className="flex items-center justify-between gap-1 mb-2 text-xs">
                        <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                            {item.condition && (
                                <span className="flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                                    <span className="truncate">{item.condition}</span>
                                </span>
                            )}
                            {item.category && item.condition && <span>•</span>}
                            {item.category && (
                                <span className="flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                                    <span className="truncate">{item.category}</span>
                                </span>
                            )}
                        </div>
                        
                        {/* Distance display for featured items */}
                        {showDistance && item.distance !== null && item.distance !== undefined && (
                            <div className="text-orange-600 dark:text-orange-400 font-medium flex items-center text-xs">
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                {formatDistance(item.distance)}
                            </div>
                        )}
                    </div>
                    
                    {/* Price and CTA - More compact */}
                    <div className="mt-auto">
                        <div className="flex items-end justify-between">
                            <div className="flex flex-col">
                                <PriceDisplay 
                                    price={price}
                                    className="text-lg sm:text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 dark:from-orange-400 dark:via-red-400 dark:to-pink-400"
                                />
                                <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    Featured Deal
                                </span>
                            </div>
                            
                            {/* Enhanced CTA Button - More compact */}
                            <div className="flex items-center gap-1 bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 group-hover:from-orange-600 group-hover:to-red-600">
                                <span className="hidden sm:inline text-xs">View</span>
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom gradient accent */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 opacity-60 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
        </Link>
    );
}
