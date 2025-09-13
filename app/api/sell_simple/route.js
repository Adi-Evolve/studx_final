import { NextResponse } from 'next/server'

export async function GET() {
  console.log('🔥 [SELL API] GET endpoint reached!');
  return NextResponse.json({ 
    success: true, 
    message: 'Sell API GET is working!',
    timestamp: new Date().toISOString()
  });
}

export async function POST() {
  console.log('🔥 [SELL API] POST endpoint reached!');
  
  try {
    console.log('🔥 [SELL API] Processing POST request...');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Sell API POST is working!',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('🚨 [SELL API] Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}