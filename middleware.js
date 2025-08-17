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
  
  // Enhanced Security Headers
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(self), microphone=(), geolocation=(self)')
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  
  // Content Security Policy
  response.headers.set('Content-Security-Policy', 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com https://unpkg.com; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://unpkg.com; " +
    "font-src 'self' https://fonts.gstatic.com; " +
    "img-src 'self' data: https: http: blob:; " +
    "connect-src 'self' https://vdpmumstdxgftaaxeacx.supabase.co https://api.razorpay.com https://api.imgbb.com; " +
    "frame-src 'self' https://checkout.razorpay.com https://api.razorpay.com; " +
    "object-src 'none'; " +
    "base-uri 'self';"
  )
  
  // Rate limiting headers
  response.headers.set('X-RateLimit-Limit', '1000')
  response.headers.set('X-RateLimit-Remaining', '999')
  
  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icons/).*)',]
}
