/**
 * Enhanced Security Middleware for StudX
 * Adds additional security headers and protections
 */

import { NextResponse } from 'next/server'

export function middleware(request) {
  // Get the response
  const response = NextResponse.next()
  
  // Block analytics requests to prevent spam
  if (request.nextUrl.pathname === '/api/analytics') {
    return new NextResponse(null, { status: 204 })
  }
  
  // Block access to sensitive files that might still exist
  const sensitivePaths = ['/adi.html', '/test-api.html', '/test-analytics.html']
  if (sensitivePaths.some(path => request.nextUrl.pathname.endsWith(path))) {
    return new NextResponse('Access Denied', { status: 403 })
  }
  
  // Add security headers
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  // Add CSP header for additional security
  response.headers.set('Content-Security-Policy', 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com https://unpkg.com https://cdn.jsdelivr.net; " +
    "style-src 'self' 'unsafe-inline' https://unpkg.com https://cdn.jsdelivr.net https://cdnjs.cloudflare.com; " +
    "img-src 'self' data: https: http:; " +
    "font-src 'self' https://cdnjs.cloudflare.com; " +
    "connect-src 'self' https://*.supabase.co https://api.imgbb.com https://i.ibb.co;"
  )
  
  // Prevent directory listing and direct file access
  if (request.nextUrl.pathname.includes('/admin') && !request.nextUrl.pathname.startsWith('/admin/')) {
    return new NextResponse('Not Found', { status: 404 })
  }
  
  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icons/).*)',
  ]
}
