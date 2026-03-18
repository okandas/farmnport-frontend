import { FilterSidebar } from "@/components/generic/filterSidebar"
import { PriceCardsView } from "@/components/structures/price-cards-view"
import { CdmPriceCardsView } from "@/components/structures/cdm-price-cards-view"
import { ActionsSidebar } from "@/components/generic/actions-sidebar"

export const metadata = {
  title: 'Agricultural Produce Prices – Market Rates | farmnport.com',
  description: 'Stay updated with current market prices for agricultural produce. Trusted by farmers and bulk buyers for pricing on crops, poultry, and livestock across Zimbabwe.',
  alternates: {
    canonical: '/prices',
  },
  openGraph: {
    title: 'Agricultural Produce Prices – Market Rates',
    description: 'Stay updated with current market prices for agricultural produce across Zimbabwe.',
    siteName: 'farmnport',
    type: 'website',
  },
}

export default async function PricesPage() {
  return (
    <main>
      <div className="mx-auto max-w-7xl px-6 lg:px-8 min-h-[70lvh]">
        <h1 className="text-3xl font-bold font-heading pt-8 pb-4">
          Producer Price Lists
        </h1>
        <p className="text-muted-foreground mb-6">
          Browse and compare current market prices from verified buyers and producers across Zimbabwe.
        </p>

        <div className="lg:flex lg:space-x-10">
          <div className="hidden lg:block lg:w-64 relative">
            <FilterSidebar />
          </div>

          <div className="lg:flex-1">
            {/* Mobile filter button */}
            <div className="lg:hidden mb-6">
              <FilterSidebar />
            </div>

            <PriceCardsView />
            <div className="mt-10">
              <CdmPriceCardsView />
            </div>
          </div>

          <div className="hidden lg:block lg:w-56 shrink-0 relative">
            <ActionsSidebar type="buyers" />
          </div>
        </div>
      </div>
    </main>
  )
}
