import { Metadata } from 'next'

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://farmnport.com'

export const metadata: Metadata = {
  title: {
    template: '%s | farmnport',
    default: 'Agricultural Market Prices Zimbabwe | farmnport',
  },
  description: 'Compare current agricultural prices from verified buyers across Zimbabwe. Livestock, cattle, grains and more — updated weekly in USD and ZiG.',
  keywords: 'agricultural prices zimbabwe, cattle prices, liveweight prices, CDM prices, cold dress mass, beef prices, livestock market, farm produce prices, abattoir rates',
  authors: [{ name: 'farmnport' }],
  openGraph: {
    title: 'Agricultural Market Prices Zimbabwe',
    description: 'Compare current agricultural prices from verified buyers across Zimbabwe.',
    url: `${baseUrl}/prices`,
    siteName: 'farmnport',
    locale: 'en_ZW',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Agricultural Market Prices Zimbabwe',
    description: 'Compare current agricultural prices from verified buyers across Zimbabwe.',
  },
  alternates: {
    canonical: `${baseUrl}/prices`,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function PricesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
