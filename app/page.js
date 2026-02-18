import { Suspense } from 'react';
import Script from 'next/script';
import FunnyAdvertisingBanner from '@/components/FunnyAdvertisingBanner';
import FeaturedSlider from '@/components/FeaturedSlider';
import NewestProductsSlider from '@/components/NewestProductsSlider';
import NewestProductsSection from '@/components/NewestProductsSection';
import FlatsRoomsSlider from '@/components/FlatsRoomsSlider';
import HowItWorks from '@/components/HowItWorks';
import LayoutWithSidebar from '@/components/LayoutWithSidebar';
// import LocationPermissionBanner from '@/components/LocationPermissionBanner'; // TODO: Re-enable location features later
import {
  fetchSponsoredListings,
  fetchNewestProducts,
  fetchNewestProductsWithLocation,
  fetchListings,
  fetchFlatsAndHostels,
} from './actions';
import Link from 'next/link';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Loading components
function SectionSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-6"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-gray-200 dark:bg-gray-700 rounded-lg h-64"></div>
        ))}
      </div>
    </div>
  );
}

// Featured Items Section Component
async function FeaturedItemsSection() {
  // Import the sponsorship manager dynamically to avoid issues with server components
  const { sponsorshipManager } = await import('@/lib/sponsorship');

  try {
    // Get all sponsored items from the new system
    const sponsoredItems = await sponsorshipManager.getAllSponsoredItems();

    // Fallback to old system if new system returns no items
    if (!sponsoredItems || sponsoredItems.length === 0) {
      const featuredItems = await fetchSponsoredListings();
      return <FeaturedSlider featuredItems={featuredItems} />;
    }

    // Format sponsored items for the FeaturedSlider component
    const formattedItems = sponsoredItems.map(item => ({
      ...item,
      is_sponsored: true,
      isFeatured: true
    }));

    return <FeaturedSlider featuredItems={formattedItems} />;
  } catch (error) {
    // console.error('Error loading sponsored items:', error);
    // Fallback to old system
    const featuredItems = await fetchSponsoredListings();
    return <FeaturedSlider featuredItems={featuredItems} />;
  }
}

// Newest Products Section Component
async function NewestProductsSectionWrapper() {
  const newestProducts = await fetchNewestProducts(30); // Increased limit to show more notes/products/rooms

  return <NewestProductsSection initialProducts={newestProducts} />;
}

// Flats, Hostels & Rooms Section Component
async function FlatsHostelsSection() {
  try {
    const { data: roomItems, error } = await fetchFlatsAndHostels(12);

    if (error) {
      return (
        <div className="text-center py-12 bg-red-50 dark:bg-red-900/30 rounded-lg">
          <div className="text-6xl mb-4">❌</div>
          <h3 className="text-xl font-bold text-red-700 dark:text-red-300 mb-2">Error Loading Listings</h3>
          <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
        </div>
      );
    }

    if (!roomItems || roomItems.length === 0) {
      return (
        <section className="mb-16 px-4">
          <div className="flex justify-between items-center mb-6 sm:mb-8">
            <div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 dark:text-white flex items-center">
                🏠 Flats, Hostels & Rooms
              </h2>
              <p className="text-xs sm:text-sm lg:text-base text-gray-600 dark:text-gray-300 mt-1 sm:mt-2">
                Find your perfect accommodation near campus
              </p>
            </div>
          </div>
          <div className="text-center py-12 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
            <div className="text-6xl mb-4">🏠</div>
            <h3 className="text-xl font-bold text-blue-700 dark:text-blue-300 mb-2">No Listings Yet</h3>
            <p className="text-blue-600 dark:text-blue-400 mb-6">Be the first to list your flat or hostel!</p>
            <Link
              href="/sell"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              List Your Property
            </Link>
          </div>
        </section>
      );
    }

    return (
      <section className="mb-16 px-4">
        <div className="flex justify-between items-center mb-6 sm:mb-8">
          <div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 dark:text-white flex items-center">
              🏠 Flats, Hostels & Rooms
            </h2>
            <p className="text-xs sm:text-sm lg:text-base text-gray-600 dark:text-gray-300 mt-1 sm:mt-2">
              Find your perfect accommodation near campus
            </p>
          </div>
          <Link
            href="/search?type=room"
            className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors flex items-center gap-1"
          >
            View All
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        <FlatsRoomsSlider items={roomItems} />
      </section>
    );
  } catch (error) {
    console.error('Error fetching flats/hostels:', error);
    return (
      <section className="mb-16">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🏠</div>
          <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">Accommodation</h3>
          <p className="text-gray-500 dark:text-gray-400">Unable to load accommodation listings at the moment.</p>
        </div>
      </section>
    );
  }
}

// Explore Listings Section Component
async function ExploreListingsSection() {
  const initialListings = await fetchListings({ page: 1, limit: 8 });

  return (
    <section className="mb-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-4">
          🔍 Explore Listings
        </h2>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Discover amazing deals from students in your college and nearby campuses.
        </p>
      </div>

      {initialListings.listings && initialListings.listings.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
            {initialListings.listings.map((item, index) => {
              // Determine the correct URL based on item type
              const getItemUrl = (item) => {
                if (item.type === 'room') return `/products/rooms/${item.id}`;
                if (item.type === 'note') return `/products/notes/${item.id}`;
                if (item.type === 'rental') return `/products/rentals/${item.id}`;
                if (item.type === 'arduino_kit') return `/products/arduino/${item.id}`;
                return `/products/regular/${item.id}`;
              };

              return (
                <Link
                  key={`${item.type}-${item.id}-${index}`}
                  href={getItemUrl(item)}
                  className="transform hover:scale-105 transition-transform duration-200 cursor-pointer"
                >
                  <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-700 overflow-hidden hover:shadow-xl dark:hover:shadow-gray-600 transition-shadow border dark:border-gray-700 ${item.type === 'rental' ? 'ring-2 ring-purple-200 dark:ring-purple-600 shadow-purple-100' : ''
                    }`}>
                    <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center relative">
                      {item.images && item.images[0] ? (
                        <img
                          src={item.images[0]}
                          alt={item.title || item.name || item.hostel_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-4xl text-gray-400 dark:text-gray-500">
                          {item.type === 'room' ? '🏠' :
                            item.type === 'note' ? '📚' :
                              item.type === 'rental' ? '🔄' :
                                item.type === 'arduino_kit' ? '⚡' : '📦'}
                        </div>
                      )}
                      {item.type === 'rental' && (
                        <div className="absolute top-2 right-2">
                          <span className="bg-purple-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg">
                            FOR RENT
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full flex items-center gap-1 ${item.type === 'room' ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' :
                            item.type === 'note' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' :
                              item.type === 'rental' ? 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 border-2 border-purple-300 dark:border-purple-600' :
                                item.type === 'arduino_kit' ? 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200' :
                                  'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200'
                          }`}>
                          {item.type === 'room' ? (
                            <>🏠 Room</>
                          ) : item.type === 'note' ? (
                            <>📚 Notes</>
                          ) : item.type === 'rental' ? (
                            <>🔄 Rental</>
                          ) : item.type === 'arduino_kit' ? (
                            <>⚡ Arduino Kit</>
                          ) : (
                            <>📦 Product</>
                          )}
                        </span>
                        {item.type === 'rental' && (
                          <span className="text-xs bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 px-2 py-1 rounded-full font-bold border border-orange-300 dark:border-orange-600">
                            NEW
                          </span>
                        )}
                      </div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2">
                        {item.title || item.name || item.hostel_name || 'Untitled'}
                      </h3>
                      <div className="flex items-center justify-between">
                        <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                          ₹{(item.price || item.rental_price || item.fees || 0).toLocaleString()}
                          {item.type === 'room' && `/${(item.duration || 'monthly').toLowerCase()}`}
                          {item.type === 'rental' && (
                            <span className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                              /{item.rental_duration || 'day'}
                            </span>
                          )}
                        </p>
                        {item.type === 'rental' && item.condition && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {item.condition}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="text-center">
            <Link
              href="/search"
              className="bg-gray-800 dark:bg-gray-700 text-white px-8 py-3 rounded-lg font-bold hover:bg-gray-900 dark:hover:bg-gray-600 transition-colors inline-flex items-center"
            >
              View All Listings
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📭</div>
          <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">No Listings Yet</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">Be the first to post something amazing!</p>
          <Link
            href="/sell"
            className="bg-blue-600 dark:bg-blue-700 text-white px-6 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors"
          >
            Start Selling
          </Link>
        </div>
      )}
    </section>
  );
}

export default async function HomePage() {
  return (
    <LayoutWithSidebar>
      {/* Hero Banner - Positioned immediately below navbar with no gap */}
      <div className="relative -mt-0">
        <FunnyAdvertisingBanner />
      </div>

      {/* Main content container */}
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Location Permission Banner */}
          {/* <LocationPermissionBanner /> */} {/* TODO: Re-enable location features later */}

          {/* Newest Products Section */}
          <div className="mb-16">
            <Suspense fallback={<SectionSkeleton />}>
              <NewestProductsSectionWrapper />
            </Suspense>
          </div>

          {/* Flats, Hostels & Rooms Section */}
          <div className="mb-16">
            <Suspense fallback={<SectionSkeleton />}>
              <FlatsHostelsSection />
            </Suspense>
          </div>

          {/* Explore Listings Section */}
          <div className="mb-16">
            <Suspense fallback={<SectionSkeleton />}>
              <ExploreListingsSection />
            </Suspense>
          </div>
        </div>
      </div>
    </LayoutWithSidebar>
  );
}
