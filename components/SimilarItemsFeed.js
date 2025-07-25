'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useInView } from 'react-intersection-observer';
import { fetchSimilarListings } from '@/app/actions';
import ListingCard from './ListingCard';

/**
 * --- REWRITTEN SimilarItemsFeed Component ---
 * This component has been completely rewritten for robustness and clarity.
 * It handles its own state, fetches data via a server action, and implements
 * a reliable infinite scroll with loading skeletons, error states, and
 * end-of-list messages.
 */
const SimilarItemsFeed = ({ type, category, college, currentItemId }) => {
    const [items, setItems] = useState([]);
    const [page, setPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [hasMore, setHasMore] = useState(true);
    const [error, setError] = useState(null);

    const { ref: inViewRef, inView } = useInView({
        triggerOnce: false,
        threshold: 0.5,
    });

    const loadMoreItems = useCallback(async (isInitialLoad = false) => {
        // Prevent fetching if already loading or no more items are available
        if (isLoading && !isInitialLoad) return;
        if (!hasMore && !isInitialLoad) return;

        setIsLoading(true);
        if (isInitialLoad) {
            setError(null);
        }

        // console.log(`[SimilarItemsFeed] Loading page ${page} for type: ${type}, category: ${category}, college: ${college}`);

        try {
            const newItems = await fetchSimilarListings({
                type,
                category,
                college,
                excludeId: currentItemId,
                page,
                pageSize: 8,
            });

            if (newItems && newItems.length > 0) {
                setItems(prev => (isInitialLoad ? newItems : [...prev, ...newItems]));
                setPage(prev => prev + 1);
                if (newItems.length < 8) {
                    setHasMore(false);
                }
            } else {
                setHasMore(false);
            }
        } catch (e) {
            // console.error('[SimilarItemsFeed] Failed to fetch similar items:', e);
            setError('An error occurred while loading items.');
        } finally {
            setIsLoading(false);
        }
    }, [page, isLoading, hasMore, type, category, college, currentItemId]);

    // Effect for the initial data load and for resetting when the main item changes.
    useEffect(() => {
        setItems([]);
        setPage(1);
        setHasMore(true);
        setError(null);
        setIsLoading(true); // Set loading true to show skeleton on prop change
        loadMoreItems(true); // Pass true for initial load
    }, [type, category, college, currentItemId]);

    // Effect for triggering the infinite scroll.
    useEffect(() => {
        if (inView && !isLoading && hasMore) {
            loadMoreItems();
        }
    }, [inView, isLoading, hasMore, loadMoreItems]);

    if (items.length === 0 && isLoading) {
        return <SkeletonGrid />;
    }

    if (error) {
        return <p className="text-center text-red-500 py-8">{error}</p>;
    }

    if (items.length === 0 && !hasMore) {
        return (
            <div className="text-center py-8">
                <p className="text-gray-500">No similar items found in this category.</p>
            </div>
        );
    }

    return (
        <div className="w-full">
            <h2 className="text-2xl font-bold text-primary mb-6 text-center">Similar Items</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {items.map(item => (
                    <ListingCard key={`${item.type}-${item.id}`} item={item} />
                ))}
            </div>

            <div ref={inViewRef} className="h-10 mt-4">
                {isLoading && <p className="text-center text-gray-500">Loading more...</p>}
            </div>

            {!hasMore && items.length > 0 && (
                <div className="text-center py-8">
                    <p className="text-gray-500">You've reached the end of the list.</p>
                </div>
            )}
        </div>
    );
};

const SkeletonCard = () => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
        <div className="w-full h-48 bg-gray-200"></div>
        <div className="p-4">
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
        </div>
    </div>
);

const SkeletonGrid = () => (
    <div className="w-full">
        <h2 className="text-2xl font-bold text-primary mb-6 text-center animate-pulse">Similar Items</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-4">
            {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
    </div>
);

export default SimilarItemsFeed;