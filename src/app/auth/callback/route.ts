import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// ─────────────────────────────────────────────────────────────
// WENDA — Auth callback
//
// Handles the OAuth / magic-link code exchange after Supabase
// Auth redirects back to the app.  After a successful exchange:
//
//   • wenda_profiles row exists  →  redirect to /profile
//                                   (or safe `next` param)
//   • no wenda_profiles row      →  redirect to /onboarding
//
// Security properties:
//   - Uses the anon key + session cookie (no service-role key).
//   - Never reads shared `profiles` to determine WENDA status.
//   - `next` redirect validated against open-redirect rule:
//     must be a same-origin path (starts with / but not //).
//   - Tokens are never exposed in the response URL.
// ─────────────────────────────────────────────────────────────

type CookieItem = { name: string; value: string; options?: Record<string, unknown> }

/**
 * Validate a `next` redirect parameter.
 * Accepts only same-origin paths (/foo, /foo/bar) —
 * rejects protocol-relative (//) and absolute URLs.
 */
function safeRedirectPath(next: string | null, fallback: string): string {
  if (!next) return fallback
  if (next.startsWith('/') && !next.startsWith('//')) return next
  return fallback
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next')

  // No authorization code — Supabase didn't send one
  if (!code) {
    return NextResponse.redirect(
      new URL('/?error=missing_auth_code', requestUrl.origin),
    )
  }

  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: CookieItem[]) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(
              name,
              value,
              options as Parameters<typeof cookieStore.set>[2],
            ),
          )
        },
      },
    },
  )

  // Exchange the one-time code for a session
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

  if (exchangeError) {
    console.error('[auth/callback] exchangeCodeForSession:', exchangeError.message)
    return NextResponse.redirect(
      new URL('/?error=auth_failed', requestUrl.origin),
    )
  }

  // Confirm identity after exchange
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return NextResponse.redirect(
      new URL('/?error=auth_failed', requestUrl.origin),
    )
  }

  // ── WENDA profile check ─────────────────────────────────────
  // Uses wenda_profiles — NOT shared profiles.
  // Determines whether this is a first-time WENDA user or
  // a returning one (which includes STV/NUMA/POS users who
  // haven't yet opted into WENDA).
  // maybeSingle() returns null (not an error) when no row exists.
  const { data: wendaProfile, error: profileError } = await supabase
    .from('wenda_profiles')
    .select('id')
    .eq('id', user.id)
    .maybeSingle()

  if (profileError) {
    console.error('[auth/callback] wenda_profiles check:', profileError.message)
    // Conservative fallback: send to onboarding
    return NextResponse.redirect(new URL('/onboarding', requestUrl.origin))
  }

  if (wendaProfile) {
    // Returning WENDA user — honour safe `next` or go to profile
    const destination = safeRedirectPath(next, '/profile')
    return NextResponse.redirect(new URL(destination, requestUrl.origin))
  }

  // New to WENDA (brand-new auth user or existing STV/NUMA/POS user)
  return NextResponse.redirect(new URL('/onboarding', requestUrl.origin))
}
