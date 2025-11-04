'use client';

import dynamic from 'next/dynamic';

const LeafletMapPicker = dynamic(
  () => import('./LeafletMapPicker'),
  { 
    loading: () => (
      <div className="h-96 bg-gray-200 dark:bg-gray-800 rounded-lg flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-2"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading map...</p>
        </div>
      </div>
    ),
    ssr: false
  }
);

export default function GoogleMapPicker({ onLocationChange, initialPosition, initialLocation }) {
  return (
    <LeafletMapPicker
      onLocationChange={onLocationChange}
      initialPosition={initialPosition}
      initialLocation={initialLocation}
    />
  );
}
