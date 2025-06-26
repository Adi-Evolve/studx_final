'use client';

import { useState, useRef, useEffect } from 'react';
import ListingCard from './ListingCard';
import Link from 'next/link';

export default function NewestProductsSlider({ newestProducts }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);
    const sliderRef = useRef(null);
    const itemsToShow = 4; // Show 4 items at once
    const maxIndex = Math.max(0, newestProducts.length - itemsToShow);

    // Auto-play functionality
    useEffect(() => {
        if (!isAutoPlaying || newestProducts.length <= itemsToShow) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
        }, 4000);

        return () => clearInterval(interval);
    }, [isAutoPlaying, maxIndex, newestProducts.length, itemsToShow]);

    const handlePrev = () => {
        setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
        setIsAutoPlaying(false);
        setTimeout(() => setIsAutoPlaying(true), 10000); // Resume auto-play after 10s
    };

    const handleNext = () => {
        setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
        setIsAutoPlaying(false);
        setTimeout(() => setIsAutoPlaying(true), 10000); // Resume auto-play after 10s
    };

    if (!newestProducts || newestProducts.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="text-6xl mb-4">🏪</div>
                <h3 className="text-xl font-bold text-gray-700 mb-2">No New Items Yet</h3>
                <p className="text-gray-500">Be the first to list something amazing!</p>
                <Link 
                    href="/sell" 
                    className="inline-block mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Start Selling
                </Link>
            </div>
        );
    }

    return (
        <section className="mb-16">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-gray-800 flex items-center">
                        ✨ Newest Products
                    </h2>
                    <p className="text-gray-600 mt-2">Fresh listings from your fellow students</p>
                </div>
                <Link 
                    href="/search?sortBy=newest" 
                    className="text-blue-600 hover:text-blue-800 font-semibold flex items-center"
                >
                    View All
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </Link>
            </div>

            <div className="relative group">
                {/* Main slider container */}
                <div className="overflow-hidden rounded-xl">
                    <div 
                        ref={sliderRef}
                        className="flex transition-transform duration-500 ease-in-out"
                        style={{ transform: `translateX(-${currentIndex * (100 / itemsToShow)}%)` }}
                    >
                        {newestProducts.map((item, index) => (
                            <div 
                                key={`${item.type}-${item.id}`} 
                                className="w-1/2 md:w-1/4 flex-shrink-0 px-2 md:px-3"
                            >
                                <ListingCard item={item} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Navigation buttons - only show if we have more items than visible */}
                {newestProducts.length > itemsToShow && (
                    <>
                        <button
                            onClick={handlePrev}
                            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-md hover:bg-white rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 opacity-0 group-hover:opacity-100 focus:outline-none border border-gray-200/50 hover:scale-110 z-10"
                            aria-label="Previous products"
                        >
                            <svg className="w-6 h-6 text-gray-700 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        
                        <button
                            onClick={handleNext}
                            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-md hover:bg-white rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 opacity-0 group-hover:opacity-100 focus:outline-none border border-gray-200/50 hover:scale-110 z-10"
                            aria-label="Next products"
                        >
                            <svg className="w-6 h-6 text-gray-700 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </>
                )}

                {/* Dots indicator */}
                {newestProducts.length > itemsToShow && (
                    <div className="flex justify-center mt-6 space-x-2">
                        {Array.from({ length: maxIndex + 1 }).map((_, index) => (
                            <button
                                key={index}
                                onClick={() => {
                                    setCurrentIndex(index);
                                    setIsAutoPlaying(false);
                                    setTimeout(() => setIsAutoPlaying(true), 10000);
                                }}
                                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                                    index === currentIndex 
                                        ? 'bg-blue-600 w-8' 
                                        : 'bg-gray-300 hover:bg-gray-400'
                                }`}
                            />
                        ))}
                    </div>
                )}

                {/* Auto-play indicator */}
                {isAutoPlaying && newestProducts.length > itemsToShow && (
                    <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                        Auto-playing ▶
                    </div>
                )}
            </div>

            {/* Quick stats */}
            <div className="mt-8 flex justify-center">
                <div className="bg-gray-50 rounded-lg px-6 py-3 text-sm text-gray-600">
                    Showing {Math.min(itemsToShow, newestProducts.length)} of {newestProducts.length} newest items
                </div>
            </div>
        </section>
    );
}