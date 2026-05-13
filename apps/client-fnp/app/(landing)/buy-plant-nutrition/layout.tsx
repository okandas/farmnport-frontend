import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Buy Plant Nutrition Products Online - Fertilizers & Nutrients | farmnport',
  description: 'Shop professional plant nutrition products online. Wide selection of fertilizers, micronutrients, and crop nutrition solutions with fast shipping and secure checkout.',
  keywords: 'buy plant nutrition, shop fertilizers online, buy crop nutrients, plant nutrition products, micronutrients, fertilizer shop, crop health products',
  authors: [{ name: 'farmnport' }],
  openGraph: {
    title: 'Buy Plant Nutrition Products Online - Fertilizers & Nutrients',
    description: 'Shop professional plant nutrition products with fast shipping and secure checkout.',
    url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://farmnport.com'}/buy-plant-nutrition`,
    siteName: 'farmnport',
    locale: 'en_ZW',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Buy Plant Nutrition Products Online',
    description: 'Shop professional plant nutrition products with fast shipping.',
  },
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://farmnport.com'}/buy-plant-nutrition`,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
}

export default function BuyPlantNutritionLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
