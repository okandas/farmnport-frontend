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
        title: 'Product Not Found | farmnport',
        description: 'The feed product you are looking for could not be found.',
      }
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://farmnport.com'
    const url = `${baseUrl}/buy-feeds/${slug}`
    const imageUrl = product.images?.[0]?.img?.src || `${baseUrl}/default-feed.png`

    const description = product.feed_category?.name
      ? `Buy ${capitalizeFirstLetter(product.name)} - ${product.feed_category.name} for ${product.animal || 'livestock'}. Fast shipping, secure checkout, and quality guarantee.`
      : `Buy ${capitalizeFirstLetter(product.name)} online. Quality livestock feed products with fast shipping and secure checkout.`

    const keywords = [
      `buy ${product.name}`,
      'livestock feed shop',
      'buy animal feed online',
      product.feed_category?.name || '',
      product.animal || '',
      product.phase || '',
      product.brand?.name || '',
    ].filter(Boolean).join(', ')

    return {
      title: `Buy ${capitalizeFirstLetter(product.name)} - ${product.feed_category?.name || 'Livestock Feed'} | farmnport`,
      description,
      keywords,
      authors: [{ name: 'farmnport' }],
      openGraph: {
        title: `Buy ${capitalizeFirstLetter(product.name)}`,
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
        title: `Buy ${capitalizeFirstLetter(product.name)}`,
        description,
        images: [imageUrl],
      },
      alternates: {
        canonical: url,
      },
      robots: {
        index: false,
        follow: true,
        googleBot: {
          index: false,
          follow: true,
        },
      },
    }
  } catch (error) {
    console.error('Error generating metadata:', error)
    return {
      title: 'Buy Livestock Feed | farmnport',
      description: 'Shop quality livestock feed products online with fast shipping.',
    }
  }
}

export default function BuyFeedLayout({ children }: LayoutProps) {
  return <>{children}</>
}
