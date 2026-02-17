// API Routes for Advertising System
// app/api/ads/fetch/route.js

import { NextResponse } from 'next/server';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

export async function POST(request) {
    try {
        const { position, category, userLocation, deviceType } = await request.json();
        const supabase = createSupabaseBrowserClient();

        // Get current timestamp
        const now = new Date();

        // Build query for fetching ads
        let query = supabase
            .from('advertisements')
            .select('*')
            .eq('status', 'active')
            .lte('start_date', now.toISOString())
            .gte('end_date', now.toISOString());

        // Filter by position if specified
        if (position) {
            query = query.contains('positions', [position]);
        }

        // Filter by category if specified
        if (category) {
            query = query.or(`target_categories.is.null,target_categories.cs.{${category}}`);
        }

        // Filter by device type
        if (deviceType) {
            query = query.or(`target_devices.is.null,target_devices.cs.{${deviceType}}`);
        }

        // Execute query
        const { data: ads, error } = await query.order('priority', { ascending: false });

        if (error) {
            // console.error('Error fetching ads:', error);
            return NextResponse.json({ success: false, error: 'Failed to fetch ads' });
        }

        if (!ads || ads.length === 0) {
            return NextResponse.json({ success: false, message: 'No ads available' });
        }

        // Apply location-based filtering if location is provided
        let filteredAds = ads;
        if (userLocation) {
            filteredAds = ads.filter(ad => {
                if (!ad.target_locations || ad.target_locations.length === 0) return true;
                return ad.target_locations.includes(userLocation);
            });
        }

        // Select ad based on weighted probability
        const selectedAd = selectAdByWeight(filteredAds);

        if (!selectedAd) {
            return NextResponse.json({ success: false, message: 'No suitable ad found' });
        }

        // Format ad data for frontend
        const formattedAd = {
            id: selectedAd.id,
            type: selectedAd.ad_type,
            title: selectedAd.title,
            description: selectedAd.description,
            imageUrl: selectedAd.image_url,
            link: selectedAd.click_url,
            cta: selectedAd.call_to_action,
            openInNewTab: selectedAd.open_in_new_tab,
            closeable: selectedAd.closeable,
            items: selectedAd.carousel_items, // For carousel ads
            ctr: selectedAd.click_through_rate || 0
        };

        return NextResponse.json({ 
            success: true, 
            ad: formattedAd 
        });

    } catch (error) {
        // console.error('Error in ads/fetch:', error);
        return NextResponse.json({ 
            success: false, 
            error: 'Internal server error' 
        }, { status: 500 });
    }
}

// Weighted ad selection algorithm
function selectAdByWeight(ads) {
    if (ads.length === 0) return null;
    if (ads.length === 1) return ads[0];

    // Calculate total weight (based on bid amount and priority)
    const totalWeight = ads.reduce((sum, ad) => {
        const weight = (ad.bid_amount || 1) * (ad.priority || 1);
        return sum + weight;
    }, 0);

    // Generate random number
    let random = Math.random() * totalWeight;

    // Select ad based on weighted probability
    for (const ad of ads) {
        const weight = (ad.bid_amount || 1) * (ad.priority || 1);
        random -= weight;
        if (random <= 0) {
            return ad;
        }
    }

    return ads[0]; // Fallback
}
