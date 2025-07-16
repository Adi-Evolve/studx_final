import { Suspense } from 'react';
import FunnyAdvertisingBanner from '@/components/FunnyAdvertisingBanner';
import FeaturedSlider from '@/components/FeaturedSlider';
import NewestProductsSlider from '@/components/NewestProductsSlider';
import NewestProductsSection from '@/components/NewestProductsSection';
import HowItWorks from '@/components/HowItWorks';
import CategoryCard from '@/components/CategoryCard';
// import LocationPermissionBanner from '@/components/LocationPermissionBanner'; // TODO: Re-enable location features later
import { 
  fetchSponsoredListings,
  fetchNewestProducts,
  fetchNewestProductsWithLocation,
  fetchListings
} from './actions';
import Link from 'next/link';

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
  const featuredItems = await fetchSponsoredListings();
  
  return <FeaturedSlider featuredItems={featuredItems} />;
}

// Newest Products Section Component
async function NewestProductsSectionWrapper() {
  const newestProducts = await fetchNewestProducts(12); // Get 12 items for slider
  
  return <NewestProductsSection initialProducts={newestProducts} />;
}

// Categories Section Component
function CategoriesSection() {
  return (
    <section className="mb-16">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-4">
          🏷️ Browse Categories
        </h2>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Find exactly what you need in our organized categories
        </p>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
        <CategoryCard href="/category/Laptop" icon="💻" title="Laptops" />
        <CategoryCard href="/category/Textbook" icon="📚" title="Textbooks" />
        <CategoryCard href="/category/Electronics" icon="🔌" title="Electronics" />
        <CategoryCard href="/category/Bike" icon="🚲" title="Bikes" />
        <CategoryCard href="/category/Notes" icon="📝" title="Notes" />
        <CategoryCard href="/category/Rooms" icon="🏠" title="Rooms" />
        <CategoryCard href="/category/Furniture" icon="🪑" title="Furniture" />
        <CategoryCard href="/category/Dorm Equipment" icon="�️" title="Dorm Equipment" />
        <CategoryCard href="/category/Books" icon="📖" title="Books" />
      </div>
    </section>
  );
}

// How It Works Section Component
function HowItWorksSection() {
  return (
    <section className="mb-12 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-800 dark:via-slate-800 dark:to-gray-700 rounded-2xl p-4 md:p-8 transition-colors duration-300 border border-blue-100 dark:border-gray-600">
      <div className="text-center mb-6 md:mb-12">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-2 md:mb-4">
          How StudXchange Works
        </h2>
        <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Getting started is super easy! Follow these simple steps to buy or sell on StudXchange.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
        <div className="text-center">
          <div className="w-12 h-12 md:w-16 md:h-16 bg-blue-500 dark:bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-2 md:mb-4 shadow-lg dark:shadow-blue-500/20">
            <span className="text-lg md:text-2xl text-white font-bold">1</span>
          </div>
          <h3 className="text-lg md:text-xl font-bold text-gray-800 dark:text-white mb-1 md:mb-2">Sign Up</h3>
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-300">
            Create your account with your college email. It's quick, free, and secure!
          </p>
        </div>
        
        <div className="text-center">
          <div className="w-12 h-12 md:w-16 md:h-16 bg-green-500 dark:bg-green-600 rounded-full flex items-center justify-center mx-auto mb-2 md:mb-4 shadow-lg dark:shadow-green-500/20">
            <span className="text-lg md:text-2xl text-white font-bold">2</span>
          </div>
          <h3 className="text-lg md:text-xl font-bold text-gray-800 dark:text-white mb-1 md:mb-2">List or Browse</h3>
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-300">
            Post your items for sale or browse through thousands of student listings.
          </p>
        </div>
        
        <div className="text-center">
          <div className="w-12 h-12 md:w-16 md:h-16 bg-purple-500 dark:bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-2 md:mb-4 shadow-lg dark:shadow-purple-500/20">
            <span className="text-lg md:text-2xl text-white font-bold">3</span>
          </div>
          <h3 className="text-lg md:text-xl font-bold text-gray-800 dark:text-white mb-1 md:mb-2">Connect & Deal</h3>
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-300">
            Chat with sellers, negotiate prices, and meet up safely on campus.
          </p>
        </div>
      </div>
      
      <div className="text-center mt-6 md:mt-12">
        <Link
          href="/signup"
          className="bg-blue-600 dark:bg-blue-700 text-white px-6 md:px-8 py-2 md:py-3 rounded-lg font-bold text-sm md:text-base hover:bg-blue-700 dark:hover:bg-blue-800 transition-all duration-300 inline-flex items-center shadow-lg hover:shadow-xl dark:shadow-blue-500/20 transform hover:scale-105"
        >
          Get Started Now
          <svg className="w-4 h-4 md:w-5 md:h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>
      </div>
    </section>
  );
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
                return `/products/regular/${item.id}`;
              };

              return (
                <Link 
                  key={`${item.type}-${item.id}-${index}`} 
                  href={getItemUrl(item)}
                  className="transform hover:scale-105 transition-transform duration-200 cursor-pointer"
                >
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-700 overflow-hidden hover:shadow-xl dark:hover:shadow-gray-600 transition-shadow border dark:border-gray-700">
                    <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center">
                      {item.images && item.images[0] ? (
                        <img 
                          src={item.images[0]} 
                          alt={item.title || item.name || item.hostel_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-4xl text-gray-400 dark:text-gray-500">
                          {item.type === 'room' ? '🏠' : item.type === 'note' ? '📚' : '📦'}
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          item.type === 'room' ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' : 
                          item.type === 'note' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' : 
                          'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200'
                        }`}>
                          {item.type === 'room' ? 'Room' : item.type === 'note' ? 'Notes' : 'Product'}
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2">
                        {item.title || item.name || item.hostel_name || 'Untitled'}
                      </h3>
                      <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                        ₹{(item.price || item.fees || 0).toLocaleString()}
                        {item.type === 'room' && '/month'}
                      </p>
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      {/* Funny Advertising Banner */}
      <FunnyAdvertisingBanner />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Location Permission Banner */}
        {/* <LocationPermissionBanner /> */} {/* TODO: Re-enable location features later */}

        {/* Newest Products Section */}
        <Suspense fallback={<SectionSkeleton />}>
          <NewestProductsSectionWrapper />
        </Suspense>

        {/* Featured Items Section */}
        <Suspense fallback={<SectionSkeleton />}>
          <FeaturedItemsSection />
        </Suspense>

        {/* Categories Section */}
        <CategoriesSection />

        {/* How It Works Section */}
        <HowItWorksSection />

        {/* Explore Listings Section */}
        <Suspense fallback={<SectionSkeleton />}>
          <ExploreListingsSection />
        </Suspense>
      </div>
    </div>
  );
}
