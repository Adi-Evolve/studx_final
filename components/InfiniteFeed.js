'use client';

import { useState, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { fetchListings } from '@/app/actions';
import ListingCard from './ListingCard';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

export default function InfiniteFeed({ initialItems }) {
    // Correctly initialize state from the initialItems object that has { listings, hasMore }
    const [items, setItems] = useState(initialItems?.listings || []);
    const [hasMore, setHasMore] = useState(initialItems?.hasMore ?? true);
    const [page, setPage] = useState(2); // Start with page 2 since page 1 is initial data

    const { ref, inView } = useInView({
        threshold: 0,
        triggerOnce: false,
    });

    const loadMoreItems = async () => {
        const { listings: newItems, hasMore: newHasMore } = await fetchListings({ page });
        if (newItems && newItems.length > 0) {
            setItems(prevItems => [...prevItems, ...newItems]);
            setPage(prevPage => prevPage + 1);
        }
        setHasMore(newHasMore);
    };

    useEffect(() => {
        // Only fetch more items if the loader is in view and we have more items to fetch
        if (inView && hasMore) {
            loadMoreItems();
        }
    }, [inView, hasMore]); // Re-run effect when inView or hasMore changes

    return (
        <div className="w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {items.map((item, index) => (
                    <ListingCard key={`${item.type}-${item.id}-${index}`} item={item} />
                ))}
            </div>

            {hasMore && (
                <div ref={ref} className="flex justify-center items-center py-8">
                    <FontAwesomeIcon icon={faSpinner} className="animate-spin text-primary text-3xl" />
                </div>
            )}

            {!hasMore && items.length > 0 && (
                <div className="text-center py-8 text-light-text-secondary">
                    You've reached the end!
                </div>
            )}

            {!hasMore && items.length === 0 && (
                 <div className="text-center py-8 text-light-text-secondary">
                    No items found.
                </div>
            )}
        </div>
    );
}