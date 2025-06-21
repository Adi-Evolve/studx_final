import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'

export async function middleware(req) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // if user is not signed in and the current path is not public, redirect the user to /login
  const publicPaths = ['/login', '/signup', '/'];
  if (!session && !publicPaths.includes(req.nextUrl.pathname) && !req.nextUrl.pathname.startsWith('/auth/callback')) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // if user is signed in and trying to access login/signup, redirect to home
  if (session && (req.nextUrl.pathname === '/login' || req.nextUrl.pathname === '/signup')) {
    return NextResponse.redirect(new URL('/home', req.url))
  }

  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
