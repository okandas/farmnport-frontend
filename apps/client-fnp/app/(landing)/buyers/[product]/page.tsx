import {capitalizeFirstLetter, plural} from "@/lib/utilities"
import { Buyers } from "@/components/layouts/buyers"
import { retrieveUser } from "@/lib/actions"
import type { Metadata, ResolvingMetadata } from "next";
import { AppURL, getBuyerSeo } from "@/lib/schemas";
import { ClientFilterSidebar } from "@/components/generic/clientFilterSidebar"
import { ActionsSidebar } from "@/components/generic/actions-sidebar"
import { CrossSellBanner } from "@/components/monetization/cross-sell-banner"
import { RelatedMarkets } from "@/components/monetization/related-markets"


type Props = {
  params: Promise<{ product: string }>
  searchParams:  Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata({ params }: Props,  parent: ResolvingMetadata): Promise<Metadata> {
  const { product } = await params
  const name = capitalizeFirstLetter(plural(product))
  const description = getBuyerSeo(product)

  return {
    alternates: {
      canonical: `${AppURL}/buyers/${product.toLowerCase()}`,
    },
    title: `${name} Buyers in Zimbabwe | farmnport`,
    description,
    keywords: `${name} buyers, buy ${product}, ${product} market, Zimbabwe buyers, agricultural buyers, farm produce buyers`,
    authors: [{ name: 'farmnport' }],
    openGraph: {
      title: `${name} Buyers in Zimbabwe`,
      description,
      url: `${AppURL}/buyers/${product.toLowerCase()}`,
      siteName: 'farmnport',
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title: `${name} Buyers in Zimbabwe`,
      description,
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

type BuyerProductPageProps ={
  params:  Promise<{ product: string }>
}

export default async function BuyersProductPage({ params }: BuyerProductPageProps) {

  const user = await retrieveUser()
  const { product } = await params
  const name = capitalizeFirstLetter(plural(product))

  return (
    <main>
      <div className="mx-auto max-w-7xl px-6 lg:px-8 min-h-[70lvh]">
        <h1 className="text-3xl font-bold font-heading pt-8 pb-4">
          {name} Buyers in Zimbabwe
        </h1>
        <p className="text-muted-foreground mb-6">
          Find verified {product} buyers across Zimbabwe. Sell your {product} directly at competitive market prices.
        </p>

        <CrossSellBanner product={product} context="buyer" />

        <div className="lg:flex lg:space-x-10">
          <div className="hidden lg:block lg:w-64 relative">
            <ClientFilterSidebar type="buyers" hideProduce hideCategory product={product} />
          </div>

          <div className="lg:flex-1">
            <div className="lg:hidden mb-4">
              <ClientFilterSidebar type="buyers" hideProduce hideCategory product={product} />
            </div>
            <Buyers user={user} queryBy={product} />
          </div>

          <div className="hidden lg:block lg:w-80 relative">
            <ActionsSidebar type="buyers" product={product} showPremiumCTA={false} />
          </div>
        </div>

        <RelatedMarkets currentProduct={product} context="buyer" />
      </div>
    </main>
  )
}









