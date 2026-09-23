'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Search, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

const NAV_LINKS = [
  { href: '/',         label: 'Home'    },
  { href: '/explore',  label: 'Explore' },
  { href: '/map',      label: 'Map'     },
  { href: '/outings',  label: 'Outings' },
]

export default function Header() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-[var(--bg-base)] border-b border-[var(--border-subtle)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-[var(--nav-h)] flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <Image
              src="/logo-mark-dark.svg"
              alt="WENDA"
              width={36}
              height={32}
              priority
              className="transition-transform duration-200 group-hover:scale-105"
            />
            <span className="font-display font-bold text-[18px] tracking-[-0.02em] text-forest-900 hidden xs:block">
              WENDA
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
            {NAV_LINKS.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'px-4 py-2 rounded-md text-[14px] font-medium transition-colors duration-150',
                  pathname === link.href
                    ? 'text-forest-900 bg-forest-900/6'
                    : 'text-ink-500 hover:text-ink-900 hover:bg-ink-50'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              aria-label="Search"
              className="w-9 h-9 flex items-center justify-center rounded-md text-ink-500 hover:text-ink-900 hover:bg-ink-50 transition-colors md:hidden"
            >
              <Search size={18} />
            </button>

            <Link
              href="/saved"
              className="hidden md:flex items-center gap-2 px-4 py-2 rounded-md text-[14px] font-medium text-ink-500 hover:text-ink-900 hover:bg-ink-50 transition-colors"
            >
              Saved
            </Link>

            <Link
              href="/auth"
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-md text-[14px] font-semibold bg-forest-900 text-sand-300 hover:bg-forest-800 transition-colors"
            >
              Sign in
            </Link>

            {/* Mobile menu toggle */}
            <button
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              onClick={() => setMobileOpen((v: boolean) => !v)}
              className="w-9 h-9 flex items-center justify-center rounded-md text-ink-600 hover:bg-ink-50 transition-colors md:hidden"
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-[var(--bg-base)] pt-[var(--nav-h)] md:hidden"
          role="dialog"
          aria-modal="true"
        >
          <nav className="flex flex-col gap-1 p-4">
            {NAV_LINKS.map(link => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'px-4 py-3 rounded-lg text-[16px] font-medium transition-colors',
                  pathname === link.href
                    ? 'text-forest-900 bg-forest-900/6 font-semibold'
                    : 'text-ink-600 hover:text-ink-900 hover:bg-ink-50'
                )}
              >
                {link.label}
              </Link>
            ))}
            <div className="h-px bg-[var(--border-subtle)] my-2" />
            <Link
              href="/saved"
              onClick={() => setMobileOpen(false)}
              className="px-4 py-3 rounded-lg text-[16px] font-medium text-ink-600 hover:text-ink-900 hover:bg-ink-50 transition-colors"
            >
              Saved
            </Link>
            <Link
              href="/auth"
              onClick={() => setMobileOpen(false)}
              className="mt-2 px-4 py-3 rounded-lg text-[16px] font-semibold bg-forest-900 text-sand-300 text-center"
            >
              Sign in
            </Link>
          </nav>
        </div>
      )}
    </>
  )
}
