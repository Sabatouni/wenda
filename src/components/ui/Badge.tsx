import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type BadgeVariant = 'default' | 'green' | 'orange' | 'muted' | 'trending' | 'new' | 'hidden'

interface BadgeProps {
  children: ReactNode
  variant?: BadgeVariant
  className?: string
}

const variantClasses: Record<BadgeVariant, string> = {
  default:  'bg-ink-100 text-ink-700',
  green:    'bg-forest-100 text-forest-800',
  orange:   'bg-ember-100 text-ember-700',
  muted:    'bg-ink-50 text-ink-500',
  trending: 'bg-ember-500 text-white',
  new:      'bg-forest-900 text-sand-300',
  hidden:   'bg-sand-300 text-forest-900',
}

export default function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold tracking-wide uppercase',
        variantClasses[variant],
        className,
      )}
    >
      {children}
    </span>
  )
}
