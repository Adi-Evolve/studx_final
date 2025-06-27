'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faHeart, 
    faUser, 
    faPlus, 
    faSignOutAlt, 
    faBars, 
    faTimes, 
    faSearch,
    faClock,
    faFire,
    faTag,
    faChartLine,
    faXmark,
    faMicrophone,
    faMicrophoneSlash,
    faQrcode,
    faCamera,
    faBell,
    faGift,
    faStar,
    faShareAlt,
    faBookmark,
    faFilter,
    faSort,
    faEye,
    faCube,
    faRobot,
    faLanguage,
    faAccessibleIcon,
    faVolumeUp,
    faAdjust
} from '@fortawesome/free-solid-svg-icons';
import NotificationSystem from './NotificationSystem';

// Custom hook to handle clicks outside a specified element
function useOnClickOutside(ref, handler) {
    useEffect(() => {
        const listener = (event) => {
            if (!ref.current || ref.current.contains(event.target)) {
                return;
            }
            handler(event);
        };
        document.addEventListener('mousedown', listener);
        document.addEventListener('touchstart', listener);
        return () => {
            document.removeEventListener('mousedown', listener);
            document.removeEventListener('touchstart', listener);
        };
    }, [ref, handler]);
}

// Enhanced Search Component with advanced features
function EnhancedSearchBox({ onSearch, className = "" }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [searchSuggestions, setSearchSuggestions] = useState([]);
    const [recentSearches, setRecentSearches] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('all');
    
    // New state for advanced features
    const [isVoiceSearchActive, setIsVoiceSearchActive] = useState(false);
    const [isBarcodeMode, setIsBarcodeMode] = useState(false);
    const [searchFilters, setSearchFilters] = useState({
        priceRange: [0, 1000],
        condition: 'all',
        location: 'all',
        sortBy: 'relevance'
    });
    const [savedSearches, setSavedSearches] = useState([]);
    const [searchHistory, setSearchHistory] = useState([]);
    const [voiceSearchSupported, setVoiceSearchSupported] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    
    const searchRef = useRef(null);
    const router = useRouter();
    const supabase = createSupabaseBrowserClient();

    // Enhanced categories with more details
    const categories = [
        { id: 'all', name: 'All Items', icon: '🔍', color: 'text-gray-600', count: '2.5k' },
        { id: 'books', name: 'Books', icon: '📚', color: 'text-blue-600', count: '800' },
        { id: 'notes', name: 'Notes', icon: '📝', color: 'text-green-600', count: '650' },
        { id: 'electronics', name: 'Electronics', icon: '💻', color: 'text-purple-600', count: '420' },
        { id: 'furniture', name: 'Furniture', icon: '🪑', color: 'text-orange-600', count: '350' },
        { id: 'rooms', name: 'Rooms', icon: '🏠', color: 'text-red-600', count: '180' },
        { id: 'stationery', name: 'Stationery', icon: '✏️', color: 'text-pink-600', count: '290' },
        { id: 'clothing', name: 'Clothing', icon: '👕', color: 'text-indigo-600', count: '220' },
    ];

    // Enhanced popular searches with AI insights
    const popularSearches = [
        { query: 'Engineering Books', trend: '+12%', category: 'books', ai_insight: 'Peak demand during semester start' },
        { query: 'Study Notes', trend: '+8%', category: 'notes', ai_insight: 'Popular before exams' },
        { query: 'Laptop', trend: '+15%', category: 'electronics', ai_insight: 'High demand from new students' },
        { query: 'Single Room', trend: '+5%', category: 'rooms', ai_insight: 'Limited availability' },
        { query: 'iPhone', trend: '+20%', category: 'electronics', ai_insight: 'Premium segment growing' },
        { query: 'Desk Chair', trend: '+3%', category: 'furniture', ai_insight: 'Remote study setup trend' },
    ];

    // Smart search suggestions with AI
    const smartSuggestions = [
        { type: 'trending', text: 'Trending in your college', icon: faFire },
        { type: 'budget', text: 'Items under ₹500', icon: faTag },
        { type: 'nearby', text: 'Available nearby', icon: faEye },
        { type: 'recommended', text: 'Recommended for you', icon: faRobot },
    ];

    // Check voice search support
    useEffect(() => {
        setVoiceSearchSupported('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);
    }, []);

    useOnClickOutside(searchRef, () => {
        setIsSearchFocused(false);
    });

    // Load recent searches from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('recentSearches');
        if (saved) {
            setRecentSearches(JSON.parse(saved));
        }
    }, []);

    // Save search to recent searches
    const saveToRecentSearches = (query) => {
        const updated = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
        setRecentSearches(updated);
        localStorage.setItem('recentSearches', JSON.stringify(updated));
    };

    // Generate search suggestions
    const generateSuggestions = async (query) => {
        if (!query.trim()) {
            setSearchSuggestions([]);
            return;
        }

        setIsLoading(true);
        try {
            // Search in database for real suggestions
            const { data, error } = await supabase
                .from('listings')
                .select('title, category')
                .ilike('title', `%${query}%`)
                .limit(6);

            if (!error && data) {
                const suggestions = data.map(item => ({
                    query: item.title,
                    category: item.category,
                    type: 'listing'
                }));
                setSearchSuggestions(suggestions);
            }
        } catch (error) {
            console.error('Error fetching suggestions:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle search input change
    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchQuery(value);
        
        // Debounce the API call
        const timeoutId = setTimeout(() => {
            generateSuggestions(value);
        }, 300);

        return () => clearTimeout(timeoutId);
    };

    // Handle search submission
    const handleSearchSubmit = (query = searchQuery, category = selectedCategory) => {
        if (!query.trim()) return;
        
        saveToRecentSearches(query.trim());
        setIsSearchFocused(false);
        setSearchQuery(query);
        
        const searchParams = new URLSearchParams();
        searchParams.set('q', query.trim());
        if (category && category !== 'all') {
            searchParams.set('category', category);
        }
        
        router.push(`/search?${searchParams.toString()}`);
        onSearch?.(query, category);
    };

    // Handle keyboard events
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSearchSubmit();
        } else if (e.key === 'Escape') {
            setIsSearchFocused(false);
        }
    };

    // Clear search
    const clearSearch = () => {
        setSearchQuery('');
        setSearchSuggestions([]);
    };

    // Remove recent search
    const removeRecentSearch = (query, e) => {
        e.stopPropagation();
        const updated = recentSearches.filter(s => s !== query);
        setRecentSearches(updated);
        localStorage.setItem('recentSearches', JSON.stringify(updated));
    };

    // Voice search functionality
    const startVoiceSearch = () => {
        if (!voiceSearchSupported) return;
        
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';
        
        recognition.onstart = () => {
            setIsRecording(true);
            setIsVoiceSearchActive(true);
        };
        
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            setSearchQuery(transcript);
            handleSearchSubmit(transcript);
        };
        
        recognition.onerror = (event) => {
            console.error('Voice search error:', event.error);
            setIsRecording(false);
            setIsVoiceSearchActive(false);
        };
        
        recognition.onend = () => {
            setIsRecording(false);
            setIsVoiceSearchActive(false);
        };
        
        recognition.start();
    };

    // Barcode/QR scanning functionality
    const startBarcodeSearch = async () => {
        try {
            if ('BarcodeDetector' in window) {
                const barcodeDetector = new BarcodeDetector();
                // Implementation would require camera access
                setIsBarcodeMode(true);
                // This would open camera interface
            } else {
                // Fallback to manual barcode input
                const barcode = prompt('Enter barcode number:');
                if (barcode) {
                    handleSearchSubmit(barcode);
                }
            }
        } catch (error) {
            console.error('Barcode search error:', error);
        }
    };

    // Enhanced search with filters
    const handleAdvancedSearch = () => {
        const searchParams = new URLSearchParams();
        searchParams.set('q', searchQuery);
        searchParams.set('category', selectedCategory);
        searchParams.set('minPrice', searchFilters.priceRange[0]);
        searchParams.set('maxPrice', searchFilters.priceRange[1]);
        searchParams.set('condition', searchFilters.condition);
        searchParams.set('location', searchFilters.location);
        searchParams.set('sort', searchFilters.sortBy);
        
        router.push(`/search?${searchParams.toString()}`);
    };

    // Save search functionality
    const saveCurrentSearch = () => {
        if (!searchQuery.trim()) return;
        
        const searchConfig = {
            query: searchQuery,
            category: selectedCategory,
            filters: searchFilters,
            timestamp: new Date().toISOString()
        };
        
        const updated = [searchConfig, ...savedSearches.filter(s => s.query !== searchQuery)].slice(0, 10);
        setSavedSearches(updated);
        localStorage.setItem('savedSearches', JSON.stringify(updated));
    };

    // Smart auto-complete with ML suggestions
    const getSmartSuggestions = async (query) => {
        // This would integrate with AI/ML service for smart suggestions
        const aiSuggestions = [
            `${query} for engineering students`,
            `${query} in good condition`,
            `${query} under ₹500`,
            `${query} available for rent`
        ];
        return aiSuggestions;
    };

    return (
        <div className={`relative ${className}`} ref={searchRef}>
            {/* Enhanced Search Input */}
            <div className={`relative transition-all duration-300 ${isSearchFocused ? 'transform scale-105' : ''}`}>
                <div className="relative">
                    <FontAwesomeIcon 
                        icon={faSearch} 
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" 
                    />
                    <input
                        type="text"
                        placeholder="Search with AI, voice, or barcode..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                        onKeyDown={handleKeyDown}
                        onFocus={() => setIsSearchFocused(true)}
                        className="w-full pl-12 pr-32 py-4 text-lg border-2 border-gray-200 rounded-2xl bg-white/90 backdrop-blur-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all duration-300 placeholder-gray-400 shadow-lg hover:shadow-xl"
                        aria-label="Search for items"
                        role="searchbox"
                    />
                    
                    {/* Enhanced Action Buttons */}
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                        {/* Voice Search Button */}
                        {voiceSearchSupported && (
                            <button
                                onClick={startVoiceSearch}
                                className={`p-2 rounded-lg transition-all duration-200 ${
                                    isRecording 
                                        ? 'bg-red-500 text-white animate-pulse' 
                                        : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                                }`}
                                title="Voice Search"
                                aria-label="Start voice search"
                            >
                                <FontAwesomeIcon 
                                    icon={isRecording ? faMicrophoneSlash : faMicrophone} 
                                    className="w-4 h-4" 
                                />
                            </button>
                        )}
                        
                        {/* Barcode Search Button */}
                        <button
                            onClick={startBarcodeSearch}
                            className="p-2 rounded-lg bg-purple-100 text-purple-600 hover:bg-purple-200 transition-colors"
                            title="Scan Barcode/QR"
                            aria-label="Scan barcode or QR code"
                        >
                            <FontAwesomeIcon icon={faQrcode} className="w-4 h-4" />
                        </button>
                        
                        {/* Save Search Button */}
                        <button
                            onClick={saveCurrentSearch}
                            className="p-2 rounded-lg bg-yellow-100 text-yellow-600 hover:bg-yellow-200 transition-colors"
                            title="Save Search"
                            aria-label="Save current search"
                        >
                            <FontAwesomeIcon icon={faBookmark} className="w-4 h-4" />
                        </button>
                        
                        {/* Search Button */}
                        <button
                            onClick={() => handleSearchSubmit()}
                            className="px-3 py-2 bg-gradient-to-r from-slate-800 via-slate-700 to-emerald-600 text-white rounded-xl hover:from-slate-900 hover:via-emerald-600 hover:to-teal-600 transition-all duration-200 font-medium shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-95"
                            aria-label="Search"
                        >
                            <FontAwesomeIcon icon={faSearch} className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Enhanced Category Filter Pills with counts */}
                {isSearchFocused && (
                    <div className="flex gap-2 mt-3 pb-2 overflow-x-auto scrollbar-hide">
                        {categories.map((category) => (
                            <button
                                key={category.id}
                                onClick={() => setSelectedCategory(category.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                                    selectedCategory === category.id
                                        ? 'bg-indigo-600 text-white shadow-lg transform scale-105'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                <span>{category.icon}</span>
                                <span>{category.name}</span>
                                <span className="text-xs opacity-75">({category.count})</span>
                            </button>
                        ))}
                    </div>
                )}

                {/* Smart Suggestions Bar */}
                {isSearchFocused && !searchQuery && (
                    <div className="flex gap-2 mt-2 overflow-x-auto scrollbar-hide">
                        {smartSuggestions.map((suggestion, index) => (
                            <button
                                key={index}
                                onClick={() => handleSearchSubmit(suggestion.text)}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 hover:from-indigo-100 hover:to-purple-100 transition-all duration-200"
                            >
                                <FontAwesomeIcon icon={suggestion.icon} className="w-3 h-3" />
                                {suggestion.text}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Enhanced Search Dropdown with AI features */}
            {isSearchFocused && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 max-h-96 overflow-y-auto">
                    {/* AI-Powered Search Insights */}
                    {searchQuery && (
                        <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-100">
                            <div className="flex items-center gap-2 mb-2">
                                <FontAwesomeIcon icon={faRobot} className="w-4 h-4 text-indigo-600" />
                                <span className="text-sm font-semibold text-indigo-900">AI Insights</span>
                            </div>
                            <p className="text-xs text-indigo-700">
                                Based on your search, you might also be interested in similar items or bundles with better deals.
                            </p>
                        </div>
                    )}

                    {/* Loading State with AI animation */}
                    {isLoading && (
                        <div className="p-6 text-center">
                            <div className="relative">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                                <FontAwesomeIcon 
                                    icon={faRobot} 
                                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 text-indigo-600" 
                                />
                            </div>
                            <p className="mt-2 text-gray-500">AI is searching for you...</p>
                        </div>
                    )}

                    {/* Enhanced Search Suggestions with AI insights */}
                    {!isLoading && searchQuery && searchSuggestions.length > 0 && (
                        <div className="p-4">
                            <h3 className="text-sm font-semibold text-gray-500 mb-3 flex items-center gap-2">
                                <FontAwesomeIcon icon={faSearch} className="w-4 h-4" />
                                Smart Suggestions
                            </h3>
                            {searchSuggestions.map((suggestion, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleSearchSubmit(suggestion.query)}
                                    className="w-full text-left p-3 rounded-xl hover:bg-gray-50 transition-colors group flex items-center gap-3"
                                >
                                    <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
                                        <FontAwesomeIcon icon={faSearch} className="w-4 h-4 text-indigo-600" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900">{suggestion.query}</p>
                                        <p className="text-xs text-gray-500 capitalize flex items-center gap-1">
                                            <span>{suggestion.category}</span>
                                            {suggestion.ai_insight && (
                                                <>
                                                    <span>•</span>
                                                    <span className="text-indigo-600">{suggestion.ai_insight}</span>
                                                </>
                                            )}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <FontAwesomeIcon icon={faRobot} className="w-3 h-3 text-indigo-500" />
                                        <span className="text-xs text-indigo-600">AI</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Enhanced Popular Searches with AI insights */}
                    {!searchQuery && (
                        <div className="p-4">
                            <h3 className="text-sm font-semibold text-gray-500 mb-3 flex items-center gap-2">
                                <FontAwesomeIcon icon={faFire} className="w-4 h-4" />
                                Trending Now
                            </h3>
                            {popularSearches.map((item, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleSearchSubmit(item.query, item.category)}
                                    className="w-full text-left p-3 rounded-xl hover:bg-gray-50 transition-colors group flex items-center gap-3"
                                >
                                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                                        <FontAwesomeIcon icon={faChartLine} className="w-4 h-4 text-orange-600" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900">{item.query}</p>
                                        <p className="text-xs text-gray-500 capitalize">{item.ai_insight}</p>
                                    </div>
                                    <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
                                        {item.trend}
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Saved Searches */}
                    {!searchQuery && savedSearches.length > 0 && (
                        <div className="p-4 border-t border-gray-100">
                            <h3 className="text-sm font-semibold text-gray-500 mb-3 flex items-center gap-2">
                                <FontAwesomeIcon icon={faBookmark} className="w-4 h-4" />
                                Saved Searches
                            </h3>
                            {savedSearches.slice(0, 3).map((search, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleSearchSubmit(search.query, search.category)}
                                    className="w-full text-left p-3 rounded-xl hover:bg-gray-50 transition-colors group flex items-center gap-3"
                                >
                                    <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center group-hover:bg-yellow-200 transition-colors">
                                        <FontAwesomeIcon icon={faBookmark} className="w-4 h-4 text-yellow-600" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900">{search.query}</p>
                                        <p className="text-xs text-gray-500">
                                            Saved {new Date(search.timestamp).toLocaleDateString()}
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default function Header() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const supabase = createSupabaseBrowserClient();
    const router = useRouter();
    const profileMenuRef = useRef(null);

    useOnClickOutside(profileMenuRef, () => setIsProfileMenuOpen(false));

    useEffect(() => {
        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
            setUser(session?.user ?? null);
            setLoading(false);
            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                router.refresh();
            }
        });

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, [supabase, router]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setIsProfileMenuOpen(false);
        router.push('/');
        router.refresh();
    };

    if (loading) {
        return (
            <header className="bg-white shadow-md">
                <nav className="container mx-auto px-4 py-2 flex justify-between items-center animate-pulse">
                    <div className="h-6 bg-gray-300 rounded w-24"></div>
                    <div className="flex items-center space-x-3">
                        <div className="h-6 bg-gray-300 rounded w-16"></div>
                        <div className="h-6 bg-gray-300 rounded w-16"></div>
                    </div>
                </nav>
            </header>
        );
    }

    return (
        <>
            <header className="glass-effect sticky top-0 z-40 border-b border-gray-100">
                <nav className="container mx-auto px-3 sm:px-4 lg:px-6 py-1.5 sm:py-2 md:py-2.5 flex justify-between items-center min-h-[50px] sm:min-h-[56px] md:min-h-[64px]">
                    {/* Logo - More compact for mobile */}
                    <Link href={user ? "/home" : "/"} className="flex items-center space-x-1 sm:space-x-2 hover:scale-105 transition-transform duration-200 group">
                        <div className="relative">
                            {/* More compact logo for mobile */}
                            <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-9 md:h-9 bg-gradient-to-br from-slate-800 via-slate-600 to-emerald-500 rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 rotate-3 group-hover:rotate-6">
                                <span className="text-white font-black text-xs sm:text-sm md:text-base transform -rotate-3">S</span>
                            </div>
                            <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 sm:w-3 sm:h-3 bg-emerald-400 rounded-full animate-pulse"></div>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-base sm:text-lg md:text-xl font-black bg-gradient-to-r from-slate-800 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
                                StudX
                            </span>
                            <span className="text-[9px] sm:text-[10px] text-gray-500 -mt-0.5 hidden sm:block">Student Marketplace</span>
                        </div>
                    </Link>

                    {/* Desktop Search Bar - Hidden on mobile */}
                    <div className="hidden lg:block flex-1 max-w-xl xl:max-w-2xl mx-4 xl:mx-8">
                        <EnhancedSearchBox className="w-full" />
                    </div>

                    {/* Mobile Search and Menu Buttons */}
                    <div className="flex items-center space-x-2">
                        {/* Mobile Search Button */}
                        <button
                            onClick={() => setIsSearchOpen(true)}
                            className="lg:hidden p-1.5 sm:p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                        >
                            <FontAwesomeIcon icon={faSearch} className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600" />
                        </button>

                        {/* Desktop Navigation - More compact */}
                        <div className="hidden md:flex items-center space-x-2 lg:space-x-3">
                            {user ? (
                                <>
                                    <Link href="/sell" className="btn-primary px-2.5 py-1.5 text-xs lg:px-3 lg:py-2 lg:text-sm">
                                        <FontAwesomeIcon icon={faPlus} className="w-3 h-3 lg:w-4 lg:h-4 mr-1" />
                                        <span className="hidden lg:inline">Sell</span>
                                    </Link>
                                    <Link href="/wishlist" className="p-1.5 lg:p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors relative">
                                        <FontAwesomeIcon icon={faHeart} className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-gray-600" />
                                    </Link>
                                    <div className="relative" ref={profileMenuRef}>
                                        <button 
                                            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                                            className="p-1.5 lg:p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                                        >
                                            <FontAwesomeIcon icon={faUser} className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-gray-600" />
                                        </button>
                                        {isProfileMenuOpen && (
                                            <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-lg border border-gray-100 py-2">
                                                <Link href="/profile" className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                                                    Profile
                                                </Link>
                                                <button 
                                                    onClick={handleLogout}
                                                    className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                                                >
                                                    <FontAwesomeIcon icon={faSignOutAlt} className="w-4 h-4 mr-2" />
                                                    Logout
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <>
                                    <Link href="/login" className="px-2.5 py-1.5 lg:px-3 lg:py-2 text-xs lg:text-sm text-gray-600 hover:text-gray-900 transition-colors">
                                        Login
                                    </Link>
                                    <Link href="/signup" className="btn-primary px-2.5 py-1.5 text-xs lg:px-3 lg:py-2 lg:text-sm">
                                        Sign Up
                                    </Link>
                                </>
                            )}
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="md:hidden p-1.5 sm:p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                        >
                            <FontAwesomeIcon 
                                icon={isMenuOpen ? faTimes : faBars} 
                                className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600" 
                            />
                        </button>
                    </div>
                </nav>

                {/* Mobile Menu Overlay - Improved */}
                {isMenuOpen && (
                    <div className="md:hidden fixed inset-0 z-50 bg-black bg-opacity-50" onClick={() => setIsMenuOpen(false)}>
                        <div className="bg-white h-full w-72 max-w-[85vw] shadow-xl" onClick={(e) => e.stopPropagation()}>
                            <div className="p-4 border-b border-gray-200">
                                <div className="flex items-center justify-between">
                                    <span className="text-lg font-bold text-gray-900">Menu</span>
                                    <button
                                        onClick={() => setIsMenuOpen(false)}
                                        className="p-2 rounded-lg hover:bg-gray-100"
                                    >
                                        <FontAwesomeIcon icon={faTimes} className="w-4 h-4 text-gray-600" />
                                    </button>
                                </div>
                            </div>
                            <div className="p-4 space-y-3">
                                {user ? (
                                    <>
                                        <Link 
                                            href="/sell" 
                                            className="flex items-center space-x-3 p-3 rounded-lg bg-slate-800 text-white hover:bg-slate-700 transition-colors"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            <FontAwesomeIcon icon={faPlus} className="w-4 h-4" />
                                            <span>Sell Item</span>
                                        </Link>
                                        <Link 
                                            href="/wishlist" 
                                            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            <FontAwesomeIcon icon={faHeart} className="w-4 h-4 text-gray-600" />
                                            <span>Wishlist</span>
                                        </Link>
                                        <Link 
                                            href="/profile" 
                                            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            <FontAwesomeIcon icon={faUser} className="w-4 h-4 text-gray-600" />
                                            <span>Profile</span>
                                        </Link>
                                        <button 
                                            onClick={() => { handleLogout(); setIsMenuOpen(false); }}
                                            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-red-50 text-red-600 transition-colors w-full text-left"
                                        >
                                            <FontAwesomeIcon icon={faSignOutAlt} className="w-4 h-4" />
                                            <span>Logout</span>
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <Link 
                                            href="/login" 
                                            className="flex items-center justify-center p-3 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            Login
                                        </Link>
                                        <Link 
                                            href="/signup" 
                                            className="flex items-center justify-center p-3 rounded-lg bg-slate-800 text-white hover:bg-slate-700 transition-colors"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            Sign Up
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Mobile Search Modal - Improved */}
                {isSearchOpen && (
                    <div className="lg:hidden fixed inset-0 z-50 bg-white">
                        <div className="p-3 border-b border-gray-200">
                            <div className="flex items-center space-x-3">
                                <button
                                    onClick={() => setIsSearchOpen(false)}
                                    className="p-2 rounded-lg hover:bg-gray-100"
                                >
                                    <FontAwesomeIcon icon={faTimes} className="w-4 h-4 text-gray-600" />
                                </button>
                                <span className="text-lg font-semibold text-gray-900">Search</span>
                            </div>
                        </div>
                        <div className="p-3">
                            <EnhancedSearchBox 
                                className="w-full" 
                                onSearch={() => setIsSearchOpen(false)}
                            />
                        </div>
                    </div>
                )}
            </header>
            <NotificationSystem />
        </>
    );
}
