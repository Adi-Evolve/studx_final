'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Image from 'next/image';
import Link from 'next/link';

function SearchResults() {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const searchParams = useSearchParams();
    const query = searchParams.get('q');
    const supabase = createClientComponentClient();

    useEffect(() => {
        const fetchResults = async () => {
            if (!query) {
                setResults([]);
                setLoading(false);
                return;
            }

            setLoading(true);

            // This is a simple search. For better performance, you might want to use
            // a dedicated search service or more advanced PostgreSQL features.
            const { data: regularProducts, error: regularError } = await supabase
                .from('regular_products')
                .select('*')
                .or(`title.ilike.%${query}%,description.ilike.%${query}%,category.ilike.%${query}%`);

            const { data: notes, error: notesError } = await supabase
                .from('notes')
                .select('*')
                .or(`title.ilike.%${query}%,description.ilike.%${query}%,category.ilike.%${query}%`);

            const { data: rooms, error: roomsError } = await supabase
                .from('rooms')
                .select('*')
                .or(`hostel_name.ilike.%${query}%,description.ilike.%${query}%,category.ilike.%${query}%`);

            if (regularError || notesError || roomsError) {
                console.error('Error fetching search results:', regularError || notesError || roomsError);
            } else {
                const allResults = [
                    ...(regularProducts || []),
                    ...(notes || []),
                    ...(rooms || []),
                ];
                setResults(allResults);
            }

            setLoading(false);
        };

        fetchResults();
    }, [query, supabase]);

    if (loading) {
        return <div className="text-center py-10">Searching for &quot;{query}&quot;...</div>;
    }

    return (
        <div className="container mx-auto px-4 py-12">
            <h1 className="text-3xl font-bold text-primary mb-8">Search Results for &quot;{query}&quot;</h1>
            {results.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {results.map(product => (
                        <div key={`${product.id}-${product.title}`} className="group bg-white rounded-lg shadow-md overflow-hidden">
                            <div className="relative h-56 w-full">
                                <Image 
                                    src={product.image_urls?.[0] || 'https://source.unsplash.com/random/400x300?placeholder'}
                                    alt={product.title || product.hostel_name}
                                    layout="fill"
                                    objectFit="cover"
                                />
                            </div>
                            <div className="p-4">
                                <h3 className="text-lg font-semibold text-primary mb-1 truncate">{product.title || product.hostel_name}</h3>
                                <p className="text-xl font-bold text-secondary mb-4">₹{product.price || product.fees}</p>
                                <Link href={`/products/${product.id}`} className="w-full text-center bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-secondary transition-colors duration-300 block">
                                    View Details
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-center text-gray-500">No results found for &quot;{query}&quot;.</p>
            )}
        </div>
    );
}

export default function SearchPage() {
    return (
        <Suspense fallback={<div className="text-center py-10">Loading...</div>}>
            <SearchResults />
        </Suspense>
    );
}
