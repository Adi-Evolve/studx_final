import { NextResponse } from 'next/server'

export async function GET() {
  console.log('🔥 [TEST API] GET endpoint reached!');
  return NextResponse.json({ 
    success: true, 
    message: 'Test API is working!',
    timestamp: new Date().toISOString()
  });
}

export async function POST() {
  console.log('🔥 [TEST API] POST endpoint reached!');
  return NextResponse.json({ 
    success: true, 
    message: 'Test POST API is working!',
    timestamp: new Date().toISOString()
  });
}