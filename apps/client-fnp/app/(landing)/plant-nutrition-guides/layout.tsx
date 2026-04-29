import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Plant Nutrition Guides - Fertilizers, Foliar Feeds & Biostimulants | farmnport',
  description: 'Comprehensive plant nutrition product guides covering fertilizers, foliar feeds, biostimulants, and plant growth regulators. Find application rates and active ingredients.',
  keywords: 'plant nutrition guides, fertilizers, foliar feeds, biostimulants, plant growth regulators, application rates, active ingredients',
  authors: [{ name: 'farmnport' }],
  openGraph: {
    title: 'Plant Nutrition Guides - Fertilizers, Foliar Feeds & Biostimulants',
    description: 'Comprehensive plant nutrition product guides. Find application rates and active ingredients for fertilizers, foliar feeds, and more.',
    url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://farmnport.com'}/plant-nutrition-guides`,
    siteName: 'farmnport',
    locale: 'en_ZW',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Plant Nutrition Guides - Complete Fertilizer & Foliar Feed Resource',
    description: 'Comprehensive guides for fertilizers, foliar feeds, biostimulants, and plant nutrition products.',
  },
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://farmnport.com'}/plant-nutrition-guides`,
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

export default function PlantNutritionGuidesRootLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
