import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';

const intlMiddleware = createMiddleware({
  // A list of all locales that are supported
  locales: ['ko', 'en'],
  
  // Used when no locale matches
  defaultLocale: 'ko',
  
  // Always show locale in URL
  localePrefix: 'always'
});

export default function middleware(request: NextRequest) {
  try {
    return intlMiddleware(request);
  } catch (error) {
    console.error('Middleware error:', error);
    
    // Fallback: redirect to default locale
    const url = request.nextUrl.clone();
    url.pathname = `/ko${url.pathname}`;
    return NextResponse.redirect(url);
  }
}

export const config = {
  // Match all pathnames except for
  // - /api (API routes)
  // - /_next (Next.js internals)
  // - /_vercel (Vercel internals)
  // - All files in the public folder
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
}; 