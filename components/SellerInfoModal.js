'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faUser, faEnvelope, faPhone, faBoxOpen } from '@fortawesome/free-solid-svg-icons';
import ListingCard from './ListingCard';

const SkeletonCard = () => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
        <div className="w-full h-40 bg-gray-200"></div>
        <div className="p-4">
            <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-7 bg-gray-200 rounded w-1/2"></div>
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
        return <p className="text-center text-red-500 py-8">{error}</p>;
    }

    if (listings.length === 0) {
        return (
            <div className="text-center text-gray-500 py-12">
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
    if (!seller) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                <div className="sticky top-0 bg-white border-b px-6 py-4 z-10 flex justify-between items-center flex-shrink-0">
                    <h2 className="text-2xl font-bold text-primary">Seller Information</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-red-600 transition-colors">
                        <FontAwesomeIcon icon={faXmark} size="lg" />
                    </button>
                </div>

                <div className="overflow-y-auto p-8">
                    <div className="flex items-center mb-8">
                        {seller.avatar_url ? (
                            <img src={seller.avatar_url} alt={seller.name} className="w-20 h-20 rounded-full object-cover mr-6" />
                        ) : (
                            <div className="w-20 h-20 rounded-full bg-secondary text-white flex items-center justify-center text-3xl font-bold mr-6">
                                {seller.name ? seller.name.charAt(0).toUpperCase() : <FontAwesomeIcon icon={faUser} />}
                            </div>
                        )}
                        <div>
                            <h3 className="text-3xl font-bold text-gray-800">{seller.name || 'Anonymous Seller'}</h3>
                            <div className="text-gray-600 mt-2 space-y-2">
                                {seller.email && <p className="flex items-center"><FontAwesomeIcon icon={faEnvelope} className="mr-3 w-4 text-gray-400" /> {seller.email}</p>}
                                
                                {/* For rooms, display contact1 and contact2. For others, display the default phone. */}
                                {seller.contact1 || seller.contact2 ? (
                                    <>
                                        {seller.contact1 && <p className="flex items-center"><FontAwesomeIcon icon={faPhone} className="mr-3 w-4 text-gray-400" /> {seller.contact1}</p>}
                                        {seller.contact2 && <p className="flex items-center"><FontAwesomeIcon icon={faPhone} className="mr-3 w-4 text-gray-400" /> {seller.contact2}</p>}
                                    </>
                                ) : (
                                    seller.phone && <p className="flex items-center"><FontAwesomeIcon icon={faPhone} className="mr-3 w-4 text-gray-400" /> {seller.phone}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <h3 className="text-xl font-bold text-primary border-t pt-6 mb-6">More items from this seller</h3>
                    <ListingsSection isLoading={isLoading} error={error} listings={otherListings} />
                </div>
            </div>
        </div>
    );
}
