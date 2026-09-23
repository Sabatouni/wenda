import { AuthForm } from '@/components/auth/AuthForm'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Sign in — Wenda' }

// ─────────────────────────────────────────────────────────────
// AuthPage — Server Component
//
// Reads the `next` search parameter (the intended destination
// after authentication) and validates it as a safe same-origin
// path before handing it to the client form component.
//
// Validation rule (mirrors auth callback and safeRedirectPath):
//   - Must start with /
//   - Must NOT start with //  (protocol-relative redirect block)
//   - Falls back to /profile on failure
//
// Note: Middleware redirects authenticated users AWAY from /auth
// so this page is only shown to unauthenticated visitors.
// ─────────────────────────────────────────────────────────────

interface AuthPageProps {
  searchParams: Promise<{ next?: string }>
}

function safeNextPath(next: string | undefined): string {
  if (!next) return '/profile'
  if (next.startsWith('/') && !next.startsWith('//')) return next
  return '/profile'
}

export default async function AuthPage({ searchParams }: AuthPageProps) {
  const { next } = await searchParams
  const nextPath = safeNextPath(next)
  return <AuthForm nextPath={nextPath} />
}
