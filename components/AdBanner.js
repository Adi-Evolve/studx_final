// Advanced Banner Ad System Implementation
// components/AdBanner.js

'use client';

import { useState, useEffect } from 'react';

const AdBanner = ({ 
    position = 'homepage-top', 
    category = null, 
    userLocation = null,
    className = ''
}) => {
    const [ad, setAd] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAd = async () => {
            try {
                const targeting = {
                    position,
                    category,
                    userLocation,
                    timestamp: Date.now(),
                    deviceType: window.innerWidth < 768 ? 'mobile' : 'desktop'
                };

                const response = await fetch('/api/ads/fetch', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(targeting)
                });

                if (response.ok) {
                    const adData = await response.json();
                    if (adData.success && adData.ad) {
                        setAd(adData.ad);
                        
                        // Track ad impression
                        await fetch('/api/ads/impression', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ adId: adData.ad.id, position })
                        });
                    }
                }
            } catch (error) {
                console.error('Error fetching ad:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAd();
    }, [position, category, userLocation]);

    const handleAdClick = async () => {
        if (!ad) return;

        // Track click
        await fetch('/api/ads/click', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                adId: ad.id, 
                position,
                timestamp: Date.now()
            })
        });

        // Open ad link
        if (ad.link) {
            window.open(ad.link, ad.openInNewTab ? '_blank' : '_self');
        }
    };

    if (loading) {
        return (
            <div className={`ad-banner-skeleton ${className}`}>
                <div className="animate-pulse bg-gray-200 rounded-lg h-24"></div>
            </div>
        );
    }

    if (!ad) return null;

    return (
        <div className={`ad-banner ${className}`}>
            <div 
                className="ad-content cursor-pointer relative overflow-hidden rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                onClick={handleAdClick}
            >
                {/* Ad Image/Content */}
                {ad.type === 'image' && (
                    <img 
                        src={ad.imageUrl} 
                        alt={ad.title}
                        className="w-full h-full object-cover"
                    />
                )}
                
                {ad.type === 'text' && (
                    <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                        <h3 className="text-lg font-bold">{ad.title}</h3>
                        <p className="text-sm opacity-90">{ad.description}</p>
                        {ad.cta && (
                            <button className="mt-2 bg-white text-blue-600 px-4 py-1 rounded-full text-sm font-medium">
                                {ad.cta}
                            </button>
                        )}
                    </div>
                )}

                {ad.type === 'carousel' && (
                    <div className="carousel-ad">
                        {ad.items.map((item, index) => (
                            <div key={index} className="carousel-item">
                                <img src={item.image} alt={item.title} />
                                <div className="carousel-overlay">
                                    <h4>{item.title}</h4>
                                    <p>{item.price}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Sponsored Label */}
                <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                    Sponsored
                </div>

                {/* Close Button (Optional) */}
                {ad.closeable && (
                    <button 
                        className="absolute top-2 right-2 bg-black bg-opacity-70 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs hover:bg-opacity-90"
                        onClick={(e) => {
                            e.stopPropagation();
                            setAd(null);
                        }}
                    >
                        ×
                    </button>
                )}
            </div>

            {/* Ad Analytics (Admin Only) */}
            {process.env.NODE_ENV === 'development' && (
                <div className="ad-debug mt-1 text-xs text-gray-500">
                    Ad ID: {ad.id} | Position: {position} | CTR: {ad.ctr}%
                </div>
            )}
        </div>
    );
};

// Usage Examples:
// <AdBanner position="homepage-hero" />
// <AdBanner position="search-results-top" category="electronics" />
// <AdBanner position="category-sidebar" category="books" />
// <AdBanner position="mobile-app-banner" />

export default AdBanner;
