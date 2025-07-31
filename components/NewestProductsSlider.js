'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import ListingCard from './ListingCard';
import Link from 'next/link';
import { useSwipeGesture } from '@/hooks/useSwipeGesture';

export default function NewestProductsSlider({ newestProducts, showDistance = false }) {
    useEffect(() => {
        // console.log('[NewestProductsSlider] Items received:', newestProducts.map(item => ({ id: item.id, type: item.type, title: item.title })));
    }, [newestProducts]);
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
            dragFree: false,
            slidesToScroll: 1,
            breakpoints: {
                '(min-width: 768px)': { slidesToScroll: 1 },
                '(min-width: 1024px)': { slidesToScroll: 1 },
            },
            // Enhanced touch settings for mobile and desktop
            watchDrag: true,
            watchResize: true,
            watchSlides: true,
            skipSnaps: false,
            inViewThreshold: 0.7,
            // Improved touch and mouse handling
            axis: 'x',
            dragThreshold: 10,
            startIndex: 0,
            // Enable mouse dragging for desktop
            dragFree: false,
            dragThreshold: 5,
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

    // Touch gesture handling
    const { handleTouchStart, handleTouchMove, handleTouchEnd } = useSwipeGesture(
        scrollNext, // onSwipeLeft
        scrollPrev  // onSwipeRight
    );

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

    // Keyboard navigation and wheel support
    useEffect(() => {
        let lastScrollTime = 0;
        const scrollThrottleDelay = 300; // Minimum time between scrolls in milliseconds

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

        const handleWheel = (e) => {
            if (!emblaApi) return;
            
            const now = Date.now();
            
            // Throttle scroll events to reduce sensitivity
            if (now - lastScrollTime < scrollThrottleDelay) {
                return;
            }
            
            // Check if horizontal scroll is being used (common with trackpads)
            // Increased threshold to make it less sensitive
            if (Math.abs(e.deltaX) > Math.abs(e.deltaY) && Math.abs(e.deltaX) > 30) {
                e.preventDefault();
                lastScrollTime = now;
                
                if (e.deltaX > 0) {
                    scrollNext();
                } else {
                    scrollPrev();
                }
            }
        };

        const emblaContainer = emblaApi?.containerNode();
        
        window.addEventListener('keydown', handleKeyDown);
        if (emblaContainer) {
            emblaContainer.addEventListener('wheel', handleWheel, { passive: false });
        }
        
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            if (emblaContainer) {
                emblaContainer.removeEventListener('wheel', handleWheel);
            }
        };
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
        <section className="mb-16 px-2">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white flex items-center">
                        Newest Products
                    </h2>
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mt-2">Fresh listings from your fellow students</p>
                </div>
            </div>

            <div className="relative group py-4">
                {/* Embla Carousel Container */}
                <div 
                    className="overflow-hidden cursor-grab active:cursor-grabbing" 
                    ref={emblaRef}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    style={{ touchAction: 'pan-y pinch-zoom' }}
                >
                    <div className="flex gap-4">
                        {newestProducts.map((item, index) => (
                            <div 
                                key={`${item.type}-${item.id}`} 
                                className="flex-[0_0_calc(50%-8px)] sm:flex-[0_0_calc(50%-8px)] md:flex-[0_0_calc(33.33%-12px)] lg:flex-[0_0_calc(25%-12px)] min-w-0 isolated-card"
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
        </section>
    );
}