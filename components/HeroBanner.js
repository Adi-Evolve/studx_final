'use client';

import React, { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import Link from 'next/link';

// Fresh, funny, and sarcastic banners that actually speak to college students
const banners = [
    {
        id: 1,
        image: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=2070&auto=format&fit=crop',
        title: '💸 Your Parents: "Money doesn\'t grow on trees"',
        subtitle: 'Us: "But it does grow from selling stuff you don\'t use anymore!" Turn your clutter into cash on StudXchange.',
        link: '/sell',
        cta: 'Start Your Side Hustle'
    },
    {
        id: 2,
        image: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?q=80&w=2070&auto=format&fit=crop',
        title: '🤔 "Should I skip class or skip meals?"',
        subtitle: 'Plot twist: Skip neither! Sell your unused stuff and buy cheap textbooks. Genius level: Unlocked.',
        link: '/category/Books',
        cta: 'Feed Your Brain & Stomach'
    },
    {
        id: 3,
        image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=2070&auto=format&fit=crop',
        title: '📝 "Wait, we had to take notes?"',
        subtitle: 'Don\'t panic. Someone else was awake during those 8 AM lectures. Buy their notes and pretend you were there.',
        link: '/category/Notes',
        cta: 'Buy Academic Redemption'
    },
    {
        id: 4,
        image: 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?q=80&w=1964&auto=format&fit=crop',
        title: '💻 "My laptop is older than some freshmen"',
        subtitle: 'Time for an upgrade! Sell your vintage tech and buy something from this decade. Your productivity will thank you.',
        link: '/category/Laptops',
        cta: 'Escape the Stone Age'
    },
    {
        id: 5,
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=2069&auto=format&fit=crop',
        title: '🚲 "Walking to class builds character"',
        subtitle: 'Sure, but arriving on time builds better grades. Find a bike and glide to success (or at least to the cafeteria faster).',
        link: '/category/Cycle/Bike',
        cta: 'Upgrade Your Commute'
    },
    {
        id: 6,
        image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=2158&auto=format&fit=crop',
        title: '🛏️ "My dorm room looks like a crime scene"',
        subtitle: 'The only crime here is your furniture situation. Find decent stuff from students who\'ve escaped the plastic chair life.',
        link: '/category/Hostel Equipment',
        cta: 'Furnish Like a Human'
    },
    {
        id: 7,
        image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2070&auto=format&fit=crop',
        title: '🎓 "College: Where dreams go to accumulate debt"',
        subtitle: 'But hey, at least you can buy and sell stuff without going broke! StudXchange: Making college slightly less painful.',
        link: '/about',
        cta: 'Join the Survival Squad'
    },
    {
        id: 8,
        gradient: 'from-emerald-500 to-teal-600',
        title: '🍕 "Instant noodles again? Really?"',
        subtitle: 'Break the cycle! Try Cantiffin for actual food that won\'t make your parents worry about your life choices.',
        link: 'https://cantiffin.vercel.app',
        cta: 'Eat Like an Adult'
    },
    {
        id: 9,
        gradient: 'from-purple-500 to-pink-600',
        title: '📱 "My phone has more cracks than my GPA"',
        subtitle: 'Fix at least one of those problems. Find phone accessories and protective gear before it\'s too late.',
        link: '/category/Electronics',
        cta: 'Save Your Screen & Dignity'
    },
    {
        id: 10,
        gradient: 'from-orange-500 to-red-600',
        title: '🏠 "Hostel life: Where privacy goes to die"',
        subtitle: 'Find a room that doesn\'t sound like a construction site. Your sanity (and sleep schedule) will thank you.',
        link: '/category/Rooms/Hostel',
        cta: 'Escape the Chaos'
    }
];

const ChevronLeftIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
    </svg>
);

const ChevronRightIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
    </svg>
);


export default function HeroBanner() {
    const [isMobile, setIsMobile] = useState(false);
    
    // Check if device is mobile
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Configure carousel based on device type
    const autoplayConfig = isMobile ? null : [Autoplay({ delay: 5000, stopOnInteraction: false })];
    
    const [emblaRef, emblaApi] = useEmblaCarousel(
        { 
            loop: true, 
            align: 'start',
            dragFree: isMobile, // Enable free dragging on mobile
            containScroll: 'trimSnaps' // Better mobile scroll behavior
        },
        autoplayConfig
    );

    const [selectedIndex, setSelectedIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(!isMobile); // Don't autoplay on mobile

    const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
    const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);
    const scrollTo = useCallback((index) => emblaApi && emblaApi.scrollTo(index), [emblaApi]);

    const toggleAutoplay = useCallback(() => {
        // Don't show autoplay controls on mobile
        if (isMobile) return;
        
        const autoplay = emblaApi?.plugins()?.autoplay;
        if (!autoplay) return;

        const playing = autoplay.isPlaying();
        if (playing) {
            autoplay.stop();
            setIsPlaying(false);
        } else {
            autoplay.play();
            setIsPlaying(true);
        }
    }, [emblaApi, isMobile]);

    useEffect(() => {
        if (!emblaApi) return;

        const onSelect = () => {
            setSelectedIndex(emblaApi.selectedScrollSnap());
        };

        emblaApi.on('select', onSelect);
        onSelect(); // Set initial index

        return () => emblaApi.off('select', onSelect);
    }, [emblaApi]);

    const bannerStyles = [
        'from-purple-500 to-indigo-600',
        'from-blue-400 to-teal-500',
        'from-green-400 to-lime-500',
    ];

    return (
        <div className="relative group w-full mx-auto my-4 md:my-8">
            {/* Mobile swipe indicator */}
            {isMobile && (
                <div className="absolute top-4 right-4 z-20 bg-black/50 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                    👆 Swipe
                </div>
            )}
            
            <div className="overflow-hidden rounded-xl shadow-2xl" ref={emblaRef}>
                <div className="flex">
                    {banners.map((banner) => {
                        const CtaButton = () => {
                            const isExternal = banner.link.startsWith('http');
                            const buttonClass = "bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-bold py-3 px-6 md:px-8 rounded-full transition-all duration-300 transform hover:scale-105 border border-white/30 text-sm md:text-base";

                            if (isExternal) {
                                return (
                                    <a href={banner.link} target="_blank" rel="noopener noreferrer" className={buttonClass}>
                                        {banner.cta}
                                    </a>
                                );
                            }
                            return (
                                <Link href={banner.link} className={buttonClass}>
                                    {banner.cta}
                                </Link>
                            );
                        };

                        return (
                            <div className="relative flex-grow-0 flex-shrink-0 w-full embla__slide" key={banner.id}>
                                {banner.image && <img src={banner.image} alt={banner.title} className="absolute inset-0 w-full h-full object-cover" />}
                                {banner.gradient && <div className={`absolute inset-0 bg-gradient-to-br ${banner.gradient}`}></div>}
                                <div className={`absolute inset-0 ${banner.image ? 'bg-black/60' : ''}`}></div>
                                <div className="relative flex flex-col items-center justify-center text-center text-white p-6 md:p-16 min-h-[250px] md:min-h-[400px]">
                                    <h2 className="text-xl md:text-5xl font-extrabold mb-3 md:mb-4 animate-fade-in-down leading-tight" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>{banner.title}</h2>
                                    <p className="text-sm md:text-xl mb-4 md:mb-6 max-w-2xl animate-fade-in-up leading-relaxed" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.5)' }}>{banner.subtitle}</p>
                                    <CtaButton />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
            {/* Prev Button - Hide on mobile for better swipe experience */}
            <button
                onClick={scrollPrev}
                className={`absolute top-1/2 left-2 md:left-4 transform -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full p-2 md:p-3 shadow-lg transition-all duration-300 opacity-70 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-white/50 z-10 ${isMobile ? 'hidden' : ''}`}
                aria-label="Previous slide"
            >
                <ChevronLeftIcon className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </button>
            {/* Next Button - Hide on mobile for better swipe experience */}
            <button
                onClick={scrollNext}
                className={`absolute top-1/2 right-2 md:right-4 transform -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full p-2 md:p-3 shadow-lg transition-all duration-300 opacity-70 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-white/50 z-10 ${isMobile ? 'hidden' : ''}`}
                aria-label="Next slide"
            >
                <ChevronRightIcon className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </button>
            
            {/* Slide Indicators */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center space-x-2 md:space-x-3 z-10">
                {/* Pause/Play Button - Only show on desktop */}
                {!isMobile && (
                    <button
                        onClick={toggleAutoplay}
                        className="bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full p-1.5 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/50"
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
                {banners.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => scrollTo(index)}
                        className={`${isMobile ? 'w-3 h-3' : 'w-2 h-2 md:w-3 md:h-3'} rounded-full transition-all duration-300 ${
                            index === selectedIndex 
                                ? 'bg-white scale-125' 
                                : 'bg-white/50 hover:bg-white/75'
                        }`}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
                
                {/* Mobile swipe hint */}
                {isMobile && (
                    <div className="ml-3 text-white/70 text-xs">
                        {selectedIndex + 1}/{banners.length}
                    </div>
                )}
            </div>
        </div>
    );
}
