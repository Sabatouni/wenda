import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import PlaceCard from '@/components/places/PlaceCard'
import { DEMO_PLACES } from '@/data/demo'

export default function DiscoveryGrid() {
  // Show 8 places sorted to mix categories
  const places = [...DEMO_PLACES].sort(() => 0.5 - Math.random()).slice(0, 8)

  return (
    <section className="py-10 sm:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex items-end justify-between mb-6">
          <div>
            <p className="text-[12px] font-semibold text-forest-500 uppercase tracking-widest mb-1">
              Zanzibar · East Africa
            </p>
            <h2 className="font-display font-bold text-[24px] sm:text-[28px] tracking-[-0.02em] text-forest-900">
              Just for you
            </h2>
          </div>
          <Link
            href="/explore"
            className="flex items-center gap-1.5 text-[13px] font-semibold text-forest-700 hover:text-forest-900 transition-colors"
          >
            See all <ArrowRight size={14} />
          </Link>
        </div>

        {/* Masonry grid */}
        <div className="masonry-grid">
          {places.map(place => (
            <div key={place.id} className="masonry-item">
              <PlaceCard place={place} />
            </div>
          ))}
        </div>

        {/* Load more */}
        <div className="mt-8 text-center">
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-[var(--border-default)]
                       text-[14px] font-semibold text-forest-900 hover:bg-forest-50 hover:border-forest-900/30
                       transition-all duration-150"
          >
            Explore more places
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </section>
  )
}
