'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const funnyBanners = [
    {
        id: 1,
        title: "Welcome to StudXchange! 🎓",
        subtitle: "Where students buy, sell, and trade everything from textbooks to room rentals. Your campus marketplace awaits!",
        buttonText: "Start Trading",
        buttonLink: "/sell",
        emoji: "🔄",
        bgGradient: "from-blue-500 via-purple-600 to-indigo-700",
        textColor: "text-white"
    },
    {
        id: 2,
        title: "Sell Your Textbooks Instantly! 📚",
        subtitle: "Turn those expensive paperweights into cold, hard cash. Other students need them more than your shelf does!",
        buttonText: "Sell Books",
        buttonLink: "/sell?type=regular&category=Books",
        emoji: "💰",
        bgGradient: "from-green-400 via-emerald-500 to-teal-600",
        textColor: "text-white"
    },
    {
        id: 3,
        title: "Share Your Study Notes! 📝",
        subtitle: "Help fellow students ace their exams with your genius notes. Make money while being the campus hero!",
        buttonText: "Upload Notes",
        buttonLink: "/sell?type=notes",
        emoji: "🧠",
        bgGradient: "from-yellow-400 via-orange-500 to-red-500",
        textColor: "text-white"
    },
    {
        id: 4,
        title: "Find Your Perfect Room! 🏠",
        subtitle: "Browse verified room listings near your campus. Safe, affordable, and student-friendly accommodations!",
        buttonText: "Browse Rooms",
        buttonLink: "/search?category=Rooms",
        emoji: "🔍",
        bgGradient: "from-pink-500 via-rose-600 to-red-600",
        textColor: "text-white"
    },
    {
        id: 5,
        title: "Electronics Exchange Hub! 💻",
        subtitle: "Upgrade your gadgets or find budget-friendly electronics from fellow students. Tech that actually works!",
        buttonText: "Shop Electronics",
        buttonLink: "/search?category=Electronics",
        emoji: "⚡",
        bgGradient: "from-cyan-500 via-blue-600 to-indigo-700",
        textColor: "text-white"
    },
    {
        id: 6,
        title: "Campus-Wide Marketplace! 🌟",
        subtitle: "From furniture to cycles, stationery to clothing - find everything you need for student life in one place!",
        buttonText: "Explore All",
        buttonLink: "/search",
        emoji: "🛍️",
        bgGradient: "from-purple-500 via-pink-500 to-red-500",
        textColor: "text-white"
    },
    {
        id: 7,
        title: "Compare Before You Buy! ⚖️",
        subtitle: "Use our smart comparison tool to find the best deals. Make informed decisions like the smart student you are!",
        buttonText: "Compare Items",
        buttonLink: "/search",
        emoji: "🤓",
        bgGradient: "from-emerald-500 via-teal-600 to-cyan-700",
        textColor: "text-white"
    },
    {
        id: 8,
        title: "Wishlist Magic! ❤️",
        subtitle: "Save items you love and get notified when prices drop. Never miss out on great deals again!",
        buttonText: "Create Wishlist",
        buttonLink: "/wishlist",
        emoji: "✨",
        bgGradient: "from-red-500 via-pink-600 to-purple-700",
        textColor: "text-white"
    },
    {
        id: 9,
        title: "Featured Listings Spotlight! ⭐",
        subtitle: "Check out premium listings with verified sellers. Quality items with guaranteed satisfaction!",
        buttonText: "View Featured",
        buttonLink: "/featured",
        emoji: "🎯",
        bgGradient: "from-amber-500 via-orange-600 to-red-600",
        textColor: "text-white"
    },
    {
        id: 10,
        title: "Student-to-Student Reviews! 💬",
        subtitle: "Read honest reviews from your campus community. Buy with confidence from trusted sellers!",
        buttonText: "Read Reviews",
        buttonLink: "/search",
        emoji: "⭐",
        bgGradient: "from-indigo-500 via-purple-600 to-pink-700",
        textColor: "text-white"
    },
    {
        id: 11,
        title: "Chat with Sellers Instantly! 💬",
        subtitle: "Connect directly with sellers through our built-in chat system. Negotiate prices and ask questions easily!",
        buttonText: "Start Chatting",
        buttonLink: "/search",
        emoji: "💬",
        bgGradient: "from-teal-500 via-green-600 to-emerald-700",
        textColor: "text-white"
    },
    {
        id: 12,
        title: "Safe Campus Trading! 🛡️",
        subtitle: "Trade safely within your college community. All users are verified students for your peace of mind!",
        buttonText: "Trade Safely",
        buttonLink: "/search",
        emoji: "🔒",
        bgGradient: "from-slate-600 via-gray-700 to-zinc-800",
        textColor: "text-white"
    },
    {
        id: 13,
        title: "Promote Your Listings! 📢",
        subtitle: "Get maximum visibility for your items with our promotion features. Sell faster and earn more!",
        buttonText: "Promote Now",
        buttonLink: "/featured/promote",
        emoji: "🚀",
        bgGradient: "from-violet-500 via-purple-600 to-indigo-700",
        textColor: "text-white"
    },
    {
        id: 14,
        title: "Download Study Materials! 📁",
        subtitle: "Access and download study notes, assignments, and resources shared by your campus community!",
        buttonText: "Browse Notes",
        buttonLink: "/search?category=Notes",
        emoji: "📊",
        bgGradient: "from-blue-600 via-indigo-700 to-purple-800",
        textColor: "text-white"
    },
    {
        id: 15,
        title: "Campus Location-Based Search! 📍",
        subtitle: "Find items and rooms near your college with our smart location features. Convenience at its best!",
        buttonText: "Search Nearby",
        buttonLink: "/search",
        emoji: "🗺️",
        bgGradient: "from-orange-500 via-red-600 to-pink-700",
        textColor: "text-white"
    }
];

export default function FunnyAdvertisingBanner() {
    const [currentBanner, setCurrentBanner] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentBanner((prev) => (prev + 1) % funnyBanners.length);
        }, 8000); // Change banner every 8 seconds

        return () => clearInterval(interval);
    }, []);

    const banner = funnyBanners[currentBanner];

    return (
        <div className="relative overflow-hidden">
            <div className={`bg-gradient-to-r ${banner.bgGradient} py-8 md:py-12 px-4 sm:px-6 lg:px-8 transition-all duration-1000 ease-in-out`}>
                <div className="max-w-7xl mx-auto">
                    <div className="text-center">
                        {/* Emoji with animation */}
                        <div className="text-4xl md:text-6xl mb-4 animate-bounce">
                            {banner.emoji}
                        </div>
                        
                        {/* Title */}
                        <h1 className={`text-2xl md:text-4xl font-bold ${banner.textColor} mb-4 leading-tight`}>
                            {banner.title}
                        </h1>
                        
                        {/* Subtitle */}
                        <p className={`text-base md:text-xl ${banner.textColor} mb-8 max-w-3xl mx-auto opacity-90`}>
                            {banner.subtitle}
                        </p>
                        
                        {/* CTA Button */}
                        <Link
                            href={banner.buttonLink}
                            className="inline-flex items-center px-6 md:px-8 py-3 md:py-4 bg-white dark:bg-gray-100 text-gray-900 dark:text-gray-800 font-bold text-sm md:text-lg rounded-full hover:bg-gray-100 dark:hover:bg-gray-200 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                        >
                            {banner.buttonText}
                            <svg className="w-4 h-4 md:w-5 md:h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                        </Link>
                    </div>
                </div>
                
                {/* Banner indicators */}
                <div className="flex justify-center mt-8 space-x-2">
                    {funnyBanners.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentBanner(index)}
                            className={`w-2 h-2 rounded-full transition-all duration-300 ${
                                index === currentBanner 
                                    ? 'bg-white dark:bg-gray-200 w-8' 
                                    : 'bg-white/50 dark:bg-gray-300/50 hover:bg-white/75 dark:hover:bg-gray-300/75'
                            }`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}