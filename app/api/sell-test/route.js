import { NextResponse } from 'next/server'

export async function GET(request) {
  try {
    // Test environment variables
    const envCheck = {
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      hasImgbbKey: !!process.env.IMGBB_API_KEY,
      nodeEnv: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    }

    // Test Supabase connection
    let supabaseTest = { status: 'not_tested' }
    try {
      const { createClient } = await import('@supabase/supabase-js')
      
      if (envCheck.hasSupabaseUrl && envCheck.hasServiceKey) {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.SUPABASE_SERVICE_ROLE_KEY
        )

        const { data, error } = await supabase
          .from('users')
          .select('count')
          .limit(1)

        if (error) {
          supabaseTest = { 
            status: 'error', 
            message: error.message,
            code: error.code 
          }
        } else {
          supabaseTest = { 
            status: 'connected',
            message: 'Successfully connected to Supabase'
          }
        }
      } else {
        supabaseTest = { 
          status: 'missing_credentials',
          message: 'Missing Supabase URL or Service Key'
        }
      }
    } catch (supabaseError) {
      supabaseTest = { 
        status: 'connection_failed',
        message: supabaseError.message 
      }
    }

    return NextResponse.json({
      message: 'Sell API Health Check',
      status: 'running',
      environment: envCheck,
      supabase: supabaseTest,
      diagnostics: {
        api_route: 'accessible',
        next_js: 'working',
        server_time: new Date().toISOString()
      }
    })

  } catch (error) {
    return NextResponse.json({
      message: 'Health check failed',
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    
    return NextResponse.json({
      message: 'Test POST endpoint received data',
      receivedData: body,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json({
      message: 'Test POST failed',
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 400 })
  }
}
