import { Metadata } from 'next'

interface LayoutProps {
  children: React.ReactNode
  params: Promise<{
    category: string
  }>
}

export async function generateMetadata({ params }: LayoutProps): Promise<Metadata> {
  const { category } = await params

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://farmnport.com'
  const url = `${baseUrl}/animal-health-guides/${category}`

  const categoryName = category
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

  const description = `Browse our comprehensive collection of ${categoryName.toLowerCase()} products for poultry and livestock. Find detailed information on active ingredients, dosage rates, and withdrawal periods.`

  return {
    title: `${categoryName} - Animal Health Guides | farmnport`,
    description,
    keywords: `${categoryName}, animal health, poultry, livestock, veterinary products, dosage rates, withdrawal periods, active ingredients`,
    authors: [{ name: 'farmnport' }],
    openGraph: {
      title: `${categoryName} - Animal Health Guides`,
      description,
      url,
      siteName: 'farmnport',
      locale: 'en_ZW',
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title: `${categoryName} - Animal Health Guides`,
      description,
    },
    alternates: {
      canonical: url,
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
}

export default function AnimalHealthCategoryLayout({ children }: LayoutProps) {
  return <>{children}</>
}
