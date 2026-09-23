import Header from '@/components/layout/Header'
import BottomNav from '@/components/layout/BottomNav'
import Hero from '@/components/home/Hero'
import TrendingSection from '@/components/home/TrendingSection'
import VibeGrid from '@/components/home/VibeGrid'
import HiddenGemsStrip from '@/components/home/HiddenGemsStrip'
import DiscoveryGrid from '@/components/home/DiscoveryGrid'
import MapCTA from '@/components/home/MapCTA'

export default function HomePage() {
  return (
    <>
      <Header />

      <main className="pb-[var(--bottom-nav-h)] md:pb-0">
        <Hero />

        <div className="h-px bg-[var(--border-subtle)]" />

        <TrendingSection />

        <div className="h-px bg-[var(--border-subtle)]" />

        <VibeGrid />

        <HiddenGemsStrip />

        <div className="h-px bg-[var(--border-subtle)]" />

        <DiscoveryGrid />

        <MapCTA />

        {/* Footer */}
        <footer className="border-t border-[var(--border-subtle)] py-10 mt-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="font-display font-bold text-[16px] tracking-[-0.02em] text-forest-900">
                  WENDA
                </p>
                <p className="text-[13px] text-ink-400 mt-0.5">
                  There&apos;s always somewhere to go.
                </p>
              </div>
              <p className="text-[12px] text-ink-400">
                © 2026 WENDA · Zanzibar, Tanzania
              </p>
            </div>
          </div>
        </footer>
      </main>

      <BottomNav />
    </>
  )
}
