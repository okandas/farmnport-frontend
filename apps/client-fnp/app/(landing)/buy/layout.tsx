import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Buy Farm Inputs Online Zimbabwe | Agrochemicals, Feed & Animal Health | farmnport',
  description: 'Shop farm inputs online in Zimbabwe — agrochemicals, animal health products, animal feed, seeds and plant nutrition. Zimbabwe\'s only online farm shop with fast delivery.',
  keywords: 'buy farm inputs Zimbabwe, buy agrochemicals online Zimbabwe, buy animal health products Zimbabwe, buy animal feed online, Zimbabwe online farm shop, farmnport shop',
  authors: [{ name: 'farmnport' }],
  openGraph: {
    title: 'Buy Farm Inputs Online Zimbabwe | farmnport',
    description: 'Zimbabwe\'s only online farm shop. Agrochemicals, animal health, feed, seeds and plant nutrition — shop now.',
    url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://farmnport.com'}/buy`,
    siteName: 'farmnport',
    locale: 'en_ZW',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Buy Farm Inputs Online Zimbabwe | farmnport',
    description: 'Zimbabwe\'s only online farm shop. Agrochemicals, animal health, feed & more.',
  },
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://farmnport.com'}/buy`,
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

export default function BuyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
