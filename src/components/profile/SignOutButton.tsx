'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LogOut } from 'lucide-react'

// ─────────────────────────────────────────────────────────────
// SignOutButton — client component
//
// The profile page is a Server Component, so it cannot call
// supabase.auth.signOut() directly. This thin client wrapper
// handles sign-out and clears the session cookie via the
// browser Supabase client, then reloads the page so the
// middleware redirects to the home screen.
// ─────────────────────────────────────────────────────────────

export function SignOutButton() {
  const router = useRouter()
  const supabase = createClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <button
      onClick={handleSignOut}
      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-[var(--border-subtle)] text-[14px] font-medium text-ink-500 hover:text-forest-900 hover:border-forest-900/30 transition-colors"
    >
      <LogOut size={14} />
      Sign out
    </button>
  )
}
