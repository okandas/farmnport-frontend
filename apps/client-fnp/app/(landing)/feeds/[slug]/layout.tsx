import { Metadata } from 'next'
import { queryFeedProduct } from '@/lib/query'
import { capitalizeFirstLetter } from '@/lib/utilities'

interface LayoutProps {
  children: React.ReactNode
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({ params }: LayoutProps): Promise<Metadata> {
  const { slug } = await params

  try {
    const response = await queryFeedProduct(slug)
    const product = response?.data

    if (!product) {
      return {
        title: 'Feed Product Not Found | farmnport',
        description: 'The feed product you are looking for could not be found.',
      }
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://farmnport.com'
    const url = `${baseUrl}/feeds/${slug}`
    const imageUrl = product.images?.[0]?.img?.src || `${baseUrl}/og-image.png`
    const name = capitalizeFirstLetter(product.name)
    const category = product.feed_category?.name || 'Livestock Feed'
    const animal = product.animal ? ` for ${product.animal}` : ''

    const description = `${name} - ${category}${animal}. View nutritional details, feeding instructions, and product information on farmnport.`

    const keywords = [
      product.name,
      product.feed_category?.name,
      product.animal,
      product.phase,
      product.brand?.name,
      'livestock feed',
      'animal feed',
    ].filter(Boolean).join(', ')

    return {
      title: `${name} - ${category} | farmnport`,
      description,
      keywords,
      authors: [{ name: 'farmnport' }],
      openGraph: {
        title: `${name} - ${category}`,
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
        title: `${name} - ${category}`,
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
      title: 'Feed Product | farmnport',
      description: 'View livestock feed product details, nutritional information, and feeding instructions.',
    }
  }
}

export default function FeedDetailLayout({ children }: LayoutProps) {
  return <>{children}</>
}
