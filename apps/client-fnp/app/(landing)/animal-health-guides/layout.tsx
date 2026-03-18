import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Animal Health Guides - Vaccines, Antibiotics & Supplements for Poultry | farmnport',
  description: 'Comprehensive animal health product guides covering vaccines, antibiotics, supplements, and more for poultry and livestock. Find dosage rates, active ingredients, and withdrawal periods.',
  keywords: 'animal health guides, poultry vaccines, livestock antibiotics, veterinary products, dosage rates, withdrawal periods, active ingredients, Newcastle disease vaccine, coccidiosis treatment',
  authors: [{ name: 'farmnport' }],
  openGraph: {
    title: 'Animal Health Guides - Vaccines, Antibiotics & Supplements for Poultry',
    description: 'Comprehensive animal health product guides covering vaccines, antibiotics, supplements, and more. Find dosage rates, active ingredients, and withdrawal periods.',
    url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://farmnport.com'}/animal-health-guides`,
    siteName: 'farmnport',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Animal Health Guides - Complete Veterinary Product Resource',
    description: 'Comprehensive guides for vaccines, antibiotics, supplements, and animal health products.',
  },
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://farmnport.com'}/animal-health-guides`,
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

export default function AnimalHealthGuidesRootLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
