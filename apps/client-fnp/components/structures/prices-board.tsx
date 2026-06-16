"use client"

import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { queryProducerPriceLists, queryCdmPrices, querySeriesSummary, queryHeadSummary } from "@/lib/query"
import { PricesTabNav } from "@/components/structures/prices-tab-nav"

type Mode = "kg" | "head"

type SeriesEntry = {
  code: string
  name: string
  category: string
  template_type: string
  avg: number
  high: number
  low: number
  buyer_count: number
  trend: number[]
  latest_date?: string
}

type HeadEntry = SeriesEntry & {
  avg_weight_grams: number
}

const toDollars = (v: number) => (v / 100).toFixed(2)
const gramsToKg = (v: number) => v > 0 ? `${(v / 1000).toFixed(1)} kg` : "—"

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

const gradeColor = (species: string) => {
  const map: Record<string, string> = {
    beef:       "text-yellow-700 bg-yellow-50 ring-yellow-600/20 dark:text-yellow-400 dark:bg-yellow-950/30 dark:ring-yellow-500/20",
    lamb:       "text-green-700 bg-green-50 ring-green-600/20 dark:text-green-400 dark:bg-green-950/30 dark:ring-green-500/20",
    mutton:     "text-lime-700 bg-lime-50 ring-lime-600/20 dark:text-lime-400 dark:bg-lime-950/30 dark:ring-lime-500/20",
    goat:       "text-teal-700 bg-teal-50 ring-teal-600/20 dark:text-teal-400 dark:bg-teal-950/30 dark:ring-teal-500/20",
    chicken:    "text-orange-700 bg-orange-50 ring-orange-600/20 dark:text-orange-400 dark:bg-orange-950/30 dark:ring-orange-500/20",
    pork:       "text-pink-700 bg-pink-50 ring-pink-600/20 dark:text-pink-400 dark:bg-pink-950/30 dark:ring-pink-500/20",
    cattle:     "text-amber-700 bg-amber-50 ring-amber-600/20 dark:text-amber-400 dark:bg-amber-950/30 dark:ring-amber-500/20",
    boran:      "text-blue-700 bg-blue-50 ring-blue-600/20 dark:text-blue-400 dark:bg-blue-950/30 dark:ring-blue-500/20",
    brahman:    "text-indigo-700 bg-indigo-50 ring-indigo-600/20 dark:text-indigo-400 dark:bg-indigo-950/30 dark:ring-indigo-500/20",
    simbra:     "text-violet-700 bg-violet-50 ring-violet-600/20 dark:text-violet-400 dark:bg-violet-950/30 dark:ring-violet-500/20",
    tuli:       "text-purple-700 bg-purple-50 ring-purple-600/20 dark:text-purple-400 dark:bg-purple-950/30 dark:ring-purple-500/20",
    mashona:    "text-rose-700 bg-rose-50 ring-rose-600/20 dark:text-rose-400 dark:bg-rose-950/30 dark:ring-rose-500/20",
    nkone:      "text-cyan-700 bg-cyan-50 ring-cyan-600/20 dark:text-cyan-400 dark:bg-cyan-950/30 dark:ring-cyan-500/20",
    angoni:     "text-emerald-700 bg-emerald-50 ring-emerald-600/20 dark:text-emerald-400 dark:bg-emerald-950/30 dark:ring-emerald-500/20",
    bonsmara:   "text-fuchsia-700 bg-fuchsia-50 ring-fuchsia-600/20 dark:text-fuchsia-400 dark:bg-fuchsia-950/30 dark:ring-fuchsia-500/20",
    beefmaster: "text-red-700 bg-red-50 ring-red-600/20 dark:text-red-400 dark:bg-red-950/30 dark:ring-red-500/20",
    aberdeen:   "text-stone-700 bg-stone-50 ring-stone-600/20 dark:text-stone-400 dark:bg-stone-950/30 dark:ring-stone-500/20",
    crossbreed: "text-sky-700 bg-sky-50 ring-sky-600/20 dark:text-sky-400 dark:bg-sky-950/30 dark:ring-sky-500/20",
    heifer:     "text-yellow-700 bg-yellow-50 ring-yellow-600/20 dark:text-yellow-400 dark:bg-yellow-950/30 dark:ring-yellow-500/20",
    steer:      "text-orange-700 bg-orange-50 ring-orange-600/20 dark:text-orange-400 dark:bg-orange-950/30 dark:ring-orange-500/20",
    breeding:   "text-green-700 bg-green-50 ring-green-600/20 dark:text-green-400 dark:bg-green-950/30 dark:ring-green-500/20",
    communal:   "text-slate-700 bg-slate-50 ring-slate-600/20 dark:text-slate-400 dark:bg-slate-950/30 dark:ring-slate-500/20",
    sheep:      "text-lime-700 bg-lime-50 ring-lime-600/20 dark:text-lime-400 dark:bg-lime-950/30 dark:ring-lime-500/20",
    pigs:       "text-pink-700 bg-pink-50 ring-pink-600/20 dark:text-pink-400 dark:bg-pink-950/30 dark:ring-pink-500/20",
  }
  return map[species] ?? "text-muted-foreground bg-muted ring-border"
}

const categoryToDisplay = (cat: string): string => {
  const map: Record<string, string> = {
    CHICKENS: "Chicken",
    PIGS: "Pigs",
  }
  return map[cat] ?? (cat.charAt(0) + cat.slice(1).toLowerCase())
}

const seriesTrendPct = (trend: number[]) => {
  const filtered = trend.filter(v => v > 0)
  if (filtered.length < 2) return null
  const p = filtered[filtered.length - 2]
  const c = filtered[filtered.length - 1]
  return ((c - p) / p) * 100
}

// ── Main board ────────────────────────────────────────────────────────────────

export function PricesBoard({ mode = "kg" }: { mode?: Mode }) {
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
  const { data: seriesSummaryData } = useQuery({
    queryKey: ["series-summary"],
    queryFn: querySeriesSummary,
    enabled: mode === "kg",
    refetchOnWindowFocus: false,
  })
  const { data: headSummaryData } = useQuery({
    queryKey: ["head-summary"],
    queryFn: queryHeadSummary,
    enabled: mode === "head",
    refetchOnWindowFocus: false,
  })

  const lwtTotal: number = lwtMeta?.data?.total ?? 0
  const cdmTotal: number = cdmData?.data?.total ?? 0

  const rawKgEntries: SeriesEntry[] = seriesSummaryData?.data?.data ?? []
  const rawHeadEntries: HeadEntry[] = headSummaryData?.data?.data ?? []
  const rawEntries = mode === "head" ? rawHeadEntries : rawKgEntries

  const unit = mode === "head" ? "" : "/kg"

  const mostRequested = mode === "head"
    ? [...rawHeadEntries].filter(e => e.avg > 0).sort((a, b) => b.avg - a.avg).slice(0, 3)
    : [...rawKgEntries].filter(e => (e.buyer_count ?? 0) > 0 && e.avg > 0).sort((a, b) => (b.buyer_count ?? 0) - (a.buyer_count ?? 0)).slice(0, 3)

  const topGainers = [...rawEntries]
    .map(e => ({ ...e, pct: seriesTrendPct(e.trend ?? []) }))
    .filter(e => e.pct !== null && e.avg > 0)
    .sort((a, b) => b.pct! - a.pct!)
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

            {/* Card 1 */}
            <li className="flex flex-col gap-4">
              <div className="overflow-hidden rounded-lg outline outline-1 outline-gray-200 dark:outline-white/10 flex-1">
                <div className="px-5 py-5 h-full flex flex-col justify-center">
                  <p className="text-sm font-semibold text-foreground mb-1">Auction Lots</p>
                  <p className="text-xs text-muted-foreground">Browse and bid on upcoming livestock auction lots from verified sellers.</p>
                  <p className="text-[11px] text-muted-foreground/60 mt-2 uppercase tracking-widest">Coming Soon</p>
                </div>
              </div>
              <div className="overflow-hidden rounded-lg outline outline-1 outline-gray-200 dark:outline-white/10 flex-1">
                <div className="px-5 py-5 h-full flex flex-col justify-center">
                  <p className="text-sm font-semibold text-foreground mb-1">Price Alerts</p>
                  <p className="text-xs text-muted-foreground">Favourite a price to get alerted when it moves.</p>
                  <p className="text-[11px] text-muted-foreground/60 mt-2 uppercase tracking-widest">Coming Soon</p>
                </div>
              </div>
            </li>

            {/* Card 2: Most Requested */}
            <li className="overflow-hidden rounded-lg outline outline-1 outline-gray-200 dark:outline-white/10">
              <div className="px-5 py-5">
                <p className="text-sm font-semibold text-foreground mb-4">Most Requested Buyer Prices</p>
                <ul className="space-y-5">
                  {mostRequested.map(item => {
                    const pct = seriesTrendPct(item.trend ?? [])
                    const color = gradeColor((item.category ?? "").toLowerCase())
                    return (
                      <li key={`${item.code}_${item.name}`} className={`flex gap-2 ${mode === "head" ? "items-center" : "items-start"}`}>
                        <span className={`inline-flex items-center justify-center rounded-md px-2 py-0.5 text-xs font-bold ring-1 ring-inset shrink-0 ${mode === "head" ? "w-12" : "min-w-[36px] mt-0.5"} ${color}`}>{item.code}</span>
                        {mode === "head" ? (
                          <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-foreground truncate">{categoryToDisplay(item.category)}</p>
                              <p className="text-[11px] text-muted-foreground leading-tight truncate">{item.name}</p>
                            </div>
                            <div className="shrink-0 text-right">
                              <p className="text-sm font-semibold tabular-nums">${toDollars(item.avg)}</p>
                              <p className={`text-xs font-medium tabular-nums ${pct === null ? "text-muted-foreground" : pct >= 0 ? "text-green-600" : "text-red-500"}`}>
                                {pct === null ? "—" : `${pct >= 0 ? "▲ +" : "▼ "}${pct.toFixed(1)}%`}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-foreground truncate">{item.name}</p>
                              <p className="text-[11px] text-muted-foreground leading-tight truncate">{categoryToDisplay(item.category)}</p>
                            </div>
                            <div className="shrink-0 text-right">
                              <p className="text-sm font-semibold tabular-nums">${toDollars(item.avg)}<span className="text-xs font-normal text-muted-foreground">/kg</span></p>
                              <p className={`text-xs font-medium tabular-nums ${pct === null ? "text-muted-foreground" : pct >= 0 ? "text-green-600" : "text-red-500"}`}>
                                {pct === null ? "—" : `${pct >= 0 ? "▲ +" : "▼ "}${pct.toFixed(1)}%`}
                              </p>
                            </div>
                          </div>
                        )}
                      </li>
                    )
                  })}
                </ul>
              </div>
            </li>

            {/* Card 3: Top Gainers */}
            <li className="overflow-hidden rounded-lg outline outline-1 outline-gray-200 dark:outline-white/10">
              <div className="px-5 py-5">
                <p className="text-sm font-semibold text-foreground mb-4">Top Gainers</p>
                <ul className="space-y-5">
                  {topGainers.map(item => {
                    const color = gradeColor((item.category ?? "").toLowerCase())
                    return (
                      <li key={`${item.code}_${item.name}`} className={`flex gap-2 ${mode === "head" ? "items-center" : "items-start"}`}>
                        <span className={`inline-flex items-center justify-center rounded-md px-2 py-0.5 text-xs font-bold ring-1 ring-inset shrink-0 ${mode === "head" ? "w-12" : "min-w-[36px] mt-0.5"} ${color}`}>{item.code}</span>
                        {mode === "head" ? (
                          <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-foreground truncate">{categoryToDisplay(item.category)}</p>
                              <p className="text-[11px] text-muted-foreground leading-tight truncate">{item.name}</p>
                            </div>
                            <div className="shrink-0 text-right">
                              <p className="text-sm font-semibold tabular-nums">${toDollars(item.avg)}</p>
                              <p className={`text-xs font-medium tabular-nums ${item.pct! >= 0 ? "text-green-600" : "text-red-500"}`}>{item.pct! >= 0 ? "▲ +" : "▼ "}{item.pct!.toFixed(1)}%</p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-foreground truncate">{item.name}</p>
                              <p className="text-[11px] text-muted-foreground leading-tight truncate">{categoryToDisplay(item.category)}</p>
                            </div>
                            <div className="shrink-0 text-right">
                              <p className="text-sm font-semibold tabular-nums">${toDollars(item.avg)}<span className="text-xs font-normal text-muted-foreground">/kg</span></p>
                              <p className={`text-xs font-medium tabular-nums ${item.pct! >= 0 ? "text-green-600" : "text-red-500"}`}>{item.pct! >= 0 ? "▲ +" : "▼ "}{item.pct!.toFixed(1)}%</p>
                            </div>
                          </div>
                        )}
                      </li>
                    )
                  })}
                  {topGainers.length === 0 && <p className="text-xs text-muted-foreground">No movement data yet</p>}
                </ul>
              </div>
            </li>

          </ul>

          {/* ── Price table ── */}
          <PricesTabNav />
          {rawEntries.length > 0 && (
            <div className="mt-2 px-4 md:px-8 py-4">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-xs text-muted-foreground">
                      <th className="text-left py-2 pr-4 font-medium w-8 tabular-nums">#</th>
                      <th className="text-left py-2 font-medium">Code</th>
                      <th className="text-left py-2 pl-2 font-medium">{mode === "head" ? "Breed · Grade" : "Produce · Grade"}</th>
                      <th className="text-left py-2 pl-2 font-medium">{mode === "head" ? "Avg/Head" : "Average"}</th>
                      {mode === "head" && <th className="text-left py-2 pl-2 font-medium hidden sm:table-cell">Avg Weight</th>}
                      <th className="text-left py-2 pl-2 font-medium hidden sm:table-cell">Change</th>
                      <th className="text-left py-2 pl-2 font-medium hidden sm:table-cell">High</th>
                      <th className="text-left py-2 pl-2 font-medium hidden sm:table-cell">Low</th>
                      <th className="text-left py-2 pl-2 font-medium hidden lg:table-cell">Trend</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...rawEntries]
                      .sort((a, b) => (b.latest_date ?? "").localeCompare(a.latest_date ?? ""))
                      .map((entry, idx) => {
                        const color = gradeColor((entry.category ?? "").toLowerCase())
                        const produce = categoryToDisplay(entry.category)
                        const href = mode === "head"
                          ? `/prices/${produce.toLowerCase()}?code=${entry.code.toLowerCase()}&type=${entry.template_type}`
                          : `/prices/${produce.toLowerCase()}?code=${entry.code.toLowerCase()}&type=${entry.template_type === "cdm" ? "cdm" : "lwt"}`
                        return (
                          <tr key={`${entry.template_type}_${entry.category}_${entry.code}_${entry.name}`} className="border-b border-border/50 last:border-0 hover:bg-muted/40 transition-colors">
                            <td className="py-3 pr-4 text-muted-foreground tabular-nums text-xs">{idx + 1}</td>
                            <td className="py-3">
                              <span className={`inline-flex items-center justify-center rounded-md px-2 py-0.5 text-xs font-bold ring-1 ring-inset min-w-[36px] shrink-0 ${color}`}>{entry.code}</span>
                            </td>
                            <td className="py-3 pl-2 font-medium text-foreground">
                              <Link href={href} className="hover:underline">
                                <p className="font-semibold leading-tight">{entry.name}</p>
                                <p className="text-xs text-muted-foreground font-normal leading-tight mt-0.5">{produce}</p>
                              </Link>
                            </td>
                            <td className="py-3 pl-2 tabular-nums font-semibold">
                              ${toDollars(entry.avg)}<span className="text-xs font-normal text-muted-foreground">{unit}</span>
                            </td>
                            {mode === "head" && (
                              <td className="py-3 pl-2 tabular-nums text-muted-foreground hidden sm:table-cell">
                                {gramsToKg((entry as HeadEntry).avg_weight_grams)}
                              </td>
                            )}
                            <td className="py-3 pl-2 tabular-nums font-medium hidden sm:table-cell">
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
                            <td className="py-3 pl-2 tabular-nums font-medium text-green-600 dark:text-green-400 hidden sm:table-cell">
                              {entry.high ? `$${toDollars(entry.high)}` : <span className="text-muted-foreground font-normal">—</span>}
                            </td>
                            <td className="py-3 pl-2 tabular-nums font-medium text-red-500 dark:text-red-400 hidden sm:table-cell">
                              {entry.low ? `$${toDollars(entry.low)}` : <span className="text-muted-foreground font-normal">—</span>}
                            </td>
                            <td className="py-3 pl-2 hidden lg:table-cell">
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
