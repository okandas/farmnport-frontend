import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Agrochemical Guides - Complete Resource for Pesticides & Herbicides | farmnport',
  description: 'Comprehensive agrochemical guides covering insecticides, fungicides, herbicides, and more. Search active ingredients, dosage rates, target pests, and safe application methods.',
  keywords: 'agrochemical guides, pesticides, herbicides, fungicides, insecticides, active ingredients, dosage rates, pest control, disease management, agricultural chemicals',
  authors: [{ name: 'farmnport' }],
  openGraph: {
    title: 'Agrochemical Guides - Complete Resource for Pesticides & Herbicides',
    description: 'Comprehensive agrochemical guides covering insecticides, fungicides, herbicides, and more. Search active ingredients, dosage rates, target pests, and safe application methods.',
    url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://farmnport.com'}/agrochemical-guides`,
    siteName: 'farmnport',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Agrochemical Guides - Complete Resource',
    description: 'Comprehensive guides for pesticides, herbicides, fungicides, and agricultural chemicals.',
  },
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://farmnport.com'}/agrochemical-guides`,
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

export default function AgroChemicalGuidesRootLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
