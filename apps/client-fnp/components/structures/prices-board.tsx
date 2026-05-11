"use client"

import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { queryProducerPriceLists, queryCdmPrices, queryMarketStats } from "@/lib/query"

type MarketStat = {
  effective_date: string
  // Beef
  beef_super_delivered: number
  beef_choice_delivered: number
  beef_commercial_delivered: number
  beef_economy_delivered: number
  beef_manufacturing_delivered: number
  beef_condemned_delivered: number
  // Lamb
  lamb_super_premium_delivered: number
  lamb_choice_delivered: number
  lamb_standard_delivered: number
  lamb_inferior_delivered: number
  // Mutton
  mutton_super_delivered: number
  mutton_choice_delivered: number
  mutton_standard_delivered: number
  mutton_ordinary_delivered: number
  mutton_inferior_delivered: number
  // Goat
  goat_super_delivered: number
  goat_choice_delivered: number
  goat_standard_delivered: number
  goat_inferior_delivered: number
  // Chicken
  chicken_a1_delivered: number
  chicken_a2_delivered: number
  chicken_a3_delivered: number
  chicken_off_layers_delivered: number
  // Pork
  pork_super_delivered: number
  pork_manufacturing_delivered: number
}

const toDollars = (v: number) => (v / 100).toFixed(2)

// ── Main board ────────────────────────────────────────────────────────────────

export function PricesBoard() {
  const { data: statsData } = useQuery({
    queryKey: ["market-stats"],
    queryFn: queryMarketStats,
    refetchOnWindowFocus: false,
  })
  const { data: cdmData } = useQuery({
    queryKey: ["cdm-board"],
    queryFn: () => queryCdmPrices({ p: 1, limit: 15 } as any),
    refetchOnWindowFocus: false,
  })
  const { data: lwtMeta } = useQuery({
    queryKey: ["lwt-total"],
    queryFn: () => queryProducerPriceLists({ p: 1, limit: 1 } as any),
    refetchOnWindowFocus: false,
  })

  const stats: MarketStat[] = statsData?.data ?? []
  const lwtTotal: number = lwtMeta?.data?.total ?? 0
  const cdmTotal: number = cdmData?.data?.total ?? 0

  const current = stats[0]
  const prev = stats[1]

  const gradeColors = [
    "text-green-700 bg-green-50 ring-green-600/20 dark:text-green-400 dark:bg-green-950/30 dark:ring-green-500/20",
    "text-lime-700 bg-lime-50 ring-lime-600/20 dark:text-lime-400 dark:bg-lime-950/30 dark:ring-lime-500/20",
    "text-yellow-700 bg-yellow-50 ring-yellow-600/20 dark:text-yellow-400 dark:bg-yellow-950/30 dark:ring-yellow-500/20",
  ]

  const produceItems = [
    { key: "chicken", label: "Chicken", gradeDesc: "A Grade · over 1.75kg", gradeCode: "A",  gradeColor: gradeColors[0], delivered: current?.chicken_a1_delivered, prevDelivered: prev?.chicken_a1_delivered },
    { key: "pork",    label: "Pork",    gradeDesc: "Super",                  gradeCode: "SP", gradeColor: gradeColors[1], delivered: current?.pork_super_delivered,   prevDelivered: prev?.pork_super_delivered },
    { key: "beef",    label: "Beef",    gradeDesc: "Super Grade",            gradeCode: "S",  gradeColor: gradeColors[2], delivered: current?.beef_super_delivered,   prevDelivered: prev?.beef_super_delivered },
  ]

  const topGainers = [...produceItems]
    .filter(item => item.delivered && item.prevDelivered)
    .map(item => ({
      ...item,
      pct: ((item.delivered! - item.prevDelivered!) / item.prevDelivered!) * 100,
    }))
    .sort((a, b) => b.pct - a.pct)
    .slice(0, 3)

  return (
    <main className="min-h-screen">

      {/* ── top stat strip — full width ── */}
      <div className="border-b bg-muted/30 text-[11px]">
        <div className="px-4 sm:px-6 lg:px-8 py-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-muted-foreground">
          <span>Price lists: <b className="text-foreground tabular-nums">{lwtTotal + cdmTotal}</b></span>
          <span className="hidden sm:inline text-border">·</span>
          <span>Liveweight: <b className="text-foreground tabular-nums">{lwtTotal}</b></span>
          <span className="hidden sm:inline text-border">·</span>
          <span>CDM: <b className="text-foreground tabular-nums">{cdmTotal}</b></span>
          <span className="hidden sm:inline text-border">·</span>
          <span>Produce: <b className="text-foreground">6</b> categories</span>
        </div>
      </div>

      {/* ── below strip: content + sidebar ── */}
      <div className="flex items-stretch min-h-[calc(100vh-33px)]">

      {/* ── left: main content ── */}
      <div className="flex-1 min-w-0">

        <div className="px-4 sm:px-6 lg:px-8 py-10">

          {/* hero */}
          <div className="mb-8">
            <div className="text-3xl font-black tracking-tight">
              Agricultural Prices
              <span className="ml-2 text-muted-foreground font-light text-2xl">Zimbabwe</span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Pricing from verified buyers · updated weekly
            </p>
          </div>

          {/* summary cards */}
          <ul role="list" className="grid grid-cols-1 gap-x-6 gap-y-4 lg:grid-cols-3 xl:gap-x-8 mb-10">

            {/* Card 1: Two separate boxes */}
            <li className="flex flex-col gap-4">
              <div className="overflow-hidden rounded-lg outline outline-1 outline-gray-200 dark:outline-white/10 px-6 py-8 flex-1">
              </div>
              <div className="overflow-hidden rounded-lg outline outline-1 outline-gray-200 dark:outline-white/10 px-6 py-8 flex-1">
              </div>
            </li>

            {/* Card 2: Trending — Chicken, Pork, Beef */}
            <li className="overflow-hidden rounded-lg outline outline-1 outline-gray-200 dark:outline-white/10">
              <div className="px-5 py-5">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-semibold text-foreground">Most Requested Buyer Prices</p>
                  <Link href="/prices/lwt" className="text-xs text-muted-foreground hover:text-foreground transition-colors">View more</Link>
                </div>
                <ul className="space-y-5">
                  {produceItems.map(item => (
                    <li key={item.key} className="flex items-start gap-2">
                      <span className={`inline-flex items-center justify-center rounded-md px-2 py-0.5 text-xs font-bold ring-1 ring-inset min-w-[36px] shrink-0 mt-0.5 ${item.gradeColor}`}>{item.gradeCode}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between gap-2">
                          <p className="text-sm font-semibold text-foreground leading-tight">{item.label}</p>
                          <p className="text-sm font-semibold tabular-nums shrink-0">
                            {item.delivered ? (
                              <>
                                ${toDollars(item.delivered)}<span className="text-xs font-normal text-muted-foreground">/kg</span>
                                {item.prevDelivered ? (() => {
                                  const diff = item.delivered - item.prevDelivered
                                  const pct = ((diff / item.prevDelivered) * 100).toFixed(1)
                                  const up = diff > 0
                                  return <span className={`ml-1.5 text-xs font-medium ${up ? "text-green-600" : "text-red-500"}`}>{up ? "▲" : "▼"} {up ? "+" : ""}{pct}%</span>
                                })() : null}
                              </>
                            ) : <span className="text-xs text-muted-foreground">—</span>}
                          </p>
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-tight">{item.gradeDesc}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </li>

            {/* Card 3: Top Gainers */}
            <li className="overflow-hidden rounded-lg outline outline-1 outline-gray-200 dark:outline-white/10">
              <div className="px-5 py-5">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-semibold text-foreground">Top Gainers</p>
                </div>
                <ul className="space-y-5">
                  {topGainers.map(item => (
                    <li key={item.key} className="flex items-start gap-2">
                      <span className={`inline-flex items-center justify-center rounded-md px-2 py-0.5 text-xs font-bold ring-1 ring-inset min-w-[36px] shrink-0 mt-0.5 ${item.gradeColor}`}>{item.gradeCode}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between gap-2">
                          <p className="text-sm font-semibold text-foreground leading-tight">{item.label}</p>
                          <p className="text-sm font-semibold tabular-nums shrink-0">
                            ${toDollars(item.delivered!)}<span className="text-xs font-normal text-muted-foreground">/kg</span>
                            <span className={`ml-1.5 text-xs font-medium ${item.pct > 0 ? "text-green-600" : "text-red-500"}`}>{item.pct > 0 ? "▲ +" : "▼ "}{item.pct.toFixed(1)}%</span>
                          </p>
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-tight">{item.gradeDesc}</p>
                      </div>
                    </li>
                  ))}
                  {topGainers.length === 0 && <p className="text-xs text-muted-foreground">No movement data yet</p>}
                </ul>
              </div>
            </li>

          </ul>

        </div>
      </div>

      {/* ── sticky insights sidebar ── */}
      <aside className="hidden lg:block w-72 xl:w-80 shrink-0 border-l">
        <div className="sticky top-6 pl-5 pt-6">
          <p className="text-sm mb-3"><span className="font-bold text-foreground">Market</span> <span className="font-normal text-muted-foreground">Insights</span></p>
          <p className="text-sm text-muted-foreground">Headlines coming soon</p>
        </div>
      </aside>

      </div>{/* end flex below strip */}
    </main>
  )
}
