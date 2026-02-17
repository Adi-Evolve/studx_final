'use client';

import { useState, useEffect } from 'react';
import NewestProductsSlider from './NewestProductsSlider';
import { useUserLocation } from '@/hooks/useUserLocation';
import { fetchNewestProducts, fetchNewestProductsWithLocation } from '@/app/actions';

export default function NewestProductsSection({ initialProducts }) {
    const [newestProducts, setNewestProducts] = useState(initialProducts || []);
    useEffect(() => {
        if (newestProducts && newestProducts.length > 0) {
            // console.log('[DEBUG] All newestProducts:', newestProducts);
            // console.log('[DEBUG] All types:', newestProducts.map(item => item.type));
            const notes = newestProducts.filter(item => item.type === 'note');
            // console.log('[DEBUG] Notes fetched for homepage:', notes);
        } else {
            // console.log('[DEBUG] No newest products fetched yet.');
        }
    }, [newestProducts]);
    const [loading, setLoading] = useState(false);
    const { location, error: locationError } = useUserLocation();

    useEffect(() => {
        async function loadLocationBasedProducts() {
            if (!location || loading) return;
            
            setLoading(true);
            try {
                const locationBasedProducts = await fetchNewestProductsWithLocation(
                    location.latitude, 
                    location.longitude, 
                    12
                );
                setNewestProducts(locationBasedProducts);
            } catch (error) {
                // console.error('Error loading location-based newest products:', error);
                // Keep the initial products if location-based fetch fails
            } finally {
                setLoading(false);
            }
        }

        loadLocationBasedProducts();
    }, [location]); // Trigger when location becomes available

    return (
        <div className="relative">
            {loading && (
                <div className="absolute top-4 right-4 z-10">
                    <div className="bg-white dark:bg-gray-800 rounded-full px-3 py-1 shadow-lg border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                            <span>Finding nearby products...</span>
                        </div>
                    </div>
                </div>
            )}
            
            <NewestProductsSlider 
                newestProducts={newestProducts} 
                showDistance={!!location && !locationError}
            />
        </div>
    );
}
