import {
  Sparkles, Utensils, Coffee, TreePalm, MoonStar, Sailboat, PartyPopper, Binoculars,
  ShoppingBasket, Waves, Leaf, Drama, FerrisWheel, Sunset, Gem, Flame, MapPin,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { PlaceCategory, VibeSlug } from '@/types'

export type WendaIconName = PlaceCategory | 'all' | VibeSlug | 'trending' | 'pin'

interface IconDef {
  icon: LucideIcon
  /** Hover nudge — applied when a parent `.group` is hovered (motion-safe only) */
  hover: string
  /** Orange is used selectively: only these icons carry the ember accent */
  accent?: boolean
}

// WENDA's icon language — one expressive Lucide icon per category / vibe.
// Each has its own small hover gesture so discovery feels alive, not corporate.
const ICONS: Record<WendaIconName, IconDef> = {
  // Categories
  all:        { icon: Sparkles,       hover: 'motion-safe:group-hover:rotate-12 motion-safe:group-hover:scale-110' },
  restaurant: { icon: Utensils,       hover: 'motion-safe:group-hover:-rotate-12' },
  cafe:       { icon: Coffee,         hover: 'motion-safe:group-hover:-translate-y-0.5 motion-safe:group-hover:-rotate-6' },
  beach:      { icon: TreePalm,       hover: 'motion-safe:group-hover:rotate-6', accent: true },
  nightlife:  { icon: MoonStar,       hover: 'motion-safe:group-hover:-rotate-12' },
  activity:   { icon: Sailboat,       hover: 'motion-safe:group-hover:translate-x-0.5 motion-safe:group-hover:-rotate-3' },
  event:      { icon: PartyPopper,    hover: 'motion-safe:group-hover:-rotate-12 motion-safe:group-hover:scale-110' },
  viewpoint:  { icon: Binoculars,     hover: 'motion-safe:group-hover:scale-110' },
  market:     { icon: ShoppingBasket, hover: 'motion-safe:group-hover:-translate-y-0.5' },

  // Vibes
  'beach-ocean':   { icon: Waves,       hover: 'motion-safe:group-hover:translate-x-0.5', accent: true },
  'local-food':    { icon: Utensils,    hover: 'motion-safe:group-hover:-rotate-12' },
  'nature-hiking': { icon: Leaf,        hover: 'motion-safe:group-hover:rotate-12' },
  'arts-culture':  { icon: Drama,       hover: 'motion-safe:group-hover:-rotate-6' },
  'family-kids':   { icon: FerrisWheel, hover: 'motion-safe:group-hover:rotate-45' },
  'sunset-spots':  { icon: Sunset,      hover: 'motion-safe:group-hover:-translate-y-0.5', accent: true },
  'hidden-gems':   { icon: Gem,         hover: 'motion-safe:group-hover:scale-110 motion-safe:group-hover:rotate-6', accent: true },

  // Signals
  trending: { icon: Flame,  hover: 'motion-safe:group-hover:scale-110 motion-safe:group-hover:-rotate-6', accent: true },
  pin:      { icon: MapPin, hover: 'motion-safe:group-hover:-translate-y-0.5' },
}

interface WendaIconProps {
  name: WendaIconName
  size?: number
  /**
   * 'default'  — sage, with ember on accent icons (light surfaces)
   * 'inverse'  — cream, with ember on accent icons (dark surfaces / active pills)
   * 'inherit'  — takes the parent's text colour
   */
  tone?: 'default' | 'inverse' | 'inherit'
  className?: string
}

export default function WendaIcon({ name, size = 15, tone = 'default', className }: WendaIconProps) {
  const def = ICONS[name] ?? ICONS.pin
  const Icon = def.icon

  const color =
    tone === 'inherit' ? '' :
    tone === 'inverse' ? (def.accent ? 'text-ember-400' : 'text-sand-300') :
    (def.accent ? 'text-ember-500' : 'text-forest-600')

  return (
    <Icon
      size={size}
      strokeWidth={2}
      aria-hidden
      className={cn(
        'shrink-0 transition-transform duration-200 ease-spring',
        def.hover,
        color,
        className,
      )}
    />
  )
}

/** Shared pill styling — category chips, quick links, filters */
export function pillClass(active = false): string {
  return cn(
    'group shrink-0 inline-flex items-center gap-2 rounded-full border text-[13px] font-medium',
    'transition-colors duration-200 ease-smooth',
    active
      ? 'bg-forest-900 border-forest-900 text-sand-200 shadow-sm'
      : 'bg-sand-100 border-forest-900/10 text-forest-900 hover:bg-white hover:border-forest-900/30',
  )
}
