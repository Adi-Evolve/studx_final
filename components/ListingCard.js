import Link from 'next/link';
import Image from 'next/image';
import PriceDisplay from './PriceDisplay';
import { formatDistance } from '@/lib/locationUtils';

const getListingUrl = (item) => {
    const type = item.type;
    if (type === 'room') {
        return `/products/rooms/${item.id}`;
    }
    if (type === 'note') {
        return `/products/notes/${item.id}`;
    }
    return `/products/regular/${item.id}`;
};

export default function ListingCard({ item, onClick, isSelectMode = false, isSponsored = false, asLink = true, showDistance = false, onEdit, onRemove, onMarkAsSold }) {
    if (!item) {
        return null;
    }

    // Get image URL with proper fallback handling for new schema
    const imageUrl = (Array.isArray(item.images) && item.images.length > 0 && item.images[0])
        || (Array.isArray(item.image_urls) && item.image_urls.length > 0 && item.image_urls[0]) // Backward compatibility
        || `https://i.pravatar.cc/300?u=${item.id}`;

    const url = getListingUrl(item);
    
    // Handle different title fields based on item type
    const title = item.title || item.name || item.hostel_name || 'Untitled';
    
    // Handle different price fields
    const price = item.price || item.fees || 0;

    const cardContent = (
        <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900 overflow-hidden hover:shadow-xl dark:hover:shadow-gray-700 transition-all duration-300 transform hover:scale-105 h-full flex flex-col group relative border-2 dark:border-gray-700 card-item ${
            (isSponsored || item.is_sponsored || item.isFeatured) 
                ? 'border-gradient-to-r from-orange-300 to-yellow-300 dark:from-orange-400 dark:to-yellow-400 hover:border-orange-400 dark:hover:border-orange-500 shadow-lg ring-2 ring-orange-200 dark:ring-orange-500/30' 
                : 'border-transparent hover:border-emerald-200 dark:hover:border-emerald-600'
        }`}
        >
            {/* Enhanced Sponsored Badge with Better Visibility */}
            {(isSponsored || item.is_sponsored || item.isFeatured) && (
                <div className="absolute top-2 right-2 z-20">
                    <div className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg border-2 border-white dark:border-gray-800">
                        <span className="flex items-center gap-1">
                            <span className="animate-pulse">⭐</span>
                            <span>SPONSORED</span>
                        </span>
                    </div>
                </div>
            )}
            
            {/* Priority Rank for Sponsored Items */}
            {item.sponsored_rank && (
                <div className="absolute top-2 left-2 z-20">
                    <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-lg border-2 border-white dark:border-gray-800">
                        #{item.sponsored_rank}
                    </div>
                </div>
            )}
            {item.is_sold && (
                <div className="absolute top-3 left-3 z-20">
                    <div className="bg-red-500 dark:bg-red-600 text-white px-2 py-1 rounded-full text-xs font-semibold">
                        SOLD OUT
                    </div>
                </div>
            )}

            {/* Image Container */}
            <div className="relative h-48 overflow-hidden bg-gradient-to-br from-slate-100 to-emerald-50">
                <Image 
                    draggable="false" 
                    src={imageUrl}
                    alt={title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    style={{ objectFit: 'cover' }}
                    className="transition-transform duration-300 group-hover:scale-110"
                />
                
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>

            {/* Content */}
            <div className="p-4 flex-grow flex flex-col">
                {/* Type Badge */}
                <div className="mb-2">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        item.type === 'room' ? 'bg-emerald-50 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700' : 
                        item.type === 'note' ? 'bg-teal-50 dark:bg-teal-900 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-700' : 
                        'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600'
                    }`}>
                        {item.type === 'room' ? '🏠 Room' : 
                         item.type === 'note' ? '📚 Notes' : 
                         '📦 Product'}
                    </span>
                </div>

                {/* Title */}
                <h3 className="font-semibold text-slate-900 dark:text-gray-100 mb-2 line-clamp-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-200" title={title}>
                    {title}
                </h3>
                
                {/* Price and details */}
                <div className="mt-auto">
                    <div className="flex items-end justify-between">
                        <div className="flex flex-col">
                            <PriceDisplay 
                                price={price}
                                className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-800 to-emerald-600 dark:from-slate-200 dark:to-emerald-400"
                            />
                            {item.type === 'room' && (
                                <span className="text-xs text-slate-500 dark:text-slate-400">
                                    /{(item.duration || 'monthly').toLowerCase()}
                                </span>
                            )}
                        </div>
                        
                        {/* College info and Distance */}
                        <div className="flex items-center justify-between text-xs">
                            {item.college && (
                                <div className="text-slate-500 dark:text-slate-400 truncate max-w-20 flex items-center" title={item.college}>
                                    <span className="mr-1">📍</span>
                                    {item.college}
                                </div>
                            )}
                            
                            {/* Distance display */}
                            {showDistance && item.distance !== null && item.distance !== undefined && (
                                <div className="text-blue-600 dark:text-blue-400 font-medium flex items-center">
                                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    {formatDistance(item.distance)}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Condition */}
                    {item.condition && item.type !== 'room' && (
                        <div className="mt-2 flex items-center">
                            <div className={`w-2 h-2 rounded-full mr-2 ${
                                item.condition === 'New' ? 'bg-emerald-500' :
                                item.condition === 'Like New' ? 'bg-emerald-400' :
                                item.condition === 'Good' ? 'bg-teal-500' :
                                'bg-slate-400'
                            }`}></div>
                            <span className="text-xs text-slate-600 dark:text-slate-400">{item.condition}</span>
                        </div>
                    )}
                </div>

                {/* Action Buttons for Profile Page */}
                {(onEdit || onRemove || onMarkAsSold) && (
                    <div className="flex gap-2 mt-4">
                        {onEdit && (
                            <button
                                onClick={e => { e.stopPropagation(); onEdit(item); }}
                                className="bg-slate-600 dark:bg-slate-700 text-white px-4 py-1 rounded-full text-sm font-semibold shadow hover:bg-slate-800 dark:hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400"
                            >
                                Edit
                            </button>
                        )}
                        {onRemove && (
                            <button
                                onClick={e => { e.stopPropagation(); onRemove(item); }}
                                className="bg-rose-500 dark:bg-rose-700 text-white px-4 py-1 rounded-full text-sm font-semibold shadow hover:bg-rose-600 dark:hover:bg-rose-800 focus:outline-none focus:ring-2 focus:ring-rose-400"
                            >
                                Remove
                            </button>
                        )}
                        {onMarkAsSold && (
                            <button
                                onClick={e => { e.stopPropagation(); onMarkAsSold(item); }}
                                disabled={item.is_sold}
                                className={`px-4 py-1 rounded-full text-sm font-semibold text-white shadow focus:outline-none focus:ring-2 focus:ring-emerald-400 ${
                                    item.is_sold 
                                        ? 'bg-gray-400 cursor-not-allowed' 
                                        : 'bg-emerald-600 dark:bg-emerald-700 hover:bg-emerald-700 dark:hover:bg-emerald-800'
                                }`}
                            >
                                {item.is_sold ? 'Sold' : 'Mark as Sold'}
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );

    // Always use Link for navigation in server-rendered context
    return (
        <Link href={url} legacyBehavior>
            <a className="block h-full hover-lift cursor-pointer" style={{ textDecoration: 'none' }}>
                {cardContent}
            </a>
        </Link>
    );
}
