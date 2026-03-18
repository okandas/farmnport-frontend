import { Metadata } from 'next'
import { queryAnimalHealthProduct } from '@/lib/query'

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
    const response = await queryAnimalHealthProduct(slug)
    const product = response?.data

    if (!product) {
      return {
        title: 'Product Not Found | farmnport',
        description: 'The animal health product you are looking for could not be found.',
      }
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://farmnport.com'
    const url = `${baseUrl}/animal-health-guides/${category}/${slug}`
    const imageUrl = product.images?.[0]?.img?.src || `${baseUrl}/default-chemical.png`

    const description = product.animal_health_category?.name
      ? `${product.name} is a ${product.animal_health_category.name} for poultry and livestock health. View active ingredients, dosage rates, withdrawal periods, and application guidelines.`
      : `Professional animal health product guide for ${product.name}. Complete information on active ingredients, dosage rates, and withdrawal periods.`

    const keywords = [
      product.name,
      product.animal_health_category?.name || 'animal health',
      'veterinary product',
      'dosage rates',
      'withdrawal period',
      'active ingredients',
      'poultry',
      'livestock',
      ...(product.targets?.map((t: any) => t.name) || []),
      ...(product.active_ingredients?.map((ai: any) => ai.name) || [])
    ].filter(Boolean).join(', ')

    return {
      title: `${product.name} - Animal Health Guide | farmnport`,
      description,
      keywords,
      authors: [{ name: 'farmnport' }],
      openGraph: {
        title: `${product.name} - Animal Health Guide`,
        description,
        url,
        siteName: 'farmnport',
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: product.name,
          },
        ],
        locale: 'en_US',
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: `${product.name} - Animal Health Guide`,
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
      title: 'Animal Health Guide | farmnport',
      description: 'Professional animal health product guides and dosage information.',
    }
  }
}

export default function AnimalHealthDetailLayout({ children }: LayoutProps) {
  return <>{children}</>
}
