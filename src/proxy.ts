import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { logRequest, logResponse } from "@/server/security/requestLogger";

export async function proxy(req: NextRequest) {
  const startTime = Date.now();
  const requestId = await logRequest(req)
  const requestHeaders = new Headers(req.headers)
  requestHeaders.set('x-request-id', requestId)

  // Sanitize Origin header — Next.js 16 action handler crashes on comma-joined
  // duplicate origins from reverse proxy header forwarding
  const originValue = requestHeaders.get('origin')
  if (originValue && originValue.includes(',')) {
    requestHeaders.set('origin', originValue.split(',')[0].trim())
  }

  const forward = () => {
    const resp = NextResponse.next({
      request: { headers: requestHeaders },
    })
    resp.headers.set('x-request-id', requestId)
    resp.headers.set('X-Content-Type-Options', 'nosniff')
    resp.headers.set('X-Frame-Options', 'DENY')
    resp.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    resp.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload')
    resp.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
    logResponse(requestId, resp.status, startTime)
    return resp
  }

  // Merge header logic from old middleware.ts
  // This ensures Next.js correctly interprets the Host header
  // when running behind a reverse proxy (LiteSpeed/CyberPanel)
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL

  if (appUrl) {
    try {
      const url = new URL(appUrl)

      // If the proxy hasn't set the forwarded host, we force it to the public domain.
      if (!requestHeaders.has('x-forwarded-host')) {
        requestHeaders.set('x-forwarded-host', url.host)
      }

      if (!requestHeaders.has('x-forwarded-proto')) {
        requestHeaders.set('x-forwarded-proto', url.protocol.replace(':', ''))
      }
    } catch (e) {
      // Ignore URL parsing errors
    }
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET }) as {
    id?: string;
    profileCompletionStatus?: string;
    role?: string;
  } | null;
  const { pathname } = req.nextUrl;

  // Public routes - accessible without login
  const publicRoutes = [
    '/login',
    '/client-login',
    '/auth/magic',
    '/auth/register-password',
    '/client-portal/magic',

    // API routes (public)
    '/api/auth',
    '/api/onboarding',

    '/api/hr/assessment',
    '/api/clients/rfp',
    '/api/rfp',
    '/api/careers',
    '/api/client-portal/magic-login',
    '/api/client-portal/survey/public',
    '/api/health',
    '/api/public',
    '/api/magic-link',
    '/api/proposal',
    '/api/google-drive/callback',
    '/api/admin/test-access',

    // Public forms (API-based)

    '/onboarding',      // Client onboarding (token-based)
    '/rfp',             // RFP submission (token-based)
    '/careers',         // Job application
    '/assessment',      // Candidate assessment (token-based)
    '/exit-interview',  // Exit interview
    '/welcome',         // Client onboarding form
    '/embed',           // Embeddable forms (iframe)
    '/proposal',        // Client proposal viewing
    '/onboard',         // Client onboarding (token-based)
    '/web-onboarding',  // Web onboarding (token-based)

    // System
    '/policies',
    '/monitoring',
    '/admin-test-ae53850ab564f71a',
  ];

  // Profile completion routes - accessible during onboarding
  const onboardingRoutes = [
    '/profile-wizard',
    '/pending-verification',
  ];

  const isPublicRoute = publicRoutes.some(route =>
    pathname === route || pathname.startsWith(route + '/')
  );

  const isOnboardingRoute = onboardingRoutes.some(route =>
    pathname === route || pathname.startsWith(route + '/')
  );

  // Allow public routes
  if (isPublicRoute) {
    // If logged in and trying to access login, redirect to dashboard
    if (token && pathname === '/login') {
      return NextResponse.redirect(new URL('/', req.url));
    }
    return NextResponse.next();
  }

  // Allow onboarding routes for authenticated users
  if (isOnboardingRoute && token) {
    return forward();
  }

  // SUPER_ADMIN bypass - founders should never be blocked by profile wizard
  if (token?.role === 'SUPER_ADMIN') {
    return forward();
  }

  // Profile completion check for authenticated users - MANDATORY for all routes
  if (token && !pathname.startsWith('/api')) {
    const profileStatus = token.profileCompletionStatus;

    // If profile is incomplete/missing and not on wizard page, redirect to wizard
    if ((!profileStatus || profileStatus === 'INCOMPLETE') && !pathname.startsWith('/profile-wizard')) {
      return NextResponse.redirect(new URL('/profile-wizard', req.url));
    }

    // If pending HR verification and not on pending page, redirect to pending
    if (profileStatus === 'PENDING_HR' && !pathname.startsWith('/pending-verification')) {
      return NextResponse.redirect(new URL('/pending-verification', req.url));
    }
  }

  // Client portal routes - redirect to client-login instead of employee login
  const isClientPortalRoute = pathname.startsWith('/client-portal') && !pathname.startsWith('/client-portal/magic');

  // Check for client session cookie for client portal routes
  if (isClientPortalRoute) {
    const clientSession = req.cookies.get('client_session')?.value;
    if (!clientSession) {
      return NextResponse.redirect(new URL('/client-login', req.url));
    }
    // If there's also an employee token, don't bypass — employee should use their own routes
    if (token) {
      return NextResponse.redirect(new URL('/', req.url));
    }
    // Client session exists, allow access
    return forward();
  }

  // ALL routes require authentication by default (except public routes handled above)
  // If no token, redirect to login
  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return forward();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icons|manifest.json|api/ai).*)',
  ],
}
