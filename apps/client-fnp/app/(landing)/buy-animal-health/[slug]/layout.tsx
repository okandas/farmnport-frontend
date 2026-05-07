import { Metadata } from 'next'
import { queryAnimalHealthProduct } from '@/lib/query'

interface LayoutProps {
  children: React.ReactNode
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({ params }: LayoutProps): Promise<Metadata> {
  const { slug } = await params

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
    const url = `${baseUrl}/buy-animal-health/${slug}`
    const imageUrl = product.images?.[0]?.img?.src || `${baseUrl}/default-product.png`

    const description = product.animal_health_category?.name
      ? `Buy ${product.name} - ${product.animal_health_category.name} for effective animal health management. Fast shipping, secure checkout, and quality guarantee.`
      : `Buy ${product.name} online. Professional animal health products with fast shipping and secure checkout.`

    const keywords = [
      `buy ${product.name}`,
      'animal health shop',
      'veterinary products online',
      product.animal_health_category?.name || '',
      product.brand?.name || '',
      ...(product.targets?.map((t: any) => t.name) || []),
      ...(product.active_ingredients?.map((ai: any) => ai.name) || []),
    ].filter(Boolean).join(', ')

    return {
      title: `Buy ${product.name} - ${product.animal_health_category?.name || 'Animal Health'} | farmnport`,
      description,
      keywords,
      authors: [{ name: 'farmnport' }],
      openGraph: {
        title: `Buy ${product.name}`,
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
        locale: 'en_ZW',
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: `Buy ${product.name}`,
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
      title: 'Buy Animal Health Products | farmnport',
      description: 'Shop professional animal health products online with fast shipping.',
    }
  }
}

export default function BuyAnimalHealthProductLayout({ children }: LayoutProps) {
  return <>{children}</>
}
