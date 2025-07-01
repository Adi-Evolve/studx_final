'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const funnyBanners = [
    {
        id: 1,
        title: "💸 Your Parents: \"Money doesn't grow on trees\"",
        subtitle: "Us: \"But it does grow from selling stuff you don't use anymore!\" Turn your clutter into cash on StudXchange.",
        buttonText: "Start Your Side Hustle",
        buttonLink: "/sell",
        emoji: "�",
        bgGradient: "from-emerald-500 via-green-600 to-teal-700",
        textColor: "text-white"
    },
    {
        id: 2,
        title: "🤔 \"Should I skip class or skip meals?\"",
        subtitle: "Plot twist: Skip neither! Sell your unused stuff and buy cheap textbooks. Genius level: Unlocked.",
        buttonText: "Feed Your Brain & Stomach",
        buttonLink: "/category/Books",
        emoji: "🧠",
        bgGradient: "from-blue-500 via-indigo-600 to-purple-700",
        textColor: "text-white"
    },
    {
        id: 3,
        title: "📝 \"Wait, we had to take notes?\"",
        subtitle: "Don't panic. Someone else was awake during those 8 AM lectures. Buy their notes and pretend you were there.",
        buttonText: "Buy Academic Redemption",
        buttonLink: "/category/Notes",
        emoji: "�",
        bgGradient: "from-orange-500 via-red-600 to-pink-700",
        textColor: "text-white"
    },
    {
        id: 4,
        title: "💻 \"My laptop is older than some freshmen\"",
        subtitle: "Time for an upgrade! Sell your vintage tech and buy something from this decade. Your productivity will thank you.",
        buttonText: "Escape the Stone Age",
        buttonLink: "/category/Laptops",
        emoji: "🦕",
        bgGradient: "from-cyan-500 via-blue-600 to-indigo-700",
        textColor: "text-white"
    },
    {
        id: 5,
        title: "🚲 \"Walking to class builds character\"",
        subtitle: "Sure, but arriving on time builds better grades. Find a bike and glide to success (or at least to the cafeteria faster).",
        buttonText: "Upgrade Your Commute",
        buttonLink: "/category/Cycle/Bike",
        emoji: "⚡",
        bgGradient: "from-green-500 via-emerald-600 to-teal-700",
        textColor: "text-white"
    },
    {
        id: 6,
        title: "🛏️ \"My dorm room looks like a crime scene\"",
        subtitle: "The only crime here is your furniture situation. Find decent stuff from students who've escaped the plastic chair life.",
        buttonText: "Furnish Like a Human",
        buttonLink: "/category/Hostel Equipment",
        emoji: "🪑",
        bgGradient: "from-purple-500 via-pink-600 to-red-700",
        textColor: "text-white"
    },
    {
        id: 7,
        title: "🎓 \"College: Where dreams go to accumulate debt\"",
        subtitle: "But hey, at least you can buy and sell stuff without going broke! StudXchange: Making college slightly less painful.",
        buttonText: "Join the Survival Squad",
        buttonLink: "/about",
        emoji: "😤",
        bgGradient: "from-indigo-500 via-purple-600 to-pink-700",
        textColor: "text-white"
    },
    {
        id: 8,
        title: "🍕 \"Instant noodles again? Really?\"",
        subtitle: "Break the cycle! Try Cantiffin for actual food that won't make your parents worry about your life choices.",
        buttonText: "Eat Like an Adult",
        buttonLink: "https://cantiffin.vercel.app",
        emoji: "🍽️",
        bgGradient: "from-amber-500 via-orange-600 to-red-600",
        textColor: "text-white"
    },
    {
        id: 9,
        title: "📱 \"My phone has more cracks than my GPA\"",
        subtitle: "Fix at least one of those problems. Find phone accessories and protective gear before it's too late.",
        buttonText: "Save Your Screen & Dignity",
        buttonLink: "/category/Electronics",
        emoji: "�",
        bgGradient: "from-slate-500 via-gray-600 to-zinc-700",
        textColor: "text-white"
    },
    {
        id: 10,
        title: "🏠 \"Hostel life: Where privacy goes to die\"",
        subtitle: "Find a room that doesn't sound like a construction site. Your sanity (and sleep schedule) will thank you.",
        buttonText: "Escape the Chaos",
        buttonLink: "/category/Rooms/Hostel",
        emoji: "🤫",
        bgGradient: "from-teal-500 via-cyan-600 to-blue-700",
        textColor: "text-white"
    },
    {
        id: 11,
        title: "📚 \"This textbook costs more than my rent\"",
        subtitle: "Welcome to college economics 101. Find cheaper books here, or sell yours to recover from financial trauma.",
        buttonText: "Recover Your Wallet",
        buttonLink: "/category/Textbook",
        emoji: "�",
        bgGradient: "from-red-500 via-pink-600 to-purple-700",
        textColor: "text-white"
    },
    {
        id: 12,
        title: "🧘 \"I need to study but Netflix exists\"",
        subtitle: "The eternal struggle. At least buy some decent study materials so you can procrastinate with style.",
        buttonText: "Procrastinate Professionally",
        buttonLink: "/search",
        emoji: "�",
        bgGradient: "from-violet-500 via-purple-600 to-indigo-700",
        textColor: "text-white"
    }
];

export default function FunnyAdvertisingBanner() {
    const [currentBanner, setCurrentBanner] = useState(0);
    const [isMobile, setIsMobile] = useState(false);
    const [isPlaying, setIsPlaying] = useState(true);

    // Check if device is mobile
    useEffect(() => {
        const checkMobile = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            setIsPlaying(!mobile); // Don't autoplay on mobile
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Auto-rotation effect (disabled on mobile)
    useEffect(() => {
        if (!isPlaying || isMobile) return;

        const interval = setInterval(() => {
            setCurrentBanner((prev) => (prev + 1) % funnyBanners.length);
        }, 6000); // Change banner every 6 seconds

        return () => clearInterval(interval);
    }, [isPlaying, isMobile]);

    const nextBanner = () => {
        setCurrentBanner((prev) => (prev + 1) % funnyBanners.length);
    };

    const prevBanner = () => {
        setCurrentBanner((prev) => (prev - 1 + funnyBanners.length) % funnyBanners.length);
    };

    const toggleAutoplay = () => {
        if (isMobile) return; // Don't allow autoplay toggle on mobile
        setIsPlaying(!isPlaying);
    };

    const banner = funnyBanners[currentBanner];

    return (
        <div className="relative overflow-hidden group">
            {/* Mobile swipe indicator */}
            {isMobile && (
                <div className="absolute top-4 right-4 z-20 bg-black/30 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                    👆 Tap arrows or dots
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
                        {/* Emoji with animation */}
                        <div className="text-4xl md:text-6xl mb-4 animate-bounce">
                            {banner.emoji}
                        </div>
                        
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
                
                {/* Banner indicators and controls */}
                <div className="flex justify-center items-center mt-8 space-x-2">
                    {/* Autoplay Toggle - Only show on desktop */}
                    {!isMobile && (
                        <button
                            onClick={toggleAutoplay}
                            className="bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full p-1.5 mr-3 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/50"
                            aria-label={isPlaying ? 'Pause slideshow' : 'Play slideshow'}
                        >
                            {isPlaying ? (
                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                                </svg>
                            ) : (
                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M8 5v14l11-7z"/>
                                </svg>
                            )}
                        </button>
                    )}

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