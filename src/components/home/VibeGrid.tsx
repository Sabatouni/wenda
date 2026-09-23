import Image from 'next/image'
import Link from 'next/link'
import { unsplash } from '@/lib/utils'
import { DEMO_VIBES } from '@/data/demo'

export default function VibeGrid() {
  return (
    <section className="py-10 sm:py-14 bg-forest-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="mb-7">
          <p className="text-[12px] font-semibold text-ember-500 uppercase tracking-widest mb-1">
            What are you feeling?
          </p>
          <h2 className="font-display font-bold text-[24px] sm:text-[28px] tracking-[-0.02em] text-sand-300">
            Explore by vibe
          </h2>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {DEMO_VIBES.map((vibe, i) => (
            <Link
              key={vibe.slug}
              href={`/explore?vibe=${vibe.slug}`}
              className="group relative rounded-lg overflow-hidden cursor-pointer"
              style={{ aspectRatio: i === 0 || i === 4 ? '1/1.2' : '1/1' }}
            >
              {/* Background image */}
              <Image
                src={unsplash(vibe.photoId, 400)}
                alt={vibe.label}
                fill
                sizes="(max-width: 640px) 50vw, 25vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-forest-900/80 via-forest-900/30 to-transparent group-hover:from-forest-900/70 transition-all duration-300" />

              {/* Content */}
              <div className="absolute inset-x-0 bottom-0 p-3.5">
                <span className="text-[18px] leading-none">{vibe.emoji}</span>
                <p className="mt-1.5 font-display font-bold text-[14px] sm:text-[15px] text-sand-200 tracking-[-0.01em] leading-tight">
                  {vibe.label}
                </p>
                <p className="text-[11px] text-sand-400 mt-0.5">
                  {vibe.placeCount} places
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
