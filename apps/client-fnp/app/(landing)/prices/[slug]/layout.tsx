import { Metadata } from 'next'
import axios from 'axios'

interface LayoutProps {
  children: React.ReactNode
  params: Promise<{
    slug: string
  }>
}

async function getPriceListBySlug(slug: string) {
  try {
    const baseURL = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || "http://localhost:3744"

    const response = await axios.get(`${baseURL}/v1/prices/all?p=1&limit=100`)
    const priceLists = response.data?.data || []

    const priceList = priceLists.find((pl: any) => {
      const plDate = new Date(pl.effectiveDate).toISOString().split('T')[0]
      const plSlug = `${pl.client_name.toLowerCase().replace(/\s+/g, '-')}-${plDate}`
      return plSlug === slug
    })

    return priceList || null
  } catch (error) {
    console.error('Error fetching price list for metadata:', error)
    return null
  }
}

export async function generateMetadata({ params }: LayoutProps): Promise<Metadata> {
  const { slug } = await params

  try {
    const priceList = await getPriceListBySlug(slug)

    if (!priceList) {
      return {
        title: 'Price List Not Found | farmnport',
        description: 'The price list you are looking for could not be found.',
      }
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://farmnport.com'
    const url = `${baseUrl}/prices/${slug}`
    const date = new Date(priceList.effectiveDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

    const description = `View ${priceList.client_name}'s farm produce price list effective ${date}. Current market prices for fresh produce including availability and quality information.`

    const productNames = priceList.entries?.map((entry: any) => entry.produce_name).filter(Boolean).join(', ') || 'farm produce'

    return {
      title: `${priceList.client_name} Price List - ${date} | farmnport`,
      description,
      keywords: `${priceList.client_name}, price list, farm produce prices, ${productNames}, market prices, ${date}`,
      authors: [{ name: 'farmnport' }],
      openGraph: {
        title: `${priceList.client_name} Price List - ${date}`,
        description,
        url,
        siteName: 'farmnport',
        locale: 'en_US',
        type: 'website',
      },
      twitter: {
        card: 'summary',
        title: `${priceList.client_name} Price List - ${date}`,
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
  } catch (error) {
    console.error('Error generating metadata:', error)
    return {
      title: 'Price List | farmnport',
      description: 'View current farm produce prices and market information.',
    }
  }
}

export default function PriceDetailLayout({ children }: LayoutProps) {
  return <>{children}</>
}
