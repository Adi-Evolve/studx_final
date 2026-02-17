'use client';
import { useState, useRef } from 'react';
import ListingCard from './ListingCard';

export default function ProductSlider({ items, title }) {
    const [currentSlide, setCurrentSlide] = useState(0);
    const sliderRef = useRef(null);
    
    const itemsPerSlide = 4;
    const totalSlides = Math.ceil(items.length / itemsPerSlide);
    
    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % totalSlides);
    };
    
    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
    };
    
    const goToSlide = (slideIndex) => {
        setCurrentSlide(slideIndex);
    };

    if (!items || items.length === 0) {
        return (
            <div className="text-center py-8">
                <p className="text-gray-500">No items found</p>
            </div>
        );
    }

    return (
        <div className="relative">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
                {totalSlides > 1 && (
                    <div className="flex space-x-2">
                        <button
                            onClick={prevSlide}
                            className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
                            aria-label="Previous slide"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <button
                            onClick={nextSlide}
                            className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
                            aria-label="Next slide"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                )}
            </div>
            
            <div className="overflow-hidden" ref={sliderRef}>
                <div 
                    className="flex transition-transform duration-300 ease-in-out"
                    style={{ 
                        transform: `translateX(-${currentSlide * 100}%)`,
                        width: `${totalSlides * 100}%`
                    }}
                >
                    {Array.from({ length: totalSlides }).map((_, slideIndex) => (
                        <div key={slideIndex} className="w-full flex space-x-4">
                            {items
                                .slice(slideIndex * itemsPerSlide, (slideIndex + 1) * itemsPerSlide)
                                .map((item) => (
                                    <div key={`${item.type}-${item.id}`} className="flex-1 min-w-0">
                                        <ListingCard 
                                            item={item} 
                                            type={item.type}
                                        />
                                    </div>
                                ))}
                            {/* Fill empty slots if last slide has fewer items */}
                            {items.slice(slideIndex * itemsPerSlide, (slideIndex + 1) * itemsPerSlide).length < itemsPerSlide && 
                                Array.from({ length: itemsPerSlide - items.slice(slideIndex * itemsPerSlide, (slideIndex + 1) * itemsPerSlide).length }).map((_, emptyIndex) => (
                                    <div key={`empty-${emptyIndex}`} className="flex-1 min-w-0"></div>
                                ))
                            }
                        </div>
                    ))}
                </div>
            </div>
            
            {totalSlides > 1 && (
                <div className="flex justify-center mt-6 space-x-2">
                    {Array.from({ length: totalSlides }).map((_, index) => (
                        <button
                            key={index}
                            onClick={() => goToSlide(index)}
                            className={`w-3 h-3 rounded-full transition-colors ${
                                currentSlide === index ? 'bg-blue-600' : 'bg-gray-300'
                            }`}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}