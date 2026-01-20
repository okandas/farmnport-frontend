import { FilterSidebar } from "@/components/generic/filterSidebar"
import { PriceCardsView } from "@/components/structures/price-cards-view"

export const metadata = {
  title: 'Agricultural Produce Prices – Market Rates | farmnport.com',
  description: `Stay updated with current market prices for agricultural produce. Trusted by farmers and bulk buyers for pricing on crops, poultry, and livestock across Zimbabwe.`,
  alternates: {
    canonical: `/prices`,
  }
}

export default async function PricesPage() {
  return (
    <main>
      <div className="mx-auto max-w-7xl px-6 lg:px-8 min-h-[70lvh]">
        <div className="lg:flex lg:space-x-10">
          <div className="hidden lg:block lg:w-44 relative">
            <FilterSidebar />
          </div>

          <div className="flex-1 py-8">
            <div className="mb-8">
              <h1 className="text-4xl font-bold font-heading">
                Producer Price Lists
              </h1>
              <p className="text-lg text-muted-foreground mt-2">
                Browse and compare current market prices from verified buyers and producers across Zimbabwe.
              </p>
            </div>

            {/* Mobile filter button */}
            <div className="lg:hidden mb-6">
              <FilterSidebar />
            </div>

            <PriceCardsView />
          </div>
        </div>
      </div>
    </main>
  )
}
