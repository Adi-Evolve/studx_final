'use client';

import { useState, useEffect, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Link from 'next/link';
import { useSwipeGesture } from '@/hooks/useSwipeGesture';

function RoomCard({ room }) {
    const firstImage = room.images && room.images.length > 0 ? room.images[0] : null;
    const isFlat = room.category === 'Flat';
    const displayPrice = room.price || room.fees || 0;
    const displayDuration = room.duration || 'monthly';

    return (
        <Link href={`/products/rooms/${room.id}`} className="group block h-full">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md dark:shadow-gray-900/40 overflow-hidden hover:shadow-xl dark:hover:shadow-blue-500/10 transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 dark:border-gray-700 h-full flex flex-col">
                {/* Image */}
                <div className="relative h-36 sm:h-40 bg-gradient-to-br from-blue-400 to-indigo-400 dark:from-blue-600 dark:to-indigo-600 overflow-hidden flex-shrink-0">
                    {firstImage ? (
                        <>
                            <img
                                src={firstImage}
                                alt={room.title || room.hostel_name || 'Property'}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        </>
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <span className="text-5xl opacity-60">{isFlat ? '🏢' : '🏠'}</span>
                        </div>
                    )}

                    {/* Category Badge */}
                    <div className="absolute top-2 left-2">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold shadow-lg backdrop-blur-sm ${isFlat
                            ? 'bg-purple-500/90 text-white'
                            : 'bg-blue-500/90 text-white'
                            }`}>
                            {isFlat ? '🏢 Flat' : '🏠 Room'}
                        </span>
                    </div>

                    {/* Price Badge */}
                    <div className="absolute bottom-2 left-2">
                        <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm px-2.5 py-1 rounded-full shadow-lg">
                            <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                                ₹{displayPrice.toLocaleString()}
                            </span>
                            <span className="text-[10px] text-gray-500 dark:text-gray-400">/{displayDuration}</span>
                        </div>
                    </div>

                    {/* Room Type */}
                    {room.room_type && (
                        <div className="absolute top-2 right-2">
                            <span className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full text-[10px] font-semibold shadow">
                                {room.room_type}
                            </span>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="p-3 sm:p-4 flex flex-col flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-1.5">
                        {room.title || room.hostel_name || 'Untitled Property'}
                    </h3>

                    {/* Key Details */}
                    <div className="flex flex-wrap gap-1.5 mb-2">
                        {room.occupancy && (
                            <span className="text-[10px] bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded-full">
                                👤 {room.occupancy}
                            </span>
                        )}
                        {isFlat && room.furnished_status && room.furnished_status !== 'Unfurnished' && (
                            <span className="text-[10px] bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-1.5 py-0.5 rounded-full">
                                🪑 {room.furnished_status}
                            </span>
                        )}
                        {room.distance && (
                            <span className="text-[10px] bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 px-1.5 py-0.5 rounded-full">
                                📍 {room.distance}
                            </span>
                        )}
                    </div>

                    {/* College */}
                    {room.college && (
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-1 mt-auto">
                            🎓 {room.college}
                        </p>
                    )}
                </div>
            </div>
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
