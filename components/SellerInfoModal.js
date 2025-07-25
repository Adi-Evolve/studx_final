'use client';

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faUser, faEnvelope, faPhone, faBoxOpen } from '@fortawesome/free-solid-svg-icons';
import ListingCard from './ListingCard';

const SkeletonCard = () => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden animate-pulse">
        <div className="w-full h-40 bg-gray-200 dark:bg-gray-700"></div>
        <div className="p-4">
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
            <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
    </div>
);

const ListingsSection = ({ isLoading, error, listings }) => {
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
        );
    }

    if (error) {
        return <p className="text-center text-red-500 dark:text-red-400 py-8">{error}</p>;
    }

    if (listings.length === 0) {
        return (
            <div className="text-center text-gray-500 dark:text-gray-400 py-12">
                <FontAwesomeIcon icon={faBoxOpen} size="3x" className="mb-4" />
                <p>This seller has no other items for sale.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map(item => (
                <ListingCard key={`${item.type}-${item.id}`} item={item} />
            ))}
        </div>
    );
};

export default function SellerInfoModal({ seller, otherListings, isLoading, error, onClose }) {
    // Always call hooks at the top level
    const [imageLoading, setImageLoading] = useState(true);
    const [imageError, setImageError] = useState(false);

    if (!seller) return null;

    // Helper function to handle image errors
    const handleImageError = (e) => {
        // console.log('[SellerInfoModal] Image load error, will show initials instead');
        setImageError(true);
        setImageLoading(false);
    };

    const handleImageLoad = () => {
        setImageLoading(false);
    };

    // Get the best available avatar URL - prioritize real Google photos
    const getAvatarUrl = () => {
        if (seller.avatar_url) {
            // console.log('[SellerInfoModal] Using seller avatar_url:', seller.avatar_url);
            return seller.avatar_url;
        }
        // console.log('[SellerInfoModal] No real avatar available for seller:', seller.id);
        return null; // Return null instead of pravatar to show initials
    };

    // Render avatar with fallback to user initials
    const renderAvatar = () => {
        const avatarUrl = getAvatarUrl();
        
        if (avatarUrl && !imageError) {
            return (
                <div className="relative">
                    {imageLoading && (
                        <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-700 mr-6 flex items-center justify-center animate-pulse">
                            <FontAwesomeIcon icon={faUser} className="text-gray-400 dark:text-gray-500" />
                        </div>
                    )}
                    <img 
                        src={avatarUrl} 
                        alt={seller.name || 'Seller'} 
                        className={`w-20 h-20 rounded-full object-cover mr-6 border-2 border-gray-200 dark:border-gray-600 shadow-md ${imageLoading ? 'hidden' : 'block'}`}
                        onError={handleImageError}
                        onLoad={handleImageLoad}
                        referrerPolicy="no-referrer" // Important for Google images
                    />
                </div>
            );
        }
        
        // Fallback to user initials instead of random avatar
        const initials = seller.name 
            ? seller.name.split(' ').map(n => n.charAt(0)).join('').substring(0, 2).toUpperCase()
            : seller.email 
                ? seller.email.charAt(0).toUpperCase()
                : 'U';
                
        return (
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center text-2xl font-bold mr-6 shadow-md">
                {initials}
            </div>
        );
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 z-10 flex justify-between items-center flex-shrink-0">
                    <h2 className="text-2xl font-bold text-primary dark:text-blue-400">Seller Information</h2>
                    <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors">
                        <FontAwesomeIcon icon={faXmark} size="lg" />
                    </button>
                </div>

                <div className="overflow-y-auto p-8">
                    <div className="flex items-center mb-8">
                        {renderAvatar()}
                        <div>
                            <h3 className="text-3xl font-bold text-gray-800 dark:text-gray-200">{seller.name || 'Anonymous Seller'}</h3>
                            <div className="text-gray-600 dark:text-gray-400 mt-2 space-y-2">
                                {seller.email && <p className="flex items-center"><FontAwesomeIcon icon={faEnvelope} className="mr-3 w-4 text-gray-400 dark:text-gray-500" /> {seller.email}</p>}
                                
                                {/* For rooms, display contact1 and contact2. For others, display the default phone. */}
                                {seller.contact1 || seller.contact2 ? (
                                    <>
                                        {seller.contact1 && <p className="flex items-center"><FontAwesomeIcon icon={faPhone} className="mr-3 w-4 text-gray-400 dark:text-gray-500" /> {seller.contact1}</p>}
                                        {seller.contact2 && <p className="flex items-center"><FontAwesomeIcon icon={faPhone} className="mr-3 w-4 text-gray-400 dark:text-gray-500" /> {seller.contact2}</p>}
                                    </>
                                ) : (
                                    seller.phone && <p className="flex items-center"><FontAwesomeIcon icon={faPhone} className="mr-3 w-4 text-gray-400 dark:text-gray-500" /> {seller.phone}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <h3 className="text-xl font-bold text-primary dark:text-blue-400 border-t border-gray-200 dark:border-gray-700 pt-6 mb-6">More items from this seller</h3>
                    <ListingsSection isLoading={isLoading} error={error} listings={otherListings} />
                </div>
            </div>
        </div>
    );
}
