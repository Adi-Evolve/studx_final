// app/api/ads/impression/route.js
import { NextResponse } from 'next/server';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

export async function POST(request) {
    try {
        const { adId, position } = await request.json();
        const supabase = createSupabaseBrowserClient();

        // Record impression
        const { error } = await supabase
            .from('ad_impressions')
            .insert({
                ad_id: adId,
                position,
                timestamp: new Date().toISOString(),
                user_agent: request.headers.get('user-agent'),
                ip_address: request.headers.get('x-forwarded-for') || 'unknown'
            });

        if (error) {
            console.error('Error recording impression:', error);
        }

        // Update impression count
        await supabase.rpc('increment_ad_impressions', { ad_id: adId });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error in ads/impression:', error);
        return NextResponse.json({ success: false }, { status: 500 });
    }
}
