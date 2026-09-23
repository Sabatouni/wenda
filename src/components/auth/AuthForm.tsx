'use client'

import { useState, type FormEvent } from 'react'
import Image from 'next/image'
import { Loader2, AlertCircle, Mail, ArrowRight, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

// ─────────────────────────────────────────────────────────────
// AuthForm — WENDA sign-in via email magic link
//
// Flow:
//   1. User enters email → signInWithOtp()
//   2. Supabase sends a magic-link email
//   3. User clicks the link → /auth/callback → /onboarding or /profile
//
// Security properties:
//   - Uses anon key only (no service-role key).
//   - emailRedirectTo points to our own /auth/callback route.
//   - `nextPath` is validated server-side before being passed here;
//     it is safe-origin by the time it arrives.
//   - shouldCreateUser: true — new users are allowed to register
//     via magic link; handle_new_auth_user() creates their shared
//     profile row, then onboarding creates their wenda_profiles row.
// ─────────────────────────────────────────────────────────────

type AuthState = 'idle' | 'loading' | 'sent' | 'error'

function mapAuthError(message: string): string {
  if (message.includes('over_email_send_rate_limit') || message.includes('rate limit'))
    return 'Too many sign-in attempts. Please wait a few minutes and try again.'
  if (message.includes('invalid'))
    return 'That doesn\'t look like a valid email address.'
  return 'Couldn\'t send sign-in link. Please try again.'
}

interface AuthFormProps {
  nextPath: string
}

export function AuthForm({ nextPath }: AuthFormProps) {
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [authState, setAuthState] = useState<AuthState>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  const canSubmit = emailValid && authState !== 'loading'

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!canSubmit) return

    setAuthState('loading')
    setErrorMessage(null)

    // Build the callback URL — includes `next` only if non-default
    const origin = window.location.origin
    const callbackUrl =
      nextPath && nextPath !== '/profile'
        ? `${origin}/auth/callback?next=${encodeURIComponent(nextPath)}`
        : `${origin}/auth/callback`

    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: callbackUrl,
        shouldCreateUser: true,
      },
    })

    if (error) {
      setErrorMessage(mapAuthError(error.message))
      setAuthState('error')
      return
    }

    setAuthState('sent')
  }

  // ── Success state ─────────────────────────────────────────
  if (authState === 'sent') {
    return (
      <div className="min-h-screen bg-[var(--bg-base)] flex flex-col">
        <header className="flex items-center justify-center px-6 pt-8 pb-6 shrink-0">
          <Image src="/logo-mark-dark.svg" alt="WENDA" width={42} height={38} priority />
        </header>

        <div className="flex-1 flex items-start justify-center px-4 py-4">
          <div className="w-full max-w-[420px] text-center">
            <div className="w-14 h-14 rounded-2xl bg-forest-50 border border-forest-200 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={26} className="text-forest-600" />
            </div>

            <h1 className="font-display font-bold text-[26px] tracking-[-0.03em] text-forest-900 mb-3">
              Check your inbox
            </h1>
            <p className="text-[15px] text-ink-500 leading-relaxed mb-2">
              We sent a sign-in link to
            </p>
            <p className="font-semibold text-[15px] text-forest-900 mb-6">{email}</p>
            <p className="text-[13px] text-ink-400 leading-relaxed">
              Click the link in that email to continue.
              You can close this tab.
            </p>

            <button
              onClick={() => {
                setAuthState('idle')
                setEmail('')
              }}
              className="mt-8 text-[13px] font-medium text-forest-600 hover:text-forest-900 transition-colors underline underline-offset-2"
            >
              Use a different email
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Form state ────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[var(--bg-base)] flex flex-col">
      <header className="flex items-center justify-center px-6 pt-8 pb-6 shrink-0">
        <Image src="/logo-mark-dark.svg" alt="WENDA" width={42} height={38} priority />
      </header>

      <div className="flex-1 flex items-start justify-center px-4 py-4">
        <div className="w-full max-w-[420px]">

          {/* Heading */}
          <div className="mb-8 text-center">
            <h1 className="font-display font-bold text-[28px] tracking-[-0.03em] text-forest-900 mb-2">
              Sign in to WENDA
            </h1>
            <p className="text-[15px] text-ink-500 leading-relaxed">
              Enter your email and we'll send you a sign-in link.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>

            {/* Email input */}
            <div>
              <label
                htmlFor="email"
                className="block text-[13px] font-semibold text-forest-900 mb-2 uppercase tracking-wider"
              >
                Email address
              </label>
              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none"
                />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  autoFocus
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  disabled={authState === 'loading'}
                  className={cn(
                    'w-full pl-10 pr-4 py-3 rounded-xl bg-white border text-[15px] text-forest-900',
                    'placeholder:text-ink-300 outline-none transition-colors',
                    'focus:border-forest-600 focus:ring-2 focus:ring-forest-600/10',
                    'border-[var(--border-default)]',
                    authState === 'loading' && 'opacity-60 cursor-not-allowed',
                  )}
                />
              </div>
            </div>

            {/* Error banner */}
            {authState === 'error' && errorMessage && (
              <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                <p className="text-[13px] leading-relaxed">{errorMessage}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={!canSubmit}
              className={cn(
                'w-full flex items-center justify-center gap-2.5',
                'py-3.5 rounded-xl font-display font-semibold text-[15px]',
                'transition-all duration-150',
                canSubmit
                  ? 'bg-forest-900 text-sand-300 hover:bg-forest-800 active:scale-[0.99] shadow-card'
                  : 'bg-forest-900/30 text-sand-300/60 cursor-not-allowed',
              )}
            >
              {authState === 'loading' ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Sending link…
                </>
              ) : (
                <>
                  Send sign-in link
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <p className="mt-8 text-center text-[12px] text-ink-400 leading-relaxed">
            New to WENDA? Sign in to get started —{' '}
            your account is created automatically.
          </p>
        </div>
      </div>
    </div>
  )
}
