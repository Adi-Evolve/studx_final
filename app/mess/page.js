import { Suspense } from 'react';
import Link from 'next/link';
import { fetchMessServices } from './actions';
import LayoutWithSidebar from '@/components/LayoutWithSidebar';

// Loading component
function MessListSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="bg-gray-200 dark:bg-gray-700 rounded-lg h-64 mb-4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
      ))}
    </div>
  );
}

// Mess Card Component - Redesigned with modern UI
function MessCard({ mess }) {
  const firstImage = mess.images && mess.images.length > 0 ? mess.images[0] : null;
  const foodCount = mess.available_foods ? mess.available_foods.length : 0;
  const rating = mess.rating || 4.5; // Default rating if not available
  
  return (
    <Link href={`/mess/${mess.id}`} className="group">
      <div className="bg-gradient-to-br from-gray-800 via-gray-900 to-black dark:bg-gradient-to-br dark:from-gray-900 dark:via-black dark:to-gray-800 rounded-2xl shadow-lg dark:shadow-2xl overflow-hidden hover:shadow-2xl dark:hover:shadow-orange-500/20 transition-all duration-500 transform hover:-translate-y-2 border border-gray-700 dark:border-gray-600 hover:border-orange-500 dark:hover:border-orange-500">
        
        {/* Mess Image with Overlay */}
        <div className="relative h-56 bg-gradient-to-br from-orange-400 via-yellow-400 to-red-400 dark:from-orange-600 dark:via-yellow-600 dark:to-red-600 overflow-hidden">
          {firstImage ? (
            <>
              <img 
                src={firstImage} 
                alt={mess.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              {/* Gradient Overlay for better text visibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-100 to-yellow-100 dark:from-gray-700 dark:to-gray-600">
              <div className="text-8xl opacity-50 transform group-hover:scale-110 transition-transform duration-500">
                🍽️
              </div>
            </div>
          )}
          
          {/* Badges Container */}
          <div className="absolute top-3 left-0 right-0 px-3 flex items-start justify-between">
            {/* Verified Badge */}
            {mess.is_owner_verified && (
              <span className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-xl flex items-center gap-1 backdrop-blur-sm">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                Verified
              </span>
            )}
            
            {/* Food Count Badge */}
            {foodCount > 0 && (
              <span className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm text-orange-600 dark:text-orange-400 px-3 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                � {foodCount} Items
              </span>
            )}
          </div>

          {/* Rating Badge - Bottom Left */}
          <div className="absolute bottom-3 left-3">
            <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md px-3 py-1.5 rounded-full shadow-xl flex items-center gap-1">
              <span className="text-yellow-500 text-sm">⭐</span>
              <span className="text-sm font-bold text-gray-900 dark:text-white">{rating.toFixed(1)}</span>
            </div>
          </div>
        </div>

        {/* Mess Info Section */}
        <div className="p-5">
          
          {/* Title */}
          <h3 className="font-bold text-white dark:text-white mb-3 text-xl line-clamp-1 group-hover:text-orange-400 dark:group-hover:text-orange-400 transition-colors">
            {mess.name}
          </h3>

          {/* Description */}
          <p className="text-sm text-gray-200 dark:text-gray-200 mb-4 line-clamp-2 leading-relaxed">
            {mess.description || 'Delicious homemade food prepared with love for students'}
          </p>

          {/* Location and Hostel Info */}
          <div className="space-y-2 mb-4">
            {mess.location && (
              <div className="flex items-center text-sm text-gray-200 dark:text-gray-200 group/location hover:text-orange-300 dark:hover:text-orange-300 transition-colors">
                <span className="mr-2 text-base">📍</span>
                <span className="line-clamp-1">{mess.location}</span>
              </div>
            )}
            {mess.hostel_name && (
              <div className="flex items-center text-sm text-gray-200 dark:text-gray-200">
                <span className="mr-2 text-base">🏠</span>
                <span className="line-clamp-1">{mess.hostel_name}</span>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="border-t border-gray-300 dark:border-gray-600 my-4"></div>

          {/* Contact Info - More compact */}
          <div className="space-y-2">
            {mess.contact_phone && (
              <div className="flex items-center text-sm text-white dark:text-white">
                <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mr-3">
                  <span className="text-base">📞</span>
                </div>
                <span className="font-medium">{mess.contact_phone}</span>
              </div>
            )}
            {mess.contact_email && (
              <div className="flex items-center text-sm text-white dark:text-white">
                <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mr-3">
                  <span className="text-base">📧</span>
                </div>
                <span className="font-medium truncate">{mess.contact_email}</span>
              </div>
            )}
          </div>

          {/* View Details Button */}
          <div className="mt-5 pt-4 border-t border-gray-300 dark:border-gray-600">
            <div className="flex items-center justify-between text-sm font-semibold text-orange-300 dark:text-orange-300 group-hover:text-orange-200 dark:group-hover:text-orange-200 transition-colors">
              <span>View Menu & Details</span>
              <svg className="w-5 h-5 transform group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

// Main Mess Services Component
async function MessServicesContent() {
  const { mess, error } = await fetchMessServices();

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">😕</div>
        <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">
          Error Loading Mess Services
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-6">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (mess.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🍽️</div>
        <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">
          No Mess Services Yet
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          Be the first to register your mess service!
        </p>
        <Link
          href="/profile"
          className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition-colors inline-flex items-center"
        >
          <span className="mr-2">🍽️</span>
          Register Your Mess
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {mess.map((messService) => (
        <MessCard key={messService.id} mess={messService} />
      ))}
    </div>
  );
}

// Main Page Component
export default function MessPage() {
  return (
    <LayoutWithSidebar>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          
          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <span className="text-6xl mr-3">🍽️</span>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-white">
                Mess Services
              </h1>
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Find homemade food services in your area
            </p>
          </div>

          {/* Mess Services Grid */}
          <Suspense fallback={<MessListSkeleton />}>
            <MessServicesContent />
          </Suspense>

        </div>
      </div>
    </LayoutWithSidebar>
  );
}

export const metadata = {
  title: 'Mess Services - StudXchange',
  description: 'Find verified mess services and delicious homemade food near your campus.',
};