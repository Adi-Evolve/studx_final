'use client';

import { useState, useRef, useEffect } from 'react';
import ListingCard from './ListingCard';
import Link from 'next/link';

export default function NewestProductsSlider({ newestProducts }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);
    const [isHovered, setIsHovered] = useState(false);
    const [touchStart, setTouchStart] = useState(0);
    const [touchEnd, setTouchEnd] = useState(0);
    const [progress, setProgress] = useState(0);
    const sliderRef = useRef(null);
    const progressRef = useRef(null);
    const itemsToShow = 4; // Show 4 items at once
    const maxIndex = Math.max(0, newestProducts.length - itemsToShow);

    // Auto-play functionality with progress
    useEffect(() => {
        if (!isAutoPlaying || isHovered || newestProducts.length <= itemsToShow) {
            setProgress(0);
            return;
        }

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
            setProgress(0); // Reset progress when slide changes
        }, 4000); // 4 second slide interval

        // Progress animation
        const progressInterval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) return 0;
                return prev + (100 / 40); // 100% in 4000ms (40 steps of 100ms)
            });
        }, 100);

        return () => {
            clearInterval(interval);
            clearInterval(progressInterval);
        };
    }, [isAutoPlaying, isHovered, maxIndex, newestProducts.length, itemsToShow, currentIndex]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (newestProducts.length <= itemsToShow) return;
            
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                handlePrev();
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                handleNext();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [maxIndex, newestProducts.length, itemsToShow]);

    const handlePrev = () => {
        setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
        setIsAutoPlaying(false);
        setProgress(0);
        // Resume auto-play after 8 seconds of user interaction
        setTimeout(() => setIsAutoPlaying(true), 8000);
    };

    const handleNext = () => {
        setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
        setIsAutoPlaying(false);
        setProgress(0);
        // Resume auto-play after 8 seconds of user interaction
        setTimeout(() => setIsAutoPlaying(true), 8000);
    };

    // Touch handlers for mobile swipe
    const handleTouchStart = (e) => {
        setTouchStart(e.targetTouches[0].clientX);
    };

    const handleTouchMove = (e) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const handleTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        
        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > 50;
        const isRightSwipe = distance < -50;

        if (isLeftSwipe && newestProducts.length > itemsToShow) {
            handleNext();
        }
        if (isRightSwipe && newestProducts.length > itemsToShow) {
            handlePrev();
        }
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
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white flex items-center">
                        Newest Products
                    </h2>
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mt-2">Fresh listings from your fellow students</p>
                </div>
                <Link 
                    href="/search?sortBy=newest" 
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-semibold flex items-center text-sm sm:text-base"
                >
                    Explore more
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </Link>
            </div>

            <div className="relative group" 
                onMouseEnter={() => setIsHovered(true)} 
                onMouseLeave={() => setIsHovered(false)}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
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
                                className="w-1/2 md:w-1/4 flex-shrink-0 px-2 md:px-3 isolated-card"
                                style={{ isolation: 'isolate' }}
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
                                    setProgress(0);
                                    // Resume auto-play after 8 seconds of user interaction
                                    setTimeout(() => setIsAutoPlaying(true), 8000);
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

                {/* No auto-play indicator - clean interface */}
            </div>

            {/* Quick stats and controls info */}
            <div className="mt-8 flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg px-6 py-3 text-sm text-gray-600 dark:text-gray-300">
                    Showing {Math.min(itemsToShow, newestProducts.length)} of {newestProducts.length} newest items
                </div>
            </div>
        </section>
    );
}