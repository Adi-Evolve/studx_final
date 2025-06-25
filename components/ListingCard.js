import Link from 'next/link';
import Image from 'next/image';

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

    const imageUrl = (Array.isArray(item.images) && item.images.length > 0 && item.images[0])
        || (Array.isArray(item.image_urls) && item.image_urls.length > 0 && item.image_urls[0])
        || `https://i.pravatar.cc/300?u=${item.id}`;

    const url = getListingUrl(item);
    const title = item.name || item.title || item.hostel_name || 'Untitled';

    const cardContent = (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden transform hover:-translate-y-1 transition-transform duration-300 h-full flex flex-col group">
            {/* Sponsored Tag */}
            {(isSponsored || item.is_sponsored) && (
                <div className="absolute top-2 right-2 bg-yellow-400 text-gray-800 text-xs font-bold px-2 py-1 rounded-md z-10 shadow-md">
                    Sponsored
                </div>
            )}
            {item.is_sold && (
                <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-md z-10">
                    SOLD
                </div>
            )}
            <div className="relative h-48">
                <Image draggable="false" 
                    src={imageUrl}
                    alt={title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    style={{ objectFit: 'cover' }}
                    className="transition-transform duration-500 group-hover:scale-105"
                />
                {item.is_sponsored && (
                    <div className="absolute top-2 left-2 bg-yellow-400 text-gray-800 text-xs font-bold px-2 py-1 rounded-md z-10">
                        SPONSORED
                    </div>
                )}
                {item.is_sold && (
                    <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-md z-10">
                        SOLD
                    </div>
                )}
            </div>
            <div className="p-4 flex-grow flex flex-col">
                <h3 className="font-bold text-lg truncate" title={title}>{title}</h3>
                <p className="text-gray-600 text-sm mb-2 capitalize">{item.type || 'Product'}</p>
                <div className="mt-auto">
                    <p className="text-accent font-semibold text-xl">₹{item.price || item.fees || 0}</p>
                </div>
            </div>
        </div>
    );

    if (!asLink) {
        // When used in a slider, the card is not a link and the parent handles clicks.
        return <div className="h-full">{cardContent}</div>;
    }

    if (isSelectMode) {
        // For the admin panel's item selection UI.
        return (
            <div onClick={() => onClick(item)} className="cursor-pointer h-full">
                {cardContent}
            </div>
        );
    }

    // Default behavior for everywhere else (e.g., the infinite feed).
    return (
        <Link href={url} className="block h-full">
            {cardContent}
        </Link>
    );
}
