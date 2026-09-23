import Image from 'next/image'
import Link from 'next/link'
import { Flame, Users } from 'lucide-react'
import { cn, formatCount } from '@/lib/utils'
import SaveButton from '@/components/ui/SaveButton'
import Badge from '@/components/ui/Badge'
import type { Place } from '@/types'
import { isNewPlace, PRICE_RANGE_LABELS } from '@/types'

// hidden-gem is NOT a category — removed from CATEGORY_LABEL
const CATEGORY_LABEL: Record<string, string> = {
  restaurant: 'Restaurant',
  cafe:       'Café',
  beach:      'Beach',
  nightlife:  'Nightlife',
  activity:   'Activity',
  event:      'Event',
  viewpoint:  'Viewpoint',
  market:     'Market',
}

interface PlaceCardProps {
  place: Place
  /** 'full' = image + info below (default); 'compact' = smaller square card */
  variant?: 'full' | 'compact' | 'horizontal'
  className?: string
}

export default function PlaceCard({ place, variant = 'full', className }: PlaceCardProps) {
  // cover_photo_url is a resolved URL (Supabase storage or Unsplash in dev)
  const imgSrc = place.cover_photo_url ?? ''
  const aspectClass = variant === 'compact' ? 'aspect-square' : 'aspect-[4/3]'
  const isNew = isNewPlace(place.created_at)

  // Stats from place_stats join (safe defaults if not fetched)
  const saveCount = place.stats?.save_count ?? 0
  const visitWeek = place.stats?.visit_7d ?? 0

  return (
    <Link
      href={`/places/${place.slug}`}
      className={cn(
        'group block bg-[var(--bg-surface)] rounded-xl overflow-hidden',
        'shadow-card hover:shadow-hover transition-shadow duration-300',
        className,
      )}
    >
      {/* Image */}
      <div className={cn('relative overflow-hidden', aspectClass)}>
        {imgSrc ? (
          <Image
            src={imgSrc}
            alt={place.name}
            fill
            sizes={variant === 'compact'
              ? '(max-width: 640px) 50vw, 25vw'
              : '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
            }
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 bg-sand-200" />
        )}

        {/* Badges top-left */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
          {place.trending && (
            <Badge variant="trending">🔥 Trending</Badge>
          )}
          {isNew && !place.trending && (
            <Badge variant="new">New</Badge>
          )}
          {/* is_hidden_gem: admin/curator flag — show badge but not filterable as vibe */}
          {place.is_hidden_gem && !place.trending && (
            <Badge variant="hidden">Hidden gem</Badge>
          )}
        </div>

        {/* Save button top-right */}
        <div className="absolute top-2.5 right-2.5">
          <SaveButton placeId={place.id} />
        </div>

        {/* Subtle gradient at bottom of image */}
        <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/20 to-transparent" />
      </div>

      {/* Info */}
      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-display font-semibold text-[15px] tracking-[-0.01em] text-[var(--text-primary)] line-clamp-1">
              {place.name}
            </h3>
            {/* Location: locality + island (NOT place.location) */}
            <p className="text-[12px] text-[var(--text-secondary)] mt-0.5 line-clamp-1">
              {place.locality}{place.island !== place.locality ? `, ${place.island}` : ''}
            </p>
          </div>
          {/* price_range: smallint 1–4 from DB (NOT priceRange) */}
          {place.price_range && (
            <span className="shrink-0 text-[11px] text-[var(--text-muted)] font-medium">
              {PRICE_RANGE_LABELS[place.price_range]}
            </span>
          )}
        </div>

        {/* Tags row */}
        <div className="mt-2 flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] text-[var(--text-secondary)] font-medium">
            {CATEGORY_LABEL[place.category] ?? place.category}
          </span>
          {place.vibes.slice(0, 2).map(v => (
            <span key={v} className="text-[11px] text-[var(--text-muted)]">
              · {v.replace(/-/g, ' ')}
            </span>
          ))}
        </div>

        {/* Stats row — from place_stats join */}
        <div className="mt-2.5 flex items-center gap-3 text-[11px] text-[var(--text-muted)]">
          <span className="flex items-center gap-1">
            <span className="text-forest-500 font-semibold">{formatCount(saveCount)}</span>
            {' saves'}
          </span>
          {visitWeek > 0 && (
            <span className="flex items-center gap-1">
              <Users size={10} />
              {formatCount(visitWeek)} this week
            </span>
          )}
          {place.trending && (
            <span className="flex items-center gap-1 text-ember-500 font-medium ml-auto">
              <Flame size={10} />
              Rising
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
