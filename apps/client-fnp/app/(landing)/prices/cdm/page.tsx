import { CdmPriceCardsView } from "@/components/structures/cdm-price-cards-view"
import { FilterSidebar } from "@/components/generic/filterSidebar"
import { ActionsSidebar } from "@/components/generic/actions-sidebar"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"

export const metadata = {
  title: 'Cold Dress Mass Cattle Prices (CDM) – Carcass & Liveweight Rates | farmnport.com',
  description: 'Browse current cold dress mass cattle prices from abattoirs across Zimbabwe. Commercial, economy and manufacturing carcass grades, ex leakage, in USD and ZiG.',
  alternates: {
    canonical: '/prices/cdm',
  },
  openGraph: {
    title: 'Cold Dress Mass Cattle Prices (CDM) – Carcass & Liveweight Rates',
    description: 'Browse current cold dress mass cattle prices from abattoirs across Zimbabwe. Carcass grades and liveweight rates.',
    siteName: 'farmnport',
    type: 'website',
  },
}

export default async function CdmPricesPage() {
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
          Cold Dress Mass Cattle Prices
        </h1>
        <p className="text-muted-foreground mb-6">
          Carcass grade pricing and liveweight rates from abattoirs, ex leakage, in USD and ZiG.
        </p>

        <div className="lg:flex lg:space-x-10">
          <div className="hidden lg:block lg:w-64 relative">
            <FilterSidebar hideProduce />
          </div>

          <div className="lg:flex-1">
            <div className="lg:hidden mb-6">
              <FilterSidebar hideProduce />
            </div>
            <CdmPriceCardsView />
          </div>

          <div className="hidden lg:block lg:w-56 shrink-0 relative">
            <ActionsSidebar type="buyers" />
          </div>
        </div>
      </div>
    </main>
  )
}
