import Link from 'next/link';
import Image from 'next/image';
import PriceDisplay from './PriceDisplay';

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

export default function ListingCard({ item, onClick, isSelectMode = false, isSponsored = false, asLink = true }) {
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
            {/* Enhanced Featured Badge */}
            {(isSponsored || item.is_sponsored || item.isFeatured) && (
                <div className="absolute top-3 right-3 z-20">
                    <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg animate-pulse">
                        ⭐ FEATURED
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
                                <span className="text-xs text-slate-500 dark:text-slate-400">/month</span>
                            )}
                        </div>
                        
                        {/* College info */}
                        {item.college && (
                            <div className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-20" title={item.college}>
                                📍 {item.college}
                            </div>
                        )}
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
            </div>
        </div>
    );

    if (!asLink) {
        return <div className="h-full hover-lift">{cardContent}</div>;
    }

    if (isSelectMode) {
        return (
            <div onClick={() => onClick(item)} className="cursor-pointer h-full hover-lift">
                {cardContent}
            </div>
        );
    }

    return (
        <Link href={url} className="block h-full hover-lift">
            {cardContent}
        </Link>
    );
}
