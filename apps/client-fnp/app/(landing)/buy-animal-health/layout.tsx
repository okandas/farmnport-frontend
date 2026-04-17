import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Buy Animal Health Products Online - Vaccines, Antibiotics & More | farmnport',
  description: 'Shop professional animal health products online. Wide selection of vaccines, antibiotics, anti-parasitic treatments, and nutritional supplements with fast shipping.',
  keywords: 'buy animal health products, veterinary products, livestock vaccines, antibiotics, anti-parasitic, nutritional supplements, animal health shop',
  authors: [{ name: 'farmnport' }],
  openGraph: {
    title: 'Buy Animal Health Products Online - Vaccines, Antibiotics & More',
    description: 'Shop professional animal health products with fast shipping and secure checkout.',
    url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://farmnport.com'}/buy-animal-health`,
    siteName: 'farmnport',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Buy Animal Health Products Online',
    description: 'Shop professional animal health products with fast shipping.',
  },
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://farmnport.com'}/buy-animal-health`,
  },
  robots: {
    index: false,
    follow: true,
    googleBot: {
      index: false,
      follow: true,
    },
  },
}

export default function BuyAnimalHealthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
