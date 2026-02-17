'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { faArrowLeft, faMapMarkerAlt, faUser, faCalendarAlt, faInfoCircle, faBalanceScale, faUtensils, faUsers, faWalking, faTag, faDirections, faStar, faStarHalfAlt } from '@fortawesome/free-solid-svg-icons';
import { faStar as faStarEmpty } from '@fortawesome/free-regular-svg-icons';

import MapDisplay from '@/components/MapDisplay';
import ProductImageGallery from '@/components/ProductImageGallery';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

// Star Rating Component
function StarRating({ rating, onRatingChange, readonly = false, size = 'lg' }) {
  const [hoverRating, setHoverRating] = useState(0);
  
  const renderStar = (starNumber) => {
    const filled = starNumber <= (hoverRating || rating);
    const halfFilled = !filled && starNumber - 0.5 <= rating;
    
    return (
      <FontAwesomeIcon
        key={starNumber}
        icon={filled ? faStar : halfFilled ? faStarHalfAlt : faStarEmpty}
        className={`${filled ? 'text-yellow-400' : halfFilled ? 'text-yellow-400' : 'text-gray-300'} 
                   ${readonly ? 'cursor-default' : 'cursor-pointer hover:text-yellow-400'} 
                   transition-colors`}
        size={size}
        onClick={() => !readonly && onRatingChange && onRatingChange(starNumber)}
        onMouseEnter={() => !readonly && setHoverRating(starNumber)}
        onMouseLeave={() => !readonly && setHoverRating(0)}
      />
    );
  };

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(renderStar)}
    </div>
  );
}

// Menu Display Component
function MenuDisplay({ menu, mealType, imageUrl }) {
  if (!menu || !menu.dishes || menu.dishes.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <FontAwesomeIcon icon={faUtensils} size="3x" className="mb-4 text-gray-300 dark:text-gray-600" />
        <p>No menu available for {mealType}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {imageUrl && (
        <div className="mb-4">
          <img 
            src={imageUrl} 
            alt={`${mealType} menu`}
            className="w-full h-48 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
          />
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {menu.dishes.map((dish, index) => (
          <div key={index} className="border border-gray-200 dark:border-gray-600 rounded-lg p-3 bg-gray-50 dark:bg-gray-700">
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-800 dark:text-gray-200">{dish.name || dish}</span>
              {dish.price && (
                <span className="text-green-600 dark:text-green-400 font-semibold">₹{dish.price}</span>
              )}
            </div>
            {dish.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{dish.description}</p>
            )}
            {dish.confidence && (
              <span className="text-xs text-blue-500 dark:text-blue-400">
                {Math.round(dish.confidence * 100)}% match
              </span>
            )}
          </div>
        ))}
      </div>
      
      {menu.detected_at && (
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">
          Menu updated: {new Date(menu.detected_at).toLocaleString()}
        </p>
      )}
    </div>
  );
}

export default function MessPageClient({ mess, seller }) {
  const [parsedLocation, setParsedLocation] = useState(null);
  
  useEffect(() => {
    if (mess.location) {
      try {
        const location = typeof mess.location === 'string' ? JSON.parse(mess.location) : mess.location;
        setParsedLocation(location);
      } catch (error) {
        console.error('Error parsing location:', error);
      }
    }
  }, [mess.location]);

  const formatDate = (dateString) => {
    if (!dateString) return 'Date not available';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch (error) {
      return 'Date not available';
    }
  };

  const getWhatsAppNumber = (phone) => {
    if (!phone) return null;
    const cleaned = phone.replace(/\\D/g, '');
    if (cleaned.length === 10) {
      return `91${cleaned}`;
    }
    if (cleaned.startsWith('91') && cleaned.length === 12) {
      return cleaned;
    }
    return phone;
  };

  const handleGetDirections = () => {
    if (parsedLocation && parsedLocation.lat && parsedLocation.lng) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${parsedLocation.lat},${parsedLocation.lng}`;
      window.open(url, '_blank');
    }
  };

  const formattedDate = formatDate(mess.created_at);
  const whatsAppNumber = getWhatsAppNumber(mess.contact_phone);

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <Link href="/mess" className="text-orange-600 dark:text-orange-400 hover:text-orange-800 dark:hover:text-orange-300 mb-6 inline-flex items-center transition-colors">
          <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
          Back to Mess Listings
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            {/* Handle image display - check multiple possible image sources */}
            {(() => {
              const images = mess.images || [];
              const menuImageUrl = mess.menu_image_url;
              
              if (images.length > 0) {
                return <ProductImageGallery images={images} title={mess.name} />;
              } else if (menuImageUrl) {
                return (
                  <div className="w-full h-96 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                    <img 
                      src={menuImageUrl} 
                      alt={`${mess.name} menu`}
                      className="max-w-full max-h-full object-contain rounded-lg"
                    />
                  </div>
                );
              } else {
                return (
                  <div className="w-full h-96 bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900 dark:to-red-900 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-6xl mb-4">🍽️</div>
                      <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">{mess.name}</h3>
                      <p className="text-gray-500 dark:text-gray-400">No images uploaded yet</p>
                    </div>
                  </div>
                );
              }
            })()
            }
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 sticky top-24">
              <h1 className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2 leading-tight">{mess.name}</h1>
              
              {/* Rating Display */}
              <div className="flex items-center gap-2 mb-4">
                <StarRating rating={mess.average_rating || 0} readonly size="sm" />
                <span className="font-semibold text-gray-800 dark:text-gray-200">{(mess.average_rating || 0).toFixed(1)}</span>
                <span className="text-gray-500 dark:text-gray-400">({mess.total_ratings || 0} reviews)</span>
              </div>

              <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400 border-t border-gray-200 dark:border-gray-600 pt-4 mb-4">
                <div className="flex items-center">
                  <FontAwesomeIcon icon={faCalendarAlt} className="w-4 mr-3 text-gray-400 dark:text-gray-500" /> 
                  Posted on {formattedDate}
                </div>
                {seller && (
                  <div className="flex items-center">
                    <FontAwesomeIcon icon={faUser} className="w-4 mr-3 text-gray-400 dark:text-gray-500" /> 
                    Listed by <span className="font-semibold text-orange-600 dark:text-orange-400 ml-1">{seller.name}</span>
                  </div>
                )}
                <div className="flex items-center">
                  <FontAwesomeIcon icon={faMapMarkerAlt} className="w-4 mr-3 text-gray-400 dark:text-gray-500" /> 
                  Location: <span className="font-semibold text-orange-600 dark:text-orange-400 ml-1">{mess.location_name || 'Location not specified'}</span>
                </div>
                <div className="flex items-center">
                  <FontAwesomeIcon icon={faUtensils} className="w-4 mr-3 text-gray-400 dark:text-gray-500" /> 
                  Meal Type: <span className="font-semibold text-orange-600 dark:text-orange-400 ml-1 capitalize">{mess.menu_meal_type || 'All Meals'}</span>
                </div>
                <div className="flex items-center">
                  <FontAwesomeIcon icon={faUsers} className="w-4 mr-3 text-gray-400 dark:text-gray-500" /> 
                  Capacity: <span className="font-semibold text-orange-600 dark:text-orange-400 ml-1">{mess.capacity || 'Not specified'}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 mt-6">
                {whatsAppNumber && (
                  <a 
                    href={`https://wa.me/${whatsAppNumber}?text=🍽️%20*Mess%20Inquiry%20-%20StudXchange*%20🍽️%0A%0AHello!%20Hope%20you're%20doing%20well!%20✨%0A%0AI%20came%20across%20your%20mess%20listing%20*"${encodeURIComponent(mess.name)}"*%20on%20StudXchange%20and%20I'm%20interested%20in%20the%20meal%20services.%0A%0A📋%20*Quick%20Details:*%0A•%20Mess:%20${encodeURIComponent(mess.name)}%0A•%20Location:%20${encodeURIComponent(mess.location_name || 'Not specified')}%0A•%20Rating:%20${(mess.average_rating || 0).toFixed(1)}⭐%20(${mess.total_ratings || 0}%20reviews)%0A%0A❓%20*Could%20you%20please%20help%20me%20with:*%0A%0A🍽️%20**Meal%20Plans%20&%20Menu**%0A•%20Available%20meal%20plans%20and%20pricing?%0A•%20Daily%20menu%20and%20meal%20timings?%0A•%20Vegetarian/Non-vegetarian%20options?%0A•%20Special%20dietary%20requirements%20accommodation?%0A%0A💰%20**Pricing%20&%20Payment**%0A•%20Monthly/weekly%20meal%20plan%20rates?%0A•%20Security%20deposit%20or%20advance%20payment?%0A•%20Payment%20schedule%20and%20methods?%0A%0A📋%20**Registration%20&%20Rules**%0A•%20Registration%20process%20and%20documents%20needed?%0A•%20Meal%20timings%20and%20booking%20procedure?%0A•%20Cancellation%20and%20leave%20policies?%0A%0A📱%20*Mess%20Link:*%20${encodeURIComponent(window.location.href)}%0A%0AI'm%20looking%20for%20reliable%20and%20quality%20meal%20services.%20Would%20love%20to%20discuss%20further!%20😊%0A%0AThank%20you!%20🙏`}
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="w-full bg-green-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center"
                  >
                    <FontAwesomeIcon icon={faWhatsapp} className="mr-3" size="lg" />
                    Contact Mess Owner
                  </a>
                )}
                
                <button 
                  onClick={handleGetDirections} 
                  className="w-full bg-red-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center"
                >
                  <FontAwesomeIcon icon={faDirections} className="mr-3" />
                  Get Directions
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mt-8">
          {/* Menu & AI Creator Section */}
          <div className="lg:col-span-3 bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-orange-600 dark:text-orange-400 mb-4">Current Menu</h2>
            
            {/* Current Menu Display */}
            {(() => {
              // Use available_foods as the primary menu source
              const menuData = mess.available_foods;
              
              if (menuData && Array.isArray(menuData) && menuData.length > 0) {
                const formattedMenu = {
                  dishes: menuData
                };
                
                return (
                  <MenuDisplay 
                    menu={formattedMenu} 
                    mealType={mess.menu_meal_type || 'Available Items'} 
                    imageUrl={mess.menu_image_url}
                  />
                );
              } else {
                return (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <FontAwesomeIcon icon={faUtensils} size="3x" className="mb-4 text-gray-300 dark:text-gray-600" />
                    <p>No menu uploaded yet</p>
                    <p className="text-sm mt-2">Menu can be added by the mess owner from their portal</p>
                  </div>
                );
              }
            })()}
          </div>

          {/* Location Section */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between mb-4 px-4">
              <h3 className="text-xl font-bold text-orange-600 dark:text-orange-400">Location</h3>
              {parsedLocation && parsedLocation.lat && parsedLocation.lng && (
                <button 
                  onClick={handleGetDirections} 
                  className="bg-red-500 dark:bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-600 dark:hover:bg-red-500 transition-colors flex items-center text-sm font-medium"
                  title="Open in Google Maps"
                >
                  <FontAwesomeIcon icon={faDirections} className="mr-2" />
                  Directions
                </button>
              )}
            </div>
            <div className="h-80 rounded-lg overflow-hidden">
              {parsedLocation ? (
                <MapDisplay location={parsedLocation} popupText={mess.name} />
              ) : (
                <div className='text-center p-10 text-gray-500 dark:text-gray-400'>Location not provided.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}