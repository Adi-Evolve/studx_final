import { Suspense } from 'react';
import FunnyAdvertisingBanner from '@/components/FunnyAdvertisingBanner';
import NewestProductsSlider from '@/components/NewestProductsSlider';
import FeaturedSlider from '@/components/FeaturedSlider';
import { 
  fetchSponsoredListings, 
  fetchNewestProducts,
  fetchListings
} from '@/app/actions';
import Link from 'next/link';

// Loading components
function SectionSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-gray-200 rounded-lg h-64"></div>
        ))}
      </div>
    </div>
  );
}

// Newest Products Section Component
async function NewestProductsSection() {
  const newestProducts = await fetchNewestProducts(12); // Get 12 items for slider
  
  return <NewestProductsSlider newestProducts={newestProducts} />;
}

// Featured Items Section Component
async function FeaturedItemsSection() {
  const featuredItems = await fetchSponsoredListings();
  
  if (!featuredItems || featuredItems.length === 0) {
    return (
      <section className="mb-16">
        <h2 className="text-3xl font-bold text-gray-800 mb-8 flex items-center">
          ⭐ Featured Items
        </h2>
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🌟</div>
          <h3 className="text-xl font-bold text-gray-700 mb-2">No Featured Items Yet</h3>
          <p className="text-gray-500">Check back soon for amazing featured products!</p>
        </div>
      </section>
    );
  }

  return (
    <section className="mb-16">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 flex items-center">
            ⭐ Featured Items
          </h2>
          <p className="text-gray-600 mt-2">Hand-picked premium listings from our community</p>
        </div>
      </div>
      <FeaturedSlider listings={featuredItems} />
    </section>
  );
}

// Categories Section Component
function CategoriesSection() {
  return (
    <section className="mb-16">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          🏷️ Browse Categories
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Find exactly what you need in our organized categories
        </p>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
        <Link href="/category/Laptop" className="group">
          <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105 p-4 md:p-6 text-center border-2 border-transparent hover:border-emerald-200">
            <div className="text-3xl md:text-4xl mb-2 group-hover:scale-110 transition-transform duration-300">💻</div>
            <h3 className="font-semibold text-slate-800 text-sm md:text-base group-hover:text-emerald-600 transition-colors">Laptops</h3>
          </div>
        </Link>
        
        <Link href="/category/Textbook" className="group">
          <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105 p-4 md:p-6 text-center border-2 border-transparent hover:border-emerald-200">
            <div className="text-3xl md:text-4xl mb-2 group-hover:scale-110 transition-transform duration-300">📚</div>
            <h3 className="font-semibold text-slate-800 text-sm md:text-base group-hover:text-emerald-600 transition-colors">Textbooks</h3>
          </div>
        </Link>
        
        <Link href="/category/Electronics" className="group">
          <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105 p-4 md:p-6 text-center border-2 border-transparent hover:border-emerald-200">
            <div className="text-3xl md:text-4xl mb-2 group-hover:scale-110 transition-transform duration-300">🔌</div>
            <h3 className="font-semibold text-slate-800 text-sm md:text-base group-hover:text-emerald-600 transition-colors">Electronics</h3>
          </div>
        </Link>
        
        <Link href="/category/Bike" className="group">
          <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105 p-4 md:p-6 text-center border-2 border-transparent hover:border-emerald-200">
            <div className="text-3xl md:text-4xl mb-2 group-hover:scale-110 transition-transform duration-300">🚲</div>
            <h3 className="font-semibold text-slate-800 text-sm md:text-base group-hover:text-emerald-600 transition-colors">Bikes</h3>
          </div>
        </Link>
        
        <Link href="/category/Notes" className="group">
          <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105 p-4 md:p-6 text-center border-2 border-transparent hover:border-emerald-200">
            <div className="text-3xl md:text-4xl mb-2 group-hover:scale-110 transition-transform duration-300">📝</div>
            <h3 className="font-semibold text-slate-800 text-sm md:text-base group-hover:text-emerald-600 transition-colors">Notes</h3>
          </div>
        </Link>
        
        <Link href="/category/Rooms" className="group">
          <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105 p-4 md:p-6 text-center border-2 border-transparent hover:border-emerald-200">
            <div className="text-3xl md:text-4xl mb-2 group-hover:scale-110 transition-transform duration-300">🏠</div>
            <h3 className="font-semibold text-slate-800 text-sm md:text-base group-hover:text-emerald-600 transition-colors">Rooms</h3>
          </div>
        </Link>
        
        <Link href="/category/Furniture" className="group">
          <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105 p-4 md:p-6 text-center border-2 border-transparent hover:border-emerald-200">
            <div className="text-3xl md:text-4xl mb-2 group-hover:scale-110 transition-transform duration-300">🪑</div>
            <h3 className="font-semibold text-slate-800 text-sm md:text-base group-hover:text-emerald-600 transition-colors">Furniture</h3>
          </div>
        </Link>
        
        <Link href="/category/Dorm" className="group">
          <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105 p-4 md:p-6 text-center border-2 border-transparent hover:border-emerald-200">
            <div className="text-3xl md:text-4xl mb-2 group-hover:scale-110 transition-transform duration-300">🎒</div>
            <h3 className="font-semibold text-slate-800 text-sm md:text-base group-hover:text-emerald-600 transition-colors">Dorm Items</h3>
          </div>
        </Link>
        
        <Link href="/category/Other" className="group">
          <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105 p-4 md:p-6 text-center border-2 border-transparent hover:border-emerald-200">
            <div className="text-3xl md:text-4xl mb-2 group-hover:scale-110 transition-transform duration-300">📦</div>
            <h3 className="font-semibold text-slate-800 text-sm md:text-base group-hover:text-emerald-600 transition-colors">Other</h3>
          </div>
        </Link>
      </div>
    </section>
  );
}

// How It Works Section Component
function HowItWorksSection() {
  return (
    <section className="mb-12 bg-gradient-to-r from-slate-50 to-emerald-50 rounded-2xl p-4 md:p-8 border border-emerald-100">
      <div className="text-center mb-6 md:mb-12">
        <h2 className="text-2xl md:text-3xl font-bold text-studx-gradient mb-2 md:mb-4">
          🚀 How StudX Works
        </h2>
        <p className="text-sm md:text-base text-slate-600 max-w-2xl mx-auto">
          Getting started is super easy! Follow these simple steps to buy or sell on StudX.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
        <div className="text-center">
          <div className="w-12 h-12 md:w-16 md:h-16 bg-studx-gradient rounded-full flex items-center justify-center mx-auto mb-2 md:mb-4 shadow-lg">
            <span className="text-lg md:text-2xl text-white">📝</span>
          </div>
          <h3 className="text-lg md:text-xl font-bold text-slate-800 mb-1 md:mb-2">1. Sign Up</h3>
          <p className="text-sm md:text-base text-slate-600">
            Create your account with your college email. It's quick, free, and secure!
          </p>
        </div>
        
        <div className="text-center">
          <div className="w-12 h-12 md:w-16 md:h-16 bg-studx-gradient rounded-full flex items-center justify-center mx-auto mb-2 md:mb-4 shadow-lg">
            <span className="text-lg md:text-2xl text-white">📱</span>
          </div>
          <h3 className="text-lg md:text-xl font-bold text-slate-800 mb-1 md:mb-2">2. List or Browse</h3>
          <p className="text-sm md:text-base text-slate-600">
            Post your items for sale or browse through thousands of student listings.
          </p>
        </div>
        
        <div className="text-center">
          <div className="w-12 h-12 md:w-16 md:h-16 bg-studx-gradient rounded-full flex items-center justify-center mx-auto mb-2 md:mb-4 shadow-lg">
            <span className="text-lg md:text-2xl text-white">🤝</span>
          </div>
          <h3 className="text-lg md:text-xl font-bold text-slate-800 mb-1 md:mb-2">3. Connect & Deal</h3>
          <p className="text-sm md:text-base text-slate-600">
            Chat with sellers, negotiate prices, and meet up safely on campus.
          </p>
        </div>
      </div>
      
      <div className="text-center mt-6 md:mt-12">
        <Link href="/signup" className="btn-primary btn-lg">
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
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          🔍 Explore Listings
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Discover amazing deals from students in your college and nearby campuses.
        </p>
      </div>
      
      {initialListings.listings && initialListings.listings.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
            {initialListings.listings.map((item, index) => (
              <div key={`${item.type}-${item.id}-${index}`} className="transform hover:scale-105 transition-transform duration-200">
                <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    {item.images && item.images[0] ? (
                      <img 
                        src={item.images[0]} 
                        alt={item.title || item.name || item.hostel_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-4xl text-gray-400">
                        {item.type === 'room' ? '🏠' : item.type === 'note' ? '📚' : '📦'}
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        item.type === 'room' ? 'bg-blue-100 text-blue-800' : 
                        item.type === 'note' ? 'bg-green-100 text-green-800' : 
                        'bg-orange-100 text-orange-800'
                      }`}>
                        {item.type === 'room' ? 'Room' : item.type === 'note' ? 'Notes' : 'Product'}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                      {item.title || item.name || item.hostel_name || 'Untitled'}
                    </h3>
                    <p className="text-lg font-bold text-blue-600">
                      ₹{(item.price || item.fees || 0).toLocaleString()}
                      {item.type === 'room' && '/month'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center">
            <Link
              href="/search"
              className="bg-gray-800 text-white px-8 py-3 rounded-lg font-bold hover:bg-gray-900 transition-colors inline-flex items-center"
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
          <h3 className="text-xl font-bold text-gray-700 mb-2">No Listings Yet</h3>
          <p className="text-gray-500 mb-6">Be the first to post something amazing!</p>
          <Link
            href="/sell"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
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
    <div className="min-h-screen bg-studx-gradient-light">
      {/* Funny Advertising Banner */}
      <FunnyAdvertisingBanner />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Newest Products Section */}
        <Suspense fallback={<SectionSkeleton />}>
          <NewestProductsSection />
        </Suspense>

        {/* Featured Items Section */}
        <Suspense fallback={<SectionSkeleton />}>
          <FeaturedItemsSection />
        </Suspense>

        {/* Categories Section */}
        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-studx-gradient mb-4">
              🏷️ Browse Categories
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Find exactly what you need in our organized categories
            </p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
            <Link href="/category/Laptop" className="group">
              <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105 p-4 md:p-6 text-center border-2 border-transparent hover:border-emerald-200">
                <div className="text-3xl md:text-4xl mb-2 group-hover:scale-110 transition-transform duration-300">💻</div>
                <h3 className="font-semibold text-slate-800 text-sm md:text-base group-hover:text-emerald-600 transition-colors">Laptops</h3>
              </div>
            </Link>
            
            <Link href="/category/Textbook" className="group">
              <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105 p-4 md:p-6 text-center border-2 border-transparent hover:border-emerald-200">
                <div className="text-3xl md:text-4xl mb-2 group-hover:scale-110 transition-transform duration-300">📚</div>
                <h3 className="font-semibold text-slate-800 text-sm md:text-base group-hover:text-emerald-600 transition-colors">Textbooks</h3>
              </div>
            </Link>
            
            <Link href="/category/Electronics" className="group">
              <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105 p-4 md:p-6 text-center border-2 border-transparent hover:border-emerald-200">
                <div className="text-3xl md:text-4xl mb-2 group-hover:scale-110 transition-transform duration-300">🔌</div>
                <h3 className="font-semibold text-slate-800 text-sm md:text-base group-hover:text-emerald-600 transition-colors">Electronics</h3>
              </div>
            </Link>
            
            <Link href="/category/Bike" className="group">
              <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105 p-4 md:p-6 text-center border-2 border-transparent hover:border-emerald-200">
                <div className="text-3xl md:text-4xl mb-2 group-hover:scale-110 transition-transform duration-300">🚲</div>
                <h3 className="font-semibold text-slate-800 text-sm md:text-base group-hover:text-emerald-600 transition-colors">Bikes</h3>
              </div>
            </Link>
            
            <Link href="/category/Notes" className="group">
              <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105 p-4 md:p-6 text-center border-2 border-transparent hover:border-emerald-200">
                <div className="text-3xl md:text-4xl mb-2 group-hover:scale-110 transition-transform duration-300">📝</div>
                <h3 className="font-semibold text-slate-800 text-sm md:text-base group-hover:text-emerald-600 transition-colors">Notes</h3>
              </div>
            </Link>
            
            <Link href="/category/Rooms" className="group">
              <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105 p-4 md:p-6 text-center border-2 border-transparent hover:border-emerald-200">
                <div className="text-3xl md:text-4xl mb-2 group-hover:scale-110 transition-transform duration-300">🏠</div>
                <h3 className="font-semibold text-slate-800 text-sm md:text-base group-hover:text-emerald-600 transition-colors">Rooms</h3>
              </div>
            </Link>
            
            <Link href="/category/Furniture" className="group">
              <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105 p-4 md:p-6 text-center border-2 border-transparent hover:border-emerald-200">
                <div className="text-3xl md:text-4xl mb-2 group-hover:scale-110 transition-transform duration-300">🪑</div>
                <h3 className="font-semibold text-slate-800 text-sm md:text-base group-hover:text-emerald-600 transition-colors">Furniture</h3>
              </div>
            </Link>
            
            <Link href="/category/Dorm" className="group">
              <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105 p-4 md:p-6 text-center border-2 border-transparent hover:border-emerald-200">
                <div className="text-3xl md:text-4xl mb-2 group-hover:scale-110 transition-transform duration-300">🎒</div>
                <h3 className="font-semibold text-slate-800 text-sm md:text-base group-hover:text-emerald-600 transition-colors">Dorm Items</h3>
              </div>
            </Link>
            
            <Link href="/category/Other" className="group">
              <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105 p-4 md:p-6 text-center border-2 border-transparent hover:border-emerald-200">
                <div className="text-3xl md:text-4xl mb-2 group-hover:scale-110 transition-transform duration-300">📦</div>
                <h3 className="font-semibold text-slate-800 text-sm md:text-base group-hover:text-emerald-600 transition-colors">Other</h3>
              </div>
            </Link>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="mb-12 bg-gradient-to-r from-slate-50 to-emerald-50 rounded-2xl p-4 md:p-8 border border-emerald-100">
          <div className="text-center mb-6 md:mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-studx-gradient mb-2 md:mb-4">
              🚀 How StudX Works
            </h2>
            <p className="text-sm md:text-base text-slate-600 max-w-2xl mx-auto">
              Getting started is super easy! Follow these simple steps to buy or sell on StudX.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
            <div className="text-center">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-studx-gradient rounded-full flex items-center justify-center mx-auto mb-2 md:mb-4 shadow-lg">
                <span className="text-lg md:text-2xl text-white">📝</span>
              </div>
              <h3 className="text-lg md:text-xl font-bold text-slate-800 mb-1 md:mb-2">1. Sign Up</h3>
              <p className="text-sm md:text-base text-slate-600">
                Create your account with your college email. It's quick, free, and secure!
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-studx-gradient rounded-full flex items-center justify-center mx-auto mb-2 md:mb-4 shadow-lg">
                <span className="text-lg md:text-2xl text-white">📱</span>
              </div>
              <h3 className="text-lg md:text-xl font-bold text-slate-800 mb-1 md:mb-2">2. List or Browse</h3>
              <p className="text-sm md:text-base text-slate-600">
                Post your items for sale or browse through thousands of student listings.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-studx-gradient rounded-full flex items-center justify-center mx-auto mb-2 md:mb-4 shadow-lg">
                <span className="text-lg md:text-2xl text-white">🤝</span>
              </div>
              <h3 className="text-lg md:text-xl font-bold text-slate-800 mb-1 md:mb-2">3. Connect & Deal</h3>
              <p className="text-sm md:text-base text-slate-600">
                Chat with sellers, negotiate prices, and meet up safely on campus.
              </p>
            </div>
          </div>
          
          <div className="text-center mt-6 md:mt-12">
            <Link href="/signup" className="btn-primary btn-lg">
              Get Started Now
              <svg className="w-4 h-4 md:w-5 md:h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </section>

        {/* Explore Listings Section */}
        <Suspense fallback={<SectionSkeleton />}>
          <ExploreListingsSection />
        </Suspense>
      </div>
    </div>
  );
}
