'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { searchListings } from '@/app/actions';

export default function AdvancedSearch({ onClose }) {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const router = useRouter();
    const searchRef = useRef(null);

    // Enhanced search suggestions including hostel/rooms cross-suggestions
    const predefinedSuggestions = [
        'Books', 'Notes', 'Electronics', 'Furniture', 'Clothing',
        'Study Materials', 'Textbooks', 'Lab Equipment', 'Stationery',
        'Hostel Room', 'Rooms', 'Accommodation', 'Housing', 'Hostel',
        'Single Room', 'Double Room', 'Shared Room', 'Private Room',
        'Boys Hostel', 'Girls Hostel', 'Co-ed Hostel', 'Dormitory',
        'Campus Housing', 'Off-campus Housing', 'Rental Room',
        'Engineering Notes', 'Medical Books', 'MBA Notes', 'Law Books',
        'Computer Science', 'Mathematics', 'Physics', 'Chemistry',
        'Biology', 'English Literature', 'Economics', 'Psychology'
    ];

    // Generate smart suggestions based on input
    const generateSuggestions = (input) => {
        if (!input.trim()) return predefinedSuggestions.slice(0, 8);
        
        const lowerInput = input.toLowerCase();
        const matchingSuggestions = [];
        
        // Direct matches
        const directMatches = predefinedSuggestions.filter(item =>
            item.toLowerCase().includes(lowerInput)
        );
        
        // Hostel/rooms cross-suggestions
        const crossSuggestions = [];
        if (lowerInput.includes('hostel')) {
            crossSuggestions.push(
                'Rooms', 'Room Sharing', 'Accommodation', 'Housing',
                'Single Room', 'Double Room', 'Shared Room', 'Private Room'
            );
        } else if (lowerInput.includes('room')) {
            crossSuggestions.push(
                'Hostel', 'Hostels', 'Boys Hostel', 'Girls Hostel',
                'Accommodation', 'Housing', 'Campus Housing'
            );
        } else if (lowerInput.includes('accommodation') || lowerInput.includes('housing')) {
            crossSuggestions.push(
                'Hostel', 'Rooms', 'Single Room', 'Double Room',
                'Boys Hostel', 'Girls Hostel', 'Private Room'
            );
        }
        
        // Category-based suggestions
        if (lowerInput.includes('book') || lowerInput.includes('note')) {
            crossSuggestions.push(
                'Engineering Notes', 'Medical Books', 'Textbooks',
                'Study Materials', 'MBA Notes', 'Law Books'
            );
        }
        
        // Combine and filter unique suggestions
        matchingSuggestions.push(...directMatches);
        matchingSuggestions.push(...crossSuggestions.filter(item => 
            !matchingSuggestions.some(existing => 
                existing.toLowerCase() === item.toLowerCase()
            )
        ));
        
        // Add partial matches from predefined suggestions
        const partialMatches = predefinedSuggestions.filter(item =>
            !directMatches.includes(item) &&
            item.toLowerCase().split(' ').some(word => word.startsWith(lowerInput))
        );
        
        matchingSuggestions.push(...partialMatches);
        
        // Remove duplicates and limit to 8 suggestions
        const uniqueSuggestions = [...new Set(matchingSuggestions)];
        return uniqueSuggestions.slice(0, 8);
    };

    useEffect(() => {
        const suggestions = generateSuggestions(query);
        setSuggestions(suggestions);
        setShowSuggestions(query.length > 0);
    }, [query]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearch = async (searchQuery = query) => {
        if (!searchQuery.trim()) return;

        setIsLoading(true);
        setShowSuggestions(false);
        
        try {
            const searchResults = await searchListings({ query: searchQuery });
            setResults(searchResults);
        } catch (error) {
            // console.error('Search error:', error);
            setResults([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSuggestionClick = (suggestion) => {
        setQuery(suggestion);
        setShowSuggestions(false);
        handleSearch(suggestion);
    };

    const handleResultClick = (result) => {
        let path = '';
        if (result.type === 'room') {
            path = `/products/rooms/${result.id}`;
        } else if (result.type === 'note') {
            path = `/products/notes/${result.id}`;
        } else {
            path = `/products/regular/${result.id}`;
        }
        
        router.push(path);
        onClose?.();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-20">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[80vh] overflow-hidden">
                {/* Header */}
                <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-gray-900">Search StudX</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 text-2xl"
                        >
                            ×
                        </button>
                    </div>
                </div>

                {/* Search Input */}
                <div className="p-4 border-b border-gray-200" ref={searchRef}>
                    <div className="relative">
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            onFocus={() => setShowSuggestions(query.length > 0)}
                            placeholder="Search for products, notes, rooms, hostels..."
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            autoFocus
                        />
                        <button
                            onClick={() => handleSearch()}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            🔍
                        </button>

                        {/* Search Suggestions */}
                        {showSuggestions && suggestions.length > 0 && (
                            <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 z-50 max-h-60 overflow-y-auto">
                                {suggestions.map((suggestion, index) => (
                                    <div
                                        key={index}
                                        onClick={() => handleSuggestionClick(suggestion)}
                                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-gray-700 border-b border-gray-100 last:border-b-0"
                                    >
                                        <div className="flex items-center">
                                            <span className="text-gray-400 mr-2">🔍</span>
                                            {suggestion}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Search Results */}
                <div className="flex-1 overflow-y-auto max-h-96">
                    {isLoading ? (
                        <div className="p-8 text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                            <p className="mt-2 text-gray-600">Searching...</p>
                        </div>
                    ) : results.length > 0 ? (
                        <div className="p-4">
                            <p className="text-sm text-gray-600 mb-4">
                                Found {results.length} result{results.length !== 1 ? 's' : ''} for "{query}"
                            </p>
                            <div className="space-y-3">
                                {results.map((result) => (
                                    <div
                                        key={`${result.type}-${result.id}`}
                                        onClick={() => handleResultClick(result)}
                                        className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer border border-gray-100"
                                    >
                                        {result.image_url ? (
                                            <img
                                                src={result.image_url}
                                                alt={result.title || result.hostel_name}
                                                className="w-16 h-16 object-cover rounded-lg"
                                            />
                                        ) : (
                                            <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                                                <span className="text-2xl">
                                                    {result.type === 'room' ? '🏠' : 
                                                     result.type === 'note' ? '📚' : '📦'}
                                                </span>
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-medium text-gray-900 truncate">
                                                {result.title || result.hostel_name}
                                            </h3>
                                            <p className="text-sm text-gray-600 line-clamp-2">
                                                {result.description}
                                            </p>
                                            <div className="flex items-center justify-between mt-2">
                                                <span className="text-lg font-semibold text-green-600">
                                                    ₹{result.price}
                                                </span>
                                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                                    {result.type === 'room' ? 'Room' : 
                                                     result.type === 'note' ? 'Notes' : 'Product'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : query && !isLoading ? (
                        <div className="p-8 text-center">
                            <p className="text-gray-600">No results found for "{query}"</p>
                            <p className="text-sm text-gray-500 mt-2">
                                Try searching for rooms, hostels, books, or notes
                            </p>
                        </div>
                    ) : (
                        <div className="p-8 text-center">
                            <p className="text-gray-600">Start typing to search...</p>
                            <div className="mt-4 flex flex-wrap gap-2 justify-center">
                                {predefinedSuggestions.slice(0, 6).map((suggestion, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleSuggestionClick(suggestion)}
                                        className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700"
                                    >
                                        {suggestion}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}