'use client';

import React, { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import Link from 'next/link';

// Dummy data for banners
const banners = [
    {
        id: 1,
        image: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=2070&auto=format&fit=crop',
        title: 'Sell Your Textbooks Before They Form a New Landmass!',
        subtitle: 'Your old books could be someone else\'s treasure (or at least help them pass). List them on StudXchange!',
        link: '/sell',
        cta: 'Sell Now & Reclaim Your Desk!'
    },
    {
        id: 2,
        image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=2158&auto=format&fit=crop',
        title: 'Your Dorm Room Doesn\'t Have to Look Like a Dungeon.',
        subtitle: 'Find cool, cheap furniture from students who are upgrading. Your back will thank you.',
        link: '/category/furniture',
        cta: 'Furnish Your Fortress!'
    },
    {
        id: 3,
        image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=2070&auto=format&fit=crop',
        title: 'Forgot to Take Notes? We Got You.',
        subtitle: 'Buy notes from students who actually paid attention in class. It\'s like a time machine for your grades.',
        link: '/category/notes',
        cta: 'Find Your Class Notes!'
    },
    {
        id: 4,
        image: 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?q=80&w=1964&auto=format&fit=crop',
        title: 'That Old Laptop Isn\'t a Paperweight Yet!',
        subtitle: 'Give your old gadgets a new life. Sell them to a student who needs them more than your closet does.',
        link: '/category/Laptops',
        cta: 'List Your Tech!'
    },
    {
        id: 5,
        image: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?q=80&w=2070&auto=format&fit=crop',
        title: 'Tired of Walking? We Feel You.',
        subtitle: 'Find a pre-loved bike on campus and get to your 8 AM class in record time. Pajamas optional.',
        link: '/category/Bikes',
        cta: 'Find Your Ride!'
    },
    {
        id: 6,
        image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2070&auto=format&fit=crop',
        title: 'Join the Smartest Marketplace on Campus.',
        subtitle: 'Buy, sell, and save. It\'s the circular economy, but for broke students. Welcome to StudXchange.',
        link: '/about',
        cta: 'Learn More!'
    },
    {
        id: 7,
        gradient: 'from-red-500 to-rose-600',
        title: 'Bored of being in line at the canteen?',
        subtitle: 'Try Cantiffin!',
        link: 'https://cantiffin.vercel.app',
        cta: 'Order Now'
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
    const [emblaRef, emblaApi] = useEmblaCarousel(
        { loop: true, align: 'start' },
        [Autoplay({ delay: 4000, stopOnInteraction: false })]
    );

    const [selectedIndex, setSelectedIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);

    const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
    const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);
    const scrollTo = useCallback((index) => emblaApi && emblaApi.scrollTo(index), [emblaApi]);

    const toggleAutoplay = useCallback(() => {
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
    }, [emblaApi]);

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
            <div className="overflow-hidden rounded-xl shadow-2xl" ref={emblaRef}>
                <div className="flex">
                    {banners.map((banner) => {
                        const CtaButton = () => {
                            const isExternal = banner.link.startsWith('http');
                            const buttonClass = "bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-bold py-3 px-8 rounded-full transition-all duration-300 transform hover:scale-105 border border-white/30";

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
                                <div className="relative flex flex-col items-center justify-center text-center text-white p-8 md:p-16 min-h-[300px] md:min-h-[400px]">
                                    <h2 className="text-3xl md:text-5xl font-extrabold mb-4 animate-fade-in-down" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>{banner.title}</h2>
                                    <p className="text-md md:text-xl mb-6 max-w-2xl animate-fade-in-up" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.5)' }}>{banner.subtitle}</p>
                                    <CtaButton />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
            {/* Prev Button */}
            <button
                onClick={scrollPrev}
                className="absolute top-1/2 left-2 md:left-4 transform -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full p-2 md:p-3 shadow-lg transition-all duration-300 opacity-70 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-white/50 z-10"
                aria-label="Previous slide"
            >
                <ChevronLeftIcon className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </button>
            {/* Next Button */}
            <button
                onClick={scrollNext}
                className="absolute top-1/2 right-2 md:right-4 transform -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full p-2 md:p-3 shadow-lg transition-all duration-300 opacity-70 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-white/50 z-10"
                aria-label="Next slide"
            >
                <ChevronRightIcon className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </button>
            
            {/* Slide Indicators */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center space-x-3 z-10">
                {/* Pause/Play Button */}
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
                
                {/* Dot Indicators */}
                {banners.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => scrollTo(index)}
                        className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-all duration-300 ${
                            index === selectedIndex 
                                ? 'bg-white scale-125' 
                                : 'bg-white/50 hover:bg-white/75'
                        }`}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    );
}
