import { Client } from "@/components/layouts/client"
import { retrieveUser } from "@/lib/actions"
import { AppURL } from "@/lib/schemas"
import { fetchLatestBuyerPrices } from "@/lib/serverFetch"
import { QuickLinks } from "@/components/generic/quick-links"
import type { Metadata, ResolvingMetadata } from 'next'

import { unSlug } from "@/lib/utilities"

type Props = {
  params: Promise<{ slug: string }>
  searchParams:  Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata({ params }: Props,  parent: ResolvingMetadata): Promise<Metadata> {
  const { slug } = await params
  const name = unSlug(slug)


  return {
    alternates: {
      canonical: `${AppURL}/buyer/${slug.toLowerCase()}`,
    },
    title: `${name} - Buyer in Zimbabwe | farmnport.com`,
    description: `${name} is an agricultural buyer in Zimbabwe. View what produce they purchase, payment terms, pricing, and contact details on farmnport.com. Sell your farm products directly to ${name} in Zimbabwe.`,
    keywords: `${name.toLowerCase()}, ${name.toLowerCase()} buyer zimbabwe, sell to ${name.toLowerCase()}, agricultural buyer zimbabwe, farm produce buyer`,
    openGraph: {
      title: `${name} - Buyer in Zimbabwe`,
      description: `${name} is an agricultural buyer in Zimbabwe. See what produce they purchase, payment terms, and pricing. Sell directly to ${name} on farmnport.com.`,
      url: `https://farmnport.com/buyer/${slug.toLowerCase()}`,
      siteName: 'farmnport',
      type: 'profile',
    },
  }
}

type BuyerPageProps ={
    params:  Promise<{ slug: string }>
}

  export default async function BuyerPage({ params }:  BuyerPageProps) {

    const user = await retrieveUser()
    const { slug } = await params
    const name = unSlug(slug)
    const latestPrices = await fetchLatestBuyerPrices(slug)

    const breadcrumbJsonLd = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://farmnport.com" },
        { "@type": "ListItem", "position": 2, "name": "Buyers", "item": "https://farmnport.com/buyers" },
        { "@type": "ListItem", "position": 3, "name": name, "item": `https://farmnport.com/buyer/${slug}` },
      ],
    }

    return(
    <main className="min-h-[70lvh]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <h1 className="sr-only">{name} - Buyer in Zimbabwe</h1>
      <Client slug={slug} type="buyer" user={user} latestPrices={latestPrices}/>
    </main>
    )
  }


