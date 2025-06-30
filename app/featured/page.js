'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchSponsoredListings } from '@/app/actions';
import ListingCard from '@/components/ListingCard';

export default function FeaturedItemsPage() {
    const [featuredItems, setFeaturedItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadFeaturedItems() {
            try {
                const items = await fetchSponsoredListings();
                setFeaturedItems(items);
            } catch (error) {
                // console.error('Error loading featured items:', error);
            } finally {
                setLoading(false);
            }
        }
        loadFeaturedItems();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading featured items...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white">
                <div className="max-w-7xl mx-auto px-4 py-16">
                    <div className="text-center">
                        <div className="flex justify-center items-center gap-3 mb-6">
                            <span className="text-5xl">⭐</span>
                            <span className="text-5xl">🎯</span>
                            <span className="text-5xl">🚀</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black mb-4">
                            Featured Items
                        </h1>
                        <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
                            Discover premium listings from top sellers! These items get maximum visibility and priority placement.
                        </p>
                        
                        {/* CTA Button */}
                        <Link 
                            href="/featured/promote" 
                            className="inline-flex items-center gap-2 bg-yellow-400 text-purple-800 px-8 py-4 rounded-2xl font-black text-lg hover:bg-yellow-300 transform hover:scale-105 transition-all duration-300 shadow-xl"
                        >
                            <span>🎉</span>
                            Get Your Item Featured
                            <span>→</span>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Featured Items Grid */}
            <div className="max-w-7xl mx-auto px-4 py-12">
                {featuredItems.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="text-6xl mb-6">🔍</div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-4">No Featured Items Yet</h3>
                        <p className="text-gray-600 mb-8 max-w-md mx-auto">
                            Be the first to get your item featured! Stand out from the crowd and get more visibility.
                        </p>
                        <Link 
                            href="/featured/promote" 
                            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                        >
                            Feature Your Item
                        </Link>
                    </div>
                ) : (
                    <>
                        {/* Stats Banner */}
                        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                                <div>
                                    <div className="text-3xl font-black text-blue-600 mb-2">{featuredItems.length}</div>
                                    <div className="text-gray-600">Featured Items</div>
                                </div>
                                <div>
                                    <div className="text-3xl font-black text-green-600 mb-2">10x</div>
                                    <div className="text-gray-600">More Visibility</div>
                                </div>
                                <div>
                                    <div className="text-3xl font-black text-purple-600 mb-2">3x</div>
                                    <div className="text-gray-600">Faster Sales</div>
                                </div>
                            </div>
                        </div>

                        {/* Items Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {featuredItems.map((item, index) => (
                                <div key={`${item.type}-${item.id}`} className="relative">
                                    {/* Featured Badge */}
                                    <div className="absolute -top-2 -right-2 z-10 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-black shadow-lg">
                                        ⭐ FEATURED #{index + 1}
                                    </div>
                                    
                                    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 border-2 border-yellow-200">
                                        <ListingCard item={item} />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Bottom CTA */}
                        <div className="text-center mt-16 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-12">
                            <h3 className="text-3xl font-bold text-gray-800 mb-4">
                                Want Your Item Here?
                            </h3>
                            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                                Join the featured section and watch your sales soar! Featured items get premium placement, 
                                highlighted badges, and appear first in search results.
                            </p>
                            <Link 
                                href="/featured/promote" 
                                className="inline-flex items-center gap-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-10 py-4 rounded-2xl font-bold text-lg hover:from-purple-700 hover:to-blue-700 transform hover:scale-105 transition-all duration-300 shadow-xl"
                            >
                                <span>🚀</span>
                                Promote My Item
                                <span>→</span>
                            </Link>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}