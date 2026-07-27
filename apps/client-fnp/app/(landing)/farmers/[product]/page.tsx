import Link from "next/link"
import { capitalizeFirstLetter, plural } from "@/lib/utilities"
import { Farmers } from "@/components/layouts/farmers"
import { retrieveUser } from "@/lib/actions"
import { QuickLinks } from "@/components/generic/quick-links"
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
      <div className="container pt-6">
        <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4">
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          <span>/</span>
          <Link href="/farmers" className="hover:text-foreground transition-colors">Farmers</Link>
          <span>/</span>
          <span className="text-foreground font-medium">{capitalizeFirstLetter(plural(product))}</span>
        </nav>
      </div>
      <div className="container min-h-[70lvh] pb-8">
        <div className="lg:flex lg:gap-8 mt-4">
          <aside className="hidden lg:block lg:w-64 shrink-0">
            <div className="sticky top-20">
              <h3 className="text-sm font-bold mb-3">Refine by Category</h3>
              <FilterSidebar />
              <div className="mt-6">
                <QuickLinks />
              </div>
            </div>
          </aside>
          <div className="flex-1 min-w-0">
            <Farmers user={user} queryBy={product} />
          </div>
        </div>
      </div>
    </main>
  )
}









