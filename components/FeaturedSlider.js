'use client';

import { useState, useRef, useEffect } from 'react';
import ListingCard from './ListingCard';
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
    const itemsToShow = 4; // Show 4 items at once
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
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-200">
                            Featured Items
                        </h2>
                    </div>
                    <div className="hidden md:block px-3 py-1 bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900 dark:to-red-900 rounded-full">
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
                                className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
                                aria-label="Previous featured items"
                            >
                                <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <button
                                onClick={handleNext}
                                className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
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
                {/* Progress Bar */}
                {featuredItems.length > itemsToShow && isAutoPlaying && !isHovered && (
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden z-10">
                        <div 
                            className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-100 ease-linear"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                )}

                <div 
                    ref={sliderRef}
                    className="overflow-hidden"
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                >
                    <div 
                        className="flex transition-transform duration-500 ease-in-out"
                        style={{ 
                            transform: `translateX(-${currentIndex * (100 / itemsToShow)}%)`,
                            width: `${(featuredItems.length / itemsToShow) * 100}%`
                        }}
                    >
                        {featuredItems.map((item, index) => (
                            <div 
                                key={`featured-${item.type}-${item.id}-${index}`}
                                className="flex-shrink-0 px-3"
                                style={{ width: `${100 / featuredItems.length}%` }}
                            >
                                <ListingCard 
                                    item={item} 
                                    isSponsored={true}
                                    asLink={true}
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

            {/* View All Featured Button */}
            <div className="text-center mt-8">
                <Link
                    href="/featured"
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                    View All Featured Items
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                </Link>
            </div>
        </section>
    );
}
