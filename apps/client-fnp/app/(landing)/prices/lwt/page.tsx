import { PriceCardsView } from "@/components/structures/price-cards-view"
import Link from "next/link"

export const metadata = {
  title: 'Liveweight Cattle Prices (LWT) – Per Kg Delivered Rates | farmnport.com',
  description: 'Browse current liveweight cattle prices per kg delivered across Zimbabwe. Prices by teeth category (Milk Teeth, 2T, 4T, 6T) and weight range in USD and ZiG.',
  alternates: { canonical: '/prices/lwt' },
  openGraph: {
    title: 'Liveweight Cattle Prices (LWT) – Per Kg Delivered Rates',
    description: 'Browse current liveweight cattle prices per kg delivered across Zimbabwe.',
    siteName: 'farmnport',
    type: 'website',
  },
}

export default async function LwtPricesPage() {
  return (
    <main>
      <div className="border-b bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Link href="/prices" className="hover:text-foreground transition-colors">Prices</Link>
          <span>/</span>
          <span className="text-foreground font-medium">Liveweight</span>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 pb-6">
        <h1 className="text-2xl font-bold tracking-tight">Liveweight <span className="text-muted-foreground font-normal">Cattle Prices</span></h1>
        <p className="mt-1 text-sm text-muted-foreground">Per kg delivered · teeth category · USD and ZiG</p>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16 min-h-[50lvh]">
        <PriceCardsView />
      </div>
    </main>
  )
}
