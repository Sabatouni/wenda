import Header from '@/components/layout/Header'
import BottomNav from '@/components/layout/BottomNav'

export default function ExploreLoading() {
  return (
    <>
      <Header />
      <main
        className="pt-[var(--nav-h)] pb-[var(--bottom-nav-h)] md:pb-0 min-h-screen"
        aria-busy="true"
        aria-label="Loading places"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="mb-6">
            <div className="skeleton h-9 w-40 rounded-md" />
            <div className="skeleton h-4 w-32 rounded mt-3" />
          </div>

          <div className="flex gap-2 overflow-hidden pb-2 mb-4">
            {Array.from({ length: 7 }, (_, i) => (
              <div key={i} className="skeleton shrink-0 h-9 w-24 rounded-full" />
            ))}
          </div>

          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
            {Array.from({ length: 8 }, (_, i) => (
              <div key={i} className="rounded-xl overflow-hidden bg-[var(--bg-surface)] shadow-card">
                <div className="skeleton aspect-[4/3]" />
                <div className="p-3">
                  <div className="skeleton h-4 w-3/4 rounded" />
                  <div className="skeleton h-3 w-1/2 rounded mt-2" />
                  <div className="skeleton h-3 w-2/3 rounded mt-3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <BottomNav />
    </>
  )
}
