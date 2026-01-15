import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// TEMPORARILY DISABLED - Let all requests through
export function middleware(request: NextRequest) {
  // Allow everything for now
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
