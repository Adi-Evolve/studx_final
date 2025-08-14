'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faTag, faBuilding, faUser, faCalendarAlt, faInfoCircle, faBalanceScale, faDownload, faBed, faUsers, faRoute, faShieldAlt, faUtensils, faCheckCircle, faWifi, faSnowflake, faCarBattery, faHotTub, faParking, faVideo, faCouch, faCreditCard, faDirections } from '@fortawesome/free-solid-svg-icons';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';

import MapDisplay from '@/components/MapDisplay';
import ProductImageGallery from '@/components/ProductImageGallery';
import SellerInfoModal from '@/components/SellerInfoModal';
import CompareModal from '@/components/CompareModal';
import CompareSelectionModal from '@/components/CompareSelectionModal';
import SimilarItemsFeed from '@/components/SimilarItemsFeed';
import PaymentModal from '@/components/PaymentModal';
import DriveUploadButton from './DriveUploadButton';
import { fetchSellerListings } from '@/app/actions';

export default function ProductPageClient({ product, seller, type }) {
    // Correctly group all hooks at the top of the component, before any returns.

    // PDF download handler
    const handleDownload = async (pdfData, fileName) => {
        if (!pdfData) return;
        let downloadUrl = '';
        // Strictly check for object with downloadUrl (Google Drive)
        if (pdfData && typeof pdfData === 'object' && pdfData.downloadUrl) {
            downloadUrl = pdfData.downloadUrl;
        } else if (typeof pdfData === 'string' && pdfData.startsWith('https://drive.google.com/')) {
            downloadUrl = pdfData;
        } else if (typeof pdfData === 'string' && !pdfData.startsWith('http')) {
            // Only for legacy Supabase storage paths
            const { createSupabaseBrowserClient } = await import('@/lib/supabase/client');
            const supabase = createSupabaseBrowserClient();
            const { data, error } = await supabase.storage
                .from('product_pdfs')
                .createSignedUrl(pdfData, 60 * 60);
            if (error || !data?.signedUrl) {
                alert('Failed to generate download link. PDF may not exist or you may not have access.');
                return;
            }
            downloadUrl = data.signedUrl;
        } else {
            alert('No valid PDF download link found.');
            return;
        }
        // Only trigger download if downloadUrl is a valid Google Drive or Supabase link
        if (downloadUrl.startsWith('https://drive.google.com/') || downloadUrl.startsWith('https://')) {
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = `${fileName || (pdfData.fileName || 'StudXchange_Notes')}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else {
            alert('No valid PDF download link found.');
        }
    };
    const [isSellerModalOpen, setIsSellerModalOpen] = useState(false);
    const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
    const [otherListings, setOtherListings] = useState([]);
    const [listingsLoading, setListingsLoading] = useState(false);
    const [listingsError, setListingsError] = useState(null);
    const [isCompareSelectionOpen, setIsCompareSelectionOpen] = useState(false);
    const [itemToCompare, setItemToCompare] = useState(null);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [hasPurchased, setHasPurchased] = useState(false);
    const [purchaseLoading, setPurchaseLoading] = useState(false);

    // Check if user has already purchased this product
    useEffect(() => {
        if (type === 'note' && product?.id) {
            const purchases = JSON.parse(localStorage.getItem('studx_purchases') || '[]');
            const hasBought = purchases.some(purchase => purchase.productId === product.id);
            setHasPurchased(hasBought);
        }
    }, [product?.id, type]);

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

    const handleBuyNow = () => {
        setPurchaseLoading(true);
        setIsPaymentModalOpen(true);
    };

    const handlePaymentSuccess = (transaction) => {
        setHasPurchased(true);
        setIsPaymentModalOpen(false);
        alert(`Payment successful! Transaction ID: ${transaction.id}. You can now download your notes.`);
        // TODO: Store purchase status in localStorage or backend
        // TODO: Mark item as sold in backend
        // TODO: Notify seller
        
        // Store purchase in localStorage for now (temporary solution)
        const purchases = JSON.parse(localStorage.getItem('studx_purchases') || '[]');
        purchases.push({
            productId: product.id,
            transactionId: transaction.id,
            purchaseDate: new Date().toISOString(),
            productTitle: product.title
        });
        localStorage.setItem('studx_purchases', JSON.stringify(purchases));
    };

    const handleGetDirections = () => {
        if (parsedLocation && parsedLocation.lat && parsedLocation.lng) {
            // Open Google Maps with the saved location
            const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${parsedLocation.lat},${parsedLocation.lng}`;
            window.open(googleMapsUrl, '_blank');
        } else {
            alert('Location not available for this item.');
        }
    };
                                    {(!product.pdf_urls || !Array.isArray(product.pdf_urls) || product.pdf_urls.length === 0) && product.pdfurl && (
                                        <button 
                                            onClick={() => handleDownload(product.pdfurl, product.title)}
                                            className="w-full bg-gradient-to-r from-slate-800 via-slate-700 to-emerald-600 text-white font-bold py-3 px-4 rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-200 flex items-center justify-center"
                                        >
                                            <FontAwesomeIcon icon={faDownload} className="mr-3" />
                                            Download PDF
                                        </button>
                                    )}
                                    {(!product.pdf_urls || !Array.isArray(product.pdf_urls) || product.pdf_urls.length === 0) && !product.pdfurl && (
                                        <div className="w-full bg-gray-300 text-gray-600 font-bold py-3 px-4 rounded-lg flex items-center justify-center cursor-not-allowed">
                                            <FontAwesomeIcon icon={faDownload} className="mr-3" />
                                            No PDF Available
                                        </div>
                                    )}

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
        <div className="bg-gray-50 dark:bg-gray-900">
            <div className="container mx-auto px-4 py-8">
                <Link href="/" legacyBehavior><a className="text-accent hover:text-primary dark:text-blue-400 dark:hover:text-blue-300 mb-6 inline-flex items-center transition-colors">
                    <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                    Back to Home
                </a></Link>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    <ProductImageGallery 
                        images={product.images || product.image_urls || []} 
                        title={product.title} 
                    />

                    <div className="lg:col-span-2">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 sticky top-24">
                            <h1 className="text-3xl font-bold text-primary dark:text-white mb-2 leading-tight">{product.title}</h1>
                            <p className="text-3xl font-bold text-accent dark:text-blue-400 mb-4">
                                ₹{product.price ? product.price.toLocaleString() : 'N/A'}
                                {type === 'room' && product.duration && (
                                    <span className="text-base text-gray-600 dark:text-gray-400 ml-2">
                                        /{product.duration.toLowerCase()}
                                    </span>
                                )}
                            </p>
                            
                            <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300 border-t dark:border-gray-700 pt-4 mb-4">
                                {formattedDate && <div className="flex items-center"><FontAwesomeIcon icon={faCalendarAlt} className="w-4 mr-3 text-gray-400" /> Listed on: <span className="font-semibold text-primary dark:text-white ml-1">{formattedDate}</span></div>}
                                {seller && <div className="flex items-center"><FontAwesomeIcon icon={faUser} className="w-4 mr-3 text-gray-400" /> Sold by <span className="font-semibold text-primary dark:text-white ml-1">{seller.name}</span></div>}
                                <div className="flex items-center"><FontAwesomeIcon icon={faTag} className="w-4 mr-3 text-gray-400" /> Category: <span className="font-semibold text-primary dark:text-white ml-1">{product.category || 'N/A'}</span></div>
                                <div className="flex items-center"><FontAwesomeIcon icon={faBuilding} className="w-4 mr-3 text-gray-400" /> College: <span className="font-semibold text-primary dark:text-white ml-1">{product.college}</span></div>
                                {type === 'note' && product.academic_year && (
                                    <div className="flex items-center"><FontAwesomeIcon icon={faCalendarAlt} className="w-4 mr-3 text-gray-400" /> Academic Year: <span className="font-semibold text-primary dark:text-white ml-1">{product.academic_year}</span></div>
                                )}
                                {type === 'note' && product.course_subject && (
                                    <div className="flex items-center"><FontAwesomeIcon icon={faTag} className="w-4 mr-3 text-gray-400" /> Subject: <span className="font-semibold text-primary dark:text-white ml-1">{product.course_subject}</span></div>
                                )}
                            </div>

                            {type === 'room' && (
                                <div className="border-t dark:border-gray-700 pt-4 mt-4">
                                    <h3 className="text-lg font-semibold text-primary dark:text-white mb-3">Room Details</h3>
                                    <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                                        <div className="flex items-center"><FontAwesomeIcon icon={faBed} className="w-4 mr-3 text-gray-400" />Room Type: <span className="font-semibold text-primary dark:text-white ml-1">{product.roomType || 'N/A'}</span></div>
                                        <div className="flex items-center"><FontAwesomeIcon icon={faUsers} className="w-4 mr-3 text-gray-400" />Occupancy: <span className="font-semibold text-primary dark:text-white ml-1">{product.occupancy || 'N/A'}</span></div>
                                        <div className="flex items-center"><FontAwesomeIcon icon={faRoute} className="w-4 mr-3 text-gray-400" />Distance: <span className="font-semibold text-primary dark:text-white ml-1">{product.distance} km from college</span></div>
                                        <div className="flex items-center"><FontAwesomeIcon icon={faShieldAlt} className="w-4 mr-3 text-gray-400" />Deposit: <span className="font-semibold text-primary dark:text-white ml-1">₹{product.deposit ? product.deposit.toLocaleString() : 'N/A'}</span></div>
                                        <div className="flex items-center"><FontAwesomeIcon icon={faUtensils} className="w-4 mr-3 text-gray-400" /><span className="font-semibold text-primary dark:text-white ml-1">{product.feesIncludeMess ? 'Mess Fees Included' : 'Mess Fees Not Included'}</span></div>
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 gap-3 mt-6">
                                {type === 'note' ? (
                                    <div className="space-y-3">
                                        {hasPurchased ? (
                                            /* Show Download Buttons After Purchase */
                                            <div className="space-y-2">
                                                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-3">
                                                    <div className="flex items-center">
                                                        <FontAwesomeIcon icon={faCheckCircle} className="mr-2" />
                                                        <span className="font-semibold">Purchase Complete!</span>
                                                    </div>
                                                    <p className="text-sm mt-1">You can now download your notes.</p>
                                                </div>
                                                
                                                {/* Multiple PDF downloads if pdf_urls array exists */}
                                                {product.pdf_urls && Array.isArray(product.pdf_urls) && product.pdf_urls.length > 0 ? (
                                                    product.pdf_urls.map((pdfObj, index) => (
                                                        <button 
                                                            key={index}
                                                            onClick={() => handleDownload(pdfObj, `${product.title}_${index + 1}`)}
                                                            className="w-full bg-gradient-to-r from-slate-800 via-slate-700 to-emerald-600 text-white font-bold py-3 px-4 rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-200 flex items-center justify-center"
                                                        >
                                                            <FontAwesomeIcon icon={faDownload} className="mr-3" />
                                                            Download PDF {product.pdf_urls.length > 1 ? `(${index + 1}/${product.pdf_urls.length})` : ''}
                                                        </button>
                                                    ))
                                                ) : product.pdf_url ? (
                                                    /* Fallback to single PDF */
                                                    <button 
                                                        onClick={() => handleDownload(product.pdf_url, product.title)}
                                                        className="w-full bg-gradient-to-r from-slate-800 via-slate-700 to-emerald-600 text-white font-bold py-3 px-4 rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-200 flex items-center justify-center"
                                                    >
                                                        <FontAwesomeIcon icon={faDownload} className="mr-3" />
                                                        Download PDF
                                                    </button>
                                                ) : (
                                                    /* No PDF available */
                                                    <div className="w-full bg-gray-300 text-gray-600 font-bold py-3 px-4 rounded-lg flex items-center justify-center cursor-not-allowed">
                                                        <FontAwesomeIcon icon={faDownload} className="mr-3" />
                                                        No PDF Available
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            /* Show Buy Now Button Before Purchase */
                                            <button 
                                                onClick={handleBuyNow}
                                                disabled={purchaseLoading}
                                                className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold py-3 px-4 rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <FontAwesomeIcon icon={faCreditCard} className="mr-3" />
                                                {purchaseLoading ? 'Processing...' : `💳 Buy Now - ₹${product.price}`}
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {/* Contact Seller Button for Physical Products */}
                                        {seller?.phone ? (
                                            <a href={`https://wa.me/${getWhatsAppNumber(seller.phone)}?text=Hi%20there!%20I%20came%20across%20your%20listing%20for%20'${encodeURIComponent(product.title)}'%20on%20StudXchange%20and%20I'm%20very%20interested%20in%20purchasing%20it.%20%0A%0ACould%20you%20please%20provide%20more%20details%20about:%20%0A-%20Current%20condition%20of%20the%20item%20%0A-%20Availability%20for%20viewing/pickup%20%0A-%20Any%20accessories%20or%20additional%20items%20included%20%0A-%20Preferred%20payment%20method%20%0A%0AProduct%20Link:%20${encodeURIComponent(window.location.href)}%20%0A%0AThank%20you%20for%20your%20time%20and%20looking%20forward%20to%20hearing%20from%20you!`} target="_blank" rel="noopener noreferrer" className="w-full bg-green-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center">
                                                <FontAwesomeIcon icon={faWhatsapp} className="mr-3" size="lg" />
                                                Contact Seller
                                            </a>
                                        ) : (
                                            <button disabled title="Seller has not provided a contact number" className="w-full bg-gray-400 text-white font-bold py-3 px-4 rounded-lg cursor-not-allowed flex items-center justify-center">
                                                <FontAwesomeIcon icon={faWhatsapp} className="mr-3" size="lg" />
                                                Contact Seller
                                            </button>
                                        )}
                                    </div>
                                )}
                                <button onClick={handleShowSellerInfo} className="w-full bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center">
                                    <FontAwesomeIcon icon={faInfoCircle} className="mr-3" />
                                    Seller Info
                                </button>
                                {type === 'room' && parsedLocation && parsedLocation.lat && parsedLocation.lng && (
                                    <button onClick={handleGetDirections} className="w-full bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center">
                                        <FontAwesomeIcon icon={faDirections} className="mr-3" />
                                        Get Directions
                                    </button>
                                )}
                                {type !== 'note' && (
                                    <button onClick={handleCompareClick} className="w-full bg-gray-200 dark:bg-gray-700 text-primary dark:text-white font-bold py-3 px-4 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center justify-center">
                                        <FontAwesomeIcon icon={faBalanceScale} className="mr-3" />
                                        Compare
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mt-8">
                    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 ${type === 'note' ? 'lg:col-span-5' : 'lg:col-span-3'}`}>
                        <h2 className="text-2xl font-bold text-primary dark:text-white mb-4">Description</h2>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{product.description}</p>

                        {type === 'room' && product.amenities && product.amenities.length > 0 && (
                            <div className="mt-8 border-t dark:border-gray-700 pt-6">
                                <h3 className="text-xl font-bold text-primary dark:text-white mb-4">Amenities</h3>
                                <ul className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {product.amenities.map(amenity => (
                                        <li key={amenity} className="flex items-center text-gray-700 dark:text-gray-300">
                                            <FontAwesomeIcon icon={getAmenityIcon(amenity)} className="w-5 h-5 mr-3 text-green-500" />
                                            <span>{amenity}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    {type !== 'note' && (
                        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
                            <div className="flex items-center justify-between mb-4 px-4">
                                <h3 className="text-xl font-bold text-primary dark:text-white">Location</h3>
                                {type === 'room' && parsedLocation && parsedLocation.lat && parsedLocation.lng && (
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
                                {parsedLocation ? <MapDisplay location={parsedLocation} /> : <div className='text-center p-10 text-gray-500 dark:text-gray-400'>Location not provided.</div>}
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

            {/* Payment Modal - Only for Notes */}
            {type === 'note' && (
                <PaymentModal
                    listing={{ ...product, type }}
                    isOpen={isPaymentModalOpen}
                    onClose={() => {
                        setIsPaymentModalOpen(false);
                        setPurchaseLoading(false);
                    }}
                    onPaymentSuccess={handlePaymentSuccess}
                />
            )}
        </div>
    );
}
