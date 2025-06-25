'use client';

import { useState, useEffect, useCallback } from 'react';
import { searchListings, fetchSimilarListings } from '@/app/actions';
import ComparisonTable from '../ComparisonTable';
import Image from 'next/image';
import { debounce } from 'lodash';

const SearchResultItem = ({ item, onSelect }) => {
    const imageUrl = (Array.isArray(item.images) && item.images.length > 0 && item.images[0])
        || (Array.isArray(item.image_urls) && item.image_urls.length > 0 && item.image_urls[0])
        || `https://i.pravatar.cc/100?u=${item.id}`;

    return (
        <div 
            className="flex items-center p-2 rounded-lg hover:bg-gray-200 cursor-pointer transition-colors duration-200"
            onClick={() => onSelect(item)}
        >
            <Image src={imageUrl} alt={item.title || item.name} width={40} height={40} className="rounded-md object-cover mr-4" />
            <div className="flex-grow">
                <p className="font-semibold text-primary truncate">{item.title || item.name}</p>
                <p className="text-sm text-gray-500 capitalize">{item.category}</p>
            </div>
            <p className="text-accent font-bold">₹{item.price || item.fees}</p>
        </div>
    );
};

export default function CompareModal({ productA, onClose }) {
    const [productB, setProductB] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // Fetch initial suggestions
    useEffect(() => {
        const getInitialSuggestions = async () => {
            if (!productA) return;
            setIsLoading(true);
            const suggestions = await fetchSimilarListings({
                category: productA.category,
                currentId: productA.id,
                limit: 5,
            });
            setSearchResults(suggestions);
            setIsLoading(false);
        };
        getInitialSuggestions();
    }, [productA]);

    // Debounced search function
    const debouncedSearch = useCallback(
        debounce(async (query) => {
            if (query.length > 1) {
                setIsLoading(true);
                const results = await searchListings({ query });
                // Filter out the original product from search results
                setSearchResults(results.filter(item => item.id !== productA.id));
                setIsLoading(false);
            } else if (query.length === 0) {
                // If search is cleared, show initial suggestions again
                const getInitialSuggestions = async () => {
                    setIsLoading(true);
                    const suggestions = await fetchSimilarListings({
                        category: productA.category,
                        currentId: productA.id,
                        limit: 5,
                    });
                    setSearchResults(suggestions);
                    setIsLoading(false);
                };
                getInitialSuggestions();
            }
        }, 300), // 300ms debounce delay
        [productA]
    );

    const handleSearchChange = (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        debouncedSearch(query);
    };

    if (!productA) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-3xl font-bold text-primary">Compare Products</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-3xl">&times;</button>
                </div>

                {productB ? (
                    <ComparisonTable productA={productA} productB={productB} />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Product A Display */}
                        <div className="p-4 border rounded-lg bg-gray-50">
                            <h3 className="font-bold text-xl text-primary mb-4">Comparing</h3>
                            <div className="flex items-center p-2 rounded-lg bg-white shadow-sm">
                                <Image 
                                    src={(Array.isArray(productA.images) && productA.images[0]) || (Array.isArray(productA.image_urls) && productA.image_urls[0]) || `https://i.pravatar.cc/100?u=${productA.id}`}
                                    alt={productA.title || productA.name}
                                    width={60}
                                    height={60}
                                    className="rounded-md object-cover mr-4"
                                />
                                <div>
                                    <p className="font-semibold text-primary">{productA.title || productA.name}</p>
                                    <p className="text-accent font-bold">₹{productA.price || productA.fees}</p>
                                </div>
                            </div>
                        </div>

                        {/* Search and Results */}
                        <div>
                            <h3 className="font-bold text-xl text-primary mb-4">With</h3>
                            <input 
                                type="text"
                                value={searchQuery}
                                onChange={handleSearchChange}
                                placeholder="Search for another product..."
                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none transition"
                            />
                            <div className="mt-4 space-y-2 max-h-64 overflow-y-auto">
                                {isLoading && <p className="text-center text-gray-500">Searching...</p>}
                                {!isLoading && searchResults.length === 0 && <p className="text-center text-gray-500">No products found.</p>}
                                {!isLoading && searchResults.map(item => (
                                    <SearchResultItem key={item.id} item={item} onSelect={setProductB} />
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
