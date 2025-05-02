import { capitalizeFirstLetter, plural } from "@/lib/utilities"
import { Farmers } from "@/components/layouts/farmers"
import { retrieveUser } from "@/lib/actions"
import type { Metadata, ResolvingMetadata } from "next";
import {AppURL, FarmerSeo} from "@/lib/schemas";
import { FilterSidebar } from "@/components/generic/filterSidebar"


type Props = {
  params: Promise<{ product: string }>
  searchParams:  Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata({ params }: Props,  parent: ResolvingMetadata): Promise<Metadata> {
  const { product } = await params
  const name = capitalizeFirstLetter(plural(product))
  const description = FarmerSeo[product]

  return {
    alternates: {
      canonical: `${AppURL}/farmers/${product.toLowerCase()}`,
    },
    title: `${name} Farmers in Zimbabwe | farmnport.com`,
    description,
  }
}

type FarmerProductPageProps ={
  params:  Promise<{ product: string }>
}

export default async function FarmersProductPage({ params }: FarmerProductPageProps) {

  const user = await retrieveUser()
  const { product } = await params

  return (
    <main>
      <div className="mx-auto max-w-7xl px-6 lg:px-8 min-h-[70lvh]">
        <div className="lg:flex lg:space-x-10">

          <div className="hidden lg:block lg:w-44 relative">
            <FilterSidebar />
          </div>

          <div className="lg:w-2/3">
            <Farmers user={user} queryBy={product} />
          </div>
        </div>
      </div>
    </main>
  )
}









