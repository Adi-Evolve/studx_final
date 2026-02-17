import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const supabase = createRouteHandlerClient({ cookies });
        
        // Get recent rooms to see if uploads are working
        const { data: rooms, error } = await supabase
            .from('rooms')
            .select(`
                id,
                title,
                images,
                price,
                owner_name,
                contact1,
                created_at
            `)
            .order('created_at', { ascending: false })
            .limit(5);
        
        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
        
        return NextResponse.json({
            message: 'Recent rooms from database',
            rooms: rooms,
            count: rooms?.length || 0
        });
        
    } catch (error) {
        return NextResponse.json({ 
            error: error.message 
        }, { status: 500 });
    }
}
