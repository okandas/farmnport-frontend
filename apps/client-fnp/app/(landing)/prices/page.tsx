import { PriceCardsView } from "@/components/structures/price-cards-view"
import { CdmPriceCardsView } from "@/components/structures/cdm-price-cards-view"
import { ProduceCategoriesView } from "@/components/structures/produce-categories-view"
import Link from "next/link"
import { ArrowRight, Scale, Beef } from "lucide-react"

export const metadata = {
  title: 'Agricultural Market Prices Zimbabwe – Livestock, Produce & More | farmnport.com',
  description: 'Compare current agricultural prices from verified buyers across Zimbabwe. Liveweight cattle, cold dress mass, beef, lamb, mutton, goat, chicken, pork — updated weekly in USD and ZiG.',
  alternates: {
    canonical: '/prices',
  },
  openGraph: {
    title: 'Agricultural Market Prices Zimbabwe',
    description: 'Compare current agricultural prices from verified buyers across Zimbabwe. Updated weekly in USD and ZiG.',
    url: '/prices',
    siteName: 'farmnport',
    type: 'website',
  },
}

export default async function PricesPage() {
  return (
    <main>
      {/* Hero */}
      <section className="border-b">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 pt-12 pb-10">
          <p className="text-xs font-semibold text-primary tracking-wide uppercase">Market Intelligence</p>
          <h1 className="mt-1 text-4xl font-bold font-heading tracking-tight">
            Market Prices
          </h1>
          <p className="mt-3 text-base text-muted-foreground max-w-2xl">
            Transparent pricing from verified buyers across Zimbabwe.
          </p>
        </div>
      </section>

      {/* Prices by Produce */}
      <section className="mx-auto max-w-7xl px-6 lg:px-8 py-10">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-6">Prices by produce</h2>
        <ProduceCategoriesView />
      </section>

      {/* Price List Categories */}
      <section className="border-t">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-10">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-6">Price lists by type</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="group rounded-xl border bg-card shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-200">
              <div className="flex items-center justify-between px-4 pt-4 pb-2">
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center h-5 w-5 rounded-md bg-gradient-to-br from-emerald-500 to-teal-600">
                    <Scale className="h-2.5 w-2.5 text-white" />
                  </div>
                  <h3 className="text-sm font-bold tracking-tight">Liveweight Prices</h3>
                </div>
                <Link href="/prices/lwt" className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-primary transition-colors">
                  View all
                  <ArrowRight className="h-3 w-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </Link>
              </div>
              <div className="px-3 pb-1">
                <PriceCardsView limit={4} />
              </div>
            </div>

            <div className="group rounded-xl border bg-card shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-200">
              <div className="flex items-center justify-between px-4 pt-4 pb-2">
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center h-5 w-5 rounded-md bg-gradient-to-br from-blue-500 to-indigo-600">
                    <Beef className="h-2.5 w-2.5 text-white" />
                  </div>
                  <h3 className="text-sm font-bold tracking-tight">Cold Dress Mass Prices</h3>
                </div>
                <Link href="/prices/cdm" className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-primary transition-colors">
                  View all
                  <ArrowRight className="h-3 w-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                </Link>
              </div>
              <div className="px-3 pb-1">
                <CdmPriceCardsView limit={4} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SEO Content */}
      <section className="border-t">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-10">
          <h2 className="text-base font-bold font-heading mb-3">About Agricultural Pricing in Zimbabwe</h2>
          <div className="space-y-2 text-sm text-muted-foreground max-w-3xl">
            <p>
              Compare current agricultural prices from verified buyers across Zimbabwe. Prices are updated weekly and cover liveweight cattle, cold dress mass, beef, lamb, mutton, goat, chicken, and pork.
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>Side-by-side price comparison from multiple buyers</li>
              <li>Delivered and collected pricing for each grade</li>
              <li>Liveweight and cold dress mass price lists</li>
            </ul>
          </div>
        </div>
      </section>
    </main>
  )
}
