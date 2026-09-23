import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, TrendingUp, Users } from 'lucide-react'
import { formatCount } from '@/lib/utils'
import { getTrendingPlaces } from '@/data/demo'

export default function TrendingSection() {
  const places = getTrendingPlaces()

  return (
    <section className="py-10 sm:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp size={14} className="text-ember-500" />
              <span className="text-[12px] font-semibold text-ember-500 uppercase tracking-widest">
                This week
              </span>
            </div>
            <h2 className="font-display font-bold text-[24px] sm:text-[28px] tracking-[-0.02em] text-forest-900">
              Trending now
            </h2>
          </div>
          <Link
            href="/explore?sort=trending"
            className="flex items-center gap-1.5 text-[13px] font-semibold text-forest-700 hover:text-forest-900 transition-colors"
          >
            See all <ArrowRight size={14} />
          </Link>
        </div>

        {/* Cards — horizontal scroll on mobile, grid on desktop */}
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:overflow-visible sm:pb-0">
          {places.map((place, i) => (
            <Link
              key={place.id}
              href={`/places/${place.slug}`}
              className="group relative shrink-0 w-[280px] sm:w-auto rounded-xl overflow-hidden"
              style={{ minHeight: i === 0 ? 360 : 280 }}
            >
              {/* Full-bleed image */}
              <Image
                src={place.cover_photo_url ?? ''}
                alt={place.name}
                fill
                sizes="(max-width: 640px) 280px, (max-width: 1024px) 50vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                loading={i < 2 ? 'eager' : 'lazy'}
              />

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

              {/* Trending number */}
              <div className="absolute top-3 left-3 w-7 h-7 rounded-full bg-ember-500 flex items-center justify-center text-white text-[12px] font-bold shadow-md">
                {i + 1}
              </div>

              {/* Info */}
              <div className="absolute inset-x-0 bottom-0 p-4">
                <p className="text-[11px] text-sand-400 font-medium mb-1">
                  {place.locality}
                </p>
                <h3 className="font-display font-bold text-white text-[18px] tracking-[-0.01em] line-clamp-1">
                  {place.name}
                </h3>
                <div className="mt-2 flex items-center gap-3 text-[11px] text-sand-300">
                  <span className="flex items-center gap-1">
                    <TrendingUp size={10} className="text-ember-400" />
                    {formatCount(place.stats?.save_count ?? 0)} saves
                  </span>
                  <span className="flex items-center gap-1">
                    <Users size={10} />
                    {formatCount(place.stats?.visit_7d ?? 0)} visits
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
