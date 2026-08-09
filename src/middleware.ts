import { NextResponse, type NextRequest } from 'next/server';
import { getClientIp, isBlockedBot, isBlockedPath } from '@/lib/security';
import { ADMIN_SESSION_COOKIE } from '@/lib/auth-constants';

const SECURITY_HEADERS: Record<string, string> = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
  'X-DNS-Prefetch-Control': 'on',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'same-site',
};

function applySecurityHeaders(response: NextResponse) {
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  }

  response.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      "connect-src 'self' https:",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; ')
  );

  return response;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isBlockedPath(pathname)) {
    return new NextResponse('Not Found', { status: 404 });
  }

  if (isBlockedBot(request) && pathname.startsWith('/api/')) {
    return new NextResponse(JSON.stringify({ error: 'Forbidden' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (
    pathname.startsWith('/adminshobhit') &&
    !pathname.startsWith('/adminshobhit/login') &&
    !request.cookies.get(ADMIN_SESSION_COOKIE)?.value
  ) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/adminshobhit/login';
    loginUrl.search = '';
    return applySecurityHeaders(NextResponse.redirect(loginUrl));
  }

  return applySecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icon.svg|robots.txt|sitemap.xml).*)',
  ],
};
