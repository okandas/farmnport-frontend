import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Livestock Feed Products - Browse Animal Feed | farmnport',
  description: 'Browse livestock feed products including poultry, cattle, pig, and dairy feeds. Compare brands, nutritional details, and find the right feed for your animals.',
  keywords: 'livestock feed, animal feed, poultry feed, cattle feed, pig feed, dairy feed, feed products',
  authors: [{ name: 'farmnport' }],
  openGraph: {
    title: 'Livestock Feed Products | farmnport',
    description: 'Browse livestock feed products including poultry, cattle, pig, and dairy feeds.',
    siteName: 'farmnport',
    locale: 'en_US',
    type: 'website',
  },
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_APP_URL || 'https://farmnport.com'}/feeds`,
  },
}

export default function FeedsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
