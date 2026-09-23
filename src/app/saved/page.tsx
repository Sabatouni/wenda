import Header from '@/components/layout/Header'
import BottomNav from '@/components/layout/BottomNav'
import PlaceCard from '@/components/places/PlaceCard'
import { Bookmark, Plus } from 'lucide-react'
import Link from 'next/link'
import { DEMO_PLACES } from '@/data/demo'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Saved — Wenda' }

const DEMO_COLLECTIONS = [
  { id: 'c1', name: 'Beach days', count: 4, emoji: '🌊' },
  { id: 'c2', name: 'Food spots', count: 6, emoji: '🍽️' },
  { id: 'c3', name: 'Night out', count: 3, emoji: '🌙' },
]

// Pretend the first 6 places are saved
const SAVED_PLACES = DEMO_PLACES.slice(0, 6)

export default function SavedPage() {
  return (
    <>
      <Header />
      <main className="pt-[var(--nav-h)] pb-[var(--bottom-nav-h)] md:pb-0 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

          {/* Header */}
          <div className="mb-8">
            <h1 className="font-display font-bold text-[28px] sm:text-[36px] tracking-[-0.02em] text-forest-900">
              Saved
            </h1>
            <p className="text-ink-500 mt-1 text-[14px]">{SAVED_PLACES.length} places</p>
          </div>

          {/* Collections */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display font-semibold text-[17px] tracking-[-0.01em] text-forest-900">
                Collections
              </h2>
              <button className="flex items-center gap-1.5 text-[12px] font-medium text-forest-600 hover:text-forest-900 transition-colors">
                <Plus size={13} />
                New
              </button>
            </div>
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
              {/* All saved */}
              <button className="shrink-0 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-forest-900 text-sand-300 text-[13px] font-semibold">
                <Bookmark size={13} fill="currentColor" />
                All saved
                <span className="text-sand-400 font-medium">{SAVED_PLACES.length}</span>
              </button>
              {DEMO_COLLECTIONS.map(col => (
                <button
                  key={col.id}
                  className="shrink-0 flex items-center gap-2.5 px-4 py-3 rounded-xl border border-[var(--border-subtle)]
                             text-[13px] font-medium text-forest-900 hover:border-forest-900/40 bg-white transition-colors"
                >
                  <span>{col.emoji}</span>
                  {col.name}
                  <span className="text-ink-400 font-normal">{col.count}</span>
                </button>
              ))}
              <button className="shrink-0 flex items-center gap-2 px-4 py-3 rounded-xl border border-dashed border-[var(--border-subtle)]
                                 text-[13px] font-medium text-ink-400 hover:border-forest-900/40 hover:text-forest-900 transition-colors">
                <Plus size={13} />
                New list
              </button>
            </div>
          </div>

          {/* Saved grid */}
          {SAVED_PLACES.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {SAVED_PLACES.map(place => (
                <PlaceCard key={place.id} place={place} variant="compact" />
              ))}
            </div>
          ) : (
            /* Empty state */
            <div className="py-20 text-center">
              <div className="w-14 h-14 rounded-2xl bg-forest-50 flex items-center justify-center mx-auto mb-5">
                <Bookmark size={24} className="text-forest-600" />
              </div>
              <h3 className="font-display font-semibold text-[18px] text-forest-900 mb-2">
                Nothing saved yet
              </h3>
              <p className="text-[14px] text-ink-400 mb-6 max-w-xs mx-auto">
                Tap the bookmark on any place to save it here.
              </p>
              <Link
                href="/explore"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-forest-900 text-sand-300 text-[13px] font-semibold hover:bg-forest-800 transition-colors"
              >
                Explore places
              </Link>
            </div>
          )}
        </div>
      </main>
      <BottomNav />
    </>
  )
}
