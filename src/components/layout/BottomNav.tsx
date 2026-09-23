'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Compass, Map, CalendarDays, Bookmark, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/',        label: 'Home',    icon: Home         },
  { href: '/explore', label: 'Explore', icon: Compass      },
  { href: '/map',     label: 'Map',     icon: Map          },
  { href: '/outings', label: 'Outings', icon: CalendarDays },
  { href: '/saved',   label: 'Saved',   icon: Bookmark     },
  { href: '/profile', label: 'Profile', icon: User         },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed bottom-0 left-0 right-0 z-50 bg-[var(--bg-base)] border-t border-[var(--border-subtle)] pb-safe md:hidden"
      style={{ height: 'calc(var(--bottom-nav-h) + env(safe-area-inset-bottom, 0px))' }}
    >
      <div className="flex items-center justify-around h-[var(--bottom-nav-h)]">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex flex-col items-center justify-center gap-1 min-w-[52px] h-full px-2 transition-colors',
                active ? 'text-forest-900' : 'text-ink-400 hover:text-ink-700'
              )}
            >
              <Icon
                size={22}
                strokeWidth={active ? 2.2 : 1.8}
                className="transition-all"
              />
              <span
                className={cn(
                  'text-[10px] font-medium leading-none',
                  active ? 'font-semibold text-forest-900' : 'text-ink-400'
                )}
              >
                {label}
              </span>
              {active && (
                <span className="absolute bottom-2 w-1 h-1 rounded-full bg-ember-500" />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
