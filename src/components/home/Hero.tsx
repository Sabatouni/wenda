'use client'

import Link from 'next/link'
import { Search } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, type FormEvent, type ChangeEvent, type CSSProperties } from 'react'
import { cn } from '@/lib/utils'
import WendaIcon, { pillClass, type WendaIconName } from '@/components/ui/WendaIcon'

const ROTATING_LINES = [
  'Nothing planned?',
  'Bored today?',
  'Where are we going?',
  'Your city has more.',
  'There\'s somewhere.',
]

// Hrefs use real category ids / flags so Explore can filter on them
const QUICK_LINKS: { label: string; icon: WendaIconName; href: string }[] = [
  { label: 'Food',        icon: 'restaurant',  href: '/explore?category=restaurant' },
  { label: 'Cafés',       icon: 'cafe',        href: '/explore?category=cafe' },
  { label: 'Beaches',     icon: 'beach',       href: '/explore?category=beach' },
  { label: 'Nightlife',   icon: 'nightlife',   href: '/explore?category=nightlife' },
  { label: 'Hidden gems', icon: 'hidden-gems', href: '/explore?filter=hidden-gems' },
  { label: 'Activities',  icon: 'activity',    href: '/explore?category=activity' },
]

const stagger = (i: number) => ({ '--i': i }) as CSSProperties

export default function Hero() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [lineIndex, setLineIndex] = useState(0)

  // Rotate the prompt line — skipped entirely for reduced-motion users
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const id = window.setInterval(
      () => setLineIndex((i: number) => (i + 1) % ROTATING_LINES.length),
      3200,
    )
    return () => window.clearInterval(id)
  }, [])

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
          <p
            className="text-[13px] font-semibold text-ember-500 uppercase tracking-widest mb-4 animate-fade-up stagger-item"
            style={stagger(0)}
          >
            Zanzibar · East Africa
          </p>
          <h1
            className="font-display font-bold leading-[0.95] tracking-[-0.03em] text-forest-900 dark:text-sand-200 animate-fade-up stagger-item"
            style={{ fontSize: 'clamp(52px, 9vw, 96px)', ...stagger(1) }}
          >
            Wenda wapi?
          </h1>
          <p
            className="mt-4 text-[18px] sm:text-[22px] font-display text-ink-400 font-medium tracking-[-0.01em] animate-fade-up stagger-item"
            style={stagger(2)}
          >
            <span key={lineIndex} className="block text-ink-600 animate-fade-up">
              {ROTATING_LINES[lineIndex]}
            </span>
            Good.{' '}
            <span className="text-ink-600">There&apos;s always somewhere to go.</span>
          </p>
        </div>

        {/* Search bar */}
        <form
          onSubmit={handleSearch}
          className="mt-8 max-w-xl animate-fade-up stagger-item"
          style={stagger(3)}
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
              aria-label="Search places"
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
                         text-[13px] font-semibold hover:bg-forest-800 active:scale-95
                         transition duration-150"
            >
              Search
            </button>
          </div>
        </form>

        {/* Quick category pills */}
        <div className="mt-5 flex flex-wrap gap-2 animate-fade-up stagger-item" style={stagger(4)}>
          {QUICK_LINKS.map(item => (
            <Link
              key={item.label}
              href={item.href}
              className={cn(pillClass(), 'px-3.5 py-2 shadow-sm')}
            >
              <WendaIcon name={item.icon} />
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
