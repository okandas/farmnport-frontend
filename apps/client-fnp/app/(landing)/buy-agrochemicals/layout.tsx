import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Buy Agrochemicals Online - Shop Pesticides & Herbicides | farmnport',
  description: 'Shop professional agrochemical products online. Wide selection of pesticides, herbicides, fungicides, and insecticides with fast shipping and secure checkout.',
  keywords: 'buy agrochemicals, shop pesticides online, buy herbicides, buy fungicides, buy insecticides, crop protection products, agricultural chemicals shop',
  authors: [{ name: 'farmnport' }],
  openGraph: {
    title: 'Buy Agrochemicals Online - Shop Pesticides & Herbicides',
    description: 'Shop professional agrochemical products with fast shipping and secure checkout.',
    url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://farmnport.com'}/buy-agrochemicals`,
    siteName: 'farmnport',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Buy Agrochemicals Online',
    description: 'Shop professional agrochemical products with fast shipping.',
  },
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://farmnport.com'}/buy-agrochemicals`,
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

export default function BuyAgroChemicalsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
