import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Protected routes yang memerlukan authentication
const protectedRoutes = [
  '/patient/',
  '/doctor/',
  '/admin/',
  '/dashboard/',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get auth token from cookies
  const authToken = request.cookies.get('sb-auth-token')?.value;

  // Check if route is protected
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // If accessing protected route without auth token
  if (isProtectedRoute && !authToken) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If accessing auth pages while logged in
  if ((pathname === '/auth/login' || pathname === '/auth/register') && authToken) {
    return NextResponse.redirect(new URL('/patient/check-wizard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/patient/:path*',
    '/doctor/:path*',
    '/admin/:path*',
    '/dashboard/:path*',
    '/auth/login',
    '/auth/register',
  ],
};
