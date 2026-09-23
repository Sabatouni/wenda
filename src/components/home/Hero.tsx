'use client'

import { Search } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, type FormEvent, type ChangeEvent } from 'react'

const ROTATING_LINES = [
  'Nothing planned?',
  'Bored today?',
  'Where are we going?',
  'Your city has more.',
  'There\'s somewhere.',
]

export default function Hero() {
  const router = useRouter()
  const [query, setQuery] = useState('')

  function handleSearch(e: FormEvent) {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/explore?q=${encodeURIComponent(query.trim())}`)
    }
  }

  return (
    <section className="pt-[var(--nav-h)] bg-[var(--bg-base)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 lg:py-20">
        {/* Headline */}
        <div className="max-w-3xl">
          <p className="text-[13px] font-semibold text-ember-500 uppercase tracking-widest mb-4">
            Zanzibar · East Africa
          </p>
          <h1 className="font-display font-bold leading-[0.95] tracking-[-0.03em] text-forest-900 dark:text-sand-200"
              style={{ fontSize: 'clamp(52px, 9vw, 96px)' }}>
            Wenda wapi?
          </h1>
          <p className="mt-4 text-[18px] sm:text-[22px] font-display text-ink-400 font-medium tracking-[-0.01em]">
            Good.{' '}
            <span className="text-ink-600">There&apos;s always somewhere to go.</span>
          </p>
        </div>

        {/* Search bar */}
        <form
          onSubmit={handleSearch}
          className="mt-8 max-w-xl"
          role="search"
        >
          <div className="relative flex items-center">
            <Search
              size={18}
              className="absolute left-4 text-ink-400 pointer-events-none"
            />
            <input
              type="search"
              value={query}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
              placeholder="Search places, food, beaches, vibes..."
              className="w-full pl-11 pr-28 py-3.5 rounded-xl border border-[var(--border-default)]
                         bg-white dark:bg-forest-900/30
                         text-[15px] text-[var(--text-primary)] placeholder:text-ink-400
                         focus:outline-none focus:ring-2 focus:ring-forest-900/20 focus:border-forest-900/40
                         transition-all duration-200 shadow-sm"
            />
            <button
              type="submit"
              className="absolute right-2 px-4 py-2 rounded-lg bg-forest-900 text-sand-300
                         text-[13px] font-semibold hover:bg-forest-800 transition-colors duration-150"
            >
              Search
            </button>
          </div>
        </form>

        {/* Quick category pills */}
        <div className="mt-5 flex flex-wrap gap-2">
          {[
            { label: 'Food', emoji: '🍽' },
            { label: 'Cafés', emoji: '☕' },
            { label: 'Beaches', emoji: '🏖' },
            { label: 'Nightlife', emoji: '🌙' },
            { label: 'Hidden gems', emoji: '💎' },
            { label: 'Activities', emoji: '🎯' },
          ].map(item => (
            <button
              key={item.label}
              onClick={() => router.push(`/explore?category=${item.label.toLowerCase()}`)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white dark:bg-forest-900/30
                         border border-[var(--border-subtle)] text-[13px] font-medium text-ink-600
                         hover:border-forest-900/30 hover:text-forest-900 hover:bg-forest-50
                         transition-all duration-150 shadow-sm"
            >
              <span>{item.emoji}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
