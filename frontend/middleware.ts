import { NextResponse, type NextRequest } from 'next/server';

const PUBLIC_PATHS = new Set<string>([
  '/',
  '/login',
  '/signup',
  '/api/auth',
  '/api/auth/signin',
  '/api/auth/callback',
  '/api/signup',
  '/favicon.ico',
]);

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isPublic = [...PUBLIC_PATHS].some((p) => pathname === p || pathname.startsWith(p + '/'));
  if (isPublic) return NextResponse.next();
  const authCookie = req.cookies.get('next-auth.session-token') || req.cookies.get('__Secure-next-auth.session-token');
  if (!authCookie) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|manifest.json|icon-.*\.svg|sw.js).*)'],
};


