'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const funnyBanners = [
    {
        id: 1,
        title: "Broke Student? We Feel You! 💸",
        subtitle: "Turn your unused stuff into pizza money. Your wallet will thank you (and so will your stomach).",
        buttonText: "Start Selling Now",
        buttonLink: "/sell",
        emoji: "🍕",
        bgGradient: "from-orange-400 via-red-500 to-pink-500",
        textColor: "text-white"
    },
    {
        id: 2,
        title: "Your Textbooks Are Judging You 📚",
        subtitle: "They're collecting dust while other students are crying. Be the hero they need!",
        buttonText: "Sell Textbooks",
        buttonLink: "/sell?type=regular&category=Books",
        emoji: "🦸‍♂️",
        bgGradient: "from-blue-500 via-purple-600 to-indigo-700",
        textColor: "text-white"
    },
    {
        id: 3,
        title: "That Laptop Needs a New Home 💻",
        subtitle: "It's been through finals, all-nighters, and questionable downloads. Give it a fresh start!",
        buttonText: "List Electronics",
        buttonLink: "/sell?type=regular&category=Electronics",
        emoji: "🏠",
        bgGradient: "from-green-400 via-teal-500 to-blue-600",
        textColor: "text-white"
    },
    {
        id: 4,
        title: "Room Full of Random Stuff? 🤷‍♀️",
        subtitle: "One person's 'I'll use this someday' is another person's treasure. Clean up and cash in!",
        buttonText: "Explore Categories",
        buttonLink: "/sell",
        emoji: "💰",
        bgGradient: "from-purple-500 via-pink-500 to-red-500",
        textColor: "text-white"
    },
    {
        id: 5,
        title: "Notes So Good, They Should Be Illegal 📝",
        subtitle: "Share your genius with future generations (and make some money while you're at it).",
        buttonText: "Share Notes",
        buttonLink: "/sell?type=notes",
        emoji: "🧠",
        bgGradient: "from-yellow-400 via-orange-500 to-red-500",
        textColor: "text-white"
    }
];

export default function FunnyAdvertisingBanner() {
    const [currentBanner, setCurrentBanner] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setIsAnimating(true);
            setTimeout(() => {
                setCurrentBanner((prev) => (prev + 1) % funnyBanners.length);
                setIsAnimating(false);
            }, 300);
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    const banner = funnyBanners[currentBanner];

    return (
        <div className={`relative bg-gradient-to-r ${banner.bgGradient} text-white py-4 md:py-8 px-4 overflow-hidden`}>
            {/* Animated background elements - smaller on mobile */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-2 left-2 md:top-5 md:left-5 text-2xl md:text-4xl animate-bounce">💸</div>
                <div className="absolute top-3 right-3 md:top-10 md:right-10 text-xl md:text-3xl animate-pulse">📚</div>
                <div className="absolute bottom-2 left-3 md:bottom-5 md:left-10 text-2xl md:text-4xl animate-spin">💻</div>
                <div className="absolute bottom-3 right-2 md:bottom-10 md:right-5 text-lg md:text-2xl animate-bounce">🎒</div>
                <div className="absolute top-1/2 left-1/4 text-xl md:text-3xl animate-pulse">📝</div>
                <div className="absolute top-1/3 right-1/3 text-lg md:text-2xl animate-bounce">🏠</div>
            </div>

            {/* Main content */}
            <div className="relative z-10 max-w-4xl mx-auto text-center">
                <div className={`transition-all duration-300 ${isAnimating ? 'opacity-0 transform scale-95' : 'opacity-100 transform scale-100'}`}>
                    <div className="text-3xl md:text-5xl mb-2 md:mb-4 animate-bounce">
                        {banner.emoji}
                    </div>
                    
                    <h1 className={`text-lg md:text-2xl lg:text-4xl font-black mb-2 md:mb-4 ${banner.textColor} leading-tight`}>
                        {banner.title}
                    </h1>
                    
                    <p className={`text-sm md:text-lg lg:text-xl mb-4 md:mb-6 ${banner.textColor} opacity-90 max-w-2xl mx-auto leading-relaxed`}>
                        {banner.subtitle}
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-2 md:gap-3 justify-center items-center">
                        <Link
                            href={banner.buttonLink}
                            className="bg-white text-gray-800 px-4 md:px-6 py-2 md:py-3 rounded-full font-bold text-sm md:text-base hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl"
                        >
                            {banner.buttonText} 🚀
                        </Link>
                        
                        <Link
                            href="/search"
                            className="border-2 border-white text-white px-4 md:px-6 py-2 md:py-3 rounded-full font-bold text-sm md:text-base hover:bg-white hover:text-gray-800 transition-all duration-300 transform hover:scale-105"
                        >
                            Browse Deals 🔍
                        </Link>
                    </div>
                </div>

                {/* Banner indicators */}
                <div className="flex justify-center mt-3 md:mt-6 space-x-2">
                    {funnyBanners.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentBanner(index)}
                            className={`w-2 h-2 rounded-full transition-all duration-300 ${
                                index === currentBanner ? 'bg-white' : 'bg-white/50'
                            }`}
                        />
                    ))}
                </div>
            </div>

            {/* Floating elements - smaller on mobile */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                <div className="absolute top-2 left-2 md:top-5 md:left-5 w-6 md:w-12 h-6 md:h-12 bg-white/10 rounded-full animate-float"></div>
                <div className="absolute top-8 right-4 md:top-20 md:right-10 w-4 md:w-10 h-4 md:h-10 bg-white/10 rounded-full animate-float-delayed"></div>
                <div className="absolute bottom-4 left-1/4 w-3 md:w-8 h-3 md:h-8 bg-white/10 rounded-full animate-float"></div>
                <div className="absolute bottom-8 right-1/3 w-7 md:w-14 h-7 md:h-14 bg-white/10 rounded-full animate-float-delayed"></div>
            </div>

            <style jsx>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-20px); }
                }
                @keyframes float-delayed {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-15px); }
                }
                .animate-float {
                    animation: float 3s ease-in-out infinite;
                }
                .animate-float-delayed {
                    animation: float-delayed 3s ease-in-out infinite 1.5s;
                }
            `}</style>
        </div>
    );
}