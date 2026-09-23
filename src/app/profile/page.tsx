import { Fragment } from 'react'
import { redirect } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import {
  Settings,
  MapPin,
  Bookmark,
  Calendar,
  Users,
  Edit3,
  ChevronRight,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { SignOutButton } from '@/components/profile/SignOutButton'
import Header from '@/components/layout/Header'
import BottomNav from '@/components/layout/BottomNav'
import { DEMO_PLACES } from '@/data/demo'
import type { Metadata } from 'next'
import type { Profile } from '@/types'

export const metadata: Metadata = { title: 'Profile — Wenda' }

// ─────────────────────────────────────────────────────────────
// ProfilePage — Server Component
//
// Data sources:
//   • supabase.auth.getUser()  — verified identity (server only)
//   • wenda_profiles            — WENDA display data
//
// Security:
//   • Never passes user_id from the client — identity comes
//     from the server-side session via auth.getUser().
//   • Uses the anon key + session cookie (no service-role key).
//   • RLS on wenda_profiles ensures users can only read
//     their own row via the select_public policy (auth.uid()).
//   • Does NOT query shared `profiles` for display data.
//   • Does NOT expose auth email anywhere on this page.
//
// Deferred to the next sprint:
//   • Live saved count (saved_places query)
//   • Live outings count (outings query)
//   • Live recently saved (saved_places join places)
//   • Profile editing (update wenda_profiles)
//   • Avatar upload (Supabase Storage)
// ─────────────────────────────────────────────────────────────

export default async function ProfilePage() {
  const supabase = await createClient()

  // Middleware enforces auth, but we defend here too
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/')
  }

  // Fetch WENDA profile from wenda_profiles — NOT shared profiles
  const { data: profile, error } = await supabase
    .from('wenda_profiles')
    .select('id, handle, display_name, avatar_url, avatar_path, bio, city, joined_at, is_deleted')
    .eq('id', user.id)
    .maybeSingle()

  if (error) {
    console.error('[profile] wenda_profiles fetch error:', error.message)
  }

  // No WENDA profile — middleware should have caught this,
  // but defend here in case the edge case races
  if (!profile) {
    redirect('/onboarding')
  }

  const p = profile as Profile

  // ── Stats ────────────────────────────────────────────────────
  // Deferred: connected in the next (data) sprint.
  // Showing zeros until saved_places / outings queries land.
  const stats = { saves: 0, outings: 0, followers: 0, following: 0 }

  // ── Recently saved ───────────────────────────────────────────
  // Deferred: replace with saved_places JOIN places in data sprint.
  const recentPlaces = DEMO_PLACES.slice(0, 4)

  // Joined date formatted simply
  const joinedYear = new Date(p.joined_at).getFullYear()

  return (
    <>
      <Header />
      <main className="pt-[var(--nav-h)] pb-[var(--bottom-nav-h)] md:pb-0 min-h-screen">

        {/* Profile header */}
        <div className="relative">

          {/* Cover strip */}
          <div className="relative h-[140px] sm:h-[180px] bg-forest-900 overflow-hidden">
            <Image
              src={DEMO_PLACES[2].cover_photo_url ?? ''}
              alt="cover"
              fill
              sizes="100vw"
              className="object-cover opacity-40"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-forest-900/60" />
          </div>

          {/* Settings */}
          <div className="absolute top-4 right-4 flex gap-2">
            <Link
              href="/settings"
              className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center"
            >
              <Settings size={15} className="text-white" />
            </Link>
          </div>

          {/* Avatar + name block */}
          <div className="px-4 sm:px-6 pb-6 border-b border-[var(--border-subtle)]">
            <div className="flex items-end justify-between -mt-10 mb-4">

              {/* Avatar */}
              <div className="relative w-[72px] h-[72px] rounded-2xl overflow-hidden ring-4 ring-[var(--bg-base)] bg-forest-100">
                {p.avatar_url ? (
                  <Image
                    src={p.avatar_url}
                    alt={p.display_name}
                    fill
                    sizes="72px"
                    className="object-cover"
                  />
                ) : (
                  // Initials placeholder until avatar upload is built
                  <div className="w-full h-full flex items-center justify-center bg-forest-200">
                    <span className="font-display font-bold text-[26px] text-forest-700">
                      {p.display_name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>

              {/* Edit profile — deferred; disabled placeholder */}
              <button
                disabled
                title="Profile editing coming soon"
                aria-label="Edit profile (coming soon)"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[var(--border-default)] text-[13px] font-medium text-ink-300 cursor-not-allowed"
              >
                <Edit3 size={13} />
                Edit profile
              </button>
            </div>

            {/* Name + handle */}
            <div className="mb-3">
              <h1 className="font-display font-bold text-[22px] tracking-[-0.02em] text-forest-900">
                {p.display_name}
              </h1>
              <p className="text-[13px] text-ink-400">@{p.handle}</p>
            </div>

            {/* Bio */}
            {p.bio && (
              <p className="text-[14px] text-ink-700 mb-3 leading-relaxed">{p.bio}</p>
            )}

            {/* City */}
            {p.city && (
              <div className="flex items-center gap-1.5 text-[13px] text-ink-400 mb-1">
                <MapPin size={12} />
                {p.city}
              </div>
            )}

            {/* Joined year */}
            <p className="text-[12px] text-ink-300 mt-1">
              WENDA member since {joinedYear}
            </p>

            {/* Stats row — zeros until data sprint */}
            <div className="flex gap-5 mt-5">
              {[
                { value: stats.saves, label: 'saved' },
                { value: stats.outings, label: 'outings' },
                { value: stats.followers, label: 'followers' },
                { value: stats.following, label: 'following' },
              ].map((s, i) => (
                <Fragment key={s.label}>
                  {i > 0 && <div className="w-px bg-[var(--border-subtle)]" />}
                  <div>
                    <p className="font-display font-bold text-[18px] text-forest-900 tabular-nums">
                      {s.value}
                    </p>
                    <p className="text-[12px] text-ink-400">{s.label}</p>
                  </div>
                </Fragment>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-8">

          {/* Recently saved — demo data until saved_places sprint */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display font-semibold text-[16px] tracking-[-0.01em] text-forest-900">
                Recently saved
              </h2>
              <Link
                href="/saved"
                className="flex items-center gap-1 text-[12px] font-medium text-forest-600 hover:text-forest-900"
              >
                See all <ChevronRight size={13} />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {recentPlaces.map(place => (
                <Link
                  key={place.id}
                  href={`/places/${place.slug}`}
                  className="group relative rounded-xl overflow-hidden aspect-[4/3] bg-forest-100"
                >
                  <Image
                    src={place.cover_photo_url ?? ''}
                    alt={place.name}
                    fill
                    sizes="(min-width: 640px) 50vw, 50vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-2 left-3 right-2">
                    <p className="font-display font-semibold text-[13px] text-white line-clamp-1">
                      {place.name}
                    </p>
                    <p className="text-[11px] text-white/70">{place.locality}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div className="rounded-2xl border border-[var(--border-subtle)] divide-y divide-[var(--border-subtle)] overflow-hidden">
            {[
              { icon: Bookmark, label: 'Saved places', href: '/saved', count: stats.saves },
              { icon: Calendar, label: 'Past outings', href: '/outings', count: stats.outings },
              { icon: Users, label: 'Friends', href: '/friends', count: stats.following },
            ].map(item => (
              <Link
                key={item.label}
                href={item.href}
                className="flex items-center gap-3 px-4 py-3.5 hover:bg-[var(--bg-surface)] transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-forest-50 flex items-center justify-center">
                  <item.icon size={15} className="text-forest-700" />
                </div>
                <span className="flex-1 text-[14px] font-medium text-forest-900">{item.label}</span>
                <span className="text-[13px] text-ink-400 mr-1">{item.count}</span>
                <ChevronRight size={15} className="text-ink-300" />
              </Link>
            ))}
          </div>

          {/* Sign out — client component (Server Component can't call signOut) */}
          <div className="pb-4">
            <SignOutButton />
          </div>
        </div>
      </main>
      <BottomNav />
    </>
  )
}
