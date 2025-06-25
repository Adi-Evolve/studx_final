'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart, faUser, faPlus, faSignOutAlt, faBars, faTimes } from '@fortawesome/free-solid-svg-icons';

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

export default function Header() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [adVisible, setAdVisible] = useState(true);
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

    const handleSearch = (e) => {
        if (e.key === 'Enter' && searchQuery.trim() !== '') {
            router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

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
            {adVisible && (
                <a href="https://cantiffin.vercel.app" target="_blank" rel="noopener noreferrer" className="fixed top-24 right-6 bg-red-600 text-white font-bold py-3 px-5 rounded-full shadow-lg z-50 hover:bg-red-700 transition-all duration-300 flex items-center gap-2 animate-fade-in-down">
                    Try Cantiffin
                    <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setAdVisible(false); }} className="bg-red-700/50 rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-700">
                        <FontAwesomeIcon icon={faTimes} className="text-sm" />
                    </button>
                </a>
            )}
            <header className="bg-white shadow-md sticky top-0 z-40">
                <nav className="container mx-auto px-4 sm:px-6 py-3 flex justify-between items-center">
                    <Link href={user ? "/home" : "/"} className="text-2xl font-bold text-accent">
                        StudXchange
                    </Link>

                    {user ? (
                        <>
                            {/* Desktop Menu */}
                            <div className="hidden md:flex items-center space-x-6">
                                <div className="flex items-center space-x-4">
                                    <div className="relative w-full">
                                        <input type="text" placeholder="Search for items / college..." className="w-full border border-gray-300 rounded-full py-2 px-4 focus:outline-none focus:ring-2 focus:ring-accent" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={handleSearch} />
                                    </div>
                                </div>
                                <Link href="/sell" className="flex items-center bg-accent text-white font-bold py-2 px-4 rounded-lg hover:bg-primary transition duration-300">
                                    <FontAwesomeIcon icon={faPlus} className="mr-2" />
                                    Sell
                                </Link>
                                <Link href="/wishlist" className="text-secondary hover:text-primary">
                                    <FontAwesomeIcon icon={faHeart} size="lg" />
                                </Link>
                                <div className="relative" ref={profileMenuRef}>
                                    <button onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)} className="text-secondary hover:text-primary">
                                        <FontAwesomeIcon icon={faUser} size="lg" />
                                    </button>
                                    <div className={`absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20 ${isProfileMenuOpen ? 'block' : 'hidden'}`}>
                                        <Link href="/profile" onClick={() => setIsProfileMenuOpen(false)} className="block px-4 py-2 text-sm text-primary hover:bg-light-bg">My Profile</Link>
                                        <Link href="/wishlist" onClick={() => setIsProfileMenuOpen(false)} className="block px-4 py-2 text-sm text-primary hover:bg-light-bg">My Wishlist</Link>
                                        <Link href="/sell" onClick={() => setIsProfileMenuOpen(false)} className="block px-4 py-2 text-sm text-primary hover:bg-light-bg">Sell Your Stuff</Link>
                                        <button onClick={handleLogout} className="w-full text-left block px-4 py-2 text-sm text-primary hover:bg-light-bg">
                                            <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" />
                                            Logout
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Mobile Menu Button */}
                            <div className="md:hidden">
                                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-secondary hover:text-primary">
                                    <FontAwesomeIcon icon={isMenuOpen ? faTimes : faBars} size="lg" />
                                </button>
                            </div>
                        </>
                    ) : (
                        <div>
                            <Link href="/login" className="text-secondary hover:text-primary mx-4">Login</Link>
                            <Link href="/signup" className="bg-accent text-white px-4 py-2 rounded-lg hover:bg-primary transition-colors">Sign Up</Link>
                        </div>
                    )}
                </nav>

                {/* Mobile Menu */}
                {isMenuOpen && user && (
                    <div className="md:hidden bg-white shadow-lg">
                        <div className="px-4 pt-2 pb-4 space-y-1">
                            <div className="relative mb-4">
                                <input type="text" placeholder="Search for items..." className="w-full border border-gray-300 rounded-full py-2 px-4 focus:outline-none focus:ring-2 focus:ring-accent" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={handleSearch} />
                            </div>
                            <Link href="/profile" className="block px-4 py-2 text-base text-primary hover:bg-light-bg rounded-md">My Profile</Link>
                            <Link href="/wishlist" className="block px-4 py-2 text-base text-primary hover:bg-light-bg rounded-md">My Wishlist</Link>
                            <Link href="/sell" className="block px-4 py-2 text-base text-primary hover:bg-light-bg rounded-md">Sell Your Stuff</Link>
                            <button onClick={handleLogout} className="w-full text-left block px-4 py-2 text-base text-primary hover:bg-light-bg rounded-md">
                                <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" />
                                Logout
                            </button>
                        </div>
                    </div>
                )}
            </header>
        </>
    );
}
