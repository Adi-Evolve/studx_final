'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { searchListings } from '@/app/actions';
import ListingCard from '@/components/ListingCard';

// Force dynamic rendering to prevent build-time prerendering issues
export const dynamic = 'force-dynamic';

// Create a separate component for the search functionality
function SearchContent() {
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        category: 'all',
        priceRange: 'all',
        condition: 'all',
        sortBy: 'newest'
    });
    const [totalResults, setTotalResults] = useState(0);
    
    const router = useRouter();
    
    // Safely get search params with build-time error handling
    let searchParams;
    let query = '';
    
    try {
        searchParams = useSearchParams();
        query = searchParams?.get('q') || '';
    } catch (error) {
        // This handles the case when useSearchParams is called during build
        // console.log('useSearchParams not available during build');
        searchParams = null;
        query = '';
    }

    // Search categories
    const categories = [
        { value: 'all', label: 'All Categories' },
        { value: 'Books', label: 'Books' },
        { value: 'Notes', label: 'Notes' },
        { value: 'Electronics', label: 'Electronics' },
        { value: 'Furniture', label: 'Furniture' },
        { value: 'Room', label: 'Rooms' },
        { value: 'Other', label: 'Other' }
    ];

    const priceRanges = [
        { value: 'all', label: 'Any Price' },
        { value: '0-100', label: '₹0 - ₹100' },
        { value: '100-500', label: '₹100 - ₹500' },
        { value: '500-1000', label: '₹500 - ₹1000' },
        { value: '1000-5000', label: '₹1000 - ₹5000' },
        { value: '5000+', label: '₹5000+' }
    ];

    const conditions = [
        { value: 'all', label: 'Any Condition' },
        { value: 'New', label: 'New' },
        { value: 'Like New', label: 'Like New' },
        { value: 'Good', label: 'Good' },
        { value: 'Fair', label: 'Fair' }
    ];

    const sortOptions = [
        { value: 'newest', label: 'Newest First' },
        { value: 'oldest', label: 'Oldest First' },
        { value: 'price-low', label: 'Price: Low to High' },
        { value: 'price-high', label: 'Price: High to Low' },
        { value: 'relevance', label: 'Most Relevant' }
    ];

    useEffect(() => {
        if (query) {
            performSearch();
        }
    }, [query, filters]);

    const performSearch = async () => {
        if (!query.trim()) return;

        setLoading(true);
        setError(null);

        try {
            // Use the server action for search
            const results = await searchListings({ query: query.trim() });
            
            // Apply client-side filters
            let filteredResults = results;

            // Apply category filter
            if (filters.category !== 'all') {
                filteredResults = filteredResults.filter(item => 
                    item.category?.toLowerCase() === filters.category.toLowerCase()
                );
            }

            // Apply price range filter
            if (filters.priceRange !== 'all') {
                const [min, max] = filters.priceRange.split('-');
                filteredResults = filteredResults.filter(item => {
                    const price = item.price || item.fees || 0;
                    if (max === '+') {
                        return price >= parseInt(min);
                    } else {
                        return price >= parseInt(min) && price <= parseInt(max);
                    }
                });
            }

            // Apply condition filter
            if (filters.condition !== 'all') {
                filteredResults = filteredResults.filter(item => 
                    item.condition === filters.condition
                );
            }

            // Apply sorting
            switch (filters.sortBy) {
                case 'newest':
                    filteredResults.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                    break;
                case 'oldest':
                    filteredResults.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
                    break;
                case 'price-low':
                    filteredResults.sort((a, b) => (a.price || a.fees || 0) - (b.price || b.fees || 0));
                    break;
                case 'price-high':
                    filteredResults.sort((a, b) => (b.price || b.fees || 0) - (a.price || a.fees || 0));
                    break;
                case 'relevance':
                default:
                    // Keep the original relevance order from server
                    break;
            }

            setSearchResults(filteredResults);
            setTotalResults(filteredResults.length);
        } catch (error) {
            // console.error('Search error:', error);
            setError('Failed to search. Please try again.');
            setSearchResults([]);
            setTotalResults(0);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (filterType, value) => {
        setFilters(prev => ({
            ...prev,
            [filterType]: value
        }));
    };

    const clearFilters = () => {
        setFilters({
            category: 'all',
            priceRange: 'all',
            condition: 'all',
            sortBy: 'relevance'
        });
    };

    if (!query) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h1 className="text-3xl font-bold text-gray-900 mb-4">Search Results</h1>
                        <p className="text-gray-600">Enter a search term to find products, notes, and rooms.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Search Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Search Results for "{query}"
                    </h1>
                    {!loading && (
                        <p className="text-gray-600">
                            {totalResults} {totalResults === 1 ? 'result' : 'results'} found
                        </p>
                    )}
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Filters Sidebar - Desktop / Horizontal Bar - Mobile */}
                    <div className="lg:w-64 flex-shrink-0">
                        {/* Mobile Horizontal Filters */}
                        <div className="lg:hidden mb-6">
                            <div className="bg-white rounded-xl shadow-md p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-sm font-semibold text-gray-900">Filters</h3>
                                    <button
                                        onClick={clearFilters}
                                        className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                                    >
                                        Clear
                                    </button>
                                </div>
                                
                                {/* Horizontal Filter Pills */}
                                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                                    {/* Category Filter */}
                                    <div className="flex-shrink-0">
                                        <select
                                            value={filters.category}
                                            onChange={(e) => handleFilterChange('category', e.target.value)}
                                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 bg-white min-w-[120px]"
                                        >
                                            {categories.map(cat => (
                                                <option key={cat.value} value={cat.value}>
                                                    {cat.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    
                                    {/* Price Range Filter */}
                                    <div className="flex-shrink-0">
                                        <select
                                            value={filters.priceRange}
                                            onChange={(e) => handleFilterChange('priceRange', e.target.value)}
                                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 bg-white min-w-[120px]"
                                        >
                                            {priceRanges.map(range => (
                                                <option key={range.value} value={range.value}>
                                                    {range.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    
                                    {/* Condition Filter */}
                                    <div className="flex-shrink-0">
                                        <select
                                            value={filters.condition}
                                            onChange={(e) => handleFilterChange('condition', e.target.value)}
                                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 bg-white min-w-[120px]"
                                        >
                                            {conditions.map(condition => (
                                                <option key={condition.value} value={condition.value}>
                                                    {condition.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    
                                    {/* Sort Filter */}
                                    <div className="flex-shrink-0">
                                        <select
                                            value={filters.sortBy}
                                            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500 bg-white min-w-[120px]"
                                        >
                                            {sortOptions.map(option => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Desktop Sidebar Filters */}
                        <div className="hidden lg:block bg-white rounded-lg shadow p-6 sticky top-24">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                                <button
                                    onClick={clearFilters}
                                    className="text-sm text-blue-600 hover:text-blue-800"
                                >
                                    Clear All
                                </button>
                            </div>

                            {/* Category Filter */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Category
                                </label>
                                <select
                                    value={filters.category}
                                    onChange={(e) => handleFilterChange('category', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                >
                                    {categories.map(cat => (
                                        <option key={cat.value} value={cat.value}>
                                            {cat.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Price Range Filter */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Price Range
                                </label>
                                <select
                                    value={filters.priceRange}
                                    onChange={(e) => handleFilterChange('priceRange', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                >
                                    {priceRanges.map(range => (
                                        <option key={range.value} value={range.value}>
                                            {range.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Condition Filter */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Condition
                                </label>
                                <select
                                    value={filters.condition}
                                    onChange={(e) => handleFilterChange('condition', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                >
                                    {conditions.map(condition => (
                                        <option key={condition.value} value={condition.value}>
                                            {condition.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Sort By */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Sort By
                                </label>
                                <select
                                    value={filters.sortBy}
                                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                >
                                    {sortOptions.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Search Results */}
                    <div className="flex-1">
                        {loading ? (
                            <div className="flex justify-center items-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
                            </div>
                        ) : error ? (
                            <div className="text-center py-12">
                                <div className="text-red-600 mb-4">{error}</div>
                                <button
                                    onClick={performSearch}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                                >
                                    Try Again
                                </button>
                            </div>
                        ) : searchResults.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="text-6xl mb-4">🔍</div>
                                <div className="text-gray-500 mb-4 text-xl font-semibold">
                                    No results found for "{query}"
                                </div>
                                <p className="text-gray-400 text-sm mb-6">
                                    Try adjusting your search terms or filters
                                </p>
                                <div className="bg-blue-50 rounded-lg p-4 max-w-md mx-auto">
                                    <p className="text-sm text-blue-800 mb-2">💡 Search Tips:</p>
                                    <ul className="text-xs text-blue-700 space-y-1">
                                        <li>• Try broader keywords</li>
                                        <li>• Check your spelling</li>
                                        <li>• Remove filters to see more results</li>
                                        <li>• Search for category names like "laptop", "notes", etc.</li>
                                    </ul>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {searchResults.map((item, index) => (
                                    <ListingCard
                                        key={`${item.type}-${item.id}-${index}`}
                                        item={item}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// Loading fallback component
function SearchLoading() {
    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-300 rounded w-64 mx-auto mb-4"></div>
                        <div className="h-4 bg-gray-200 rounded w-48 mx-auto"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Main component with Suspense wrapper
export default function SearchPage() {
    return (
        <Suspense fallback={<SearchLoading />}>
            <SearchContent />
        </Suspense>
    );
}
