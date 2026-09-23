'use client'

import { Bookmark } from 'lucide-react'
import { useState, type MouseEvent } from 'react'
import { cn } from '@/lib/utils'

// SaveButton — save/unsave a place.
//
// Auth & persistence: intentionally deferred for Supabase wiring.
// When wired:
//   1. Read initial saved state from user's saved_places via RLS-protected query.
//   2. On toggle: upsert / delete in saved_places table using Supabase client.
//   3. Never allow client-side INSERT with user_id supplied by the caller —
//      use auth.uid() server-side (set via RLS policy or SECURITY DEFINER fn).
//   4. Optimistic update: flip state immediately, revert on error.
//
// This component is intentionally display-only until Supabase is wired.
// placeId is kept for the upcoming integration (not prefixed with _).

interface SaveButtonProps {
  placeId: string
  initialSaved?: boolean
  className?: string
}

export default function SaveButton({ placeId, initialSaved = false, className }: SaveButtonProps) {
  const [saved, setSaved] = useState(initialSaved)

  function handleSave(e: MouseEvent<HTMLButtonElement>) {
    e.preventDefault()
    e.stopPropagation()

    // Optimistic toggle — will revert on error once Supabase is wired
    setSaved((v: boolean) => !v)

    // TODO: wire to Supabase — example integration:
    // const supabase = createBrowserClient(...)
    // if (!saved) {
    //   await supabase.from('saved_places').insert({ place_id: placeId })
    //   // user_id is set by RLS (auth.uid()) — never pass it from the client
    // } else {
    //   await supabase.from('saved_places')
    //     .delete().eq('place_id', placeId).eq('user_id', (await supabase.auth.getUser()).data.user?.id ?? '')
    // }
    void placeId  // referenced for upcoming Supabase integration
  }

  return (
    <button
      onClick={handleSave}
      aria-label={saved ? 'Remove from saved' : 'Save place'}
      className={cn(
        'w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200',
        saved
          ? 'bg-forest-900 text-sand-300 shadow-md'
          : 'bg-white/80 backdrop-blur-sm text-ink-600 hover:bg-white hover:text-forest-900',
        className,
      )}
    >
      <Bookmark
        size={15}
        strokeWidth={2}
        fill={saved ? 'currentColor' : 'none'}
      />
    </button>
  )
}
