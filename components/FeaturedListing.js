// Featured Listings Implementation
'use client';
import { useState } from 'react';

// Featured Listing Boost Component
export default function FeaturedListingBoost({ listingId, currentUser, onBoostSuccess }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState('48h');
    const [isProcessing, setIsProcessing] = useState(false);

    const boostPlans = [
        {
            id: '24h',
            duration: '24 hours',
            price: 2.00,
            popular: false,
            description: 'Quick boost for urgent sales'
        },
        {
            id: '48h',
            duration: '48 hours',
            price: 3.00,
            popular: true,
            description: 'Most popular choice'
        },
        {
            id: '7d',
            duration: '7 days',
            price: 5.00,
            popular: false,
            description: 'Best value for longer exposure'
        }
    ];

    const handleBoostListing = async () => {
        setIsProcessing(true);
        
        try {
            const selectedPlanData = boostPlans.find(plan => plan.id === selectedPlan);
            
            // Create payment intent
            const response = await fetch('/api/boost-listing', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    listingId,
                    plan: selectedPlan,
                    price: selectedPlanData.price
                })
            });

            const result = await response.json();

            if (result.success) {
                setIsModalOpen(false);
                onBoostSuccess?.(result.boostData);
                
                // Show success message
                alert(`🎉 Your listing is now featured for ${selectedPlanData.duration}!`);
            } else {
                alert('❌ Boost failed: ' + result.error);
            }
        } catch (error) {
            // console.error('Boost error:', error);
            alert('❌ Something went wrong. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <>
            {/* Boost Button */}
            <button
                onClick={() => setIsModalOpen(true)}
                className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2"
            >
                <span>⭐</span>
                <span>Boost Listing</span>
            </button>

            {/* Boost Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-md w-full p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-gray-900">
                                🚀 Boost Your Listing
                            </h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="mb-6">
                            <p className="text-gray-600 text-sm mb-4">
                                Featured listings get 3-5x more views and sell 2x faster!
                            </p>

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                                <h4 className="font-semibold text-blue-800 mb-2">What you get:</h4>
                                <ul className="text-sm text-blue-700 space-y-1">
                                    <li>📌 Top position in search results</li>
                                    <li>⭐ Special "Featured" badge</li>
                                    <li>🌟 Highlighted border</li>
                                    <li>📈 Increased visibility</li>
                                </ul>
                            </div>
                        </div>

                        {/* Plan Selection */}
                        <div className="space-y-3 mb-6">
                            {boostPlans.map((plan) => (
                                <label
                                    key={plan.id}
                                    className={`block cursor-pointer rounded-lg border-2 p-4 transition-all ${
                                        selectedPlan === plan.id
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <input
                                                type="radio"
                                                name="boostPlan"
                                                value={plan.id}
                                                checked={selectedPlan === plan.id}
                                                onChange={(e) => setSelectedPlan(e.target.value)}
                                                className="mr-3"
                                            />
                                            <div>
                                                <div className="flex items-center space-x-2">
                                                    <span className="font-semibold">
                                                        {plan.duration}
                                                    </span>
                                                    {plan.popular && (
                                                        <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                                                            Most Popular
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-600">
                                                    {plan.description}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-lg font-bold">
                                                ${plan.price.toFixed(2)}
                                            </div>
                                        </div>
                                    </div>
                                </label>
                            ))}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex space-x-3">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 rounded-lg font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleBoostListing}
                                disabled={isProcessing}
                                className="flex-1 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white py-3 rounded-lg font-medium transition-all disabled:opacity-50"
                            >
                                {isProcessing ? (
                                    <div className="flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                        Processing...
                                    </div>
                                ) : (
                                    `Boost for $${boostPlans.find(p => p.id === selectedPlan)?.price.toFixed(2)}`
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

// Featured Listing Display Component
export function FeaturedListingCard({ item, userLocation, children }) {
    const isFeatured = item.featured && new Date(item.featuredUntil) > new Date();
    
    return (
        <div className={`
            relative bg-white rounded-lg shadow-sm border transition-all duration-200 hover:shadow-md
            ${isFeatured 
                ? 'border-2 border-orange-300 bg-gradient-to-br from-orange-50 to-pink-50 shadow-lg' 
                : 'border-gray-200'
            }
        `}>
            {/* Featured Badge */}
            {isFeatured && (
                <div className="absolute -top-2 -right-2 z-10">
                    <div className="bg-gradient-to-r from-orange-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                        ⭐ FEATURED
                    </div>
                </div>
            )}

            {/* Boost Glow Effect */}
            {isFeatured && (
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-orange-200 to-pink-200 opacity-30 animate-pulse"></div>
            )}

            <div className="relative z-10">
                {children}
            </div>

            {/* Featured Footer */}
            {isFeatured && (
                <div className="bg-gradient-to-r from-orange-100 to-pink-100 px-4 py-2 rounded-b-lg">
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-orange-700 font-medium">
                            🚀 Boosted for more visibility
                        </span>
                        <span className="text-orange-600">
                            Expires: {new Date(item.featuredUntil).toLocaleDateString()}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}
