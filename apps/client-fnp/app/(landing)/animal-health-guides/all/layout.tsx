import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'All Animal Health Products - Complete Product Catalog | farmnport',
  description: 'Browse our complete catalog of animal health products. Filter by brand, target disease, active ingredient, and animal type. Find detailed dosage rates and withdrawal periods.',
  keywords: 'animal health products catalog, poultry vaccines, livestock antibiotics, veterinary supplements, dosage rates, withdrawal periods, Newcastle disease, coccidiosis',
  authors: [{ name: 'farmnport' }],
  openGraph: {
    title: 'All Animal Health Products - Complete Product Catalog',
    description: 'Browse our complete catalog of animal health products with detailed information on active ingredients, dosage rates, and withdrawal periods.',
    url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://farmnport.com'}/animal-health-guides/all`,
    siteName: 'farmnport',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'All Animal Health Products - Complete Catalog',
    description: 'Browse our complete catalog of animal health products with detailed guides.',
  },
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://farmnport.com'}/animal-health-guides/all`,
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

export default function AllAnimalHealthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
