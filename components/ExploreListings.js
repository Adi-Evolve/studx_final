import React from 'react';
import Link from 'next/link';

export default function ExploreListings() {
    const categories = [
        {
            name: 'Textbooks',
            description: 'Course materials and academic books',
            icon: '📚',
            href: '/products/regular',
            color: 'bg-blue-500',
            stats: 'Most Popular'
        },
        {
            name: 'Study Notes',
            description: 'Class notes and study materials',
            icon: '📝',
            href: '/products/notes',
            color: 'bg-green-500',
            stats: 'High Quality'
        },
        {
            name: 'Room Rentals',
            description: 'Housing and accommodation',
            icon: '🏠',
            href: '/products/rooms',
            color: 'bg-purple-500',
            stats: 'Verified Listings'
        }
    ];

    const quickActions = [
        {
            title: 'Sell Your Items',
            description: 'List your textbooks, notes, or room',
            icon: '💰',
            href: '/sell',
            color: 'border-green-200 hover:border-green-300 bg-green-50'
        },
        {
            title: 'Advanced Search',
            description: 'Find exactly what you need',
            icon: '🔍',
            href: '/search',
            color: 'border-blue-200 hover:border-blue-300 bg-blue-50'
        },
        {
            title: 'Your Wishlist',
            description: 'Save items for later',
            icon: '❤️',
            href: '/wishlist',
            color: 'border-red-200 hover:border-red-300 bg-red-50'
        }
    ];

    return (
        <section className="py-16 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">
                        Explore Everything StudX
                    </h2>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        From textbooks to study notes and housing - find everything you need for student life
                    </p>
                </div>

                {/* Main Categories */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                    {categories.map((category) => (
                        <Link key={category.name} href={category.href} className="group">
                            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                                <div className={`inline-flex items-center justify-center w-16 h-16 ${category.color} rounded-xl text-white text-2xl mb-6`}>
                                    {category.icon}
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                                    {category.name}
                                </h3>
                                <p className="text-gray-600 mb-4">
                                    {category.description}
                                </p>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-blue-600 font-medium">
                                        {category.stats}
                                    </span>
                                    <svg className="w-6 h-6 text-gray-400 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-2xl p-8 shadow-lg">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                        Quick Actions
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {quickActions.map((action) => (
                            <Link key={action.title} href={action.href} className="group">
                                <div className={`border-2 rounded-xl p-6 transition-all duration-300 hover:shadow-md ${action.color}`}>
                                    <div className="text-3xl mb-3">
                                        {action.icon}
                                    </div>
                                    <h4 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                                        {action.title}
                                    </h4>
                                    <p className="text-gray-600 text-sm">
                                        {action.description}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Browse by College */}
                <div className="mt-12 text-center">
                    <h3 className="text-xl font-semibold text-gray-900 mb-6">
                        Browse by College
                    </h3>
                    <div className="flex flex-wrap justify-center gap-3">
                        {['MIT', 'Harvard', 'Stanford', 'UC Berkeley', 'CMU', 'Caltech'].map((college) => (
                            <Link 
                                key={college} 
                                href={`/search?college=${college}`}
                                className="px-4 py-2 bg-white border border-gray-200 rounded-full hover:border-blue-300 hover:bg-blue-50 transition-colors text-sm font-medium text-gray-700 hover:text-blue-600"
                            >
                                {college}
                            </Link>
                        ))}
                        <Link 
                            href="/search"
                            className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors text-sm font-medium"
                        >
                            View All →
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}