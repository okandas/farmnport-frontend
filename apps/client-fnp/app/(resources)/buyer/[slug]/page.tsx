import { Buyer } from "@/components/layouts/buyer"
import { retrieveUser } from "@/lib/actions"

import type { Metadata, ResolvingMetadata } from 'next'

type Props = {
  params: { slug: string }
  searchParams: { [key: string]: string | string[] | undefined }
}
 
export async function generateMetadata(
  { params, searchParams }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const slug = params.slug
 

  return {
    alternates: {
      canonical: `/buyer/${slug}`,
    },
    title: 'Buyers in Zimbabwe | farmnport.com',
  }
}

interface BuyerPageProps {
    params: {
      slug: string
    }
  }

  
  export default async function BuyerPage({
    params
  }: BuyerPageProps) {

    const user = await retrieveUser()

    return(
    <main className="min-h-[70lvh]">
    <div className="mx-auto max-w-7xl min-h-[70lvh]">
        <div className="lg:flex lg:space-x-10">
          <Buyer slug={params.slug} user={user}/>
        </div>
    </div>
</main>
)
  }


