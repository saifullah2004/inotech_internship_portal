import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyJWT } from './lib/auth';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Read session cookie
  const sessionCookie = request.cookies.get('inotech_session')?.value;

  // Paths that do not require authentication
  const isAuthPage = pathname === '/login' || pathname === '/register';
  const isRootPage = pathname === '/';

  if (!sessionCookie) {
    // User is NOT logged in
    if (isAuthPage || isRootPage) {
      return NextResponse.next();
    }
    // Redirect to login for protected pages
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // User HAS session cookie - verify it
  const payload = await verifyJWT(sessionCookie);

  if (!payload) {
    // Bad token - clear cookie and redirect to login
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('inotech_session');
    return response;
  }

  // User is logged in and token is valid
  const { role } = payload;

  if (role === 'admin') {
    // Admins go to /admin/dashboard, never to user pages or auth pages
    if (isAuthPage || isRootPage || pathname.startsWith('/dashboard')) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    }
    return NextResponse.next();
  }

  if (role === 'user') {
    // Users go to /dashboard, never to admin pages or auth pages
    if (isAuthPage || isRootPage || pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

// Configure proxy to run on specific paths
export const config = {
  matcher: [
    '/',
    '/login',
    '/register',
    '/dashboard/:path*',
    '/admin/:path*',
  ],
};
