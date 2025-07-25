import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Create Supabase client using environment variables
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    // Test database connection
    const { data, error, count } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    if (error) {
      return NextResponse.json({
        status: 'error',
        message: error.message,
        database_url: process.env.NEXT_PUBLIC_SUPABASE_URL
      });
    }

    // Get some sample data
    const { data: users } = await supabase
      .from('users')
      .select('email, name, created_at')
      .limit(3);

    return NextResponse.json({
      status: 'success',
      database_url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      total_users: count,
      sample_users: users,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: error.message,
      database_url: process.env.NEXT_PUBLIC_SUPABASE_URL
    });
  }
}
