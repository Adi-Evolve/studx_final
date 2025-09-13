import Link from 'next/link';
import Image from 'next/image';
import PriceDisplay from './PriceDisplay';
import { formatDistance } from '@/lib/locationUtils';
import { getCustomStyling } from '@/lib/privilegedUsers';

const getListingUrl = (item) => {
    const type = item.type;
    if (type === 'room') {
        return `/products/rooms/${item.id}`;
    }
    if (type === 'note') {
        return `/products/notes/${item.id}`;
    }
    if (type === 'rental') {
        return `/products/rentals/${item.id}`;
    }
    if (type === 'arduino_kit') {
        return `/products/arduino/${item.id}`;
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
    const price = item.price || item.fees || item.rental_price || 0;

    // Check if this is a profile page with action buttons
    const hasActionButtons = onEdit || onRemove || onMarkAsSold;
    
    // Get privileged user styling - ONLY for Project Equipment category by admin
    const isPrivilegedProduct = item.seller_id === '5d6e6776-4e15-4dff-8233-d02616d1880a'; // adiinamdar888@gmail.com user ID
    const isProjectEquipment = item.category === 'Project Equipment';
    const shouldApplyHighlighting = isPrivilegedProduct && isProjectEquipment;
    
    const sellerEmail = shouldApplyHighlighting ? 'adiinamdar888@gmail.com' : null;
    const category = item.category;
    const isNewListing = item.created_at && new Date() - new Date(item.created_at) < 7 * 24 * 60 * 60 * 1000; // New if less than 7 days old
    const privilegedStyling = shouldApplyHighlighting ? getCustomStyling(sellerEmail, category, isNewListing) : null;

    const cardContent = (
        <div 
            className={`bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900 overflow-hidden hover:shadow-xl dark:hover:shadow-gray-700 transition-all duration-300 transform hover:scale-105 h-full flex flex-col group relative border-2 dark:border-gray-700 card-item ${
                (isSponsored || item.is_sponsored || item.isFeatured) 
                    ? 'border-gradient-to-r from-orange-300 to-yellow-300 dark:from-orange-400 dark:to-yellow-400 hover:border-orange-400 dark:hover:border-orange-500 shadow-lg ring-2 ring-orange-200 dark:ring-orange-500/30' 
                    : privilegedStyling 
                        ? privilegedStyling.cardClass 
                        : 'border-transparent hover:border-emerald-200 dark:hover:border-emerald-600'
            } ${hasActionButtons ? 'cursor-default' : ''}`}
            onClick={hasActionButtons ? (e) => {
                // Only navigate if clicking on the main card area, not buttons
                if (!e.target.closest('button') && !e.target.closest('.action-buttons')) {
                    window.open(url, '_blank');
                }
            } : undefined}
        >
            {/* Enhanced Featured Badge with Better Visibility */}
            {(isSponsored || item.is_sponsored || item.isFeatured) && (
                <div className="absolute top-2 right-2 z-20">
                    <div className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg border-2 border-white dark:border-gray-800">
                        <span className="flex items-center gap-1">
                            <span className="animate-pulse">⭐</span>
                            <span>FEATURED</span>
                        </span>
                    </div>
                </div>
            )}
            
            {/* Priority Rank for Featured Items */}
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

            {/* Image Container - Optimized for mobile square layout */}
            <div className="relative h-32 sm:h-48 overflow-hidden bg-gradient-to-br from-slate-100 to-emerald-50">
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

            {/* Content - Mobile optimized spacing */}
            <div className="p-2 sm:p-4 flex-grow flex flex-col">
                {/* Verified Seller Badge for Privileged Users - Below image on right side */}
                {privilegedStyling && privilegedStyling.badgeText && !isSponsored && !item.is_sponsored && !item.isFeatured && (
                    <div className="flex justify-end mb-2">
                        <div className={privilegedStyling.badgeClass}>
                            <span className="flex items-center gap-0.5">
                                <svg className="w-2.5 h-2.5 text-emerald-200" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                <span>VERIFIED</span>
                            </span>
                        </div>
                    </div>
                )}
                
                {/* Type Badge - Mobile optimized */}
                <div className="mb-1.5 sm:mb-2">
                    <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold rounded-full ${
                        item.type === 'room' ? 'bg-emerald-50 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700' : 
                        item.type === 'note' ? 'bg-teal-50 dark:bg-teal-900 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-700' : 
                        item.type === 'rental' ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 border-2 border-purple-300 dark:border-purple-600 font-bold animate-pulse' :
                        'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600'
                    }`}>
                        {item.type === 'room' ? '🏠 Room' : 
                         item.type === 'note' ? '📚 Notes' : 
                         item.type === 'rental' ? '🔄 Rental' :
                         '📦 Product'}
                    </span>
                    {item.type === 'rental' && (
                        <span className="ml-2 px-2 py-1 bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 text-xs rounded-full font-bold border border-orange-300 dark:border-orange-600">
                            NEW
                        </span>
                    )}
                </div>

                {/* Title - Mobile optimized */}
                <h3 className="font-semibold text-slate-900 dark:text-gray-100 mb-1.5 sm:mb-2 line-clamp-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-200 text-xs sm:text-sm leading-tight" title={title}>
                    {title}
                </h3>
                
                {/* Price and details - Mobile optimized layout */}
                <div className="mt-auto space-y-1.5 sm:space-y-2">
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                            <PriceDisplay 
                                price={price}
                                className={privilegedStyling && privilegedStyling.priceClass 
                                    ? privilegedStyling.priceClass 
                                    : "text-sm sm:text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-800 to-emerald-600 dark:from-slate-200 dark:to-emerald-400"
                                }
                            />
                            {item.type === 'room' && (
                                <span className="text-[9px] sm:text-xs text-slate-500 dark:text-slate-400">
                                    /{(item.duration || 'monthly').toLowerCase()}
                                </span>
                            )}
                            {item.type === 'rental' && (
                                <span className="text-[8px] sm:text-xs text-purple-600 dark:text-purple-400 font-bold bg-purple-50 dark:bg-purple-900 px-1 sm:px-2 py-0.5 sm:py-1 rounded-full border border-purple-200 dark:border-purple-700 inline-block w-fit mt-1">
                                    /{item.rental_duration || 'daily'}
                                </span>
                            )}
                        </div>
                        
                        {/* College info and Distance */}
                        <div className="flex items-center justify-between text-[9px] sm:text-xs mt-1.5 sm:mt-2">
                            {item.college && (
                                <div className="text-slate-500 dark:text-slate-400 truncate max-w-16 sm:max-w-20 flex items-center" title={item.college}>
                                    <span className="mr-0.5 sm:mr-1 text-[8px] sm:text-[10px]">📍</span>
                                    <span className="text-[8px] sm:text-xs truncate">{item.college}</span>
                                </div>
                            )}
                            
                            {/* Distance display */}
                            {showDistance && item.distance !== null && item.distance !== undefined && (
                                <div className="text-blue-600 dark:text-blue-400 font-medium flex items-center">
                                    <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <span className="text-[8px] sm:text-xs">{formatDistance(item.distance)}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Condition - Mobile optimized */}
                    {item.condition && item.type !== 'room' && (
                        <div className="mt-1.5 sm:mt-2 flex items-center">
                            <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full mr-1 sm:mr-2 ${
                                item.condition === 'New' ? 'bg-emerald-500' :
                                item.condition === 'Like New' ? 'bg-emerald-400' :
                                item.condition === 'Good' ? 'bg-teal-500' :
                                'bg-slate-400'
                            }`}></div>
                            <span className="text-[8px] sm:text-xs text-slate-600 dark:text-slate-400">{item.condition}</span>
                        </div>
                    )}
                </div>

                {/* Action Buttons for Profile Page */}
                {(onEdit || onRemove || onMarkAsSold) && (
                    <div className="flex gap-2 mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg action-buttons">
                        {onEdit && (
                            <button
                                onClick={e => { 
                                    e.preventDefault(); 
                                    e.stopPropagation(); 
                                    onEdit(item); 
                                }}
                                className="bg-blue-600 dark:bg-blue-700 text-white px-3 py-1 rounded text-sm font-semibold hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors"
                            >
                                Edit
                            </button>
                        )}
                        {onRemove && (
                            <button
                                onClick={e => { 
                                    e.preventDefault(); 
                                    e.stopPropagation(); 
                                    onRemove(item); 
                                }}
                                className="bg-red-600 dark:bg-red-700 text-white px-3 py-1 rounded text-sm font-semibold hover:bg-red-700 dark:hover:bg-red-800 transition-colors"
                            >
                                Remove
                            </button>
                        )}
                        {onMarkAsSold && (
                            <button
                                onClick={e => { 
                                    e.preventDefault(); 
                                    e.stopPropagation(); 
                                    onMarkAsSold(item); 
                                }}
                                disabled={item.is_sold}
                                className={`px-3 py-1 rounded text-sm font-semibold transition-colors ${
                                    item.is_sold 
                                        ? 'bg-gray-400 text-white cursor-not-allowed' 
                                        : 'bg-green-600 text-white hover:bg-green-700'
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

    // For profile page, don't wrap in Link if action buttons are present    
    if (hasActionButtons) {
        return (
            <div className="block h-full hover-lift" style={{ textDecoration: 'none' }}>
                {cardContent}
            </div>
        );
    }

    // Always use Link for navigation in server-rendered context
    return (
        <Link href={url} legacyBehavior>
            <a className="block h-full hover-lift cursor-pointer" style={{ textDecoration: 'none' }}>
                {cardContent}
            </a>
        </Link>
    );
}
