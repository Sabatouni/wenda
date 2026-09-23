import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Bookmark, Navigation } from 'lucide-react'
import Header from '@/components/layout/Header'
import BottomNav from '@/components/layout/BottomNav'
import PlaceCard from '@/components/places/PlaceCard'
import Badge from '@/components/ui/Badge'
import { getPlaceBySlug, DEMO_PLACES } from '@/data/demo'
import { formatCount } from '@/lib/utils'
import { isNewPlace, PRICE_RANGE_LABELS } from '@/types'
import type { Metadata } from 'next'

interface Params { slug: string }

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params
  const place = getPlaceBySlug(slug)
  if (!place) return { title: 'Not found' }
  return {
    title: `${place.name} — ${place.locality}, ${place.island}`,
    description: place.description,
  }
}

export async function generateStaticParams() {
  return DEMO_PLACES.map(p => ({ slug: p.slug }))
}

export default async function PlacePage({ params }: { params: Promise<Params> }) {
  const { slug } = await params
  const place = getPlaceBySlug(slug)
  if (!place) return notFound()

  // Related: same locality first, then same island — excludes current place
  const related = DEMO_PLACES.filter(
    p => p.id !== place.id && p.locality === place.locality
  ).slice(0, 4)

  const CATEGORY_LABEL: Record<string, string> = {
    restaurant: 'Restaurant', cafe: 'Café', beach: 'Beach',
    nightlife: 'Nightlife', activity: 'Activity',
    event: 'Event', viewpoint: 'Viewpoint', market: 'Market',
  }

  return (
    <>
      <Header />
      <main className="pt-[var(--nav-h)] pb-[var(--bottom-nav-h)] md:pb-0">
        {/* Hero image */}
        <div className="relative h-[50vh] sm:h-[60vh] max-h-[560px] bg-ink-200">
          {place.cover_photo_url && (
            <Image
              src={place.cover_photo_url}
              alt={place.name}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

          {/* Back button */}
          <Link
            href="/explore"
            className="absolute top-4 left-4 flex items-center gap-2 px-3 py-2 rounded-full
                       bg-black/40 backdrop-blur-sm text-white text-[13px] font-medium
                       hover:bg-black/60 transition-colors"
          >
            ← Back
          </Link>

          {/* Badges */}
          <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
            {place.trending && <Badge variant="trending">🔥 Trending</Badge>}
            {isNewPlace(place.created_at) && <Badge variant="new">New</Badge>}
            {place.is_hidden_gem && <Badge variant="hidden">Hidden gem</Badge>}
          </div>

          {/* Title overlay */}
          <div className="absolute inset-x-0 bottom-0 p-6">
            <p className="text-sand-300 text-[13px] font-medium mb-1.5">
              {place.locality} · {CATEGORY_LABEL[place.category] ?? place.category}
            </p>
            <h1 className="font-display font-bold text-white text-[32px] sm:text-[40px] tracking-[-0.02em] leading-tight">
              {place.name}
            </h1>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          {/* Action bar */}
          <div className="flex items-center gap-3 py-5 border-b border-[var(--border-subtle)]">
            <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-forest-900 text-sand-300
                               text-[14px] font-semibold hover:bg-forest-800 transition-colors flex-1 sm:flex-none justify-center">
              <Bookmark size={15} />
              Save
            </button>
            <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[var(--border-default)]
                               text-[14px] font-semibold text-forest-900 hover:bg-forest-50 transition-colors flex-1 sm:flex-none justify-center">
              <Navigation size={15} />
              Directions
            </button>
            <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[var(--border-default)]
                               text-[14px] font-semibold text-forest-900 hover:bg-forest-50 transition-colors flex-1 sm:flex-none justify-center">
              Plan outing
            </button>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6 py-5 border-b border-[var(--border-subtle)]">
            <div>
              <p className="font-display font-bold text-[22px] text-forest-900">{formatCount(place.stats?.save_count ?? 0)}</p>
              <p className="text-[12px] text-ink-400">saves</p>
            </div>
            <div className="h-10 w-px bg-[var(--border-subtle)]" />
            <div>
              <p className="font-display font-bold text-[22px] text-forest-900">{formatCount(place.stats?.visit_7d ?? 0)}</p>
              <p className="text-[12px] text-ink-400">visits this week</p>
            </div>
            {place.price_range && (
              <>
                <div className="h-10 w-px bg-[var(--border-subtle)]" />
                <div>
                  <p className="font-display font-bold text-[22px] text-forest-900">{PRICE_RANGE_LABELS[place.price_range]}</p>
                  <p className="text-[12px] text-ink-400">price range</p>
                </div>
              </>
            )}
          </div>

          {/* Vibes */}
          <div className="py-5 border-b border-[var(--border-subtle)]">
            <div className="flex flex-wrap gap-2">
              <span className="text-[13px] font-medium text-ink-500 mr-1">Vibes:</span>
              {place.vibes.map(v => (
                <span
                  key={v}
                  className="px-3 py-1 rounded-full bg-forest-50 text-forest-800 text-[12px] font-medium border border-forest-100"
                >
                  {v.replace(/-/g, ' ')}
                </span>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="py-6 border-b border-[var(--border-subtle)]">
            <p className="text-[16px] text-ink-700 leading-relaxed">{place.description}</p>
          </div>

          {/* Location */}
          <div className="py-5 flex items-start gap-3 border-b border-[var(--border-subtle)]">
            <MapPin size={18} className="text-forest-600 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-forest-900">{place.locality}</p>
              <p className="text-[13px] text-ink-400 mt-0.5">{place.island}</p>
            </div>
          </div>
        </div>

        {/* Related places */}
        {related.length > 0 && (
          <section className="py-10 sm:py-14">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <h2 className="font-display font-bold text-[22px] tracking-[-0.02em] text-forest-900 mb-6">
                More in {place.locality}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {related.map(p => (
                  <PlaceCard key={p.id} place={p} variant="compact" />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
      <BottomNav />
    </>
  )
}
