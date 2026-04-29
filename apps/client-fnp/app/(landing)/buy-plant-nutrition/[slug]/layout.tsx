import { Metadata } from 'next'
import { queryPlantNutritionProduct } from '@/lib/query'

interface LayoutProps {
  children: React.ReactNode
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({ params }: LayoutProps): Promise<Metadata> {
  const { slug } = await params

  try {
    const response = await queryPlantNutritionProduct(slug)
    const product = response?.data

    if (!product) {
      return {
        title: 'Product Not Found | farmnport',
        description: 'The plant nutrition product you are looking for could not be found.',
      }
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://farmnport.com'
    const url = `${baseUrl}/buy-plant-nutrition/${slug}`
    const imageUrl = product.images?.[0]?.img?.src || `${baseUrl}/default-product.png`

    const description = product.plant_nutrition_category?.name
      ? `Buy ${product.name} - ${product.plant_nutrition_category.name} for healthy crop nutrition. Fast shipping, secure checkout, and quality guarantee.`
      : `Buy ${product.name} online. Professional plant nutrition products with fast shipping and secure checkout.`

    const keywords = [
      `buy ${product.name}`,
      'plant nutrition shop',
      'buy fertilizers online',
      product.plant_nutrition_category?.name || '',
      product.brand?.name || '',
      ...(product.active_ingredients?.map((ai: any) => ai.name) || []),
    ].filter(Boolean).join(', ')

    return {
      title: `Buy ${product.name} - ${product.plant_nutrition_category?.name || 'Plant Nutrition'} | farmnport`,
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
      title: 'Buy Plant Nutrition Products | farmnport',
      description: 'Shop professional plant nutrition products online with fast shipping.',
    }
  }
}

export default function BuyPlantNutritionProductLayout({ children }: LayoutProps) {
  return <>{children}</>
}
