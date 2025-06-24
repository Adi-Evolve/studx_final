'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { fetchListings } from '@/app/actions';
import ListingCard from './ListingCard';

export default function ProductFeed() {
    const [listings, setListings] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const loader = useRef(null);

    const loadMore = useCallback(async () => {
        if (isLoading || !hasMore) return;
        setIsLoading(true);
        const newLimit = 12;
        const newPage = page + 1;
        const newlistings = await fetchListings({ page: newPage, limit: newLimit });

        if (newlistings.length > 0) {
            setListings(prev => [...prev, ...newlistings]);
            setPage(newPage);
        } else {
            setHasMore(false);
        }
        setIsLoading(false);
    }, [page, isLoading, hasMore]);

    useEffect(() => {
        const initialLoad = async () => {
            setIsLoading(true);
            const initialListings = await fetchListings({ page: 1, limit: 12 });
            setListings(initialListings);
            if (initialListings.length < 12) {
                setHasMore(false);
            }
            setIsLoading(false);
        };
        initialLoad();
    }, []);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    loadMore();
                }
            },
            { rootMargin: '200px' }
        );

        if (loader.current) {
            observer.observe(loader.current);
        }

        return () => {
            if (loader.current) {
                observer.unobserve(loader.current);
            }
        };
    }, [loadMore]);

    return (
        <section className="py-16">
            <h2 className="text-3xl font-bold text-center text-primary mb-12">Explore Listings</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {listings.map((item) => (
                    <ListingCard key={`${item.category}-${item.id}`} item={item} />
                ))}
            </div>
            <div ref={loader} className="text-center py-8">
                {isLoading && <p>Loading more items...</p>}
                {!hasMore && listings.length > 0 && <p>You've reached the end!</p>}
            </div>
        </section>
    );
}
