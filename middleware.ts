import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()

  // Authentication-related pages
  const authPages = ['/login', '/signup', '/profile', '/admin']
  const isAuthPage = authPages.some(page => req.nextUrl.pathname.startsWith(page))

  if (isAuthPage) {
    // Prevent caching of auth/admin pages
    res.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate, private')
    res.headers.set('Pragma', 'no-cache')
    res.headers.set('Expires', '0')
    res.headers.set('X-Robots-Tag', 'noindex, nofollow')
  } else {
    // Non-auth pages → prevent aggressive caching
    res.headers.set('Cache-Control', 'no-cache, private, must-revalidate')
  }

  // Security headers for all pages
  res.headers.set('X-Frame-Options', 'DENY')
  res.headers.set('X-Content-Type-Options', 'nosniff')
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  // API routes → CORS & cache
  if (req.nextUrl.pathname.startsWith('/api/')) {
    res.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
    res.headers.set('Access-Control-Allow-Credentials', 'true')
    // Safer than '*', allows only the requesting origin
    const origin = req.headers.get('origin') || ''
    res.headers.set('Access-Control-Allow-Origin', origin)
    res.headers.set('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
    res.headers.set(
      'Access-Control-Allow-Headers',
      'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
    )
  }

  return res
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
