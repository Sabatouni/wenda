import Header from '@/components/layout/Header'
import BottomNav from '@/components/layout/BottomNav'
import Link from 'next/link'
import Image from 'next/image'
import { Plus, Users, MapPin, ChevronRight, Calendar, Clock } from 'lucide-react'
import { DEMO_PLACES } from '@/data/demo'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Outings — Wenda' }

const DEMO_OUTINGS = [
  {
    id: 'o1',
    name: 'Saturday beach day 🌊',
    date: 'This Saturday',
    time: '10am',
    places: [DEMO_PLACES[2], DEMO_PLACES[4], DEMO_PLACES[7]],
    members: 4,
    status: 'planning' as const,
  },
  {
    id: 'o2',
    name: 'Stone Town food tour',
    date: 'Next Friday',
    time: '6pm',
    places: [DEMO_PLACES[0], DEMO_PLACES[3], DEMO_PLACES[5]],
    members: 2,
    status: 'confirmed' as const,
  },
]

export default function OutingsPage() {
  return (
    <>
      <Header />
      <main className="pt-[var(--nav-h)] pb-[var(--bottom-nav-h)] md:pb-0 min-h-screen">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">

          {/* Header */}
          <div className="flex items-end justify-between mb-8">
            <div>
              <h1 className="font-display font-bold text-[28px] sm:text-[34px] tracking-[-0.02em] text-forest-900">
                Outings
              </h1>
              <p className="text-ink-500 mt-1 text-[14px]">Plans you're making</p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-forest-900 text-sand-300 text-[13px] font-semibold hover:bg-forest-800 transition-colors">
              <Plus size={15} />
              New outing
            </button>
          </div>

          {/* Active outings */}
          {DEMO_OUTINGS.length > 0 ? (
            <div className="space-y-4 mb-10">
              {DEMO_OUTINGS.map(outing => (
                <div
                  key={outing.id}
                  className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] overflow-hidden hover:border-forest-900/20 transition-colors"
                >
                  {/* Photo strip */}
                  <div className="flex h-[100px] overflow-hidden">
                    {outing.places.map((place, i) => (
                      <div key={place.id} className="relative flex-1 overflow-hidden">
                        <Image
                          src={place.cover_photo_url ?? ''}
                          alt={place.name}
                          fill
                          sizes="33vw"
                          className="object-cover"
                        />
                        {i < outing.places.length - 1 && (
                          <div className="absolute right-0 top-0 bottom-0 w-px bg-white/30" />
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-display font-semibold text-[17px] tracking-[-0.01em] text-forest-900">
                          {outing.name}
                        </h3>
                        <div className="flex items-center gap-3 mt-1.5">
                          <div className="flex items-center gap-1 text-[12px] text-ink-500">
                            <Calendar size={11} />
                            {outing.date}
                          </div>
                          <div className="flex items-center gap-1 text-[12px] text-ink-500">
                            <Clock size={11} />
                            {outing.time}
                          </div>
                          <div className="flex items-center gap-1 text-[12px] text-ink-500">
                            <Users size={11} />
                            {outing.members} going
                          </div>
                        </div>
                      </div>
                      <span className={`shrink-0 text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                        outing.status === 'confirmed'
                          ? 'bg-forest-50 text-forest-700 border border-forest-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {outing.status === 'confirmed' ? '✓ Confirmed' : '● Planning'}
                      </span>
                    </div>

                    {/* Places list */}
                    <div className="mt-3 flex flex-col gap-1">
                      {outing.places.map((place, i) => (
                        <div key={place.id} className="flex items-center gap-2">
                          <span className="text-[11px] font-bold text-ember-500 w-4">{i + 1}</span>
                          <MapPin size={10} className="text-ink-400" />
                          <span className="text-[12px] text-ink-600">{place.name}</span>
                          <span className="text-[11px] text-ink-400">· {place.locality}</span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 flex gap-2">
                      <button className="flex-1 py-2 rounded-lg border border-[var(--border-default)] text-[13px] font-medium text-forest-900 hover:bg-forest-50 transition-colors">
                        Edit
                      </button>
                      <button className="flex-1 py-2 rounded-lg bg-forest-900 text-sand-300 text-[13px] font-semibold hover:bg-forest-800 transition-colors">
                        Share
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          {/* Empty CTA */}
          <div className="rounded-2xl border-2 border-dashed border-[var(--border-subtle)] p-8 text-center">
            <div className="w-12 h-12 rounded-2xl bg-forest-50 flex items-center justify-center mx-auto mb-4">
              <Calendar size={22} className="text-forest-600" />
            </div>
            <h3 className="font-display font-semibold text-[16px] text-forest-900 mb-1">
              Start planning
            </h3>
            <p className="text-[13px] text-ink-400 mb-5 max-w-xs mx-auto">
              Build an outing from places you've saved. Invite friends, set a time, done.
            </p>
            <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-forest-900 text-sand-300 text-[13px] font-semibold hover:bg-forest-800 transition-colors">
              <Plus size={15} />
              New outing
            </button>
          </div>

          {/* Quick add from saved */}
          <div className="mt-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-semibold text-[17px] tracking-[-0.01em] text-forest-900">
                Quick add from saved
              </h2>
              <Link
                href="/saved"
                className="flex items-center gap-1 text-[12px] font-medium text-forest-600 hover:text-forest-900"
              >
                See saved <ChevronRight size={13} />
              </Link>
            </div>
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
              {DEMO_PLACES.slice(0, 5).map(place => (
                <button
                  key={place.id}
                  className="shrink-0 group flex flex-col items-center gap-2 w-[80px]"
                >
                  <div className="relative w-[72px] h-[72px] rounded-2xl overflow-hidden">
                    <Image
                      src={place.cover_photo_url ?? ''}
                      alt={place.name}
                      fill
                      sizes="72px"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-forest-900/50">
                      <Plus size={18} className="text-white" />
                    </div>
                  </div>
                  <span className="text-[10px] text-ink-500 text-center line-clamp-2 leading-tight">
                    {place.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>
      <BottomNav />
    </>
  )
}
