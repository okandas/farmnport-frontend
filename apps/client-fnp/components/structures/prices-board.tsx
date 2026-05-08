"use client"

import { useQuery } from "@tanstack/react-query"
import { queryProducerPriceLists, queryCdmPrices } from "@/lib/query"

// ── Main board ────────────────────────────────────────────────────────────────

export function PricesBoard() {
  const { data: lwtData } = useQuery({
    queryKey: ["lwt-total"],
    queryFn: () => queryProducerPriceLists({ p: 1, limit: 1 } as any),
    refetchOnWindowFocus: false,
  })
  const { data: cdmData } = useQuery({
    queryKey: ["cdm-total"],
    queryFn: () => queryCdmPrices({ p: 1, limit: 1 } as any),
    refetchOnWindowFocus: false,
  })

  const lwtTotal = lwtData?.data?.total ?? 0
  const cdmTotal = cdmData?.data?.total ?? 0

  return (
    <main className="min-h-screen">

      {/* ── top stat strip ── */}
      <div className="border-b bg-muted/30 text-[11px]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-muted-foreground">
          <span>Price lists: <b className="text-foreground tabular-nums">{lwtTotal + cdmTotal}</b></span>
          <span className="hidden sm:inline text-border">·</span>
          <span>Liveweight: <b className="text-foreground tabular-nums">{lwtTotal}</b></span>
          <span className="hidden sm:inline text-border">·</span>
          <span>CDM: <b className="text-foreground tabular-nums">{cdmTotal}</b></span>
          <span className="hidden sm:inline text-border">·</span>
          <span>Produce: <b className="text-foreground">6</b> categories</span>

        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* ── hero ── */}
        <div className="pt-10 pb-8">
          <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-2">Market Intelligence</p>
          <h1 className="text-3xl font-black tracking-tight">
            Agricultural Prices
            <span className="ml-2 text-muted-foreground font-light text-2xl">Zimbabwe</span>
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Pricing from verified buyers · updated weekly
          </p>
        </div>


      </div>
    </main>
  )
}
