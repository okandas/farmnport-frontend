import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Buy Livestock Feed Online - Shop Animal Feed & Supplements | farmnport',
  description: 'Shop livestock feed products online. Wide selection of poultry feed, cattle feed, and animal nutrition products with fast shipping and secure checkout.',
  keywords: 'buy livestock feed, shop animal feed online, buy poultry feed, buy cattle feed, animal nutrition products, feed supplements shop',
  authors: [{ name: 'farmnport' }],
  openGraph: {
    title: 'Buy Livestock Feed Online - Shop Animal Feed & Supplements',
    description: 'Shop livestock feed products with fast shipping and secure checkout.',
    url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://farmnport.com'}/buy-feeds`,
    siteName: 'farmnport',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Buy Livestock Feed Online',
    description: 'Shop livestock feed products with fast shipping.',
  },
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://farmnport.com'}/buy-feeds`,
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

export default function BuyFeedsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
