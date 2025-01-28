import { Buyer } from "@/components/layouts/buyer"
import { retrieveUser } from "@/lib/actions"
import { AppURL } from "@/lib/schemas"

import type { Metadata, ResolvingMetadata } from 'next'

import { unSlug } from "@/lib/utilities"

type Props = {
  params: { slug: string }
  searchParams: { [key: string]: string | string[] | undefined }
}
 
export async function generateMetadata({ params, searchParams }: Props,  parent: ResolvingMetadata): Promise<Metadata> {
  const { slug } = await params
  const name = unSlug(slug)
 

  return {
    alternates: {
      canonical: `${AppURL}/buyer/${slug}`,
    },
    title: `${name} - Buyer in Zimbabwe | farmnport.com`,
  }
}

type BuyerPageProps = Promise<{
    params: {
      slug: string
    }
  }>

  
  export default async function BuyerPage(props: { params: BuyerPageProps}) {

    const user = await retrieveUser()
    const { params } = await props.params
    const slug = params.slug

    return(
    <main className="min-h-[70lvh]">
    <div className="mx-auto max-w-7xl min-h-[70lvh]">
        <div className="lg:flex lg:space-x-10">
          <Buyer slug={slug} user={user}/>
        </div>
    </div>
</main>
)
  }


