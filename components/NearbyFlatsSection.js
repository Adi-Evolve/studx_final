'use client';

import React, { useState, useEffect } from 'react';
import { fetchNearbyRooms } from '@/app/actions';
import ListingCard from './ListingCard';

/**
 * NearbyFlatsSection - Shows nearby flats/hostels sorted by distance (nearest first).
 * Used on room detail pages as a replacement for SimilarItemsFeed when location data is available.
 */
export default function NearbyFlatsSection({ currentRoomId, location }) {
    const [rooms, setRooms] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        async function load() {
            setIsLoading(true);
            try {
                let lat, lng;
                if (location) {
                    const loc = typeof location === 'string' ? JSON.parse(location) : location;
                    lat = parseFloat(loc.lat || loc.latitude);
                    lng = parseFloat(loc.lng || loc.longitude || loc.lon);
                }

                if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
                    setRooms([]);
                    setIsLoading(false);
                    return;
                }

                const data = await fetchNearbyRooms({ currentRoomId, lat, lng, limit: 12 });
                if (!cancelled) setRooms(data || []);
            } catch (e) {
                console.error('Error loading nearby rooms:', e);
                if (!cancelled) setRooms([]);
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        }

        load();
        return () => { cancelled = true; };
    }, [currentRoomId, location]);

    if (isLoading) {
        return (
            <div className="w-full">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6 text-center">
                    Nearby Flats & Hostels
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden animate-pulse">
                            <div className="h-48 bg-gray-200 dark:bg-gray-700" />
                            <div className="p-4 space-y-3">
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (rooms.length === 0) {
        return (
            <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">No nearby flats or hostels found.</p>
            </div>
        );
    }

    return (
        <div className="w-full">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6 text-center">
                Nearby Flats & Hostels
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {rooms.map((room) => (
                    <div key={room.id} className="relative">
                        <ListingCard item={room} />
                        {room._distance != null && (
                            <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs font-semibold px-2 py-1 rounded-full shadow-md z-10">
                                {room._distance < 1
                                    ? `${Math.round(room._distance * 1000)}m away`
                                    : `${room._distance.toFixed(1)} km away`}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
