import { Metadata } from 'next'
import { queryAgroChemical } from '@/lib/query'

interface LayoutProps {
  children: React.ReactNode
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({ params }: LayoutProps): Promise<Metadata> {
  const { slug } = await params

  try {
    const response = await queryAgroChemical(slug)
    const chemical = response?.data

    if (!chemical) {
      return {
        title: 'Product Not Found | farmnport',
        description: 'The agrochemical product you are looking for could not be found.',
      }
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://farmnport.com'
    const url = `${baseUrl}/buy-agrochemicals/${slug}`
    const imageUrl = chemical.images?.[0]?.img?.src || `${baseUrl}/default-chemical.png`

    const description = chemical.agrochemical_category?.name
      ? `Buy ${chemical.name} - ${chemical.agrochemical_category.name} for effective pest and disease control. Fast shipping, secure checkout, and quality guarantee.`
      : `Buy ${chemical.name} online. Professional agrochemical products with fast shipping and secure checkout.`

    const keywords = [
      `buy ${chemical.name}`,
      'agrochemical shop',
      'buy pesticides online',
      chemical.agrochemical_category?.name || '',
      'crop protection products',
      ...(chemical.targets?.map((t: any) => t.name) || []),
      ...(chemical.active_ingredients?.map((ai: any) => ai.name) || [])
    ].filter(Boolean).join(', ')

    return {
      title: `Buy ${chemical.name} - ${chemical.agrochemical_category?.name || 'Agrochemical'} | farmnport`,
      description,
      keywords,
      authors: [{ name: 'farmnport' }],
      openGraph: {
        title: `Buy ${chemical.name}`,
        description,
        url,
        siteName: 'farmnport',
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: chemical.name,
          },
        ],
        locale: 'en_ZW',
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: `Buy ${chemical.name}`,
        description,
        images: [imageUrl],
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
        },
      },
    }
  } catch (error) {
    console.error('Error generating metadata:', error)
    return {
      title: 'Buy Agrochemicals | farmnport',
      description: 'Shop professional agrochemical products online with fast shipping.',
    }
  }
}

export default function BuyAgroChemicalLayout({ children }: LayoutProps) {
  return <>{children}</>
}
