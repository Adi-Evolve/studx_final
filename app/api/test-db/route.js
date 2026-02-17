import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET(request) {
    // console.log('=== Simple Database Test ===');
    
    try {
        // Create client with service role key for testing
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.SUPABASE_SECRET_KEY
        );
        
        // Test 1: Check if we can connect
        const { data: connectionTest, error: connectionError } = await supabase
            .from('notes')
            .select('id')
            .limit(1);
        
        // console.log('Connection test:', connectionError?.message);
        
        // Test 2: Check table schema
        const { data: schemaData, error: schemaError } = await supabase
            .rpc('get_schema_info', { table_name: 'notes' });
        
        // console.log('Schema RPC:', schemaError?.message);
        
        // Test 3: Try manual query to see columns
        const { data: manualData, error: manualError } = await supabase
            .from('notes')
            .select('*')
            .limit(1);
        
        // console.log('Manual query:', manualError?.message);
        
        // Test 4: Try a simple insert with minimal data
        const testUserId = '123e4567-e89b-12d3-a456-426614174000'; // Test UUID
        
        const { data: insertData, error: insertError } = await supabase
            .from('notes')
            .insert({
                seller_id: testUserId,
                title: 'Test Note',
                description: 'Test Description',
                price: 100,
                college: 'Test College',
                course_subject: 'Test Subject',
                academic_year: '2024',
                category: 'Test Category'
            })
            .select('id')
            .single();
        
        // console.log('Insert result:', insertData, insertError?.message);
        
        // If insert worked, delete it
        if (insertData?.id) {
            await supabase.from('notes').delete().eq('id', insertData.id);
        }
        
        return NextResponse.json({ 
            connectionError: connectionError?.message,
            schemaError: schemaError?.message,
            manualError: manualError?.message,
            insertError: insertError?.message,
            insertSuccess: !!insertData
        });
        
    } catch (error) {
        // console.error('Database test error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
