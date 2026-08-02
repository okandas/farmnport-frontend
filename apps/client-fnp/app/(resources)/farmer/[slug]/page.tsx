import { Client } from "@/components/layouts/client"
import { retrieveUser } from "@/lib/actions"
import { AppURL } from "@/lib/schemas"
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
      canonical: `${AppURL}/farmer/${slug.toLowerCase()}`,
    },
    title: `${name} - Farmer in Zimbabwe | farmnport.com`,
    description: `${name} is a farmer in Zimbabwe. View their farm profile, available produce, farming operations, and contact details on farmnport.com. Connect directly with ${name} to buy agricultural products in Zimbabwe.`,
    keywords: `${name.toLowerCase()}, ${name.toLowerCase()} farmer zimbabwe, buy from ${name.toLowerCase()}, zimbabwe farmer, farm produce supplier`,
    openGraph: {
      title: `${name} - Farmer in Zimbabwe`,
      description: `${name} is a farmer in Zimbabwe. View their farm profile, available produce, and contact details. Connect directly with ${name} on farmnport.com.`,
      url: `https://farmnport.com/farmer/${slug.toLowerCase()}`,
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

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://farmnport.com" },
      { "@type": "ListItem", "position": 2, "name": "Farmers", "item": "https://farmnport.com/farmers" },
      { "@type": "ListItem", "position": 3, "name": name, "item": `https://farmnport.com/farmer/${slug}` },
    ],
  }

  return(
    <main className="min-h-[70lvh]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <h1 className="sr-only">{name} - Farmer in Zimbabwe</h1>
      <Client slug={slug} type="farmer" user={user}/>
    </main>
  )
}


