import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// ─────────────────────────────────────────────────────────────
// WENDA — Auth + onboarding middleware
//
// Layer 1 — Authentication gate
//   Protected routes require a valid Supabase auth session.
//   Unauthenticated requests are redirected to /auth with a
//   `next` param so the user lands back after signing in.
//
// Layer 2 — WENDA onboarding gate
//   Authenticated users on gated routes must have a row in
//   wenda_profiles. If none exists they go to /onboarding.
//   /onboarding itself is exempt from the profile check —
//   that's where the row gets created.
//
// Route classification:
//   PUBLIC          /  /explore  /places/*  /map  /vibes/*
//   AUTH_REQUIRED   /profile  /outings  /saved  /account  /admin
//   ONBOARDING_GATE /profile  /outings  /saved  /account  /admin
//   AUTH_REQUIRED   /onboarding  (exempt from onboarding gate)
//   PASS_THROUGH    /auth/callback  (handled by callback route itself)
//
// Security properties:
//   - Uses anon key + session cookie only. No service-role key.
//   - Never creates a wenda_profiles row — only reads.
//   - Never weakens RLS. RLS enforces auth.uid() in every query.
//   - Prevents open redirects: `next` validated by the target page.
//   - No redirect loop: /onboarding is excluded from the gate.
// ─────────────────────────────────────────────────────────────

// Routes requiring a valid auth session
const PROTECTED_PREFIXES = [
  '/profile',
  '/outings',
  '/saved',
  '/account',
  '/admin',
  '/onboarding',    // requires auth; exempt from wenda_profiles gate
]

// Authenticated routes that ALSO need a wenda_profiles row.
// /onboarding is intentionally absent — it's where you create the row.
const WENDA_GATE_PREFIXES = [
  '/profile',
  '/outings',
  '/saved',
  '/account',
  '/admin',
]

// Public discovery routes — always accessible without auth
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _PUBLIC_PREFIXES = ['/', '/explore', '/places', '/map', '/vibes']

type CookieItem = { name: string; value: string; options?: Record<string, unknown> }

function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(prefix => pathname.startsWith(prefix))
}

function requiresWendaProfile(pathname: string): boolean {
  return WENDA_GATE_PREFIXES.some(prefix => pathname.startsWith(prefix))
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })

  // Supabase SSR client — refreshes session cookies on each request
  // so that Server Components receive an up-to-date session
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: CookieItem[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          )
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(
              name,
              value,
              options as Parameters<typeof response.cookies.set>[2],
            ),
          )
        },
      },
    },
  )

  // Layer 0 — always refresh the session (required for Server Components)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // ── Layer 1: Authentication gate ─────────────────────────────
  if (isProtectedRoute(pathname) && !user) {
    const loginUrl = new URL('/auth', request.url)
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // ── Layer 2: WENDA onboarding gate ───────────────────────────
  // Only runs for authenticated users on gated routes.
  // Avoids a redundant DB call on public pages.
  if (user && requiresWendaProfile(pathname)) {
    const { data: wendaProfile } = await supabase
      .from('wenda_profiles')
      .select('id')
      .eq('id', user.id)
      .maybeSingle()

    if (!wendaProfile) {
      // No WENDA profile yet — send to onboarding.
      // /onboarding is not in WENDA_GATE_PREFIXES, so no loop.
      return NextResponse.redirect(new URL('/onboarding', request.url))
    }
  }

  // ── Redirect authenticated users away from auth pages ─────────
  if ((pathname === '/auth' || pathname === '/login' || pathname === '/signup') && user) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     *   - _next/static   (static files)
     *   - _next/image    (image optimisation)
     *   - favicon.ico
     *   - public assets  (svg, png, jpg, gif, webp)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
