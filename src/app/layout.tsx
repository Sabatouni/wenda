import type { ReactNode } from 'react'
import type { Metadata, Viewport } from 'next'
import { spaceGrotesk, inter } from '@/lib/fonts'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'WENDA — Wenda wapi?',
    template: '%s | WENDA',
  },
  description: "There's always somewhere to go. Discover the best places in Zanzibar — restaurants, beaches, hidden gems, cafés, events and more.",
  keywords: ['Zanzibar', 'places to go', 'discover Zanzibar', 'restaurants Zanzibar', 'beaches Zanzibar'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'WENDA',
    title: 'WENDA — Wenda wapi?',
    description: "There's always somewhere to go.",
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WENDA — Wenda wapi?',
    description: "There's always somewhere to go.",
  },
  icons: {
    icon: '/logo-mark-dark.svg',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#faf6ef' },
    { media: '(prefers-color-scheme: dark)',  color: '#0a0d0b' },
  ],
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${spaceGrotesk.variable} ${inter.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  )
}
