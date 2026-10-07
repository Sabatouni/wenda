'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Search, Menu, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import Image from 'next/image'

const NAV_LINKS = [
  { href: '/',         label: 'Home'    },
  { href: '/explore',  label: 'Explore' },
  { href: '/map',      label: 'Map'     },
  { href: '/outings',  label: 'Outings' },
]

export default function Header() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  // Border + shadow appear once the page scrolls under the header
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close the mobile menu with Escape
  useEffect(() => {
    if (!mobileOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [mobileOpen])

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 border-b backdrop-blur-md',
          'bg-[color-mix(in_srgb,var(--bg-base)_85%,transparent)]',
          'transition-[border-color,box-shadow] duration-300 ease-smooth',
          scrolled || mobileOpen
            ? 'border-[var(--border-subtle)] shadow-sm'
            : 'border-transparent',
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-[var(--nav-h)] flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            {/* Transparent mark for light backgrounds — derived from public/wenda-logo.png */}
            <Image
              src="/wenda-mark-dark.png"
              alt="WENDA"
              width={46}
              height={32}
              priority
              className="h-8 w-auto transition-transform duration-200 group-hover:scale-105"
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
                aria-current={pathname === link.href ? 'page' : undefined}
                className={cn(
                  'px-4 py-2 rounded-md text-[14px] font-medium transition-colors duration-150',
                  pathname === link.href
                    ? 'text-forest-900 bg-forest-900/[0.06]'
                    : 'text-ink-500 hover:text-ink-900 hover:bg-ink-50'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/explore"
              aria-label="Search"
              className="w-9 h-9 flex items-center justify-center rounded-md text-ink-500 hover:text-ink-900 hover:bg-ink-50 active:scale-95 transition md:hidden"
            >
              <Search size={18} />
            </Link>

            <Link
              href="/saved"
              className="hidden md:flex items-center gap-2 px-4 py-2 rounded-md text-[14px] font-medium text-ink-500 hover:text-ink-900 hover:bg-ink-50 transition-colors"
            >
              Saved
            </Link>

            <Link
              href="/auth"
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-md text-[14px] font-semibold bg-forest-900 text-sand-300 hover:bg-forest-800 active:scale-[0.98] transition"
            >
              Sign in
            </Link>

            {/* Mobile menu toggle */}
            <button
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((v: boolean) => !v)}
              className="w-9 h-9 flex items-center justify-center rounded-md text-ink-600 hover:bg-ink-50 active:scale-95 transition md:hidden"
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu — always mounted so it can fade out as well as in */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-[var(--bg-base)] pt-[var(--nav-h)] md:hidden',
          'transition-[opacity,visibility] duration-200 ease-smooth',
          mobileOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none',
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        inert={!mobileOpen}
      >
        <nav
          className={cn(
            'flex flex-col gap-1 p-4 transition-transform duration-300 ease-smooth',
            mobileOpen ? 'translate-y-0' : '-translate-y-2',
          )}
        >
          {NAV_LINKS.map(link => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'px-4 py-3 rounded-lg text-[16px] font-medium transition-colors',
                pathname === link.href
                  ? 'text-forest-900 bg-forest-900/[0.06] font-semibold'
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
            className="mt-2 px-4 py-3 rounded-lg text-[16px] font-semibold bg-forest-900 text-sand-300 text-center active:scale-[0.99] transition-transform"
          >
            Sign in
          </Link>
        </nav>
      </div>
    </>
  )
}
