"use client"

import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { queryProducerPriceLists, queryCdmPrices, queryMarketStats, queryGradeSummary } from "@/lib/query"

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

function MiniSparkline({ values }: { values: number[] }) {
  const filtered = values.filter(v => v > 0)
  if (filtered.length < 2) return <span className="text-muted-foreground text-sm">—</span>
  const w = 80, h = 28
  const min = Math.min(...filtered)
  const max = Math.max(...filtered)
  const range = max - min || 1
  const pts = filtered.map((v, i) => {
    const x = (i / (filtered.length - 1)) * w
    const y = h - ((v - min) / range) * (h - 4) - 2
    return `${x.toFixed(1)},${y.toFixed(1)}`
  }).join(" ")
  const up = filtered[filtered.length - 1] >= filtered[0]
  const stroke = up ? "#16a34a" : "#ef4444"
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="inline-block">
      <polyline points={pts} fill="none" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}


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
  const { data: gradeSummaryData } = useQuery({
    queryKey: ["grade-summary"],
    queryFn: queryGradeSummary,
    refetchOnWindowFocus: false,
  })

  const stats: MarketStat[] = statsData?.data ?? []
  const lwtTotal: number = lwtMeta?.data?.total ?? 0
  const cdmTotal: number = cdmData?.data?.total ?? 0

  const current = stats[0]
  const prev = stats[1]

  type GradeEntry = {
    key: string
    produce: string
    grade: string
    code: string
    price_type: string
    avg: number
    high: number
    low: number
    trend: number[]
  }
  const gradeEntries: GradeEntry[] = gradeSummaryData?.data ?? []

  type GradeItem = {
    key: string
    label: string
    gradeDesc: string
    gradeCode: string
    gradeColor: string
    delivered: number | undefined
    prevDelivered: number | undefined
  }

  const gradeColor = (species: string) => {
    const map: Record<string, string> = {
      beef:    "text-yellow-700 bg-yellow-50 ring-yellow-600/20 dark:text-yellow-400 dark:bg-yellow-950/30 dark:ring-yellow-500/20",
      lamb:    "text-green-700 bg-green-50 ring-green-600/20 dark:text-green-400 dark:bg-green-950/30 dark:ring-green-500/20",
      mutton:  "text-lime-700 bg-lime-50 ring-lime-600/20 dark:text-lime-400 dark:bg-lime-950/30 dark:ring-lime-500/20",
      goat:    "text-teal-700 bg-teal-50 ring-teal-600/20 dark:text-teal-400 dark:bg-teal-950/30 dark:ring-teal-500/20",
      chicken: "text-orange-700 bg-orange-50 ring-orange-600/20 dark:text-orange-400 dark:bg-orange-950/30 dark:ring-orange-500/20",
      pork:    "text-pink-700 bg-pink-50 ring-pink-600/20 dark:text-pink-400 dark:bg-pink-950/30 dark:ring-pink-500/20",
    }
    return map[species] ?? "text-muted-foreground bg-muted ring-border"
  }

  const allGrades: GradeItem[] = [
    { key: "beef_super",             label: "Beef",    gradeDesc: "Super",            gradeCode: "S",   gradeColor: gradeColor("beef"),    delivered: current?.beef_super_delivered,             prevDelivered: prev?.beef_super_delivered },
    { key: "beef_choice",            label: "Beef",    gradeDesc: "Choice",           gradeCode: "CH",  gradeColor: gradeColor("beef"),    delivered: current?.beef_choice_delivered,            prevDelivered: prev?.beef_choice_delivered },
    { key: "beef_commercial",        label: "Beef",    gradeDesc: "Commercial",       gradeCode: "CM",  gradeColor: gradeColor("beef"),    delivered: current?.beef_commercial_delivered,        prevDelivered: prev?.beef_commercial_delivered },
    { key: "beef_economy",           label: "Beef",    gradeDesc: "Economy",          gradeCode: "EC",  gradeColor: gradeColor("beef"),    delivered: current?.beef_economy_delivered,           prevDelivered: prev?.beef_economy_delivered },
    { key: "beef_manufacturing",     label: "Beef",    gradeDesc: "Manufacturing",    gradeCode: "MF",  gradeColor: gradeColor("beef"),    delivered: current?.beef_manufacturing_delivered,     prevDelivered: prev?.beef_manufacturing_delivered },
    { key: "lamb_super_premium",     label: "Lamb",    gradeDesc: "Super Premium",    gradeCode: "SP",  gradeColor: gradeColor("lamb"),    delivered: current?.lamb_super_premium_delivered,     prevDelivered: prev?.lamb_super_premium_delivered },
    { key: "lamb_choice",            label: "Lamb",    gradeDesc: "Choice",           gradeCode: "CH",  gradeColor: gradeColor("lamb"),    delivered: current?.lamb_choice_delivered,            prevDelivered: prev?.lamb_choice_delivered },
    { key: "lamb_standard",          label: "Lamb",    gradeDesc: "Standard",         gradeCode: "ST",  gradeColor: gradeColor("lamb"),    delivered: current?.lamb_standard_delivered,          prevDelivered: prev?.lamb_standard_delivered },
    { key: "lamb_inferior",          label: "Lamb",    gradeDesc: "Inferior",         gradeCode: "IN",  gradeColor: gradeColor("lamb"),    delivered: current?.lamb_inferior_delivered,          prevDelivered: prev?.lamb_inferior_delivered },
    { key: "mutton_super",           label: "Mutton",  gradeDesc: "Super",            gradeCode: "S",   gradeColor: gradeColor("mutton"),  delivered: current?.mutton_super_delivered,           prevDelivered: prev?.mutton_super_delivered },
    { key: "mutton_choice",          label: "Mutton",  gradeDesc: "Choice",           gradeCode: "CH",  gradeColor: gradeColor("mutton"),  delivered: current?.mutton_choice_delivered,          prevDelivered: prev?.mutton_choice_delivered },
    { key: "mutton_standard",        label: "Mutton",  gradeDesc: "Standard",         gradeCode: "ST",  gradeColor: gradeColor("mutton"),  delivered: current?.mutton_standard_delivered,        prevDelivered: prev?.mutton_standard_delivered },
    { key: "mutton_ordinary",        label: "Mutton",  gradeDesc: "Ordinary",         gradeCode: "OR",  gradeColor: gradeColor("mutton"),  delivered: current?.mutton_ordinary_delivered,        prevDelivered: prev?.mutton_ordinary_delivered },
    { key: "mutton_inferior",        label: "Mutton",  gradeDesc: "Inferior",         gradeCode: "IN",  gradeColor: gradeColor("mutton"),  delivered: current?.mutton_inferior_delivered,        prevDelivered: prev?.mutton_inferior_delivered },
    { key: "goat_super",             label: "Goat",    gradeDesc: "Super",            gradeCode: "S",   gradeColor: gradeColor("goat"),    delivered: current?.goat_super_delivered,             prevDelivered: prev?.goat_super_delivered },
    { key: "goat_choice",            label: "Goat",    gradeDesc: "Choice",           gradeCode: "CH",  gradeColor: gradeColor("goat"),    delivered: current?.goat_choice_delivered,            prevDelivered: prev?.goat_choice_delivered },
    { key: "goat_standard",          label: "Goat",    gradeDesc: "Standard",         gradeCode: "ST",  gradeColor: gradeColor("goat"),    delivered: current?.goat_standard_delivered,          prevDelivered: prev?.goat_standard_delivered },
    { key: "goat_inferior",          label: "Goat",    gradeDesc: "Inferior",         gradeCode: "IN",  gradeColor: gradeColor("goat"),    delivered: current?.goat_inferior_delivered,          prevDelivered: prev?.goat_inferior_delivered },
    { key: "chicken_a1",             label: "Chicken", gradeDesc: "A1 · over 1.75kg", gradeCode: "A1",  gradeColor: gradeColor("chicken"), delivered: current?.chicken_a1_delivered,             prevDelivered: prev?.chicken_a1_delivered },
    { key: "chicken_a2",             label: "Chicken", gradeDesc: "A2",               gradeCode: "A2",  gradeColor: gradeColor("chicken"), delivered: current?.chicken_a2_delivered,             prevDelivered: prev?.chicken_a2_delivered },
    { key: "chicken_a3",             label: "Chicken", gradeDesc: "A3",               gradeCode: "A3",  gradeColor: gradeColor("chicken"), delivered: current?.chicken_a3_delivered,             prevDelivered: prev?.chicken_a3_delivered },
    { key: "chicken_off_layers",     label: "Chicken", gradeDesc: "Off Layers",       gradeCode: "OL",  gradeColor: gradeColor("chicken"), delivered: current?.chicken_off_layers_delivered,     prevDelivered: prev?.chicken_off_layers_delivered },
    { key: "pork_super",             label: "Pork",    gradeDesc: "Super",            gradeCode: "SP",  gradeColor: gradeColor("pork"),    delivered: current?.pork_super_delivered,             prevDelivered: prev?.pork_super_delivered },
    { key: "pork_manufacturing",     label: "Pork",    gradeDesc: "Manufacturing",    gradeCode: "MF",  gradeColor: gradeColor("pork"),    delivered: current?.pork_manufacturing_delivered,     prevDelivered: prev?.pork_manufacturing_delivered },
  ]

  const produceItems: GradeItem[] = [
    { key: "chicken", label: "Chicken", gradeDesc: "A Grade · over 1.75kg", gradeCode: "A",  gradeColor: gradeColor("chicken"), delivered: current?.chicken_a1_delivered, prevDelivered: prev?.chicken_a1_delivered },
    { key: "pork",    label: "Pork",    gradeDesc: "Super",                  gradeCode: "SP", gradeColor: gradeColor("pork"),    delivered: current?.pork_super_delivered,   prevDelivered: prev?.pork_super_delivered },
    { key: "beef",    label: "Beef",    gradeDesc: "Super Grade",            gradeCode: "S",  gradeColor: gradeColor("beef"),    delivered: current?.beef_super_delivered,   prevDelivered: prev?.beef_super_delivered },
  ]

  const topGainers = [...allGrades]
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
                  <Link href="/prices" className="text-xs text-muted-foreground hover:text-foreground transition-colors">View more</Link>
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
                  <Link href="/prices" className="text-xs text-muted-foreground hover:text-foreground transition-colors">View more</Link>
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

          {/* ── Grade price table ── */}
          {gradeEntries.length > 0 && (
            <div className="mt-2">
              <div className="overflow-x-auto border-t border-b border-border">
                <table className="w-full text-base">
                  <thead>
                    <tr className="border-b border-border text-sm text-muted-foreground">
                      <th className="text-left px-6 py-4 font-medium w-12">#</th>
                      <th className="text-left px-6 py-4 font-medium min-w-[220px]">Produce · Grade</th>
                      <th className="text-right px-6 py-4 font-medium">Average</th>
                      <th className="text-right px-6 py-4 font-medium hidden sm:table-cell">Change</th>
                      <th className="text-right px-6 py-4 font-medium hidden sm:table-cell">High</th>
                      <th className="text-right px-6 py-4 font-medium hidden sm:table-cell">Low</th>
                      <th className="text-right px-6 py-4 font-medium hidden lg:table-cell w-24">Trend</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...gradeEntries]
                      .sort((a, b) => b.avg - a.avg)
                      .map((entry, idx) => {
                        const color = gradeColor((entry.produce ?? "").toLowerCase())
                        return (
                          <tr key={entry.key} className="border-b border-border/50 last:border-0 hover:bg-muted/40 transition-colors">
                            <td className="px-6 py-4 text-sm text-muted-foreground tabular-nums w-12">{idx + 1}</td>
                            <td className="px-6 py-4 min-w-[220px]">
                              <div className="flex items-center gap-3">
                                <span className={`inline-flex items-center justify-center rounded-md px-2 py-0.5 text-[10px] font-bold ring-1 ring-inset w-8 shrink-0 ${color}`}>{entry.code}</span>
                                <div>
                                  <Link href={`/prices/${entry.produce.toLowerCase()}?code=${entry.code.toLowerCase()}`} className="font-medium text-foreground leading-tight hover:text-foreground/70">{entry.produce} <span className="text-muted-foreground font-normal text-sm">· {entry.grade}</span></Link>
                                  <p className="text-xs text-muted-foreground leading-tight mt-0.5 italic">{entry.price_type}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right tabular-nums font-semibold">
                              ${toDollars(entry.avg)}
                            </td>
                            <td className="px-6 py-4 text-right tabular-nums text-sm font-medium hidden sm:table-cell">
                              {(() => {
                                const t = entry.trend ?? []
                                if (t.length < 2) return <span className="text-muted-foreground">—</span>
                                const prev = t[t.length - 2], curr = t[t.length - 1]
                                if (!prev) return <span className="text-muted-foreground">—</span>
                                const pct = ((curr - prev) / prev) * 100
                                const up = pct >= 0
                                return <span className={up ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-red-400"}>{up ? "▲" : "▼"} {up ? "+" : ""}{pct.toFixed(2)}%</span>
                              })()}
                            </td>
                            <td className="px-6 py-4 text-right tabular-nums text-sm font-medium text-green-600 dark:text-green-400 hidden sm:table-cell">
                              {entry.high ? `$${toDollars(entry.high)}` : <span className="text-muted-foreground font-normal">—</span>}
                            </td>
                            <td className="px-6 py-4 text-right tabular-nums text-sm font-medium text-red-500 dark:text-red-400 hidden sm:table-cell">
                              {entry.low ? `$${toDollars(entry.low)}` : <span className="text-muted-foreground font-normal">—</span>}
                            </td>
                            <td className="px-6 py-4 text-right hidden lg:table-cell">
                              <MiniSparkline values={entry.trend ?? []} />
                            </td>
                          </tr>
                        )
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

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
