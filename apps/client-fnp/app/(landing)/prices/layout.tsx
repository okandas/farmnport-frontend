import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Farm Produce Prices | farmnport',
  description: 'Browse current farm produce price lists from verified buyers and suppliers. Real-time market prices for fresh fruits, vegetables, and agricultural products.',
  keywords: 'farm produce prices, market prices, agricultural prices, fresh produce, buyer prices, supplier prices, farm products',
  authors: [{ name: 'farmnport' }],
  openGraph: {
    title: 'Farm Produce Prices',
    description: 'Browse current farm produce price lists from verified buyers and suppliers. Real-time market prices for fresh fruits, vegetables, and agricultural products.',
    url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://farmnport.com'}/prices`,
    siteName: 'farmnport',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Farm Produce Prices',
    description: 'Browse current farm produce price lists from verified buyers and suppliers.',
  },
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://farmnport.com'}/prices`,
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
