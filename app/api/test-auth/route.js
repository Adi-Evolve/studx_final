// Alternative API route for testing different auth approaches
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Create a service role client for testing
const supabaseServiceRole = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SECRET_KEY
);

export async function POST(request) {
    // console.log('=== Test API route ===');
    
    try {
        // Get the authorization header
        const authHeader = request.headers.get('authorization');
        // console.log('Auth header:', authHeader ? 'Present' : 'Missing');
        
        // Get cookies
        const cookieHeader = request.headers.get('cookie');
        // console.log('Cookie header:', cookieHeader ? 'Present' : 'Missing');
        
        // Parse body
        const body = await request.json();
        // console.log('Request body:', body);
        
        return NextResponse.json({
            success: true,
            message: 'Test API route working',
            headers: {
                hasAuth: !!authHeader,
                hasCookies: !!cookieHeader
            }
        });
        
    } catch (error) {
        // console.error('Test API error:', error);
        return NextResponse.json({
            error: error.message
        }, { status: 500 });
    }
}
