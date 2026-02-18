'use client';

import { useState, useEffect, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Link from 'next/link';
import Image from 'next/image';
import { fetchNearbyRooms } from '@/app/actions';

function NearbyRoomCard({ room }) {
    const imageUrl = (Array.isArray(room.images) && room.images.length > 0 && room.images[0])
        || `https://i.pravatar.cc/300?u=${room.id}`;
    const isFlat = room.category === 'Flat';
    const displayPrice = room.price || room.fees || 0;
    const displayDuration = room.duration || 'monthly';
    const title = room.title || 'Untitled Property';
    const distKm = room.calculatedDistance;
    const distLabel = distKm !== undefined && distKm !== Infinity
        ? (distKm < 1 ? `${Math.round(distKm * 1000)}m away` : `${distKm.toFixed(1)} km away`)
        : null;

    return (
        <Link href={`/products/rooms/${room.id}`} legacyBehavior>
            <a className="block h-full" style={{ textDecoration: 'none' }}>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900 overflow-hidden hover:shadow-xl dark:hover:shadow-gray-700 transition-all duration-300 transform hover:scale-105 h-full flex flex-col group relative border-2 dark:border-gray-700 border-transparent hover:border-emerald-200 dark:hover:border-emerald-600">
                    {/* Image */}
                    <div className="relative h-32 sm:h-44 overflow-hidden bg-gradient-to-br from-slate-100 to-emerald-50">
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
                        {/* Distance badge */}
                        {distLabel && (
                            <div className="absolute top-2 right-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm text-xs font-semibold px-2 py-1 rounded-full text-emerald-700 dark:text-emerald-300 shadow">
                                📍 {distLabel}
                            </div>
                        )}
                    </div>

                    {/* Content */}
                    <div className="p-2 sm:p-3 flex-grow flex flex-col">
                        {/* Type Badge */}
                        <div className="mb-1 sm:mb-1.5">
                            <span className="px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs font-semibold rounded-full bg-emerald-50 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700">
                                {isFlat ? '🏢 Flat' : '🏠 Hostel'}
                            </span>
                        </div>

                        {/* Title */}
                        <h3 className="font-semibold text-slate-900 dark:text-gray-100 mb-1 line-clamp-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-200 text-xs sm:text-sm leading-tight">
                            {title}
                        </h3>

                        {/* Price */}
                        <div className="mt-auto">
                            <span className="font-bold text-sm sm:text-base bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                                ₹{displayPrice.toLocaleString('en-IN')}
                            </span>
                            <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 ml-1">/{displayDuration}</span>
                        </div>

                        {/* Occupancy */}
                        {room.occupancy && (
                            <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                👥 {room.occupancy} sharing
                            </p>
                        )}
                    </div>
                </div>
            </a>
        </Link>
    );
}

export default function NearbyFlatsSection({ currentRoomId, location }) {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);

    const [emblaRef, emblaApi] = useEmblaCarousel({
        align: 'start',
        loop: false,
        slidesToScroll: 1,
        containScroll: 'trimSnaps',
        dragFree: true,
    });

    const [canScrollPrev, setCanScrollPrev] = useState(false);
    const [canScrollNext, setCanScrollNext] = useState(false);

    const onSelect = useCallback(() => {
        if (!emblaApi) return;
        setCanScrollPrev(emblaApi.canScrollPrev());
        setCanScrollNext(emblaApi.canScrollNext());
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

    useEffect(() => {
        async function loadNearby() {
            try {
                let lat = null, lng = null;
                if (location) {
                    const loc = typeof location === 'string' ? JSON.parse(location) : location;
                    lat = loc.lat;
                    lng = loc.lng;
                }
                const { data } = await fetchNearbyRooms(currentRoomId, lat, lng, 12);
                setRooms(data || []);
            } catch (e) {
                console.error('Failed to load nearby rooms:', e);
            } finally {
                setLoading(false);
            }
        }
        loadNearby();
    }, [currentRoomId, location]);

    if (loading) {
        return (
            <div className="mt-10">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    🏘️ Nearby Flats & Hostels
                </h2>
                <div className="flex gap-4 overflow-hidden">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="min-w-[200px] h-56 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    if (rooms.length === 0) return null;

    return (
        <div className="mt-10">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                    🏘️ Nearby Flats & Hostels
                </h2>
                <div className="flex gap-2">
                    <button
                        onClick={() => emblaApi?.scrollPrev()}
                        disabled={!canScrollPrev}
                        className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-emerald-100 dark:hover:bg-emerald-900 disabled:opacity-30 transition-all"
                        aria-label="Previous"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700 dark:text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <button
                        onClick={() => emblaApi?.scrollNext()}
                        disabled={!canScrollNext}
                        className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-emerald-100 dark:hover:bg-emerald-900 disabled:opacity-30 transition-all"
                        aria-label="Next"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700 dark:text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            </div>

            <div className="overflow-hidden" ref={emblaRef}>
                <div className="flex gap-3 sm:gap-4">
                    {rooms.map((room) => (
                        <div
                            key={room.id}
                            className="flex-shrink-0 w-[160px] sm:w-[220px] md:w-[240px]"
                        >
                            <NearbyRoomCard room={room} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
