import { Client } from "@/components/layouts/client"
import { retrieveUser } from "@/lib/actions"
import { AppURL } from "@/lib/schemas"

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
    openGraph: {
      title: `${name} - Buyer in Zimbabwe`,
      description: `${name} is an agricultural buyer in Zimbabwe. See what produce they purchase, payment terms, and pricing. Sell directly to ${name} on farmnport.com.`,
      url: `${AppURL}/buyer/${slug.toLowerCase()}`,
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

    return(
    <main className="min-h-[70lvh]">
    <div className="mx-auto max-w-7xl min-h-[70lvh]">
        <div className="lg:flex lg:space-x-10">
          <Client slug={slug} user={user}/>
        </div>
    </div>
</main>
)
  }


