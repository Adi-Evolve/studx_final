import { NextResponse } from 'next/server'

export function middleware(request) {
  // Block all analytics requests completely to prevent terminal spam
  if (request.nextUrl.pathname === '/api/analytics') {
    // Return empty response without logging
    return new NextResponse(null, { status: 204 })
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: '/api/analytics'
}
