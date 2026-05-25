/**
 * Root Next.js middleware.
 *
 * Two responsibilities:
 *  1. Serve permanent (301) redirects from legacy routes to the post-spec:008
 *     URL shape — keeps printed QRs and shared links working.
 *  2. Refresh the Supabase auth session per request.
 *
 * Matcher excludes static assets, `_next/*` chunks and `/api/card/*` (the
 * public QR + vCard endpoints, which must stay cacheable and don't need
 * auth context).
 *
 * Refs: adr:0002 §3 (session, middleware matcher), adr:0004 (url shape), spec:008.
 */
import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

function legacyRedirect(pathname: string): string | null {
  // `/u/<slug>` (with optional trailing subpath, incl. /booking) → `/<slug>` + subpath
  const portfolioMatch = pathname.match(/^\/u\/([^/]+)(\/.*)?$/);
  if (portfolioMatch) return `/${portfolioMatch[1]}${portfolioMatch[2] ?? ''}`;

  // `/card/<slug>` (with optional trailing subpath) → `/c/<slug>` + subpath
  const cardMatch = pathname.match(/^\/card\/([^/]+)(\/.*)?$/);
  if (cardMatch) return `/c/${cardMatch[1]}${cardMatch[2] ?? ''}`;

  return null;
}

export async function middleware(request: NextRequest) {
  const target = legacyRedirect(request.nextUrl.pathname);
  if (target) {
    const url = request.nextUrl.clone();
    url.pathname = target;
    return NextResponse.redirect(url, 301);
  }
  return updateSession(request);
}

export const config = {
  matcher: [
    // Everything except:
    //  - /_next/*  (Next internals)
    //  - /api/card/*  (public QR + vCard endpoints)
    //  - /favicon.ico, /robots.txt, /sitemap.xml
    //  - static files with an extension (.png, .svg, .css, .js, .woff2, ...)
    '/((?!_next/|api/card/|favicon\\.ico|robots\\.txt|sitemap\\.xml|.*\\.[\\w]+$).*)',
  ],
};
