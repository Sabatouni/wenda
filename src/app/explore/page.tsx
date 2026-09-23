import Header from '@/components/layout/Header'
import BottomNav from '@/components/layout/BottomNav'
import PlaceCard from '@/components/places/PlaceCard'
import { DEMO_PLACES, CATEGORIES } from '@/data/demo'

export const metadata = { title: 'Explore' }

export default function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; vibe?: string; q?: string }>
}) {
  const places = DEMO_PLACES

  return (
    <>
      <Header />
      <main className="pt-[var(--nav-h)] pb-[var(--bottom-nav-h)] md:pb-0 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          {/* Page heading */}
          <div className="mb-6">
            <h1 className="font-display font-bold text-[28px] sm:text-[36px] tracking-[-0.02em] text-forest-900">
              Explore
            </h1>
            <p className="text-ink-500 mt-1">
              {places.length} places in Zanzibar
            </p>
          </div>

          {/* Category filter */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 mb-8">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full
                           border border-[var(--border-subtle)] text-[13px] font-medium
                           text-ink-600 hover:border-forest-900/40 hover:text-forest-900
                           bg-white transition-all duration-150"
              >
                <span>{cat.emoji}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>

          {/* Grid */}
          <div className="masonry-grid">
            {places.map(place => (
              <div key={place.id} className="masonry-item">
                <PlaceCard place={place} />
              </div>
            ))}
          </div>
        </div>
      </main>
      <BottomNav />
    </>
  )
}
