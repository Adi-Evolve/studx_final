import { Suspense } from 'react';
import { searchListings } from '@/app/actions';
import ListingCard from '@/components/ListingCard';

async function SearchResults({ query }) {
    const results = await searchListings({ query });

    return (
        <div className="container mx-auto px-4 py-12">
            <h1 className="text-3xl font-bold text-primary mb-8">
                Search Results for &quot;{query}&quot;
            </h1>
            {results.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {results.map(item => (
                        <ListingCard key={`${item.category}-${item.id}`} item={item} />
                    ))}
                </div>
            ) : (
                <p className="text-center text-gray-500 py-10">No results found for &quot;{query}&quot;.</p>
            )}
        </div>
    );
}

export default function SearchPage({ searchParams }) {
    const query = searchParams.q || '';

    return (
        <Suspense fallback={<div className="text-center py-10">Searching...</div>}>
            <SearchResults query={query} />
        </Suspense>
    );
}
