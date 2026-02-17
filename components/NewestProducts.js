import React from 'react';
import ListingCard from './ListingCard';

export default function NewestProducts({ products, notes, rooms }) {
    // Combine all items and sort by created_at
    const allItems = [
        ...(products || []),
        ...(notes || []),
        ...(rooms || [])
    ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    // Take only the 8 most recent items
    const newestItems = allItems.slice(0, 8);

    if (newestItems.length === 0) {
        return null;
    }

    return (
        <section className="py-8 sm:py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 space-y-4 sm:space-y-0">
                    <div>
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
                            Just Added
                        </h2>
                        <p className="text-sm sm:text-base text-gray-600">
                            Fresh listings from fellow students
                        </p>
                    </div>
                    <a 
                        href="/search" 
                        className="text-blue-600 hover:text-blue-700 font-medium flex items-center text-sm sm:text-base self-start"
                    >
                        View All
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </a>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                    {newestItems.map((item) => (
                        <ListingCard
                            key={`${item.type}-${item.id}`}
                            item={item}
                            type={item.type}
                        />
                    ))}
                </div>

                {/* Category breakdown */}
                <div className="mt-8 sm:mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                    <div className="text-center p-4 sm:p-6 bg-blue-50 rounded-lg">
                        <div className="text-xl sm:text-2xl font-bold text-blue-600 mb-1">
                            {products?.length || 0}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-600">New Textbooks</div>
                    </div>
                    <div className="text-center p-4 sm:p-6 bg-green-50 rounded-lg">
                        <div className="text-xl sm:text-2xl font-bold text-green-600 mb-1">
                            {notes?.length || 0}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-600">New Notes</div>
                    </div>
                    <div className="text-center p-4 sm:p-6 bg-purple-50 rounded-lg">
                        <div className="text-xl sm:text-2xl font-bold text-purple-600 mb-1">
                            {rooms?.length || 0}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-600">New Room Listings</div>
                    </div>
                </div>
            </div>
        </section>
    );
}