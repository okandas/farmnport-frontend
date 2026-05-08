import { CdmPriceCardsView } from "@/components/structures/cdm-price-cards-view"
import Link from "next/link"

export const metadata = {
  title: 'Cold Dress Mass Cattle Prices (CDM) – Carcass & Liveweight Rates | farmnport.com',
  description: 'Browse current cold dress mass cattle prices from abattoirs across Zimbabwe. Commercial, economy and manufacturing carcass grades, ex leakage, in USD and ZiG.',
  alternates: { canonical: '/prices/cdm' },
  openGraph: {
    title: 'Cold Dress Mass Cattle Prices (CDM) – Carcass & Liveweight Rates',
    description: 'Browse current cold dress mass cattle prices from abattoirs across Zimbabwe.',
    siteName: 'farmnport',
    type: 'website',
  },
}

export default async function CdmPricesPage() {
  return (
    <main>
      <div className="border-b bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Link href="/prices" className="hover:text-foreground transition-colors">Prices</Link>
          <span>/</span>
          <span className="text-foreground font-medium">Cold Dress Mass</span>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 pb-6">
        <h1 className="text-2xl font-bold tracking-tight">Cold Dress Mass <span className="text-muted-foreground font-normal">Cattle Prices</span></h1>
        <p className="mt-1 text-sm text-muted-foreground">Carcass grade pricing · ex leakage · USD and ZiG</p>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16 min-h-[50lvh]">
        <CdmPriceCardsView />
      </div>
    </main>
  )
}
