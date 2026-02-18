import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'All Agrochemicals - Complete Product Catalog | farmnport',
  description: 'Browse our complete catalog of agrochemical products. Filter by brand, target pest, active ingredient, and more. Find detailed information on dosage rates, application methods, and safety guidelines.',
  keywords: 'agrochemicals catalog, all pesticides, herbicides list, fungicides directory, insecticides, pest control products, agricultural chemicals, crop protection',
  authors: [{ name: 'farmnport' }],
  openGraph: {
    title: 'All Agrochemicals - Complete Product Catalog',
    description: 'Browse our complete catalog of agrochemical products with detailed information on active ingredients, dosage rates, and application guidelines.',
    url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://farmnport.com'}/agrochemical-guides/all`,
    siteName: 'farmnport',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'All Agrochemicals - Complete Catalog',
    description: 'Browse our complete catalog of agrochemical products with detailed guides.',
  },
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://farmnport.com'}/agrochemical-guides/all`,
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

export default function AllAgroChemicalsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
