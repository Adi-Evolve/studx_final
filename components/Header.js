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
    faChartLine,  // Changed from faTrendUp to faChartLine
    faXmark
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

// Enhanced Search Component
function EnhancedSearchBox({ onSearch, className = "" }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [searchSuggestions, setSearchSuggestions] = useState([]);
    const [recentSearches, setRecentSearches] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const searchRef = useRef(null);
    const router = useRouter();
    const supabase = createSupabaseBrowserClient();

    // Categories for filtering
    const categories = [
        { id: 'all', name: 'All Items', icon: '🔍', color: 'text-gray-600' },
        { id: 'books', name: 'Books', icon: '📚', color: 'text-blue-600' },
        { id: 'notes', name: 'Notes', icon: '📝', color: 'text-green-600' },
        { id: 'electronics', name: 'Electronics', icon: '💻', color: 'text-purple-600' },
        { id: 'furniture', name: 'Furniture', icon: '🪑', color: 'text-orange-600' },
        { id: 'rooms', name: 'Rooms', icon: '🏠', color: 'text-red-600' },
    ];

    // Popular searches
    const popularSearches = [
        { query: 'Engineering Books', trend: '+12%', category: 'books' },
        { query: 'Study Notes', trend: '+8%', category: 'notes' },
        { query: 'Laptop', trend: '+15%', category: 'electronics' },
        { query: 'Single Room', trend: '+5%', category: 'rooms' },
        { query: 'iPhone', trend: '+20%', category: 'electronics' },
        { query: 'Desk Chair', trend: '+3%', category: 'furniture' },
    ];

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

    return (
        <div className={`relative ${className}`} ref={searchRef}>
            {/* Search Input */}
            <div className={`relative transition-all duration-300 ${isSearchFocused ? 'transform scale-105' : ''}`}>
                <div className="relative">
                    <FontAwesomeIcon 
                        icon={faSearch} 
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" 
                    />
                    <input
                        type="text"
                        placeholder="Search for books, notes, electronics, rooms..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                        onKeyDown={handleKeyDown}
                        onFocus={() => setIsSearchFocused(true)}
                        className="w-full pl-12 pr-24 py-4 text-lg border-2 border-gray-200 rounded-2xl bg-white/90 backdrop-blur-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all duration-300 placeholder-gray-400 shadow-lg hover:shadow-xl"
                    />
                    
                    {/* Clear Button */}
                    {searchQuery && (
                        <button
                            onClick={clearSearch}
                            className="absolute right-16 top-1/2 transform -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <FontAwesomeIcon icon={faXmark} className="w-4 h-4" />
                        </button>
                    )}
                    
                    {/* Search Button */}
                    <button
                        onClick={() => handleSearchSubmit()}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-2 bg-gradient-to-r from-slate-800 via-slate-700 to-emerald-600 text-white rounded-xl hover:from-slate-900 hover:via-emerald-600 hover:to-teal-600 transition-all duration-200 font-medium shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-95"
                    >
                        Search
                    </button>
                </div>

                {/* Category Filter Pills */}
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
                                {category.name}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Search Dropdown */}
            {isSearchFocused && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 max-h-96 overflow-y-auto">
                    {/* Loading State */}
                    {isLoading && (
                        <div className="p-6 text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                            <p className="mt-2 text-gray-500">Searching...</p>
                        </div>
                    )}

                    {/* Search Suggestions */}
                    {!isLoading && searchQuery && searchSuggestions.length > 0 && (
                        <div className="p-4">
                            <h3 className="text-sm font-semibold text-gray-500 mb-3 flex items-center gap-2">
                                <FontAwesomeIcon icon={faSearch} className="w-4 h-4" />
                                Search Suggestions
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
                                        <p className="text-xs text-gray-500 capitalize">{suggestion.category}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* No Results */}
                    {!isLoading && searchQuery && searchSuggestions.length === 0 && (
                        <div className="p-6 text-center">
                            <p className="text-gray-500">No suggestions found for "{searchQuery}"</p>
                            <button
                                onClick={() => handleSearchSubmit()}
                                className="mt-2 text-indigo-600 hover:text-indigo-800 font-medium"
                            >
                                Search anyway →
                            </button>
                        </div>
                    )}

                    {/* Recent Searches */}
                    {!searchQuery && recentSearches.length > 0 && (
                        <div className="p-4 border-b border-gray-100">
                            <h3 className="text-sm font-semibold text-gray-500 mb-3 flex items-center gap-2">
                                <FontAwesomeIcon icon={faClock} className="w-4 h-4" />
                                Recent Searches
                            </h3>
                            {recentSearches.map((search, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleSearchSubmit(search)}
                                    className="w-full text-left p-3 rounded-xl hover:bg-gray-50 transition-colors group flex items-center gap-3"
                                >
                                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                                        <FontAwesomeIcon icon={faClock} className="w-4 h-4 text-gray-600" />
                                    </div>
                                    <p className="flex-1 font-medium text-gray-900">{search}</p>
                                    <button
                                        onClick={(e) => removeRecentSearch(search, e)}
                                        className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-gray-600 transition-all"
                                    >
                                        <FontAwesomeIcon icon={faXmark} className="w-3 h-3" />
                                    </button>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Popular Searches */}
                    {!searchQuery && (
                        <div className="p-4">
                            <h3 className="text-sm font-semibold text-gray-500 mb-3 flex items-center gap-2">
                                <FontAwesomeIcon icon={faFire} className="w-4 h-4" />
                                Trending Searches
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
                                        <p className="text-xs text-gray-500 capitalize">{item.category}</p>
                                    </div>
                                    <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
                                        {item.trend}
                                    </span>
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
                <nav className="container mx-auto px-6 py-3 flex justify-between items-center animate-pulse">
                    <div className="h-8 bg-gray-300 rounded w-32"></div>
                    <div className="flex items-center space-x-4">
                        <div className="h-8 bg-gray-300 rounded w-20"></div>
                        <div className="h-8 bg-gray-300 rounded w-20"></div>
                    </div>
                </nav>
            </header>
        );
    }

    return (
        <>
            <header className="glass-effect sticky top-0 z-40 border-b border-gray-100">
                <nav className="container mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
                    <Link href={user ? "/home" : "/"} className="flex items-center space-x-3 hover:scale-105 transition-transform duration-200 group">
                        {/* Ultra Modern Geometric StudX Logo */}
                        <div className="relative">
                            {/* Main Logo Container - Diamond/Crystal Design */}
                            <div className="w-14 h-14 relative flex items-center justify-center">
                                {/* Outer rotating ring */}
                                <div className="absolute inset-0 border-4 border-transparent bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-600 rounded-full animate-spin" style={{ animationDuration: '8s' }}>
                                    <div className="w-full h-full rounded-full bg-white m-0.5"></div>
                                </div>
                                
                                {/* Inner diamond shape */}
                                <div className="relative z-10 w-10 h-10 bg-gradient-to-br from-slate-800 via-slate-900 to-black transform rotate-45 rounded-lg shadow-2xl group-hover:shadow-emerald-500/30 transition-all duration-500">
                                    {/* Diamond inner glow */}
                                    <div className="absolute inset-0.5 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-lg opacity-90"></div>
                                    
                                    {/* Center logo text */}
                                    <div className="absolute inset-0 flex items-center justify-center transform -rotate-45">
                                        <div className="text-white font-black text-xl tracking-tight">
                                            <span className="relative">
                                                <span className="text-yellow-300 drop-shadow-2xl">X</span>
                                                {/* Pulsing glow effect */}
                                                <div className="absolute inset-0 text-yellow-300 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse blur-sm">
                                                    X
                                                </div>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Floating accent dots */}
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full animate-bounce shadow-lg"></div>
                                <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full animate-pulse shadow-md"></div>
                                
                                {/* Energy particles */}
                                <div className="absolute top-0 left-1/2 w-1 h-1 bg-emerald-400 rounded-full animate-ping opacity-75"></div>
                                <div className="absolute bottom-0 right-1/4 w-0.5 h-0.5 bg-teal-300 rounded-full animate-pulse delay-300"></div>
                            </div>
                        </div>
                        
                        {/* Modern Brand Typography */}
                        <div className="flex flex-col">
                            <div className="flex items-baseline space-x-0.5">
                                <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-800 via-slate-700 to-emerald-600 group-hover:from-slate-900 group-hover:via-emerald-600 group-hover:to-teal-600 transition-all duration-500 tracking-tight">
                                    studXchange
                                </span>
                                <div className="w-2 h-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full animate-pulse"></div>
                            </div>
                            <div className="flex items-center space-x-1 -mt-1">
                                <span className="text-xs font-bold text-gray-500 group-hover:text-emerald-600 transition-colors duration-300 tracking-widest">
                                    MARKETPLACE
                                </span>
                                <div className="flex space-x-0.5">
                                    <div className="w-1 h-1 bg-emerald-400 rounded-full animate-pulse"></div>
                                    <div className="w-1 h-1 bg-teal-400 rounded-full animate-pulse delay-75"></div>
                                    <div className="w-1 h-1 bg-cyan-400 rounded-full animate-pulse delay-150"></div>
                                </div>
                            </div>
                        </div>
                    </Link>

                    {user ? (
                        <>
                            {/* Desktop Menu */}
                            <div className="hidden md:flex items-center space-x-8">
                                <div className="flex items-center space-x-6">
                                    {/* Enhanced Search Box */}
                                    <EnhancedSearchBox className="w-96" />
                                </div>

                                <div className="flex items-center space-x-4">
                                    <Link href="/sell" className="btn-primary btn-sm">
                                        <FontAwesomeIcon icon={faPlus} className="w-4 h-4" />
                                        Sell Item
                                    </Link>
                                    
                                    <Link href="/wishlist" className="relative p-3 text-slate-600 hover:text-emerald-600 transition-colors duration-200 rounded-xl hover:bg-slate-50">
                                        <FontAwesomeIcon icon={faHeart} className="w-5 h-5" />
                                        <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                                            0
                                        </span>
                                    </Link>
                                    
                                    {/* Add Notification System */}
                                    <NotificationSystem userId={user?.id} />
                                    
                                    <div className="relative" ref={profileMenuRef}>
                                        <button 
                                            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)} 
                                            className="flex items-center space-x-3 p-2 rounded-xl hover:bg-slate-50 transition-colors duration-200"
                                        >
                                            <div className="w-9 h-9 bg-gradient-to-br from-slate-800 via-slate-700 to-emerald-600 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-soft">
                                                {user.user_metadata?.name?.charAt(0) || user.email?.charAt(0) || 'U'}
                                            </div>
                                            <span className="text-sm font-medium text-slate-700">
                                                {user.user_metadata?.name?.split(' ')[0] || 'Profile'}
                                            </span>
                                        </button>
                                        
                                        <div className={`absolute right-0 mt-2 w-64 card card-elevated py-2 z-50 transition-all duration-200 ${isProfileMenuOpen ? 'opacity-100 visible transform translate-y-0' : 'opacity-0 invisible transform -translate-y-2'}`}>
                                            <div className="px-4 py-3 border-b border-slate-100">
                                                <p className="text-sm font-semibold text-slate-900">{user.user_metadata?.name || 'User'}</p>
                                                <p className="text-xs text-muted truncate">{user.email}</p>
                                            </div>
                                            <Link href="/profile" onClick={() => setIsProfileMenuOpen(false)} className="flex items-center px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                                                <FontAwesomeIcon icon={faUser} className="mr-3 w-4" />
                                                My Profile
                                            </Link>
                                            <Link href="/wishlist" onClick={() => setIsProfileMenuOpen(false)} className="flex items-center px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                                                <FontAwesomeIcon icon={faHeart} className="mr-3 w-4" />
                                                My Wishlist
                                            </Link>
                                            <Link href="/sell" onClick={() => setIsProfileMenuOpen(false)} className="flex items-center px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                                                <FontAwesomeIcon icon={faPlus} className="mr-3 w-4" />
                                                Sell Item
                                            </Link>
                                            <div className="divider my-1"></div>
                                            <button onClick={handleLogout} className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors">
                                                <FontAwesomeIcon icon={faSignOutAlt} className="mr-3 w-4" />
                                                Sign Out
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Mobile Menu Button */}
                            <div className="md:hidden">
                                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-gray-600 hover:text-primary-600 transition-colors rounded-lg hover:bg-gray-50">
                                    <FontAwesomeIcon icon={isMenuOpen ? faTimes : faBars} className="w-5 h-5" />
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center space-x-4">
                            <Link href="/login" className="text-gray-600 hover:text-primary-600 font-medium transition-colors">
                                Sign In
                            </Link>
                            <Link href="/signup" className="btn-accent btn-sm">
                                Get Started
                            </Link>
                        </div>
                    )}
                </nav>

                {/* Mobile Menu */}
                {isMenuOpen && user && (
                    <div className="md:hidden bg-white border-t border-gray-100 shadow-soft animate-fade-in-down">
                        <div className="px-4 py-6 space-y-4">
                            {/* Mobile Enhanced Search */}
                            <EnhancedSearchBox className="w-full" />
                            
                            <div className="space-y-2">
                                <Link href="/sell" onClick={() => setIsMenuOpen(false)} className="flex items-center p-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                                    <FontAwesomeIcon icon={faPlus} className="mr-3 w-5 h-5" />
                                    Sell Item
                                </Link>
                                <Link href="/wishlist" onClick={() => setIsMenuOpen(false)} className="flex items-center p-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                                    <FontAwesomeIcon icon={faHeart} className="mr-3 w-5 h-5" />
                                    My Wishlist
                                </Link>
                                <Link href="/profile" onClick={() => setIsMenuOpen(false)} className="flex items-center p-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                                    <FontAwesomeIcon icon={faUser} className="mr-3 w-5 h-5" />
                                    My Profile
                                </Link>
                                <button onClick={handleLogout} className="flex items-center w-full p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                    <FontAwesomeIcon icon={faSignOutAlt} className="mr-3 w-5 h-5" />
                                    Sign Out
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </header>
        </>
    );
}
