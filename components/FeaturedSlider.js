'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import FeaturedCard from './FeaturedCard';
import Link from 'next/link';
import { useSwipeGesture } from '@/hooks/useSwipeGesture';

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

    return (
        <section className="mb-16 px-2">
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
            </div>

            <div className="relative py-4">
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
                        {featuredItems.map((item, index) => (
                            <div 
                                key={`featured-${item.type}-${item.id}-${index}`}
                                className="flex-[0_0_calc(50%-8px)] sm:flex-[0_0_calc(50%-8px)] md:flex-[0_0_calc(33.33%-12px)] lg:flex-[0_0_calc(25%-12px)] min-w-0 isolated-card"
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

        </section>
    );
}
