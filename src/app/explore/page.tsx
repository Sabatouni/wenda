import Link from 'next/link'
import { Search, X, Compass } from 'lucide-react'
import Header from '@/components/layout/Header'
import BottomNav from '@/components/layout/BottomNav'
import PlaceCard from '@/components/places/PlaceCard'
import { DEMO_PLACES, DEMO_VIBES, CATEGORIES } from '@/data/demo'
import { cn } from '@/lib/utils'
import WendaIcon, { pillClass, type WendaIconName } from '@/components/ui/WendaIcon'
import type { CSSProperties } from 'react'

export const metadata = { title: 'Explore' }

type ExploreParams = {
  category?: string
  vibe?: string
  q?: string
  filter?: string
  sort?: string
}

/** Build an /explore URL, dropping empty params and the default category */
function exploreHref(params: ExploreParams): string {
  const qs = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value && !(key === 'category' && value === 'all')) qs.set(key, value)
  }
  const s = qs.toString()
  return s ? `/explore?${s}` : '/explore'
}

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<ExploreParams>
}) {
  const params = await searchParams
  const q = params.q?.trim() ?? ''
  const category = CATEGORIES.some(c => c.id === params.category) ? params.category! : 'all'
  const vibe = DEMO_VIBES.find(v => v.slug === params.vibe)
  const hiddenGems = params.filter === 'hidden-gems'
  const trending = params.sort === 'trending'

  const needle = q.toLowerCase()
  const places = DEMO_PLACES.filter(p => {
    if (category !== 'all' && p.category !== category) return false
    if (vibe && !p.vibes.includes(vibe.slug)) return false
    if (hiddenGems && !p.is_hidden_gem) return false
    if (trending && !p.trending) return false
    if (needle) {
      const haystack = [p.name, p.locality, p.island, p.description, p.category, ...p.vibes]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      if (!haystack.includes(needle)) return false
    }
    return true
  })

  // Everything currently applied — used to keep other filters when one changes
  const current: ExploreParams = {
    category,
    vibe: vibe?.slug,
    q,
    filter: hiddenGems ? 'hidden-gems' : undefined,
    sort: trending ? 'trending' : undefined,
  }

  const activeChips = [
    vibe       && { label: vibe.label,    icon: vibe.slug,     href: exploreHref({ ...current, vibe: undefined }) },
    hiddenGems && { label: 'Hidden gems', icon: 'hidden-gems', href: exploreHref({ ...current, filter: undefined }) },
    trending   && { label: 'Trending',    icon: 'trending',    href: exploreHref({ ...current, sort: undefined }) },
    q          && { label: `“${q}”`,                     href: exploreHref({ ...current, q: undefined }) },
  ].filter(Boolean) as { label: string; icon?: WendaIconName; href: string }[]

  const isFiltered = category !== 'all' || activeChips.length > 0

  return (
    <>
      <Header />
      <main className="pt-[var(--nav-h)] pb-[var(--bottom-nav-h)] md:pb-0 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          {/* Page heading + search */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between animate-fade-up">
            <div>
              <h1 className="font-display font-bold text-[28px] sm:text-[36px] tracking-[-0.02em] text-forest-900">
                Explore
              </h1>
              <p className="text-ink-500 mt-1" aria-live="polite">
                {places.length} {places.length === 1 ? 'place' : 'places'}
                {isFiltered ? ' found' : ' in Zanzibar'}
              </p>
            </div>

            <form action="/explore" role="search" className="relative w-full sm:w-[320px]">
              {category !== 'all' && <input type="hidden" name="category" value={category} />}
              {vibe && <input type="hidden" name="vibe" value={vibe.slug} />}
              {hiddenGems && <input type="hidden" name="filter" value="hidden-gems" />}
              {trending && <input type="hidden" name="sort" value="trending" />}
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none"
              />
              <input
                type="search"
                name="q"
                defaultValue={q}
                aria-label="Search places"
                placeholder="Search places, food, beaches…"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--border-default)]
                           bg-white text-[14px] text-[var(--text-primary)] placeholder:text-ink-400
                           focus:outline-none focus:ring-2 focus:ring-forest-900/20 focus:border-forest-900/40
                           transition-all duration-200 shadow-sm"
              />
            </form>
          </div>

          {/* Category filter */}
          <nav
            aria-label="Categories"
            className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 pb-2 mb-4"
          >
            {CATEGORIES.map(cat => {
              const active = cat.id === category
              return (
                <Link
                  key={cat.id}
                  href={exploreHref({ ...current, category: cat.id })}
                  scroll={false}
                  aria-current={active ? 'true' : undefined}
                  className={cn(pillClass(active), 'px-4 py-2')}
                >
                  <WendaIcon name={cat.id} tone={active ? 'inverse' : 'default'} />
                  <span>{cat.label}</span>
                </Link>
              )
            })}
          </nav>

          {/* Active filters */}
          {activeChips.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mb-4 animate-fade-in">
              {activeChips.map(chip => (
                <Link
                  key={chip.label}
                  href={chip.href}
                  scroll={false}
                  aria-label={`Remove filter ${chip.label}`}
                  className="group flex items-center gap-1.5 pl-3 pr-2 py-1.5 rounded-full bg-forest-50
                             text-[12px] font-medium text-forest-800 hover:bg-forest-100
                             transition-colors duration-200"
                >
                  {chip.icon && <WendaIcon name={chip.icon} size={13} />}
                  {chip.label}
                  <X size={12} className="text-forest-600 group-hover:text-forest-900" />
                </Link>
              ))}
              <Link
                href="/explore"
                scroll={false}
                className="text-[12px] font-medium text-ink-500 hover:text-forest-900 underline underline-offset-2 transition-colors"
              >
                Clear all
              </Link>
            </div>
          )}

          {/* Grid */}
          {places.length > 0 ? (
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
              {places.map((place, i) => (
                <div
                  key={place.id}
                  className="animate-fade-up stagger-item"
                  style={{ '--i': Math.min(i, 11) } as CSSProperties}
                >
                  <PlaceCard place={place} />
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-4 rounded-2xl border border-dashed border-[var(--border-default)] px-6 py-16 text-center animate-fade-up">
              <div className="mx-auto w-12 h-12 rounded-full bg-forest-50 flex items-center justify-center text-forest-700">
                <Compass size={22} />
              </div>
              <h2 className="mt-4 font-display font-semibold text-[18px] tracking-[-0.01em] text-forest-900">
                Nothing here yet
              </h2>
              <p className="mt-1 text-[14px] text-ink-500 max-w-sm mx-auto">
                No places match these filters. Try a different category or clear your search.
              </p>
              <Link
                href="/explore"
                className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-forest-900 text-sand-300
                           text-[13px] font-semibold hover:bg-forest-800 active:scale-[0.98] transition"
              >
                Clear filters
              </Link>
            </div>
          )}
        </div>
      </main>
      <BottomNav />
    </>
  )
}
