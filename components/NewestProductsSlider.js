'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import ListingCard from './ListingCard';
import Link from 'next/link';

export default function NewestProductsSlider({ newestProducts, showDistance = false }) {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [scrollSnaps, setScrollSnaps] = useState([]);
    const [prevBtnEnabled, setPrevBtnEnabled] = useState(false);
    const [nextBtnEnabled, setNextBtnEnabled] = useState(false);
    
    // Configure Embla with autoplay and responsive options
    const autoplayOptions = {
        delay: 4000,
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
                '(min-width: 768px)': { slidesToScroll: 2 },
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

    // Scroll to specific index
    const scrollTo = useCallback((index) => {
        if (emblaApi) emblaApi.scrollTo(index);
    }, [emblaApi]);

    // Navigation functions
    const scrollPrev = useCallback(() => {
        if (emblaApi) emblaApi.scrollPrev();
    }, [emblaApi]);

    const scrollNext = useCallback(() => {
        if (emblaApi) emblaApi.scrollNext();
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

            <div className="relative group">
                {/* Embla Carousel Container */}
                <div className="overflow-hidden" ref={emblaRef}>
                    <div className="flex touch-pan-x touch-pinch-zoom">
                        {newestProducts.map((item, index) => (
                            <div 
                                key={`${item.type}-${item.id}`} 
                                className="flex-[0_0_48%] sm:flex-[0_0_48%] md:flex-[0_0_48%] lg:flex-[0_0_31%] xl:flex-[0_0_23%] min-w-0 pl-2 first:pl-0"
                                style={{ isolation: 'isolate' }}
                            >
                                <ListingCard item={item} showDistance={showDistance} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Navigation buttons */}
                <button
                    onClick={scrollPrev}
                    disabled={!prevBtnEnabled}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-white/95 backdrop-blur-sm hover:bg-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 opacity-0 group-hover:opacity-100 focus:opacity-100 focus:outline-none border border-gray-200/50 hover:scale-105 z-10 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
                    aria-label="Previous products"
                >
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                
                <button
                    onClick={scrollNext}
                    disabled={!nextBtnEnabled}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-white/95 backdrop-blur-sm hover:bg-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 opacity-0 group-hover:opacity-100 focus:opacity-100 focus:outline-none border border-gray-200/50 hover:scale-105 z-10 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
                    aria-label="Next products"
                >
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>

                {/* Dots indicator */}
                {scrollSnaps.length > 1 && (
                    <div className="flex justify-center mt-6 space-x-2">
                        {scrollSnaps.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => scrollTo(index)}
                                className={`h-2 rounded-full transition-all duration-300 ${
                                    index === selectedIndex 
                                        ? 'bg-blue-600 w-8' 
                                        : 'bg-gray-300 hover:bg-gray-400 w-2'
                                }`}
                                aria-label={`Go to slide ${index + 1}`}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Quick stats and controls info */}
            <div className="mt-8 flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg px-4 py-2 sm:px-6 sm:py-3 text-sm text-gray-600 dark:text-gray-300">
                    Showing {newestProducts.length} newest items
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                    💡 Swipe or drag to explore more
                </div>
            </div>
        </section>
    );
}