import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request) {
    console.log('=== Debug Test API ===');
    
    try {
        const supabase = createRouteHandlerClient({ cookies });
        
        // Test 1: Get authenticated user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        console.log('User:', user?.email, userError?.message);
        
        // Test 2: Check notes table schema
        const { data: schemaData, error: schemaError } = await supabase
            .from('notes')
            .select('*')
            .limit(1);
        
        console.log('Schema check:', schemaError?.message);
        
        // Test 3: Try a simple insert
        const testData = {
            seller_id: user?.id,
            title: 'Test Note',
            description: 'Test Description',
            price: 100,
            college: 'Test College',
            course_subject: 'Test Subject',
            academic_year: '2024',
            category: 'Test Category'
        };
        
        console.log('Test data:', testData);
        
        const { data: insertData, error: insertError } = await supabase
            .from('notes')
            .insert(testData)
            .select('id')
            .single();
        
        console.log('Insert result:', insertData, insertError?.message);
        
        return NextResponse.json({ 
            user: user?.email,
            schemaError: schemaError?.message,
            insertError: insertError?.message,
            insertData: insertData
        });
        
    } catch (error) {
        console.error('Test error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
