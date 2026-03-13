import { capitalizeFirstLetter, plural } from "@/lib/utilities"
import { Farmers } from "@/components/layouts/farmers"
import { retrieveUser } from "@/lib/actions"
import type { Metadata, ResolvingMetadata } from "next";
import {AppURL, getFarmerSeo} from "@/lib/schemas";
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
  const description = getFarmerSeo(product)

  return {
    alternates: {
      canonical: `${AppURL}/farmers/${product.toLowerCase()}`,
    },
    title: `${name} Farmers in Zimbabwe | farmnport`,
    description,
    keywords: `${name} farmers, ${product} suppliers, ${product} growers, Zimbabwe farmers, agricultural producers, farm produce suppliers`,
    authors: [{ name: 'farmnport' }],
    openGraph: {
      title: `${name} Farmers in Zimbabwe`,
      description,
      url: `${AppURL}/farmers/${product.toLowerCase()}`,
      siteName: 'farmnport',
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title: `${name} Farmers in Zimbabwe`,
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

type FarmerProductPageProps ={
  params:  Promise<{ product: string }>
}

export default async function FarmersProductPage({ params }: FarmerProductPageProps) {

  const user = await retrieveUser()
  const { product } = await params
  const name = capitalizeFirstLetter(plural(product))

  return (
    <main>
      <div className="mx-auto max-w-7xl px-6 lg:px-8 min-h-[70lvh]">
        <h1 className="text-3xl font-bold font-heading pt-8 pb-4">
          {name} Farmers in Zimbabwe
        </h1>
        <p className="text-muted-foreground mb-6">
          Buy quality {product} directly from trusted farmers across Zimbabwe at fair farm-gate prices.
        </p>

        <CrossSellBanner product={product} context="farmer" />

        <div className="lg:flex lg:space-x-10">
          <div className="hidden lg:block lg:w-64 relative">
            <ClientFilterSidebar type="farmers" hideProduce hideCategory product={product} />
          </div>

          <div className="lg:flex-1">
            <div className="lg:hidden mb-4">
              <ClientFilterSidebar type="farmers" hideProduce hideCategory product={product} />
            </div>
            <Farmers user={user} queryBy={product} />
          </div>

          <div className="hidden lg:block lg:w-80 relative">
            <ActionsSidebar type="farmers" product={product} showPremiumCTA={false} />
          </div>
        </div>

        <RelatedMarkets currentProduct={product} context="farmer" />
      </div>
    </main>
  )
}









