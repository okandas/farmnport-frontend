import { Metadata } from 'next'
import { queryAgroChemical } from '@/lib/query'

interface LayoutProps {
  children: React.ReactNode
  params: Promise<{
    category: string
    slug: string
  }>
}

export async function generateMetadata({ params }: LayoutProps): Promise<Metadata> {
  const { category, slug } = await params

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
    const url = `${baseUrl}/agrochemical-guides/${category}/${slug}`
    const imageUrl = chemical.images?.[0]?.img?.src || `${baseUrl}/default-chemical.png`

    const description = chemical.agrochemical_category?.name
      ? `${chemical.name} is a ${chemical.agrochemical_category.name} for effective pest and disease control. View active ingredients, dosage rates, and application guidelines.`
      : `Professional agrochemical guide for ${chemical.name}. Complete information on active ingredients, dosage rates, and safe application.`

    const keywords = [
      chemical.name,
      chemical.agrochemical_category?.name || 'agrochemical',
      'pesticide',
      'active ingredients',
      'dosage rates',
      'application guide',
      ...(chemical.targets?.map((t: any) => t.name) || []),
      ...(chemical.active_ingredients?.map((ai: any) => ai.name) || [])
    ].filter(Boolean).join(', ')

    return {
      title: `${chemical.name} - Agrochemical Guide | farmnport`,
      description,
      keywords,
      authors: [{ name: 'farmnport' }],
      openGraph: {
        title: `${chemical.name} - Agrochemical Guide`,
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
        locale: 'en_US',
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: `${chemical.name} - Agrochemical Guide`,
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
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      },
    }
  } catch (error) {
    console.error('Error generating metadata:', error)
    return {
      title: 'Agrochemical Guide | farmnport',
      description: 'Professional agrochemical guides and product information.',
    }
  }
}

export default function AgroChemicalDetailLayout({ children }: LayoutProps) {
  return <>{children}</>
}
