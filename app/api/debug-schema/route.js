import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SECRET_KEY

if (!supabaseUrl || !supabaseKey) {
  // console.error('Missing Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseKey)

export async function GET() {
  try {
    // console.log('[DEBUG API] Checking database schema...')

    // Check if rooms table exists and get its columns
    const { data: tables, error: tablesError } = await supabase
      .rpc('sql', {
        query: `
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name IN ('rooms', 'products', 'notes', 'users');
        `
      })

    if (tablesError) {
      return NextResponse.json({
        error: 'Failed to check tables',
        details: tablesError.message
      }, { status: 500 })
    }

    // Check rooms table columns
    const { data: roomsColumns, error: columnsError } = await supabase
      .rpc('sql', {
        query: `
          SELECT column_name, data_type, is_nullable, column_default
          FROM information_schema.columns 
          WHERE table_name = 'rooms' 
          AND table_schema = 'public'
          ORDER BY ordinal_position;
        `
      })

    if (columnsError) {
      return NextResponse.json({
        error: 'Failed to check rooms columns',
        details: columnsError.message
      }, { status: 500 })
    }

    // Test insert a sample room (without actually inserting)
    const testRoomData = {
      title: 'TEST - Sample Room',
      description: 'Test room for debugging',
      price: 5000,
      location: JSON.stringify({ lat: 18.5204, lng: 73.8567 }),
      room_type: 'single',
      category: 'rooms',
      seller_id: '00000000-0000-0000-0000-000000000000', // UUID format
      college: 'VIT Pune',
      occupancy: '1',
      owner_name: 'Test Owner',
      contact1: '1234567890',
      deposit: 2000,
      fees_include_mess: false,
      amenities: ['WiFi', 'AC'],
      distance: '1km',
      fees_period: 'Monthly',
      duration: 'monthly',
      hostel_name: 'Test Hostel',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    // Check sample data count
    const { data: sampleRooms, error: sampleError } = await supabase
      .from('rooms')
      .select('id, title, fees_period, created_at')
      .limit(5)

    return NextResponse.json({
      message: 'Database schema check',
      tables: tables || [],
      roomsColumns: roomsColumns || [],
      sampleRooms: sampleRooms || [],
      testData: testRoomData,
      environment: {
        hasSupabaseUrl: !!supabaseUrl,
        hasSupabaseKey: !!supabaseKey,
        nodeEnv: process.env.NODE_ENV
      }
    })

  } catch (error) {
    return NextResponse.json({
      error: 'Database check failed',
      details: error.message,
      stack: error.stack?.substring(0, 500)
    }, { status: 500 })
  }
}
