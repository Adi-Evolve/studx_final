'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faTag, faBuilding, faUser, faCalendarAlt, faInfoCircle, faBalanceScale, faDownload, faBed, faUsers, faRoute, faShieldAlt, faUtensils, faCheckCircle, faWifi, faSnowflake, faCarBattery, faHotTub, faParking, faVideo, faCouch } from '@fortawesome/free-solid-svg-icons';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';

import MapDisplay from '@/components/MapDisplay';
import ProductImageGallery from '@/components/ProductImageGallery';
import SellerInfoModal from '@/components/SellerInfoModal';
import CompareModal from '@/components/CompareModal';
import CompareSelectionModal from '@/components/CompareSelectionModal';
import SimilarItemsFeed from '@/components/SimilarItemsFeed';
import { fetchSellerListings } from '@/app/actions';

export default function ProductPageClient({ product, seller, type }) {
    // Correctly group all hooks at the top of the component, before any returns.
    const [isSellerModalOpen, setIsSellerModalOpen] = useState(false);
    const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
    const [otherListings, setOtherListings] = useState([]);
    const [listingsLoading, setListingsLoading] = useState(false);
    const [listingsError, setListingsError] = useState(null);
    const [isCompareSelectionOpen, setIsCompareSelectionOpen] = useState(false);
    const [itemToCompare, setItemToCompare] = useState(null);

    // The guard clause MUST come after all hooks to follow React rules.
    if (!product) {
        return (
            <div className="container mx-auto px-4 py-8 text-center">
                <p className="text-lg text-gray-500">Loading product details...</p>
            </div>
        );
    }

    const getWhatsAppNumber = (phone) => {
        if (!phone) return null;
        const cleaned = phone.replace(/\D/g, '');
        return cleaned.length === 10 ? `91${cleaned}` : cleaned;
    };

    const handleShowSellerInfo = async () => {
        if (!seller) return;

        setIsSellerModalOpen(true);
        setListingsLoading(true);
        setListingsError(null);
        setOtherListings([]);

        try {
            const listings = await fetchSellerListings({
                sellerId: seller.id,
                excludeId: product.id,
                excludeType: type,
            });
            setOtherListings(listings);
        } catch (error) {
            console.error('Error fetching seller listings:', error);
            setListingsError('Could not load seller information.');
        } finally {
            setListingsLoading(false);
        }
    };

    const handleCompareClick = () => {
        setIsCompareSelectionOpen(true);
    };

    const handleItemSelectedForCompare = (selectedItem) => {
        setItemToCompare(selectedItem);
        setIsCompareSelectionOpen(false);
        setIsCompareModalOpen(true);
    };

    const formattedDate = product.created_at ? new Date(product.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }) : null;

    let parsedLocation = null;
    if (product.location) {
        try {
            parsedLocation = typeof product.location === 'string' ? JSON.parse(product.location) : product.location;
        } catch (error) {
            console.error('Failed to parse location JSON:', error);
        }
    }

    const getAmenityIcon = (amenity) => {
        const lowerAmenity = amenity.toLowerCase();
        if (lowerAmenity.includes('wi-fi')) return faWifi;
        if (lowerAmenity.includes('ac') || lowerAmenity.includes('air conditioner')) return faSnowflake;
        if (lowerAmenity.includes('power backup')) return faCarBattery;
        if (lowerAmenity.includes('geyser')) return faHotTub;
        if (lowerAmenity.includes('kitchen')) return faUtensils;
        if (lowerAmenity.includes('parking')) return faParking;
        if (lowerAmenity.includes('security')) return faShieldAlt;
        if (lowerAmenity.includes('cctv')) return faVideo;
        if (lowerAmenity.includes('furniture') || lowerAmenity.includes('furnished')) return faCouch;
        return faCheckCircle; // Fallback icon
    };

    return (
        <div className="bg-gray-50">
            <div className="container mx-auto px-4 py-8">
                <Link href="/home" legacyBehavior><a className="text-accent hover:text-primary mb-6 inline-flex items-center transition-colors">
                    <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                    Back to Home
                </a></Link>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    <ProductImageGallery images={product.images} title={product.title} />

                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
                            <h1 className="text-3xl font-bold text-primary mb-2 leading-tight">{product.title}</h1>
                            <p className="text-3xl font-bold text-accent mb-4">₹{product.price ? product.price.toLocaleString() : 'N/A'}</p>
                            
                            <div className="space-y-3 text-sm text-gray-600 border-t pt-4 mb-4">
                                {formattedDate && <div className="flex items-center"><FontAwesomeIcon icon={faCalendarAlt} className="w-4 mr-3 text-gray-400" /> Listed on: <span className="font-semibold text-primary ml-1">{formattedDate}</span></div>}
                                {seller && <div className="flex items-center"><FontAwesomeIcon icon={faUser} className="w-4 mr-3 text-gray-400" /> Sold by <span className="font-semibold text-primary ml-1">{seller.name}</span></div>}
                                <div className="flex items-center"><FontAwesomeIcon icon={faTag} className="w-4 mr-3 text-gray-400" /> Category: <span className="font-semibold text-primary ml-1">{product.category || 'N/A'}</span></div>
                                <div className="flex items-center"><FontAwesomeIcon icon={faBuilding} className="w-4 mr-3 text-gray-400" /> College: <span className="font-semibold text-primary ml-1">{product.college}</span></div>
                            </div>

                            {type === 'room' && (
                                <div className="border-t pt-4 mt-4">
                                    <h3 className="text-lg font-semibold text-primary mb-3">Room Details</h3>
                                    <div className="space-y-3 text-sm text-gray-600">
                                        <div className="flex items-center"><FontAwesomeIcon icon={faBed} className="w-4 mr-3 text-gray-400" />Room Type: <span className="font-semibold text-primary ml-1">{product.roomType || 'N/A'}</span></div>
                                        <div className="flex items-center"><FontAwesomeIcon icon={faUsers} className="w-4 mr-3 text-gray-400" />Occupancy: <span className="font-semibold text-primary ml-1">{product.occupancy || 'N/A'}</span></div>
                                        <div className="flex items-center"><FontAwesomeIcon icon={faRoute} className="w-4 mr-3 text-gray-400" />Distance: <span className="font-semibold text-primary ml-1">{product.distance} km from college</span></div>
                                        <div className="flex items-center"><FontAwesomeIcon icon={faShieldAlt} className="w-4 mr-3 text-gray-400" />Deposit: <span className="font-semibold text-primary ml-1">₹{product.deposit ? product.deposit.toLocaleString() : 'N/A'}</span></div>
                                        <div className="flex items-center"><FontAwesomeIcon icon={faUtensils} className="w-4 mr-3 text-gray-400" /><span className="font-semibold text-primary ml-1">{product.feesIncludeMess ? 'Mess Fees Included' : 'Mess Fees Not Included'}</span></div>
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 gap-3 mt-6">
                                {type === 'note' ? (
                                    <a href={product.file_url} download target="_blank" rel="noopener noreferrer" className="w-full bg-accent text-white font-bold py-3 px-4 rounded-lg hover:bg-primary transition-colors flex items-center justify-center">
                                        <FontAwesomeIcon icon={faDownload} className="mr-3" />
                                        Download Now
                                    </a>
                                ) : (
                                    seller?.phone ? (
                                        <a href={`https://wa.me/${getWhatsAppNumber(seller.phone)}?text=I'm%20interested%20in%20your%20'${encodeURIComponent(product.title)}'%20on%20StudXchange.`} target="_blank" rel="noopener noreferrer" className="w-full bg-green-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center">
                                            <FontAwesomeIcon icon={faWhatsapp} className="mr-3" size="lg" />
                                            Contact Seller
                                        </a>
                                    ) : (
                                        <button disabled title="Seller has not provided a contact number" className="w-full bg-gray-400 text-white font-bold py-3 px-4 rounded-lg cursor-not-allowed flex items-center justify-center">
                                            <FontAwesomeIcon icon={faWhatsapp} className="mr-3" size="lg" />
                                            Contact Seller
                                        </button>
                                    )
                                )}
                                <button onClick={handleShowSellerInfo} className="w-full bg-blue-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center">
                                    <FontAwesomeIcon icon={faInfoCircle} className="mr-3" />
                                    Seller Info
                                </button>
                                {type !== 'note' && (
                                    <button onClick={handleCompareClick} className="w-full bg-gray-200 text-primary font-bold py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center">
                                        <FontAwesomeIcon icon={faBalanceScale} className="mr-3" />
                                        Compare
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mt-8">
                    <div className={`bg-white rounded-lg shadow-md p-8 ${type === 'note' ? 'lg:col-span-5' : 'lg:col-span-3'}`}>
                        <h2 className="text-2xl font-bold text-primary mb-4">Description</h2>
                        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{product.description}</p>

                        {type === 'room' && product.amenities && product.amenities.length > 0 && (
                            <div className="mt-8 border-t pt-6">
                                <h3 className="text-xl font-bold text-primary mb-4">Amenities</h3>
                                <ul className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {product.amenities.map(amenity => (
                                        <li key={amenity} className="flex items-center text-gray-700">
                                            <FontAwesomeIcon icon={getAmenityIcon(amenity)} className="w-5 h-5 mr-3 text-green-500" />
                                            <span>{amenity}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    {type !== 'note' && (
                        <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-4">
                            <h3 className="text-xl font-bold text-primary mb-4 px-4">Location</h3>
                            <div className="h-80 rounded-lg overflow-hidden">
                                {parsedLocation ? <MapDisplay location={parsedLocation} /> : <div className='text-center p-10 text-gray-500'>Location not provided.</div>}
                            </div>
                        </div>
                    )}
                </div>

                <div className="mt-12">
                    <SimilarItemsFeed type={type} category={product.category} college={product.college} currentItemId={product.id} />
                </div>
            </div>
            
            {isSellerModalOpen && 
                <SellerInfoModal 
                    seller={seller} 
                    otherListings={otherListings} 
                    isLoading={listingsLoading}
                    error={listingsError}
                    onClose={() => setIsSellerModalOpen(false)} 
                />}

            {isCompareSelectionOpen && 
                <CompareSelectionModal 
                    currentItem={product} 
                    onItemSelected={handleItemSelectedForCompare} 
                    onClose={() => setIsCompareSelectionOpen(false)} 
                />}

            {isCompareModalOpen && 
                <CompareModal 
                    currentItem={product} 
                    compareItem={itemToCompare} 
                    onClose={() => setIsCompareModalOpen(false)} 
                />}
        </div>
    );
}
