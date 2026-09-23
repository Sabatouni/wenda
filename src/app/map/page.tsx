import Header from '@/components/layout/Header'
import BottomNav from '@/components/layout/BottomNav'
import { Map, Filter, Search, Layers } from 'lucide-react'
import { DEMO_PLACES, CATEGORIES } from '@/data/demo'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Map — Wenda' }

export default function MapPage() {
  return (
    <>
      <Header />
      <main className="pt-[var(--nav-h)] pb-[var(--bottom-nav-h)] md:pb-0 h-screen flex flex-col overflow-hidden">
        {/* Map placeholder — full-height container */}
        <div className="relative flex-1 bg-[#e8ead6] overflow-hidden">

          {/* Fake map texture */}
          <svg className="absolute inset-0 w-full h-full opacity-30" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#0b2d1a" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>

          {/* Fake map roads */}
          <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg" style={{opacity: 0.15}}>
            <line x1="20%" y1="0" x2="35%" y2="100%" stroke="#0b2d1a" strokeWidth="3"/>
            <line x1="50%" y1="0" x2="60%" y2="100%" stroke="#0b2d1a" strokeWidth="5"/>
            <line x1="0" y1="30%" x2="100%" y2="25%" stroke="#0b2d1a" strokeWidth="3"/>
            <line x1="0" y1="65%" x2="100%" y2="60%" stroke="#0b2d1a" strokeWidth="4"/>
            <line x1="75%" y1="0" x2="80%" y2="100%" stroke="#0b2d1a" strokeWidth="2"/>
            <line x1="0" y1="45%" x2="100%" y2="50%" stroke="#0b2d1a" strokeWidth="2"/>
          </svg>

          {/* Demo place pins */}
          {DEMO_PLACES.slice(0, 8).map((place, i) => {
            const positions = [
              { top: '18%', left: '32%' },
              { top: '38%', left: '55%' },
              { top: '55%', left: '28%' },
              { top: '25%', left: '68%' },
              { top: '70%', left: '60%' },
              { top: '45%', left: '75%' },
              { top: '62%', left: '42%' },
              { top: '30%', left: '48%' },
            ]
            const pos = positions[i]
            return (
              <Link
                key={place.id}
                href={`/places/${place.slug}`}
                className="absolute group"
                style={pos}
              >
                <div className="relative">
                  <div className="
                    px-2.5 py-1.5 rounded-xl bg-forest-900 text-sand-300 text-[11px] font-semibold
                    shadow-float whitespace-nowrap
                    group-hover:bg-ember-500 transition-colors duration-150
                    -translate-x-1/2
                  ">
                    {place.name}
                  </div>
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-forest-900 group-hover:bg-ember-500 transition-colors duration-150" />
                </div>
              </Link>
            )
          })}

          {/* Search bar overlay */}
          <div className="absolute top-4 left-4 right-4 z-10">
            <div className="flex gap-2">
              <div className="flex-1 flex items-center gap-2 bg-white/95 backdrop-blur-sm rounded-xl px-4 py-3 shadow-nav">
                <Search size={16} className="text-ink-400 shrink-0" />
                <span className="text-[14px] text-ink-400">Search on map…</span>
              </div>
              <button className="w-12 h-12 rounded-xl bg-white/95 backdrop-blur-sm shadow-nav flex items-center justify-center">
                <Filter size={16} className="text-forest-900" />
              </button>
              <button className="w-12 h-12 rounded-xl bg-white/95 backdrop-blur-sm shadow-nav flex items-center justify-center">
                <Layers size={16} className="text-forest-900" />
              </button>
            </div>
          </div>

          {/* Category filter strip */}
          <div className="absolute top-20 left-0 right-0 z-10 px-4">
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full
                             bg-white/90 backdrop-blur-sm border border-white/60
                             text-[12px] font-medium text-forest-900
                             shadow-sm hover:bg-white transition-all duration-150"
                >
                  <span>{cat.emoji}</span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Watermark / Coming soon note */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/60 backdrop-blur-sm">
              <Map size={12} className="text-sand-300" />
              <span className="text-[11px] font-medium text-sand-300">Interactive map coming soon</span>
            </div>
          </div>
        </div>

        {/* Bottom sheet — place list */}
        <div className="bg-[var(--bg-base)] border-t border-[var(--border-subtle)] overflow-y-auto"
             style={{ maxHeight: '40vh' }}>
          <div className="px-4 pt-4 pb-2">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[13px] font-semibold text-ink-500">
                {DEMO_PLACES.length} places nearby
              </p>
              <button className="text-[12px] font-medium text-forest-600 hover:text-forest-900">
                Sort by distance
              </button>
            </div>
            <div className="space-y-3">
              {DEMO_PLACES.slice(0, 6).map(place => (
                <Link
                  key={place.id}
                  href={`/places/${place.slug}`}
                  className="flex items-center gap-3 py-2 hover:bg-[var(--bg-surface)] rounded-xl px-2 -mx-2 transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-forest-100 flex items-center justify-center shrink-0 text-[18px]">
                    {CATEGORIES.find(c => c.id === place.category)?.emoji ?? '📍'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-[14px] text-forest-900 truncate">{place.name}</p>
                    <p className="text-[12px] text-ink-400">{place.locality}</p>
                  </div>
                  {place.trending && (
                    <span className="shrink-0 text-[10px] font-semibold text-ember-500 bg-ember-50 px-2 py-0.5 rounded-full">
                      🔥 Hot
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>
      <BottomNav />
    </>
  )
}
