import Link from 'next/link'
import { Map, ArrowRight } from 'lucide-react'

export default function MapCTA() {
  return (
    <section className="py-10 sm:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <Link
          href="/map"
          className="group relative flex flex-col sm:flex-row sm:items-center justify-between gap-6
                     bg-forest-900 rounded-2xl px-7 py-8 sm:px-10 sm:py-9 overflow-hidden
                     hover:bg-forest-800 transition-colors duration-300 cursor-pointer"
        >
          {/* Background dot decoration */}
          <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-ember-500/10 blur-2xl pointer-events-none" />
          <div className="absolute bottom-4 right-24 w-3 h-3 rounded-full bg-ember-500 opacity-60 pointer-events-none" />

          {/* Left */}
          <div className="relative">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                <Map size={20} className="text-sand-300" />
              </div>
              <span className="text-[12px] font-semibold text-ember-400 uppercase tracking-widest">
                Interactive map
              </span>
            </div>
            <h2 className="font-display font-bold text-[24px] sm:text-[28px] tracking-[-0.02em] text-sand-200 leading-tight">
              Explore what&apos;s
              <br />around you
            </h2>
            <p className="mt-2 text-[14px] text-sand-400 max-w-xs">
              Browse places geographically. Filter by vibe, category, or just zoom in on your area.
            </p>
          </div>

          {/* Right CTA */}
          <div className="relative shrink-0">
            <span className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-sand-300 text-forest-900
                             font-semibold text-[14px] group-hover:bg-sand-200 transition-colors duration-200">
              Open map
              <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-0.5" />
            </span>
          </div>
        </Link>
      </div>
    </section>
  )
}
