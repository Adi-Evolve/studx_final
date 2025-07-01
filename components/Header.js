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
    faSearch
} from '@fortawesome/free-solid-svg-icons';
import NotificationSystem from './NotificationSystem';
import ThemeToggle from './ThemeToggle';

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

// Simple Search Component with Modern Design
function SearchBox({ onSearch, className = "" }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const searchRef = useRef(null);
    const router = useRouter();

    useOnClickOutside(searchRef, () => {
        setIsSearchFocused(false);
    });

    const handleSearchSubmit = (query = searchQuery) => {
        if (!query.trim()) return;
        
        setIsSearchFocused(false);
        setSearchQuery(query);
        
        const searchParams = new URLSearchParams();
        searchParams.set('q', query.trim());
        
        router.push(`/search?${searchParams.toString()}`);
        onSearch?.(query);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSearchSubmit();
        } else if (e.key === 'Escape') {
            setIsSearchFocused(false);
        }
    };

    return (
        <div className={`relative ${className}`} ref={searchRef}>
            <div className="relative group">
                {/* Modern Search Icon */}
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
                    <FontAwesomeIcon 
                        icon={faSearch} 
                        className={`w-4 h-4 transition-colors duration-200 ${
                            isSearchFocused ? 'text-emerald-500' : 'text-gray-400'
                        }`} 
                    />
                </div>
                
                {/* Enhanced Input Field */}
                <input
                    type="text"
                    placeholder="Search textbooks, notes, rooms, electronics..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setIsSearchFocused(true)}
                    className={`
                        w-full pl-12 pr-20 py-3.5 
                        bg-gradient-to-r from-gray-50 to-gray-50 dark:from-gray-800 dark:to-gray-800
                        border-2 rounded-2xl 
                        text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400
                        transition-all duration-300 ease-in-out
                        shadow-sm hover:shadow-md dark:shadow-gray-900 dark:hover:shadow-gray-700
                        ${isSearchFocused 
                            ? 'border-emerald-400 dark:border-emerald-500 bg-white dark:bg-gray-700 shadow-lg ring-4 ring-emerald-100 dark:ring-emerald-900/30' 
                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                        }
                    `}
                    aria-label="Search for items"
                />
                
                {/* Enhanced Search Button */}
                <button
                    onClick={() => handleSearchSubmit()}
                    className={`
                        absolute right-2 top-1/2 transform -translate-y-1/2 
                        px-4 py-2 rounded-xl font-semibold text-sm
                        transition-all duration-200 shadow-sm
                        ${searchQuery.trim() 
                            ? 'bg-gradient-to-r from-slate-800 via-slate-700 to-emerald-600 dark:from-slate-600 dark:via-slate-500 dark:to-emerald-500 text-white hover:shadow-md hover:scale-105 active:scale-95' 
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                        }
                    `}
                    disabled={!searchQuery.trim()}
                >
                    Search
                </button>
                
                {/* Focus Ring Effect */}
                <div className={`
                    absolute inset-0 rounded-2xl transition-opacity duration-300 pointer-events-none
                    ${isSearchFocused ? 'bg-gradient-to-r from-emerald-500/5 to-teal-500/5' : 'opacity-0'}
                `}></div>
            </div>
            
            {/* Search Suggestions (when focused) */}
            {isSearchFocused && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
                    <div className="p-3 border-b border-gray-100">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Quick Searches</p>
                    </div>
                    <div className="p-2">
                        {['📚 Textbooks', '📝 Study Notes', '🏠 Rooms', '💻 Electronics', '🪑 Furniture'].map((suggestion, index) => (
                            <button
                                key={index}
                                onClick={() => {
                                    const cleanSuggestion = suggestion.split(' ').slice(1).join(' ');
                                    handleSearchSubmit(cleanSuggestion);
                                }}
                                className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors duration-150 text-sm text-gray-700 hover:text-gray-900"
                            >
                                {suggestion}
                            </button>
                        ))}
                    </div>
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
            <header className="bg-white dark:bg-gray-900 shadow-md dark:shadow-gray-800 transition-colors duration-300">
                <nav className="container mx-auto px-4 py-4 flex justify-between items-center animate-pulse">
                    <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-32"></div>
                    <div className="flex items-center space-x-4">
                        <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-20"></div>
                        <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-20"></div>
                    </div>
                </nav>
            </header>
        );
    }

    return (
        <>
            <header className="bg-white dark:bg-gray-900 shadow-md dark:shadow-gray-800 sticky top-0 z-40 transition-colors duration-300">
                <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
                    {/* StudXchange Text Only - No Logo */}
                    <Link href={user ? "/" : "/"} className="flex items-center hover:scale-105 transition-transform duration-300 group">
                        <div className="flex flex-col">
                            {/* StudXchange as One Word with Footer Gradient */}
                            <div className="flex items-baseline">
                                <span className="text-3xl font-black bg-gradient-to-r from-slate-800 via-slate-700 to-emerald-600 dark:from-slate-200 dark:via-slate-300 dark:to-emerald-400 bg-clip-text text-transparent tracking-tight">
                                    StudXchange
                                </span>
                            </div>
                            
                            {/* Clean Subtitle */}
                            <div className="flex items-center space-x-2 mt-1">
                                <p className="text-xs text-gray-600 dark:text-gray-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-300 font-medium">
                                    Academic Marketplace
                                </p>
                                <div className="w-1 h-1 bg-emerald-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <span className="text-xs text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500 font-medium">
                                    Exchange
                                </span>
                            </div>
                        </div>
                    </Link>

                    {/* Desktop Search Bar */}
                    <div className="hidden lg:block flex-1 max-w-2xl mx-8">
                        <SearchBox className="w-full" />
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-4">
                        {/* Mobile Search Button for tablets */}
                        <button
                            onClick={() => setIsSearchOpen(true)}
                            className="lg:hidden p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                        >
                            <FontAwesomeIcon icon={faSearch} className="w-5 h-5 text-gray-600" />
                        </button>

                        {user ? (
                            <>
                                <ThemeToggle />
                                <Link href="/sell" className="btn-primary">
                                    <FontAwesomeIcon icon={faPlus} className="w-4 h-4 mr-2" />
                                    Sell
                                </Link>
                                <Link href="/wishlist" className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors relative">
                                    <FontAwesomeIcon icon={faHeart} className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                </Link>
                                <div className="relative" ref={profileMenuRef}>
                                    <button 
                                        onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                                        className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        <FontAwesomeIcon icon={faUser} className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                    </button>
                                    {isProfileMenuOpen && (
                                        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
                                            <Link 
                                                href="/profile" 
                                                className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                                onClick={() => setIsProfileMenuOpen(false)}
                                            >
                                                <FontAwesomeIcon icon={faUser} className="w-4 h-4 mr-3" />
                                                Profile
                                            </Link>
                                            <button 
                                                onClick={handleLogout}
                                                className="w-full text-left px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                            >
                                                <FontAwesomeIcon icon={faSignOutAlt} className="w-4 h-4 mr-3" />
                                                Logout
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <>
                                <ThemeToggle />
                                <Link href="/login" className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                                    Login
                                </Link>
                                <Link href="/signup" className="btn-primary">
                                    Sign Up
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button and Search */}
                    <div className="md:hidden flex items-center space-x-2">
                        <button
                            onClick={() => setIsSearchOpen(true)}
                            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        >
                            <FontAwesomeIcon icon={faSearch} className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        </button>
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        >
                            <FontAwesomeIcon 
                                icon={isMenuOpen ? faTimes : faBars} 
                                className="w-5 h-5 text-gray-600 dark:text-gray-400" 
                            />
                        </button>
                    </div>
                </nav>

                {/* Improved Mobile Menu */}
                {isMenuOpen && (
                    <div className="md:hidden">
                        <div className="absolute top-full left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-lg z-50 transition-colors duration-300">
                            <div className="container mx-auto px-4 py-4">
                                <div className="space-y-3">
                                    {/* Theme Toggle for Mobile */}
                                    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                        <span className="text-gray-700 dark:text-gray-300">Dark Mode</span>
                                        <ThemeToggle />
                                    </div>
                                    <hr className="border-gray-200 dark:border-gray-700" />
                                    
                                    {user ? (
                                        <>
                                            <Link 
                                                href="/sell" 
                                                className="flex items-center space-x-3 p-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                                                onClick={() => setIsMenuOpen(false)}
                                            >
                                                <FontAwesomeIcon icon={faPlus} className="w-5 h-5" />
                                                <span className="font-medium">Sell Item</span>
                                            </Link>
                                            <Link 
                                                href="/wishlist" 
                                                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                                onClick={() => setIsMenuOpen(false)}
                                            >
                                                <FontAwesomeIcon icon={faHeart} className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                                <span className="text-gray-700 dark:text-gray-300">Wishlist</span>
                                            </Link>
                                            <Link 
                                                href="/profile" 
                                                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                                onClick={() => setIsMenuOpen(false)}
                                            >
                                                <FontAwesomeIcon icon={faUser} className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                                <span className="text-gray-700 dark:text-gray-300">Profile</span>
                                            </Link>
                                            <hr className="border-gray-200 dark:border-gray-700" />
                                            <button 
                                                onClick={() => { handleLogout(); setIsMenuOpen(false); }}
                                                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors w-full text-left"
                                            >
                                                <FontAwesomeIcon icon={faSignOutAlt} className="w-5 h-5" />
                                                <span>Logout</span>
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <Link 
                                                href="/login" 
                                                className="block w-full p-3 text-center rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300"
                                                onClick={() => setIsMenuOpen(false)}
                                            >
                                                Login
                                            </Link>
                                            <Link 
                                                href="/signup" 
                                                className="block w-full p-3 text-center rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                                                onClick={() => setIsMenuOpen(false)}
                                            >
                                                Sign Up
                                            </Link>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Improved Mobile Search Modal */}
                {isSearchOpen && (
                    <div className="fixed inset-0 z-50 lg:hidden">
                        {/* Backdrop */}
                        <div 
                            className="absolute inset-0 bg-black bg-opacity-50" 
                            onClick={() => setIsSearchOpen(false)}
                        ></div>
                        
                        {/* Search Modal */}
                        <div className="relative bg-white">
                            <div className="flex items-center justify-between p-4 border-b border-gray-200">
                                <h2 className="text-lg font-semibold text-gray-900">Search StudXchange</h2>
                                <button
                                    onClick={() => setIsSearchOpen(false)}
                                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    <FontAwesomeIcon icon={faTimes} className="w-5 h-5 text-gray-600" />
                                </button>
                            </div>
                            <div className="p-4">
                                <SearchBox 
                                    className="w-full" 
                                    onSearch={() => setIsSearchOpen(false)}
                                />
                                <div className="mt-4">
                                    <p className="text-sm text-gray-500 mb-3">Popular searches:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {['Books', 'Electronics', 'Notes', 'Furniture', 'Rooms'].map((term) => (
                                            <button
                                                key={term}
                                                onClick={() => {
                                                    router.push(`/search?q=${term}`);
                                                    setIsSearchOpen(false);
                                                }}
                                                className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
                                            >
                                                {term}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </header>
            <NotificationSystem />
        </>
    );
}
