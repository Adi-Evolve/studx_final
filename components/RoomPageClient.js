'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { faArrowLeft, faMapMarkerAlt, faUser, faCalendarAlt, faInfoCircle, faBalanceScale, faBed, faUsers, faWalking, faUtensils, faTag, faDirections } from '@fortawesome/free-solid-svg-icons';

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

    const handleGetDirections = () => {
        if (parsedLocation && parsedLocation.lat && parsedLocation.lng) {
            // Open Google Maps with the saved location
            const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${parsedLocation.lat},${parsedLocation.lng}`;
            window.open(googleMapsUrl, '_blank');
        } else {
            alert('Location not available for this room.');
        }
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
                            <p className="text-3xl font-bold text-accent mb-4">₹{room.price ? room.price.toLocaleString() : 'N/A'} / {(room.fees_period || 'Monthly').toLowerCase()}</p>
                            
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
                                    <a href={`https://wa.me/${whatsAppNumber}?text=🏠%20*Room%20Inquiry%20-%20StudXchange*%20🏠%0A%0AHello!%20Hope%20you're%20doing%20well!%20✨%0A%0AI%20came%20across%20your%20room%20listing%20*"${encodeURIComponent(room.title)}"*%20on%20StudXchange%20and%20I'm%20genuinely%20interested%20in%20it.%20The%20location%20and%20amenities%20look%20perfect%20for%20my%20needs!%0A%0A📋%20*Quick%20Details%20I%20Noticed:*%0A•%20Price:%20₹${room.price ? room.price.toLocaleString() : 'N/A'}/${(room.duration || 'month').toLowerCase()}%0A•%20Type:%20${room.roomType}%0A•%20Distance:%20${room.distance}km%20from%20college%0A•%20Occupancy:%20${room.occupancy}%0A%0A❓%20*Could%20you%20please%20help%20me%20with%20these%20details:*%0A%0A🗓️%20**Availability%20&%20Timeline**%0A•%20When%20is%20the%20room%20available%20from?%0A•%20Minimum%20stay%20duration%20requirements?%0A•%20Any%20advance%20booking%20needed?%0A%0A💰%20**Financial%20Details**%0A•%20Security%20deposit%20amount?%0A•%20Any%20additional%20charges%20(maintenance,%20electricity,%20etc.)?%0A•%20Payment%20schedule%20and%20preferred%20method?%0A%0A🏡%20**Living%20Arrangements**%0A•%20Current%20occupancy%20status%20of%20the%20property?%0A•%20House%20rules%20and%20timings?%0A•%20Cooking%20facilities%20and%20kitchen%20access?%0A•%20Internet%20WiFi%20speed%20and%20reliability?%0A%0A🔍%20**Viewing%20&%20Next%20Steps**%0A•%20Best%20time%20for%20a%20room%20viewing?%0A•%20Can%20I%20visit%20this%20weekend%20or%20weekday%20evening?%0A•%20Any%20documents%20needed%20for%20booking?%0A%0A📱%20*Room%20Link:*%20${encodeURIComponent(window.location.href)}%0A%0AI'm%20a%20responsible%20student%20looking%20for%20a%20comfortable%20stay.%20Would%20love%20to%20connect%20and%20discuss%20further!%20😊%0A%0AThank%20you%20for%20your%20time!%20🙏`} target="_blank" rel="noopener noreferrer" className="w-full bg-green-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center">
                                        <FontAwesomeIcon icon={faWhatsapp} className="mr-3" size="lg" />
                                        Contact Lister
                                    </a>
                                )}
                                <button onClick={handleGetDirections} className="w-full bg-red-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center">
                                    <FontAwesomeIcon icon={faDirections} className="mr-3" />
                                    Get Directions
                                </button>
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
                        <div className="flex items-center justify-between mb-4 px-4">
                            <h3 className="text-xl font-bold text-primary">Location</h3>
                            {parsedLocation && parsedLocation.lat && parsedLocation.lng && (
                                <button 
                                    onClick={handleGetDirections} 
                                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center text-sm font-medium"
                                    title="Open in Google Maps"
                                >
                                    <FontAwesomeIcon icon={faDirections} className="mr-2" />
                                    Directions
                                </button>
                            )}
                        </div>
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
