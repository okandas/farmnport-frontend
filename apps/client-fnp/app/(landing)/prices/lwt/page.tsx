import { FilterSidebar } from "@/components/generic/filterSidebar"
import { PriceCardsView } from "@/components/structures/price-cards-view"
import { ActionsSidebar } from "@/components/generic/actions-sidebar"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"

export const metadata = {
  title: 'Liveweight Cattle Prices (LWT) – Per Kg Delivered Rates | farmnport.com',
  description: 'Browse current liveweight cattle prices per kg delivered across Zimbabwe. Prices by teeth category (Milk Teeth, 2T, 4T, 6T) and weight range in USD and ZiG.',
  alternates: {
    canonical: '/prices/lwt',
  },
  openGraph: {
    title: 'Liveweight Cattle Prices (LWT) – Per Kg Delivered Rates',
    description: 'Browse current liveweight cattle prices per kg delivered across Zimbabwe. Prices by teeth category and weight range.',
    siteName: 'farmnport',
    type: 'website',
  },
}

export default async function LwtPricesPage() {
  return (
    <main>
      <div className="mx-auto max-w-7xl px-6 lg:px-8 min-h-[70lvh]">
        <div className="pt-6 pb-4">
          <Link
            href="/prices"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            All prices
          </Link>
        </div>

        <h1 className="text-3xl font-bold font-heading pb-2">
          Liveweight Cattle Prices
        </h1>
        <p className="text-muted-foreground mb-6">
          Per kg delivered prices for cattle by teeth category and weight range, in USD and ZiG.
        </p>

        <div className="lg:flex lg:space-x-10">
          <div className="hidden lg:block lg:w-64 relative">
            <FilterSidebar />
          </div>

          <div className="lg:flex-1">
            <div className="lg:hidden mb-6">
              <FilterSidebar />
            </div>
            <PriceCardsView />
          </div>

          <div className="hidden lg:block lg:w-56 shrink-0 relative">
            <ActionsSidebar type="buyers" />
          </div>
        </div>
      </div>
    </main>
  )
}
