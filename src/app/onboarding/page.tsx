'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Loader2, AlertCircle, AtSign, User } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import type { WendaOnboardingInput } from '@/types'

// ─────────────────────────────────────────────────────────────
// WENDA Onboarding
//
// Creates a wenda_profiles row via the create_wenda_profile()
// SECURITY DEFINER RPC (migration 014_functions_triggers.sql).
//
// What we send to the RPC:
//   p_display_name  — required, 1–60 chars
//   p_handle        — optional; RPC auto-generates from email if NULL
//
// What we never send:
//   user_id / email / full_name / any UUID
//
// The RPC derives identity from auth.uid() server-side.
// REVOKE EXECUTE FROM PUBLIC — anon cannot call it.
// ON CONFLICT DO NOTHING — safe to call more than once.
// ─────────────────────────────────────────────────────────────

function mapRpcError(message: string): string {
  if (message.includes('handle_taken'))
    return 'That handle is already taken. Try a different one.'
  if (message.includes('invalid_handle'))
    return 'Handles can only use letters, numbers, and underscores (2–30 characters).'
  if (message.includes('unauthenticated'))
    return 'Your session has expired. Please sign in again.'
  if (message.includes('display_name is required'))
    return 'Please enter a display name.'
  return 'Something went wrong. Please try again.'
}

export default function OnboardingPage() {
  const router = useRouter()
  const supabase = createClient()

  const [displayName, setDisplayName] = useState('')
  const [handle, setHandle] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Client-side display name validation (server validates too)
  const displayNameTooLong = displayName.length > 60
  const displayNameBlank = displayName.length > 0 && displayName.trim().length === 0
  const displayNameError = displayNameBlank
    ? 'Display name cannot be blank.'
    : displayNameTooLong
    ? 'Display name must be 60 characters or fewer.'
    : null

  const canSubmit =
    displayName.trim().length >= 1 &&
    !displayNameTooLong &&
    !loading

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!canSubmit) return

    setLoading(true)
    setError(null)

    const input: WendaOnboardingInput = {
      display_name: displayName.trim(),
      ...(handle.trim() ? { handle: handle.trim() } : {}),
    }

    // Call the SECURITY DEFINER RPC — identity comes from auth.uid()
    const { error: rpcError } = await supabase.rpc('create_wenda_profile', {
      p_display_name: input.display_name,
      p_handle: input.handle ?? null,
    })

    if (rpcError) {
      setError(mapRpcError(rpcError.message))
      setLoading(false)
      return
    }

    // Profile created — go to profile page
    router.replace('/profile')
  }

  return (
    <div className="min-h-screen bg-[var(--bg-base)] flex flex-col">

      {/* Minimal header — no full nav bar during onboarding */}
      <header className="flex items-center justify-center px-6 pt-8 pb-6 shrink-0">
        <Image
          src="/logo-mark-dark.svg"
          alt="WENDA"
          width={42}
          height={38}
          priority
        />
      </header>

      {/* Form area */}
      <div className="flex-1 flex items-start justify-center px-4 py-4">
        <div className="w-full max-w-[420px]">

          {/* Heading */}
          <div className="mb-8 text-center">
            <h1 className="font-display font-bold text-[28px] tracking-[-0.03em] text-forest-900 mb-2">
              Create your profile
            </h1>
            <p className="text-[15px] text-ink-500 leading-relaxed">
              How should people know you on WENDA?
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>

            {/* Display name */}
            <div>
              <label
                htmlFor="display_name"
                className="block text-[13px] font-semibold text-forest-900 mb-2 uppercase tracking-wider"
              >
                Display name <span className="text-ember-500 normal-case tracking-normal">*</span>
              </label>
              <div className="relative">
                <User
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none"
                />
                <input
                  id="display_name"
                  type="text"
                  autoComplete="name"
                  autoFocus
                  placeholder="e.g. Arif Hassan"
                  maxLength={60}
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  disabled={loading}
                  className={cn(
                    'w-full pl-10 pr-4 py-3 rounded-xl bg-white border text-[15px] text-forest-900',
                    'placeholder:text-ink-300 outline-none transition-colors',
                    'focus:border-forest-600 focus:ring-2 focus:ring-forest-600/10',
                    displayNameError
                      ? 'border-red-400 focus:border-red-400 focus:ring-red-400/10'
                      : 'border-[var(--border-default)]',
                    loading && 'opacity-60 cursor-not-allowed',
                  )}
                />
              </div>
              {displayNameError ? (
                <p className="mt-1.5 text-[12px] text-red-500">{displayNameError}</p>
              ) : (
                <p className="mt-1.5 text-[12px] text-ink-400 tabular-nums">
                  {displayName.length}/60
                </p>
              )}
            </div>

            {/* Handle */}
            <div>
              <label
                htmlFor="handle"
                className="block text-[13px] font-semibold text-forest-900 mb-2 uppercase tracking-wider"
              >
                Handle{' '}
                <span className="text-ink-400 font-normal normal-case text-[12px] tracking-normal">
                  — optional, auto-generated if left blank
                </span>
              </label>
              <div className="relative">
                <AtSign
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none"
                />
                <input
                  id="handle"
                  type="text"
                  autoComplete="username"
                  placeholder="yourhandle"
                  maxLength={30}
                  value={handle}
                  onChange={e =>
                    // Strip disallowed characters client-side for better UX;
                    // server validates the final value via RPC
                    setHandle(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))
                  }
                  disabled={loading}
                  className={cn(
                    'w-full pl-10 pr-4 py-3 rounded-xl bg-white border text-[15px] text-forest-900',
                    'placeholder:text-ink-300 outline-none transition-colors font-mono tracking-wide',
                    'focus:border-forest-600 focus:ring-2 focus:ring-forest-600/10',
                    'border-[var(--border-default)]',
                    loading && 'opacity-60 cursor-not-allowed',
                  )}
                />
              </div>
              <p className="mt-1.5 text-[12px] text-ink-400">
                Letters, numbers, underscores — 2 to 30 characters.
              </p>
            </div>

            {/* RPC error banner */}
            {error && (
              <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                <p className="text-[13px] leading-relaxed">{error}</p>
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
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Creating your profile…
                </>
              ) : (
                'Get started on WENDA'
              )}
            </button>
          </form>

          {/* Footer note */}
          <p className="mt-8 text-center text-[12px] text-ink-400 leading-relaxed">
            Your display name is shown publicly on WENDA.
            You can update both at any time from your settings.
          </p>
        </div>
      </div>
    </div>
  )
}
