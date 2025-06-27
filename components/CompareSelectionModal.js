'use client';

import { useState, useEffect, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faSearch } from '@fortawesome/free-solid-svg-icons';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import ListingCard from './ListingCard';
import { debounce } from 'lodash';

export default function CompareSelectionModal({ currentItem, onItemSelected, onClose }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('related');
    const supabase = createSupabaseBrowserClient();

    // Fetch related products on mount
    useEffect(() => {
        fetchRelatedProducts();
    }, [currentItem]);

    const fetchRelatedProducts = async () => {
        setIsLoading(true);
        try {
            const { data: products, error } = await supabase
                .from('listings')
                .select('*')
                .eq('category', currentItem.category)
                .neq('id', currentItem.id)
                .limit(12);

            if (!error && products) {
                setRelatedProducts(products);
            }
        } catch (error) {
            console.error('Error fetching related products:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Debounced search function
    const debouncedSearch = useCallback(
        debounce(async (query) => {
            if (query.length > 2) {
                setIsLoading(true);
                try {
                    const { data: results, error } = await supabase
                        .from('listings')
                        .select('*')
                        .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
                        .neq('id', currentItem.id)
                        .limit(20);

                    if (!error && results) {
                        setSearchResults(results);
                    }
                } catch (error) {
                    console.error('Search error:', error);
                    setSearchResults([]);
                } finally {
                    setIsLoading(false);
                }
            } else {
                setSearchResults([]);
            }
        }, 300),
        [currentItem.id]
    );

    const handleSearchChange = (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        
        if (query.length > 0) {
            setActiveTab('search');
            debouncedSearch(query);
        } else {
            setActiveTab('related');
        }
    };

    const handleItemSelect = (item) => {
        onItemSelected(item);
        onClose();
    };

    const currentProducts = activeTab === 'search' ? searchResults : relatedProducts;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden relative" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="sticky top-0 bg-white border-b px-6 py-4 z-10">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold text-primary">Select an Item to Compare</h2>
                        <button onClick={onClose} className="text-gray-500 hover:text-red-600 transition-colors">
                            <FontAwesomeIcon icon={faXmark} size="lg" />
                        </button>
                    </div>
                    
                    {/* Search Bar */}
                    <div className="relative">
                        <FontAwesomeIcon 
                            icon={faSearch} 
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" 
                        />
                        <input
                            type="text"
                            placeholder="Search for products to compare..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    {/* Tabs */}
                    <div className="flex space-x-4 mt-4">
                        <button
                            onClick={() => setActiveTab('related')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                activeTab === 'related'
                                    ? 'bg-blue-100 text-blue-600'
                                    : 'text-gray-600 hover:text-blue-600'
                            }`}
                        >
                            Related Products ({relatedProducts.length})
                        </button>
                        {searchQuery && (
                            <button
                                onClick={() => setActiveTab('search')}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                    activeTab === 'search'
                                        ? 'bg-blue-100 text-blue-600'
                                        : 'text-gray-600 hover:text-blue-600'
                                }`}
                            >
                                Search Results ({searchResults.length})
                            </button>
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[70vh]">
                    {isLoading ? (
                        <div className="flex justify-center items-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        </div>
                    ) : currentProducts.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {currentProducts.map((item) => (
                                <div 
                                    key={item.id}
                                    className="cursor-pointer transform hover:scale-105 transition-transform duration-200"
                                    onClick={() => handleItemSelect(item)}
                                >
                                    <div className="border-2 border-transparent hover:border-blue-300 rounded-lg overflow-hidden">
                                        <ListingCard item={item} />
                                        <div className="p-3 bg-blue-50 text-center">
                                            <span className="text-blue-600 font-medium text-sm">Click to Compare</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <div className="text-gray-400 text-4xl mb-4">🔍</div>
                            <h3 className="text-lg font-medium text-gray-600 mb-2">
                                {activeTab === 'search' ? 'No search results found' : 'No related products found'}
                            </h3>
                            <p className="text-gray-500">
                                {activeTab === 'search' 
                                    ? 'Try searching with different keywords'
                                    : 'No similar products available for comparison'
                                }
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
