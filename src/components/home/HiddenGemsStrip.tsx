import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Diamond } from 'lucide-react'
import { formatCount } from '@/lib/utils'
import { getHiddenGems } from '@/data/demo'

export default function HiddenGemsStrip() {
  const gems = getHiddenGems()

  if (gems.length === 0) return null

  return (
    <section className="py-10 sm:py-14 bg-sand-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Diamond size={12} className="text-forest-600" />
              <span className="text-[12px] font-semibold text-forest-600 uppercase tracking-widest">
                Off the beaten path
              </span>
            </div>
            <h2 className="font-display font-bold text-[24px] sm:text-[28px] tracking-[-0.02em] text-forest-900">
              Hidden gems
            </h2>
          </div>
          {/* Link to explore filtered by is_hidden_gem, not vibe=hidden-gem */}
          <Link
            href="/explore?filter=hidden-gems"
            className="flex items-center gap-1.5 text-[13px] font-semibold text-forest-700 hover:text-forest-900 transition-colors"
          >
            See all <ArrowRight size={14} />
          </Link>
        </div>

        {/* Horizontal scroll */}
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
          {gems.map(place => (
            <Link
              key={place.id}
              href={`/places/${place.slug}`}
              className="group shrink-0 w-[240px] rounded-xl overflow-hidden bg-white shadow-card hover:shadow-hover transition-shadow duration-300"
            >
              {/* Image — cover_photo_url (resolved URL, not Unsplash ID) */}
              <div className="relative h-[140px] overflow-hidden">
                {place.cover_photo_url ? (
                  <Image
                    src={place.cover_photo_url}
                    alt={place.name}
                    fill
                    sizes="240px"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                ) : (
                  <div className="absolute inset-0 bg-sand-200" />
                )}
              </div>

              {/* Info */}
              <div className="p-3">
                {/* locality + island instead of place.location */}
                <p className="text-[11px] text-ink-400 mb-0.5">{place.locality}, {place.island}</p>
                <h3 className="font-display font-semibold text-[14px] tracking-[-0.01em] text-forest-900 line-clamp-1">
                  {place.name}
                </h3>
                <p className="mt-1 text-[12px] text-ink-500 line-clamp-2 leading-relaxed">
                  {place.description}
                </p>
                {/* stats.save_count instead of place.saves */}
                <p className="mt-2 text-[11px] text-forest-500 font-semibold">
                  {formatCount(place.stats?.save_count ?? 0)} saves
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
