import { NextResponse } from 'next/server'

export async function middleware(request) {
  const response = NextResponse.next()
  
  // Block analytics requests to prevent spam
  if (request.nextUrl.pathname === '/api/analytics') {
    return new NextResponse('Analytics Disabled', { status: 403 })
  }
  
  // Comprehensive security file blocking
  const blockedPaths = [
    '/adi.html', '/test-api.html', '/test-analytics.html',
    '/admin-panel-tests.js', '/diagnose_products.js',
    '/enhanced-admin-features.js', '/enhanced-analytics-dashboard.js',
    '/enhanced-user-management.js', '/fix_database_permissions.js',
    '/test-security-fix.js', '/security-fix-plan.md',
    '/search-sponsored-example.html', '/homepage-sponsored-example.html',
    '/include-analytics-tracker.html'
  ]
  
  // Block direct access to development/admin files
  if (blockedPaths.some(path => request.nextUrl.pathname.endsWith(path))) {
    return new NextResponse('🚫 Access Denied - File Not Available', { 
      status: 403,
      headers: {
        'Content-Type': 'text/html',
      }
    })
  }
  
  // Block access to .env files
  if (request.nextUrl.pathname.includes('.env')) {
    return new NextResponse('🚫 Forbidden', { status: 403 })
  }
  
  // Enhanced Security Headers - More permissive for browser extensions
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'SAMEORIGIN') // Changed from DENY to SAMEORIGIN
  response.headers.set('X-XSS-Protection', '0') // Disabled to prevent extension conflicts
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  // Remove strict permissions policy that causes camera violations
  response.headers.delete('Permissions-Policy')
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  
  // Comprehensive Content Security Policy for browser extensions
  response.headers.set('Content-Security-Policy', 
    "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob: chrome-extension: moz-extension: webkit-extension:; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com https://unpkg.com chrome-extension: moz-extension: webkit-extension: data: blob:; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://unpkg.com chrome-extension: moz-extension: webkit-extension:; " +
    "font-src 'self' https://fonts.gstatic.com data: chrome-extension: moz-extension: webkit-extension:; " +
    "img-src 'self' data: https: http: blob: chrome-extension: moz-extension: webkit-extension:; " +
    "connect-src 'self' https://vdpmumstdxgftaaxeacx.supabase.co https://api.razorpay.com https://api.imgbb.com chrome-extension: moz-extension: webkit-extension: wss: ws:; " +
    "frame-src 'self' https://checkout.razorpay.com https://api.razorpay.com chrome-extension: moz-extension: webkit-extension:; " +
    "object-src 'none'; " +
    "base-uri 'self' data: chrome-extension: moz-extension: webkit-extension:; " +
    "worker-src 'self' blob: chrome-extension: moz-extension: webkit-extension:; " +
    "child-src 'self' chrome-extension: moz-extension: webkit-extension:;"
  )
  
  // Rate limiting headers
  response.headers.set('X-RateLimit-Limit', '1000')
  response.headers.set('X-RateLimit-Remaining', '999')
  
  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icons/).*)',]
}
