'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import FeaturedCard from './FeaturedCard';
import Link from 'next/link';

export default function FeaturedSlider({ featuredItems }) {
    // Add null/undefined checking
    if (!featuredItems || featuredItems.length === 0) {
        return null;
    }

    const [selectedIndex, setSelectedIndex] = useState(0);
    const [scrollSnaps, setScrollSnaps] = useState([]);
    const [prevBtnEnabled, setPrevBtnEnabled] = useState(false);
    const [nextBtnEnabled, setNextBtnEnabled] = useState(false);
    
    // Configure Embla with autoplay and responsive options
    const autoplayOptions = {
        delay: 5000,
        stopOnInteraction: true,
        stopOnMouseEnter: true,
        stopOnFocusIn: true,
        playOnInit: true,
        rootNode: (emblaRoot) => emblaRoot.parentElement,
    };

    const [emblaRef, emblaApi] = useEmblaCarousel(
        {
            loop: true,
            align: 'start',
            containScroll: 'trimSnaps',
            dragFree: true,
            slidesToScroll: 1,
            breakpoints: {
                '(min-width: 640px)': { slidesToScroll: 2 },
                '(min-width: 1024px)': { slidesToScroll: 3 },
            },
            // Enhanced touch settings for mobile
            watchDrag: true,
            watchResize: true,
            watchSlides: true,
            skipSnaps: false,
            inViewThreshold: 0.7,
        },
        [Autoplay(autoplayOptions)]
    );

    // Navigation functions
    const scrollPrev = useCallback(() => {
        if (emblaApi) emblaApi.scrollPrev();
    }, [emblaApi]);

    const scrollNext = useCallback(() => {
        if (emblaApi) emblaApi.scrollNext();
    }, [emblaApi]);

    // Scroll to specific index
    const scrollTo = useCallback((index) => {
        if (emblaApi) emblaApi.scrollTo(index);
    }, [emblaApi]);

    // Update button states and selected index
    const onSelect = useCallback(() => {
        if (!emblaApi) return;
        setSelectedIndex(emblaApi.selectedScrollSnap());
        setPrevBtnEnabled(emblaApi.canScrollPrev());
        setNextBtnEnabled(emblaApi.canScrollNext());
    }, [emblaApi]);

    // Initialize embla
    useEffect(() => {
        if (!emblaApi) return;
        
        onSelect();
        setScrollSnaps(emblaApi.scrollSnapList());
        emblaApi.on('select', onSelect);
        emblaApi.on('reInit', onSelect);
        
        return () => {
            emblaApi.off('select', onSelect);
            emblaApi.off('reInit', onSelect);
        };
    }, [emblaApi, onSelect]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!emblaApi) return;
            
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                scrollPrev();
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                scrollNext();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [emblaApi, scrollPrev, scrollNext]);

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
                    <button
                        onClick={scrollPrev}
                        disabled={!prevBtnEnabled}
                        className="p-2 rounded-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Previous featured items"
                    >
                        <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <button
                        onClick={scrollNext}
                        disabled={!nextBtnEnabled}
                        className="p-2 rounded-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Next featured items"
                    >
                        <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            </div>

            <div className="relative">
                {/* Embla Carousel Container */}
                <div className="overflow-hidden rounded-2xl" ref={emblaRef}>
                    <div className="flex touch-pan-x touch-pinch-zoom">
                        {featuredItems.map((item, index) => (
                            <div 
                                key={`featured-${item.type}-${item.id}-${index}`}
                                className="flex-[0_0_90%] sm:flex-[0_0_70%] md:flex-[0_0_50%] lg:flex-[0_0_33.333%] min-w-0 pl-4 first:pl-0"
                                style={{ isolation: 'isolate' }}
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
                {scrollSnaps.length > 1 && (
                    <div className="flex justify-center mt-6 space-x-2">
                        {scrollSnaps.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => scrollTo(index)}
                                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                                    index === selectedIndex 
                                        ? 'bg-gradient-to-r from-orange-500 to-red-500 scale-125' 
                                        : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
                                }`}
                                aria-label={`Go to slide ${index + 1}`}
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
