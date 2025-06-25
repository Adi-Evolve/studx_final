'use client';

import React, { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import ListingCard from './ListingCard';

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

export default function FeaturedSlider({ listings }) {
    const router = useRouter();
    const [emblaRef, emblaApi] = useEmblaCarousel(
        {
            loop: true,
            align: 'start',
            draggable: false, // Disable manual dragging
        },
        // Autoplay pauses on hover to allow button interaction
        [Autoplay({ delay: 4000, stopOnInteraction: false, stopOnMouseEnter: true })]
    );

    const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
    const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

    const handleSlideClick = useCallback((item) => {
        if (!item) return;
        const url = getListingUrl(item);
        router.push(url);
    }, [router]);

    if (!listings || listings.length === 0) {
        return null;
    }

    return (
        <div className="relative group">
            <div className="overflow-hidden" ref={emblaRef}>
                <div className="flex -ml-4">
                    {listings.map((item, index) => (
                        <div
                            className="relative flex-shrink-0 w-1/2 md:w-1/3 lg:w-1/4 pl-4 embla__slide cursor-pointer"
                            key={`${item.type}-${item.id}-${index}`}
                            onClick={() => handleSlideClick(item)}
                        >
                            <ListingCard item={item} isSponsored={true} asLink={false} />
                        </div>
                    ))}
                </div>
            </div>
            {/* Prev Button */}
            <button
                onClick={scrollPrev}
                className="absolute top-1/2 left-0 transform -translate-y-1/2 -translate-x-4 bg-white/80 hover:bg-white rounded-full p-2 shadow-md transition-opacity opacity-0 group-hover:opacity-100 focus:outline-none"
                aria-label="Previous slide"
            >
                <ChevronLeftIcon className="w-6 h-6 text-gray-700" />
            </button>
            {/* Next Button */}
            <button
                onClick={scrollNext}
                className="absolute top-1/2 right-0 transform -translate-y-1/2 translate-x-4 bg-white/80 hover:bg-white rounded-full p-2 shadow-md transition-opacity opacity-0 group-hover:opacity-100 focus:outline-none"
                aria-label="Next slide"
            >
                <ChevronRightIcon className="w-6 h-6 text-gray-700" />
            </button>
        </div>
    );
}
