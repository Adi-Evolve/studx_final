'use client';

import { useState, useEffect, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Link from 'next/link';
import Image from 'next/image';
import { useSwipeGesture } from '@/hooks/useSwipeGesture';

function RoomCard({ room }) {
    const imageUrl = (Array.isArray(room.images) && room.images.length > 0 && room.images[0])
        || `https://i.pravatar.cc/300?u=${room.id}`;
    const isFlat = room.category === 'Flat';
    const displayPrice = room.price || room.fees || 0;
    const displayDuration = room.duration || 'monthly';
    const title = room.title || room.hostel_name || 'Untitled Property';

    return (
        <Link href={`/products/rooms/${room.id}`} legacyBehavior>
            <a className="block h-full hover-lift" style={{ textDecoration: 'none' }}>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900 overflow-hidden hover:shadow-xl dark:hover:shadow-gray-700 transition-all duration-300 transform hover:scale-105 h-full flex flex-col group relative border-2 dark:border-gray-700 border-transparent hover:border-emerald-200 dark:hover:border-emerald-600">
                    {/* Image */}
                    <div className="relative h-32 sm:h-48 overflow-hidden bg-gradient-to-br from-slate-100 to-emerald-50">
                        <Image
                            draggable="false"
                            src={imageUrl}
                            alt={title}
                            fill
                            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                            style={{ objectFit: 'cover' }}
                            className="transition-transform duration-300 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>

                    {/* Content */}
                    <div className="p-2 sm:p-4 flex-grow flex flex-col">
                        {/* Type Badge */}
                        <div className="mb-1.5 sm:mb-2">
                            <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold rounded-full bg-emerald-50 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700">
                                {isFlat ? '🏢 Flat' : '🏠 Hostel'}
                            </span>
                        </div>

                        {/* Title */}
                        <h3 className="font-semibold text-slate-900 dark:text-gray-100 mb-1.5 sm:mb-2 line-clamp-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-200 text-xs sm:text-sm leading-tight">
                            {title}
                        </h3>

                        {/* Price + Details */}
                        <div className="mt-auto space-y-1.5 sm:space-y-2">
                            <div className="flex items-center justify-between">
                                <div className="flex flex-col">
                                    <span className="text-sm sm:text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-800 to-emerald-600 dark:from-slate-200 dark:to-emerald-400">
                                        ₹{displayPrice.toLocaleString()}
                                    </span>
                                    <span className="text-[9px] sm:text-xs text-slate-500 dark:text-slate-400">
                                        /{displayDuration.toLowerCase()}
                                    </span>
                                </div>

                                {/* Occupancy */}
                                {room.occupancy && (
                                    <div className="text-slate-500 dark:text-slate-400 flex items-center">
                                        <span className="text-[9px] sm:text-xs">👤 {room.occupancy}</span>
                                    </div>
                                )}
                            </div>

                            {/* College */}
                            {room.college && (
                                <div className="flex items-center text-[9px] sm:text-xs text-slate-500 dark:text-slate-400 truncate">
                                    <span className="mr-0.5 sm:mr-1 text-[8px] sm:text-[10px]">📍</span>
                                    <span className="truncate">{room.college}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </a>
        </Link>
    );
}

export default function FlatsRoomsSlider({ items }) {
    const [prevBtnEnabled, setPrevBtnEnabled] = useState(false);
    const [nextBtnEnabled, setNextBtnEnabled] = useState(false);

    const [emblaRef, emblaApi] = useEmblaCarousel({
        loop: true,
        align: 'start',
        containScroll: 'trimSnaps',
        dragFree: false,
        slidesToScroll: 1,
        watchDrag: true,
        watchResize: true,
        watchSlides: true,
        skipSnaps: false,
        axis: 'x',
        dragThreshold: 5,
    });

    const scrollPrev = useCallback(() => {
        if (emblaApi) emblaApi.scrollPrev();
    }, [emblaApi]);

    const scrollNext = useCallback(() => {
        if (emblaApi) emblaApi.scrollNext();
    }, [emblaApi]);

    const { handleTouchStart, handleTouchMove, handleTouchEnd } = useSwipeGesture(
        scrollNext,
        scrollPrev
    );

    const onSelect = useCallback(() => {
        if (!emblaApi) return;
        setPrevBtnEnabled(emblaApi.canScrollPrev());
        setNextBtnEnabled(emblaApi.canScrollNext());
    }, [emblaApi]);

    useEffect(() => {
        if (!emblaApi) return;
        onSelect();
        emblaApi.on('select', onSelect);
        emblaApi.on('reInit', onSelect);
        return () => {
            emblaApi.off('select', onSelect);
            emblaApi.off('reInit', onSelect);
        };
    }, [emblaApi, onSelect]);

    if (!items || items.length === 0) return null;

    return (
        <div className="relative group py-2 sm:py-4">
            {/* Carousel */}
            <div
                className="overflow-hidden cursor-grab active:cursor-grabbing touch-pan-y"
                ref={emblaRef}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                style={{ touchAction: 'pan-y pinch-zoom' }}
            >
                <div className="flex gap-3 sm:gap-4">
                    {items.map((room) => (
                        <div
                            key={room.id}
                            className="flex-[0_0_calc(50%-6px)] sm:flex-[0_0_calc(50%-8px)] md:flex-[0_0_calc(33.33%-12px)] lg:flex-[0_0_calc(25%-12px)] min-w-0"
                        >
                            <RoomCard room={room} />
                        </div>
                    ))}
                </div>
            </div>

            {/* Prev Button */}
            <button
                onClick={scrollPrev}
                disabled={!prevBtnEnabled}
                className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-700 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 opacity-60 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100 focus:outline-none border border-gray-200/50 dark:border-gray-600/50 hover:scale-105 z-10 disabled:opacity-30 disabled:cursor-not-allowed disabled:scale-100"
                aria-label="Previous"
            >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-gray-700 dark:text-gray-200 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
            </button>

            {/* Next Button */}
            <button
                onClick={scrollNext}
                disabled={!nextBtnEnabled}
                className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-700 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 opacity-60 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100 focus:outline-none border border-gray-200/50 dark:border-gray-600/50 hover:scale-105 z-10 disabled:opacity-30 disabled:cursor-not-allowed disabled:scale-100"
                aria-label="Next"
            >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-gray-700 dark:text-gray-200 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </button>
        </div>
    );
}
