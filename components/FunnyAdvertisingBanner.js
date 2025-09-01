'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const funnyBanners = [
    {
        id: 1,
        title: "🔥 Premium Arduino Kits Available!",
        subtitle: "Complete starter kits with sensors, wires & components from verified seller. Perfect for electronics projects!",
        buttonText: "Shop Arduino Kits",
        buttonLink: "/search?q=arduino&category=Project+Equipment",
        bgGradient: "from-gray-800 to-gray-600",
        textColor: "text-white"
    },
    {
        id: 2,
        title: "Buy and Sell Student Essentials",
        subtitle: "Connect with fellow students to find textbooks, electronics, and more at affordable prices.",
        buttonText: "Start Shopping",
        buttonLink: "/",
        bgGradient: "from-slate-800 to-slate-600",
        textColor: "text-white"
    },
    {
        id: 3,
        title: "Sell Your Unused Items",
        subtitle: "Turn your unused books, electronics, and equipment into cash. List items quickly and reach student buyers.",
        buttonText: "Start Selling",
        buttonLink: "/sell",
        bgGradient: "from-gray-700 to-gray-500",
        textColor: "text-white"
    },
    {
        id: 4,
        title: "Find Academic Resources",
        subtitle: "Access notes, study materials, and textbooks shared by students from your institution.",
        buttonText: "Browse Notes",
        buttonLink: "/category/Notes",
        bgGradient: "from-zinc-800 to-zinc-600",
        textColor: "text-white"
    },
    {
        id: 5,
        title: "Discover Student Accommodation",
        subtitle: "Find rooms, hostels, and shared accommodations near your campus with verified listings.",
        buttonText: "Find Rooms",
        buttonLink: "/category/Rooms/Hostel",
        bgGradient: "from-stone-800 to-stone-600",
        textColor: "text-white"
    }
];

export default function FunnyAdvertisingBanner() {
    const [currentBanner, setCurrentBanner] = useState(0);
    const [isMobile, setIsMobile] = useState(false);

    // Check if device is mobile
    useEffect(() => {
        const checkMobile = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Auto-rotation effect (DISABLED per user request)
    // useEffect(() => {
    //     if (!isPlaying || isMobile) return;

    //     const interval = setInterval(() => {
    //         setCurrentBanner((prev) => (prev + 1) % funnyBanners.length);
    //     }, 6000); // Change banner every 6 seconds

    //     return () => clearInterval(interval);
    // }, [isPlaying, isMobile]);

    const nextBanner = () => {
        setCurrentBanner((prev) => (prev + 1) % funnyBanners.length);
    };

    const prevBanner = () => {
        setCurrentBanner((prev) => (prev - 1 + funnyBanners.length) % funnyBanners.length);
    };

    const banner = funnyBanners[currentBanner];

    return (
        <div className="relative overflow-hidden group">
            {/* Mobile navigation indicator */}
            {isMobile && (
                <div className="absolute top-4 right-4 z-20 bg-black/30 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                    Tap arrows
                </div>
            )}

            <div className={`bg-gradient-to-r ${banner.bgGradient} py-8 md:py-12 px-4 sm:px-6 lg:px-8 transition-all duration-1000 ease-in-out relative`}>
                {/* Navigation Arrows - Always visible on mobile for manual control */}
                <button
                    onClick={prevBanner}
                    className={`absolute top-1/2 left-2 md:left-4 transform -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full p-2 md:p-3 shadow-lg transition-all duration-300 opacity-70 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-white/50 z-10 ${isMobile ? 'opacity-90' : 'md:opacity-0 md:group-hover:opacity-100'}`}
                    aria-label="Previous banner"
                >
                    <svg className="w-4 h-4 md:w-5 md:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>

                <button
                    onClick={nextBanner}
                    className={`absolute top-1/2 right-2 md:right-4 transform -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full p-2 md:p-3 shadow-lg transition-all duration-300 opacity-70 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-white/50 z-10 ${isMobile ? 'opacity-90' : 'md:opacity-0 md:group-hover:opacity-100'}`}
                    aria-label="Next banner"
                >
                    <svg className="w-4 h-4 md:w-5 md:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>

                <div className="max-w-7xl mx-auto">
                    <div className="text-center">
                        {/* Title */}
                        <h1 className={`text-xl md:text-4xl font-bold ${banner.textColor} mb-4 leading-tight animate-fade-in-down`}>
                            {banner.title}
                        </h1>
                        
                        {/* Subtitle */}
                        <p className={`text-sm md:text-xl ${banner.textColor} mb-8 max-w-3xl mx-auto opacity-90 animate-fade-in-up`}>
                            {banner.subtitle}
                        </p>
                        
                        {/* CTA Button */}
                        {banner.buttonLink.startsWith('http') ? (
                            <a
                                href={banner.buttonLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-6 md:px-8 py-3 md:py-4 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-bold text-sm md:text-lg rounded-full transition-all duration-300 transform hover:scale-105 border border-white/30 shadow-lg hover:shadow-xl"
                            >
                                {banner.buttonText}
                                <svg className="w-4 h-4 md:w-5 md:h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </a>
                        ) : (
                            <Link
                                href={banner.buttonLink}
                                className="inline-flex items-center px-6 md:px-8 py-3 md:py-4 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-bold text-sm md:text-lg rounded-full transition-all duration-300 transform hover:scale-105 border border-white/30 shadow-lg hover:shadow-xl"
                            >
                                {banner.buttonText}
                                <svg className="w-4 h-4 md:w-5 md:h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </Link>
                        )}
                    </div>
                </div>
                
                {/* Banner indicators */}
                <div className="flex justify-center items-center mt-8 space-x-2">
                    {/* Dot Indicators - Larger on mobile for better touch targets */}
                    {funnyBanners.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentBanner(index)}
                            className={`${isMobile ? 'w-3 h-3' : 'w-2 h-2 md:w-3 md:h-3'} rounded-full transition-all duration-300 ${
                                index === currentBanner 
                                    ? 'bg-white scale-125' 
                                    : 'bg-white/50 hover:bg-white/75'
                            }`}
                            aria-label={`Go to banner ${index + 1}`}
                        />
                    ))}

                    {/* Mobile counter */}
                    {isMobile && (
                        <div className="ml-3 text-white/70 text-xs">
                            {currentBanner + 1}/{funnyBanners.length}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}