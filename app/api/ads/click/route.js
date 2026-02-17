// app/api/ads/click/route.js
import { NextResponse } from 'next/server';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

export async function POST(request) {
    try {
        const { adId, position, timestamp } = await request.json();
        const supabase = createSupabaseBrowserClient();

        // Record click
        const { error } = await supabase
            .from('ad_clicks')
            .insert({
                ad_id: adId,
                position,
                timestamp: new Date(timestamp).toISOString(),
                user_agent: request.headers.get('user-agent'),
                ip_address: request.headers.get('x-forwarded-for') || 'unknown'
            });

        if (error) {
            // console.error('Error recording click:', error);
        }

        // Update click count and CTR
        await supabase.rpc('increment_ad_clicks', { ad_id: adId });

        return NextResponse.json({ success: true });
    } catch (error) {
        // console.error('Error in ads/click:', error);
        return NextResponse.json({ success: false }, { status: 500 });
    }
}
