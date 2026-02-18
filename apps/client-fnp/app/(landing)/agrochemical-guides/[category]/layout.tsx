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
  const url = `${baseUrl}/agrochemical-guides/${category}`

  // Capitalize category name for display
  const categoryName = category
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

  const description = `Browse our comprehensive collection of ${categoryName.toLowerCase()} products. Find detailed information on active ingredients, dosage rates, target pests, and safe application guidelines.`

  return {
    title: `${categoryName} - Agrochemical Guides | farmnport`,
    description,
    keywords: `${categoryName}, agrochemicals, pesticides, active ingredients, dosage rates, pest control, disease management`,
    authors: [{ name: 'farmnport' }],
    openGraph: {
      title: `${categoryName} - Agrochemical Guides`,
      description,
      url,
      siteName: 'farmnport',
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title: `${categoryName} - Agrochemical Guides`,
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

export default function AgroChemicalCategoryLayout({ children }: LayoutProps) {
  return <>{children}</>
}
