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
      canonical: `${AppURL}/farmer/${slug.toLowerCase()}`,
    },
    title: `${name} - Farmer in Zimbabwe | farmnport.com`,
    description: `${name} is a farmer in Zimbabwe. View their farm profile, available produce, farming operations, and contact details on farmnport.com. Connect directly with ${name} to buy agricultural products in Zimbabwe.`,
    openGraph: {
      title: `${name} - Farmer in Zimbabwe`,
      description: `${name} is a farmer in Zimbabwe. View their farm profile, available produce, and contact details. Connect directly with ${name} on farmnport.com.`,
      url: `${AppURL}/farmer/${slug.toLowerCase()}`,
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


