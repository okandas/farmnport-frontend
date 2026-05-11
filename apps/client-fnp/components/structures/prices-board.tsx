"use client"

import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { queryProducerPriceLists, queryCdmPrices, queryMarketStats } from "@/lib/query"
import { CdmPrice } from "@/lib/schemas"

type MarketStat = {
  effective_date: string
  beef_super_delivered: number
  beef_super_collected: number
  chicken_top_delivered: number
  chicken_top_collected: number
  pork_super_delivered: number
  pork_super_collected: number
}

function Delta({ current, previous }: { current: number; previous: number }) {
  if (!previous || current === previous) return null
  const diff = current - previous
  const pct = ((diff / previous) * 100).toFixed(1)
  const up = diff > 0
  return (
    <span className={`text-xs font-medium ${up ? "text-green-600" : "text-red-500"}`}>
      {up ? "▲" : "▼"} {up ? "+" : ""}{diff.toFixed(2)} ({up ? "+" : ""}{pct}%)
    </span>
  )
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
  const cdmList: CdmPrice[] = cdmData?.data?.data ?? []
  const lwtTotal: number = lwtMeta?.data?.total ?? 0
  const cdmTotal: number = cdmData?.data?.total ?? 0

  const current = stats[0]
  const prev = stats[1]
  const cdmCurrent = cdmList[0]
  const cdmPrev = cdmList[1]

  const produceItems = [
    { key: "chicken", label: "Chicken", color: "bg-yellow-400", delivered: current?.chicken_top_delivered, prevDelivered: prev?.chicken_top_delivered },
    { key: "pork",    label: "Pork",    color: "bg-pink-400",   delivered: current?.pork_super_delivered,   prevDelivered: prev?.pork_super_delivered },
    { key: "beef",    label: "Beef",    color: "bg-red-500",    delivered: current?.beef_super_delivered,   prevDelivered: prev?.beef_super_delivered },
  ]

  return (
    <main className="min-h-screen">

      {/* ── top stat strip ── */}
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

      <div className="px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex gap-8 items-start">

          {/* ── main content ── */}
          <div className="flex-1 min-w-0">

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
                <div className="overflow-hidden rounded-lg outline outline-1 outline-gray-200 dark:outline-white/10 px-5 py-4">
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1">LWT Beef — Super Grade</p>
                  {current?.beef_super_delivered ? (
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="text-2xl font-bold tabular-nums">${toDollars(current.beef_super_delivered)}<span className="text-sm font-normal text-muted-foreground">/kg</span></span>
                      {prev?.beef_super_delivered ? <Delta current={current.beef_super_delivered} previous={prev.beef_super_delivered} /> : null}
                    </div>
                  ) : <p className="text-sm text-muted-foreground">No data</p>}
                </div>
                <div className="overflow-hidden rounded-lg outline outline-1 outline-gray-200 dark:outline-white/10 px-5 py-4">
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1">CDM — Commercial Collected</p>
                  {cdmCurrent?.carcass_grades?.commercial?.collected_usd ? (
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="text-2xl font-bold tabular-nums">${cdmCurrent.carcass_grades.commercial.collected_usd}<span className="text-sm font-normal text-muted-foreground">/kg</span></span>
                      {cdmPrev?.carcass_grades?.commercial?.collected_usd ? (
                        <Delta current={cdmCurrent.carcass_grades.commercial.collected_usd} previous={cdmPrev.carcass_grades.commercial.collected_usd} />
                      ) : null}
                    </div>
                  ) : <p className="text-sm text-muted-foreground">No data</p>}
                </div>
              </li>

              {/* Card 2: Trending — Chicken, Pork, Beef */}
              <li className="overflow-hidden rounded-lg outline outline-1 outline-gray-200 dark:outline-white/10">
                <div className="px-5 py-5">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm font-semibold text-foreground">🔥 Trending</p>
                    <Link href="/prices/lwt" className="text-xs text-muted-foreground hover:text-foreground transition-colors">View more</Link>
                  </div>
                  <ul className="space-y-5">
                    {produceItems.map(item => (
                      <li key={item.key} className="flex items-center gap-3">
                        <span className={`w-8 h-8 rounded-full ${item.color} shrink-0`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground">{item.label}</p>
                          <p className="text-xs text-muted-foreground">{item.label}</p>
                        </div>
                        <div className="text-right shrink-0">
                          {item.delivered ? (
                            <p className="text-sm font-semibold tabular-nums">
                              ${toDollars(item.delivered)}
                              {item.prevDelivered ? (() => {
                                const diff = item.delivered - item.prevDelivered
                                const pct = ((diff / item.prevDelivered) * 100).toFixed(1)
                                const up = diff > 0
                                return (
                                  <span className={`ml-1.5 text-xs font-medium ${up ? "text-green-600" : "text-red-500"}`}>
                                    {up ? "+" : ""}{pct}%
                                  </span>
                                )
                              })() : null}
                            </p>
                          ) : (
                            <p className="text-xs text-muted-foreground">—</p>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </li>

              {/* Card 3: Top Gainers */}
              <li className="overflow-hidden rounded-lg outline outline-1 outline-gray-200 dark:outline-white/10">
                <div className="px-5 py-4">
                  <p className="text-xs font-semibold text-foreground mb-3">🚀 Top Gainers</p>
                </div>
              </li>

            </ul>

          </div>

          {/* ── sticky insights sidebar ── */}
          <aside className="hidden lg:block w-72 xl:w-80 shrink-0">
            <div className="sticky top-6">
              <div className="border-l pl-5">
                <p className="text-sm mb-3"><span className="font-bold text-foreground">Market</span> <span className="font-normal text-muted-foreground">Insights</span></p>
                <p className="text-sm text-muted-foreground">Headlines coming soon</p>
              </div>
            </div>
          </aside>

        </div>
      </div>
    </main>
  )
}
