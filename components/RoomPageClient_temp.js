'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { faArrowLeft, faMapMarkerAlt, faUser, faCalendarAlt, faInfoCircle, faBalanceScale, faBed, faUsers, faWalking, faUtensils, faTag } from '@fortawesome/free-solid-svg-icons';

import MapDisplay from '@/components/MapDisplay';
import SellerInfoModal from '@/components/SellerInfoModal';
import CompareModal from '@/components/CompareModal';
import CompareSelectionModal from '@/components/CompareSelectionModal';
import SimilarItemsFeed from '@/components/SimilarItemsFeed';
import ProductImageGallery from '@/components/ProductImageGallery';
import { fetchSellerListings } from '@/app/actions';

const ReviewsSection = ({ roomId }) => (
    <div className="bg-white rounded-lg shadow-md p-8 mt-8">
        <h2 className="text-2xl font-bold text-primary mb-4">Reviews & Ratings</h2>
        <div className="border-t pt-4">
            <p className="text-gray-500">Reviews feature coming soon!</p>
        </div>
    </div>
);

export default function RoomPageClient({ room, seller }) {
    const [isSellerModalOpen, setIsSellerModalOpen] = useState(false);
    const [otherListings, setOtherListings] = useState([]);
    const [isCompareSelectionOpen, setIsCompareSelectionOpen] = useState(false);
    const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
    const [itemToCompare, setItemToCompare] = useState(null);

    const getWhatsAppNumber = (phone) => {
        if (!phone) return null;
        const cleaned = phone.replace(/\D/g, '');
        if (cleaned.length === 10) {
            return `91${cleaned}`;
        }
        if (cleaned.startsWith('91') && cleaned.length === 12) {
            return cleaned;
        }
        return phone; // fallback
    };

    const handleShowSellerInfo = async () => {
        if (!seller) {
            // console.error("handleShowSellerInfo called but seller object is null or undefined.");
            return;
        }
        try {
            const listings = await fetchSellerListings({
                sellerId: seller.id,
                excludeId: room.id,
                excludeType: 'room'
            });
            setOtherListings(listings);
            setIsSellerModalOpen(true);
        } catch (error) {
            // console.error('Error fetching seller listings:', error);
            alert('Could not load seller information.');
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

    const formattedDate = new Date(room.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    const whatsAppNumber = getWhatsAppNumber(seller?.phone);

    let parsedLocation = null;
    if (room.location) {
        try {
            parsedLocation = typeof room.location === 'string' 
                ? JSON.parse(room.location) 
                : room.location;
        } catch (error) {
            // console.error('Failed to parse location JSON:', error);
        }
    }

    return (
        <div className="bg-gray-50">
            <div className="container mx-auto px-4 py-8">
                <Link href="/" className="text-accent hover:text-primary mb-6 inline-flex items-center transition-colors">
                    <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                    Back to Home
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    <div className="lg:col-span-3 bg-white rounded-lg shadow-md p-4">
                        <ProductImageGallery images={room.images} title={room.title} />
                    </div>

                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
                            <h1 className="text-3xl font-bold text-primary mb-2 leading-tight">{room.title}</h1>
                            <p className="text-3xl font-bold text-accent mb-4">₹{room.price ? room.price.toLocaleString() : 'N/A'} / month</p>
                            
                            <div className="space-y-3 text-sm text-gray-600 border-t pt-4 mb-4">
                                <div className="flex items-center"><FontAwesomeIcon icon={faCalendarAlt} className="w-4 mr-3 text-gray-400" /> Posted on {formattedDate}</div>
                                {seller && <div className="flex items-center"><FontAwesomeIcon icon={faUser} className="w-4 mr-3 text-gray-400" /> Listed by <span className="font-semibold text-primary ml-1">{seller.name}</span></div>}
                                <div className="flex items-center"><FontAwesomeIcon icon={faTag} className="w-4 mr-3 text-gray-400" /> Category: <span className="font-semibold text-primary ml-1">{room.category?.name || 'N/A'}</span></div>
                                <div className="flex items-center"><FontAwesomeIcon icon={faBed} className="w-4 mr-3 text-gray-400" /> Type: <span className="font-semibold text-primary ml-1">{room.roomType}</span></div>
                                <div className="flex items-center"><FontAwesomeIcon icon={faUsers} className="w-4 mr-3 text-gray-400" /> Occupancy: <span className="font-semibold text-primary ml-1">{room.occupancy}</span></div>
                                <div className="flex items-center"><FontAwesomeIcon icon={faWalking} className="w-4 mr-3 text-gray-400" /> Distance: <span className="font-semibold text-primary ml-1">{room.distance} km from college</span></div>
                                <div className="flex items-center"><FontAwesomeIcon icon={faUtensils} className="w-4 mr-3 text-gray-400" /> Mess: <span className="font-semibold text-primary ml-1">{room.messType} ({room.feesIncludeMess ? 'Included' : 'Extra'})</span></div>
                            </div>

                            <div className="grid grid-cols-1 gap-3 mt-6">
                                {whatsAppNumber && (
                                    <a href={`https://wa.me/${whatsAppNumber}?text=Hello!%20I%20saw%20your%20room%20listing%20for%20'${encodeURIComponent(room.title)}'%20on%20StudXchange%20and%20I'm%20interested%20in%20renting%20it.%20%0A%0ACould%20you%20please%20provide%20more%20details%20about:%20%0A-%20Room%20availability%20dates%20%0A-%20Monthly%20rent%20and%20security%20deposit%20%0A-%20Included%20amenities%20and%20utilities%20%0A-%20House%20rules%20and%20preferences%20%0A-%20Best%20time%20for%20room%20viewing%20%0A%0ARoom%20Link:%20${encodeURIComponent(window.location.href)}%20%0A%0AI%20would%20love%20to%20schedule%20a%20viewing%20if%20possible.%20Thank%20you!`} target="_blank" rel="noopener noreferrer" className="w-full bg-green-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center">
                                        <FontAwesomeIcon icon={faWhatsapp} className="mr-3" size="lg" />
                                        Contact Lister
                                    </a>
                                )}
                                <button onClick={handleShowSellerInfo} className="w-full bg-blue-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center">
                                    <FontAwesomeIcon icon={faInfoCircle} className="mr-3" />
                                    Lister Info
                                </button>
                                <button onClick={handleCompareClick} className="w-full bg-gray-200 text-primary font-bold py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center">
                                    <FontAwesomeIcon icon={faBalanceScale} className="mr-3" />
                                    Compare
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mt-8">
                    <div className="lg:col-span-3 bg-white rounded-lg shadow-md p-8">
                        <h2 className="text-2xl font-bold text-primary mb-4">Description & Amenities</h2>
                        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap mb-6">{room.description}</p>
                        <h3 className="text-xl font-bold text-primary mb-3">Amenities</h3>
                        <div className="flex flex-wrap gap-2">
                            {room.amenities?.map(amenity => <span key={amenity} className="bg-blue-100 text-blue-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded-full">{amenity}</span>) || <p>No amenities listed.</p>}
                        </div>
                    </div>
                    <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-4">
                        <h3 className="text-xl font-bold text-primary mb-4 px-4">Location</h3>
                        <div className="h-80 rounded-lg overflow-hidden">
                            {parsedLocation ? <MapDisplay location={parsedLocation} popupText={room.title} /> : <div className='text-center p-10 text-gray-500'>Location not provided.</div>}
                        </div>
                    </div>
                </div>

                <ReviewsSection roomId={room.id} />

                <div className="mt-12">
                    <h2 className="text-3xl font-bold text-primary mb-6 text-center">Similar Rooms & Hostels</h2>
                    <SimilarItemsFeed categoryId={room.category_id} currentItemId={room.id} type="room" />
                </div>
            </div>

            {isSellerModalOpen && <SellerInfoModal seller={seller} soldProducts={otherListings} onClose={() => setIsSellerModalOpen(false)} />}
            {isCompareSelectionOpen && 
                <CompareSelectionModal 
                    currentItem={room} 
                    onItemSelected={handleItemSelectedForCompare} 
                    onClose={() => setIsCompareSelectionOpen(false)} 
                    excludeType="room"
                />}
            {isCompareModalOpen && 
                <CompareModal 
                    currentItem={room} 
                    compareItem={itemToCompare} 
                    onClose={() => setIsCompareModalOpen(false)} 
                />}
        </div>
    );
}
