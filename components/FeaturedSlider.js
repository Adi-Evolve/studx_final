'use client';

import { useState, useRef, useEffect } from 'react';
import FeaturedCard from './FeaturedCard';
import Link from 'next/link';

export default function FeaturedSlider({ featuredItems }) {
    // Add null/undefined checking
    if (!featuredItems || featuredItems.length === 0) {
        return null;
    }

    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);
    const [isHovered, setIsHovered] = useState(false);
    const [touchStart, setTouchStart] = useState(0);
    const [touchEnd, setTouchEnd] = useState(0);
    const [progress, setProgress] = useState(0);
    const sliderRef = useRef(null);
    const progressRef = useRef(null);
    
    // Responsive items to show
    const getItemsToShow = () => {
        if (typeof window !== 'undefined') {
            if (window.innerWidth < 640) return 2; // Mobile: 2 cards
            if (window.innerWidth < 768) return 2; // Small tablet: 2 cards
            if (window.innerWidth < 1024) return 3; // Large tablet: 3 cards
            return 4; // Desktop: 4 cards
        }
        return 4; // Default for SSR
    };
    
    const [itemsToShow, setItemsToShow] = useState(getItemsToShow());
    const maxIndex = Math.max(0, featuredItems.length - itemsToShow);

    // Auto-play functionality with progress
    useEffect(() => {
        if (!isAutoPlaying || isHovered || featuredItems.length <= itemsToShow) {
            setProgress(0);
            return;
        }

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
            setProgress(0); // Reset progress when slide changes
        }, 5000); // 5 second slide interval for featured items

        // Progress animation
        const progressInterval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) return 0;
                return prev + (100 / 50); // 100% in 5000ms (50 steps of 100ms)
            });
        }, 100);

        return () => {
            clearInterval(interval);
            clearInterval(progressInterval);
        };
    }, [isAutoPlaying, isHovered, maxIndex, featuredItems.length, itemsToShow, currentIndex]);

    // Handle window resize for responsive items
    useEffect(() => {
        const handleResize = () => {
            const newItemsToShow = getItemsToShow();
            setItemsToShow(newItemsToShow);
            setCurrentIndex(0); // Reset to first slide on resize
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (featuredItems.length <= itemsToShow) return;
            
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
    }, [maxIndex, featuredItems.length, itemsToShow]);

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

        if (isLeftSwipe && featuredItems.length > itemsToShow) {
            handleNext();
        }
        if (isRightSwipe && featuredItems.length > itemsToShow) {
            handlePrev();
        }
    };

    const handleMouseEnter = () => {
        setIsHovered(true);
        setProgress(0);
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
    };

    return (
        <section className="mb-16">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-200">
                            Featured Items
                        </h2>
                    </div>
                    <div className="px-3 py-1 bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900 dark:to-red-900 rounded-full">
                        <span className="text-sm font-semibold text-orange-800 dark:text-orange-200">
                            Sponsored
                        </span>
                    </div>
                </div>
                
                <div className="flex items-center space-x-2">
                    {featuredItems.length > itemsToShow && (
                        <>
                            <button
                                onClick={handlePrev}
                                className="p-2 rounded-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={currentIndex === 0}
                                aria-label="Previous featured items"
                            >
                                <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <button
                                onClick={handleNext}
                                className="p-2 rounded-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={currentIndex >= maxIndex}
                                aria-label="Next featured items"
                            >
                                <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </>
                    )}
                </div>
            </div>

            <div className="relative">
                {/* Enhanced Progress Bar */}
                {featuredItems.length > itemsToShow && isAutoPlaying && !isHovered && (
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden z-10">
                        <div 
                            className="h-full bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 transition-all duration-100 ease-linear rounded-full"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                )}

                {/* Enhanced slider container */}
                <div 
                    ref={sliderRef}
                    className="overflow-hidden rounded-2xl"
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                >
                    <div 
                        className="flex transition-transform duration-700 ease-in-out gap-2 sm:gap-4"
                        style={{ 
                            transform: `translateX(-${currentIndex * (100 / itemsToShow)}%)`,
                            width: `${(featuredItems.length / itemsToShow) * 100}%`
                        }}
                    >
                        {featuredItems.map((item, index) => (
                            <div 
                                key={`featured-${item.type}-${item.id}-${index}`}
                                className="flex-shrink-0 px-2 sm:px-3"
                                style={{ width: `${100 / featuredItems.length}%` }}
                            >
                                <FeaturedCard 
                                    item={item} 
                                    index={index}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Dots indicator */}
                {featuredItems.length > itemsToShow && (
                    <div className="flex justify-center mt-6 space-x-2">
                        {Array.from({ length: maxIndex + 1 }, (_, i) => (
                            <button
                                key={i}
                                onClick={() => {
                                    setCurrentIndex(i);
                                    setIsAutoPlaying(false);
                                    setProgress(0);
                                    setTimeout(() => setIsAutoPlaying(true), 8000);
                                }}
                                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                                    i === currentIndex 
                                        ? 'bg-gradient-to-r from-orange-500 to-red-500 scale-125' 
                                        : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
                                }`}
                                aria-label={`Go to slide ${i + 1}`}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Enhanced View All Featured Button */}
            <div className="text-center mt-8">
                <Link
                    href="/featured"
                    className="inline-flex items-center px-6 py-3 sm:px-8 sm:py-4 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white rounded-2xl font-bold text-sm sm:text-base hover:from-orange-600 hover:via-red-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
                >
                    <span className="mr-2">✨</span>
                    View All Featured Items
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                </Link>
            </div>
        </section>
    );
}
