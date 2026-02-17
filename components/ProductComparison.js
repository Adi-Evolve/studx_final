'use client';

import { useState, useEffect } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faPlus, 
    faTimes, 
    faExchangeAlt, 
    faHeart,
    faShare,
    faShoppingCart,
    faStar,
    faMapMarkerAlt,
    faUser,
    faCalendar
} from '@fortawesome/free-solid-svg-icons';
import Image from 'next/image';
import Link from 'next/link';

export default function ProductComparison({ initialProducts = [], onClose }) {
    const [compareProducts, setCompareProducts] = useState(initialProducts);
    const [loading, setLoading] = useState(false);
    const [comparisonData, setComparisonData] = useState(null);
    const supabase = createSupabaseBrowserClient();

    useEffect(() => {
        if (compareProducts.length >= 2) {
            generateComparison();
        }
    }, [compareProducts]);

    const generateComparison = async () => {
        setLoading(true);
        try {
            // Create comparison data structure
            const comparison = {
                products: compareProducts,
                features: extractFeatures(compareProducts),
                recommendations: generateRecommendations(compareProducts)
            };

            setComparisonData(comparison);

            // Save comparison to database for logged-in users
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                await supabase
                    .from('product_comparisons')
                    .insert({
                        user_id: user.id,
                        product_ids: compareProducts.map(p => p.id),
                        comparison_data: comparison
                    });
            }
        } catch (error) {
            // console.error('Error generating comparison:', error);
        } finally {
            setLoading(false);
        }
    };

    const extractFeatures = (products) => {
        const features = {
            price: products.map(p => ({ value: p.price, formatted: `₹${p.price?.toLocaleString()}` })),
            condition: products.map(p => ({ value: p.condition })),
            location: products.map(p => ({ value: p.location || 'Not specified' })),
            category: products.map(p => ({ value: p.category })),
            seller: products.map(p => ({ value: p.seller_name || 'Unknown' })),
            posted: products.map(p => ({ 
                value: p.created_at, 
                formatted: new Date(p.created_at).toLocaleDateString() 
            })),
            views: products.map(p => ({ value: p.view_count || 0 })),
            rating: products.map(p => ({ 
                value: p.seller_rating || 0,
                formatted: p.seller_rating ? `${p.seller_rating}/5` : 'No rating'
            }))
        };

        // Add category-specific features
        if (products[0]?.category === 'Electronics') {
            features.warranty = products.map(p => ({ 
                value: p.warranty || 'Not mentioned',
                formatted: p.warranty || 'Not mentioned'
            }));
        }

        if (products[0]?.type === 'rooms') {
            features.occupancy = products.map(p => ({ 
                value: p.occupancy || 'Not specified',
                formatted: p.occupancy || 'Not specified'
            }));
            features.amenities = products.map(p => ({
                value: p.amenities?.length || 0,
                formatted: `${p.amenities?.length || 0} amenities`
            }));
        }

        return features;
    };

    const generateRecommendations = (products) => {
        const recommendations = [];

        // Price analysis
        const prices = products.map(p => p.price).filter(p => p);
        if (prices.length > 1) {
            const cheapest = Math.min(...prices);
            const cheapestIndex = prices.indexOf(cheapest);
            recommendations.push({
                type: 'price',
                message: `${products[cheapestIndex]?.name} offers the best price at ₹${cheapest.toLocaleString()}`,
                productIndex: cheapestIndex,
                icon: 'dollar'
            });
        }

        // Condition analysis
        const conditionScore = { 'New': 5, 'Excellent': 4, 'Good': 3, 'Fair': 2, 'Poor': 1 };
        const bestCondition = products.reduce((best, product, index) => {
            const score = conditionScore[product.condition] || 0;
            return score > best.score ? { score, index, condition: product.condition } : best;
        }, { score: 0, index: 0 });

        if (bestCondition.score > 0) {
            recommendations.push({
                type: 'condition',
                message: `${products[bestCondition.index]?.name} has the best condition (${bestCondition.condition})`,
                productIndex: bestCondition.index,
                icon: 'star'
            });
        }

        // Value for money
        const valueScores = products.map((product, index) => {
            const priceScore = prices.length > 1 ? (Math.max(...prices) - product.price) / Math.max(...prices) : 0;
            const conditionScore = (conditionScore[product.condition] || 0) / 5;
            return { score: (priceScore + conditionScore) / 2, index };
        });

        const bestValue = valueScores.reduce((best, current) => 
            current.score > best.score ? current : best
        );

        recommendations.push({
            type: 'value',
            message: `${products[bestValue.index]?.name} offers the best value for money`,
            productIndex: bestValue.index,
            icon: 'award'
        });

        return recommendations;
    };

    const removeProduct = (index) => {
        setCompareProducts(prev => prev.filter((_, i) => i !== index));
    };

    const addToWishlist = async (productId) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        await supabase
            .from('wishlist')
            .insert({ user_id: user.id, product_id: productId });
    };

    const shareComparison = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Product Comparison - StudXchange',
                    text: `Comparing ${compareProducts.map(p => p.name).join(' vs ')}`,
                    url: window.location.href
                });
            } catch (error) {
                // console.log('Error sharing:', error);
            }
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert('Comparison link copied to clipboard!');
        }
    };

    if (compareProducts.length === 0) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-xl max-w-md w-full p-6">
                    <div className="text-center">
                        <FontAwesomeIcon icon={faExchangeAlt} className="w-16 h-16 text-gray-400 mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Products to Compare</h3>
                        <p className="text-gray-600 mb-4">
                            Select at least 2 products to start comparing their features and prices.
                        </p>
                        <button onClick={onClose} className="btn-primary">
                            Close
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-7xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <FontAwesomeIcon icon={faExchangeAlt} className="w-6 h-6 text-primary-600" />
                        <h2 className="text-xl font-semibold text-gray-900">
                            Product Comparison ({compareProducts.length})
                        </h2>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={shareComparison}
                            className="btn-secondary btn-sm"
                        >
                            <FontAwesomeIcon icon={faShare} className="w-4 h-4 mr-2" />
                            Share
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                        >
                            <FontAwesomeIcon icon={faTimes} className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto p-6">
                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                                <p className="text-gray-600">Analyzing products...</p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Recommendations */}
                            {comparisonData?.recommendations && (
                                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                                    <h3 className="font-semibold text-blue-900 mb-3">Recommendations</h3>
                                    <div className="space-y-2">
                                        {comparisonData.recommendations.map((rec, index) => (
                                            <div key={index} className="flex items-start gap-2 text-sm text-blue-800">
                                                <span className="text-blue-600">•</span>
                                                <span>{rec.message}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Products Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {compareProducts.map((product, index) => (
                                    <div key={product.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                                        {/* Product Header */}
                                        <div className="relative">
                                            <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                                                {product.images?.[0] ? (
                                                    <Image
                                                        src={product.images[0]}
                                                        alt={product.name}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex items-center justify-center h-48 bg-gray-200">
                                                        <span className="text-gray-400">No image</span>
                                                    </div>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => removeProduct(index)}
                                                className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-md hover:bg-gray-50"
                                            >
                                                <FontAwesomeIcon icon={faTimes} className="w-4 h-4 text-gray-600" />
                                            </button>
                                        </div>

                                        {/* Product Info */}
                                        <div className="p-4">
                                            <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                                                {product.name}
                                            </h3>
                                            
                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Price:</span>
                                                    <span className="font-semibold text-green-600">
                                                        ₹{product.price?.toLocaleString()}
                                                    </span>
                                                </div>
                                                
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Condition:</span>
                                                    <span className="font-medium">{product.condition}</span>
                                                </div>
                                                
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Category:</span>
                                                    <span>{product.category}</span>
                                                </div>
                                                
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Location:</span>
                                                    <span className="text-right">{product.location || 'Not specified'}</span>
                                                </div>
                                                
                                                {product.seller_rating && (
                                                    <div className="flex justify-between">
                                                        <span className="text-gray-600">Seller Rating:</span>
                                                        <div className="flex items-center gap-1">
                                                            <FontAwesomeIcon icon={faStar} className="w-3 h-3 text-yellow-500" />
                                                            <span>{product.seller_rating}/5</span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Actions */}
                                            <div className="flex gap-2 mt-4">
                                                <Link
                                                    href={`/products/${product.id}`}
                                                    className="btn-primary btn-sm flex-1"
                                                >
                                                    View Details
                                                </Link>
                                                <button
                                                    onClick={() => addToWishlist(product.id)}
                                                    className="btn-secondary btn-sm p-2"
                                                >
                                                    <FontAwesomeIcon icon={faHeart} className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {/* Add Product Button */}
                                {compareProducts.length < 4 && (
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center min-h-[400px]">
                                        <FontAwesomeIcon icon={faPlus} className="w-12 h-12 text-gray-400 mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">Add Product</h3>
                                        <p className="text-gray-600 text-center mb-4">
                                            Compare up to 4 products to find the best deal
                                        </p>
                                        <button className="btn-secondary">
                                            Browse Products
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Detailed Comparison Table */}
                            {compareProducts.length >= 2 && comparisonData && (
                                <div className="bg-gray-50 rounded-lg p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Comparison</h3>
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b border-gray-200">
                                                    <th className="text-left py-3 px-4 font-medium text-gray-900">Feature</th>
                                                    {compareProducts.map((product, index) => (
                                                        <th key={index} className="text-left py-3 px-4 font-medium text-gray-900">
                                                            {product.name}
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {Object.entries(comparisonData.features).map(([feature, values]) => (
                                                    <tr key={feature} className="border-b border-gray-100">
                                                        <td className="py-3 px-4 font-medium text-gray-700 capitalize">
                                                            {feature.replace('_', ' ')}
                                                        </td>
                                                        {values.map((value, index) => (
                                                            <td key={index} className="py-3 px-4 text-gray-600">
                                                                {value.formatted || value.value}
                                                            </td>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* Quick Actions */}
                            <div className="flex flex-wrap gap-3 justify-center">
                                <button className="btn-secondary">
                                    <FontAwesomeIcon icon={faHeart} className="w-4 h-4 mr-2" />
                                    Save Comparison
                                </button>
                                <button className="btn-secondary">
                                    <FontAwesomeIcon icon={faShare} className="w-4 h-4 mr-2" />
                                    Share with Friends
                                </button>
                                <button className="btn-primary">
                                    <FontAwesomeIcon icon={faShoppingCart} className="w-4 h-4 mr-2" />
                                    Contact All Sellers
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}