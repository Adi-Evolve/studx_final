'use client';

import React, { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import Image from 'next/image';
import PriceDisplay from './PriceDisplay';

// SVG Icons for buttons
const ChevronLeftIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
    </svg>
);

const ChevronRightIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
    </svg>
);

const getListingUrl = (item) => {
    const type = item.type;
    if (type === 'room') return `/products/rooms/${item.id}`;
    if (type === 'note') return `/products/notes/${item.id}`;
    return `/products/regular/${item.id}`;
};

// Modern Featured Product Card Component
const FeaturedProductCard = ({ item, onClick }) => {
    if (!item) return null;

    const imageUrl = (Array.isArray(item.images) && item.images.length > 0 && item.images[0])
        || (Array.isArray(item.image_urls) && item.image_urls.length > 0 && item.image_urls[0])
        || `https://i.pravatar.cc/400?u=${item.id}`;

    const title = item.name || item.title || item.hostel_name || 'Untitled';
    const price = item.price || item.fees || 0;

    const getTypeInfo = (type) => {
        switch(type) {
            case 'room':
                return { icon: '🏠', label: 'Room', gradient: 'from-blue-500 to-cyan-500', bg: 'bg-blue-50' };
            case 'note':
                return { icon: '📚', label: 'Notes', gradient: 'from-emerald-500 to-teal-500', bg: 'bg-emerald-50' };
            default:
                return { icon: '📦', label: 'Product', gradient: 'from-purple-500 to-pink-500', bg: 'bg-purple-50' };
        }
    };

    const typeInfo = getTypeInfo(item.type);

    return (
        <div 
            className="featured-card-container cursor-pointer h-full"
            onClick={() => onClick(item)}
        >
            <div className="relative bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 overflow-hidden h-full border border-gray-100 hover:border-gray-200">
                {/* Animated Background Gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-purple-50/20 to-pink-50/30 opacity-0 featured-card-container:hover:opacity-100 transition-opacity duration-700"></div>
                
                {/* Featured Badge */}
                <div className="absolute top-4 left-4 z-20">
                    <div className="px-3 py-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold rounded-full shadow-lg animate-pulse">
                        ⭐ FEATURED
                    </div>
                </div>

                {/* Sold Out Overlay */}
                {item.is_sold && (
                    <div className="absolute inset-0 bg-black/60 z-30 flex items-center justify-center">
                        <div className="bg-red-500 text-white px-6 py-3 rounded-xl font-bold text-lg shadow-xl">
                            SOLD OUT
                        </div>
                    </div>
                )}

                {/* Image Section with Advanced Effects */}
                <div className="relative h-32 md:h-56 overflow-hidden">
                    <Image 
                        src={imageUrl}
                        alt={title}
                        fill
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 50vw, 33vw"
                        style={{ objectFit: 'cover' }}
                        className="transition-all duration-700 featured-card-container:hover:scale-110 featured-card-container:hover:brightness-110"
                    />
                    
                    {/* Multi-layer Overlays */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 featured-card-container:hover:opacity-100 transition-opacity duration-500"></div>
                    <div className={`absolute inset-0 bg-gradient-to-br ${typeInfo.gradient}/20 opacity-0 featured-card-container:hover:opacity-100 transition-opacity duration-500`}></div>
                    
                    {/* Shimmer Effect */}
                    <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent featured-card-container:hover:translate-x-full transition-transform duration-1000 ease-out"></div>
                    
                    {/* Quick View Button */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 featured-card-container:hover:opacity-100 transition-all duration-300 transform translate-y-4 featured-card-container:hover:translate-y-0">
                        <div className="bg-white/90 backdrop-blur-md rounded-2xl px-6 py-3 shadow-2xl border border-white/50">
                            <span className="text-slate-800 font-bold text-sm flex items-center gap-2">
                                <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                                Quick View
                            </span>
                        </div>
                    </div>

                    {/* Price Badge - Floating */}
                    <div className="absolute top-2 right-2 md:top-4 md:right-4 z-20">
                        <div className="bg-white/95 backdrop-blur-sm rounded-xl md:rounded-2xl px-2 py-1 md:px-4 md:py-2 shadow-xl border border-white/50">
                            <PriceDisplay 
                                price={price}
                                className="text-sm md:text-lg font-black text-slate-900"
                            />
                            {item.type === 'room' && (
                                <span className="text-xs text-slate-600 font-medium">/mo</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Content Section */}
                <div className="p-3 md:p-6 relative">
                    {/* Type Badge */}
                    <div className="mb-2 md:mb-4">
                        <div className={`inline-flex items-center gap-1 md:gap-2 px-2 py-1 md:px-3 md:py-1 ${typeInfo.bg} rounded-full border border-gray-200/50`}>
                            <span className="text-xs md:text-sm">{typeInfo.icon}</span>
                            <span className="text-xs font-bold text-slate-700">{typeInfo.label}</span>
                        </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-sm md:text-xl font-black text-slate-900 mb-2 md:mb-3 leading-tight featured-card-container:hover:text-blue-600 transition-colors duration-300" title={title}>
                        {title.length > 30 ? title.substring(0, 30) + '...' : title}
                    </h3>

                    {/* Details Grid - Simplified for mobile */}
                    <div className="space-y-1 md:space-y-3">
                        {/* Condition & Quality */}
                        {item.condition && item.type !== 'room' && (
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1 md:gap-2">
                                    <div className={`w-2 h-2 md:w-3 md:h-3 rounded-full ${
                                        item.condition === 'New' ? 'bg-emerald-500 shadow-lg shadow-emerald-200' :
                                        item.condition === 'Like New' ? 'bg-green-500 shadow-lg shadow-green-200' :
                                        item.condition === 'Good' ? 'bg-yellow-500 shadow-lg shadow-yellow-200' :
                                        'bg-gray-400 shadow-lg shadow-gray-200'
                                    }`}></div>
                                    <span className="text-xs md:text-sm font-semibold text-slate-700">{item.condition}</span>
                                </div>
                                {(item.condition === 'New' || item.condition === 'Like New') && (
                                    <span className="text-emerald-500 text-xs md:text-sm">✨</span>
                                )}
                            </div>
                        )}

                        {/* Location - Only show on desktop or truncate on mobile */}
                        {item.college && (
                            <div className="flex items-center gap-1 md:gap-2">
                                <span className="text-blue-500 text-xs md:text-base">📍</span>
                                <span className="text-xs md:text-sm font-medium text-slate-600 truncate" title={item.college}>
                                    {item.college.length > 15 ? item.college.substring(0, 15) + '...' : item.college}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Action Button - Hidden on mobile, shown on desktop */}
                    <div className="hidden md:block mt-6 opacity-0 featured-card-container:hover:opacity-100 transition-all duration-300 transform translate-y-2 featured-card-container:hover:translate-y-0">
                        <button className={`w-full py-3 px-4 bg-gradient-to-r ${typeInfo.gradient} text-white rounded-xl font-bold text-sm shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105`}>
                            View Details →
                        </button>
                    </div>

                    {/* Glow Effect Border */}
                    <div className="absolute inset-0 rounded-3xl border-2 border-transparent featured-card-container:hover:border-blue-200/50 transition-all duration-500 pointer-events-none"></div>
                </div>

                {/* Bottom Glow */}
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-3/4 h-4 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent opacity-0 featured-card-container:hover:opacity-100 transition-opacity duration-500 blur-md"></div>
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
            <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-bold text-slate-700 mb-2">No Featured Items Yet</h3>
                <p className="text-slate-500">Check back soon for amazing featured products!</p>
            </div>
        );
    }

    return (
        <div className="relative group">
            <div className="overflow-hidden" ref={emblaRef}>
                <div className="flex -ml-6">
                    {listings.map((item, index) => (
                        <div
                            className="relative flex-shrink-0 w-1/2 md:w-1/2 lg:w-1/3 xl:w-1/4 pl-6 embla__slide"
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
            
            {/* Enhanced Navigation Buttons */}
            <button
                onClick={scrollPrev}
                className="absolute top-1/2 -left-6 transform -translate-y-1/2 w-12 h-12 bg-white/95 backdrop-blur-md hover:bg-white rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 opacity-0 group-hover:opacity-100 focus:outline-none border border-gray-200/50 hover:scale-110"
                aria-label="Previous slide"
            >
                <ChevronLeftIcon className="w-6 h-6 text-slate-700 mx-auto" />
            </button>
            
            <button
                onClick={scrollNext}
                className="absolute top-1/2 -right-6 transform -translate-y-1/2 w-12 h-12 bg-white/95 backdrop-blur-md hover:bg-white rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 opacity-0 group-hover:opacity-100 focus:outline-none border border-gray-200/50 hover:scale-110"
                aria-label="Next slide"
            >
                <ChevronRightIcon className="w-6 h-6 text-slate-700 mx-auto" />
            </button>

            {/* Slide Indicators */}
            <div className="flex justify-center mt-8 gap-2">
                {listings.map((_, index) => (
                    <button
                        key={index}
                        className="w-2 h-2 rounded-full bg-slate-300 hover:bg-slate-400 transition-colors duration-200"
                        onClick={() => emblaApi && emblaApi.scrollTo(index)}
                    />
                ))}
            </div>
        </div>
    );
}
