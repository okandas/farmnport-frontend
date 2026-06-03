"use client"

import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { queryHeadSummary, queryProducerPriceLists, queryCdmPrices, queryMarketStats } from "@/lib/query"
import { PricesTabNav } from "@/components/structures/prices-tab-nav"

type HeadEntry = {
  code: string
  name: string
  category: string
  template_type: string
  avg: number
  high: number
  low: number
  avg_weight_grams: number
  trend: number[]
}

type MarketStat = {
  effective_date: string
  beef_super_delivered: number
  beef_choice_delivered: number
  beef_commercial_delivered: number
  beef_economy_delivered: number
  beef_manufacturing_delivered: number
  beef_condemned_delivered: number
  lamb_super_premium_delivered: number
  lamb_choice_delivered: number
  lamb_standard_delivered: number
  lamb_inferior_delivered: number
  mutton_super_delivered: number
  mutton_choice_delivered: number
  mutton_standard_delivered: number
  mutton_ordinary_delivered: number
  mutton_inferior_delivered: number
  goat_super_delivered: number
  goat_choice_delivered: number
  goat_standard_delivered: number
  goat_inferior_delivered: number
  chicken_a1_delivered: number
  chicken_a2_delivered: number
  chicken_a3_delivered: number
  chicken_off_layers_delivered: number
  pork_super_delivered: number
  pork_manufacturing_delivered: number
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
    beef:      "text-yellow-700 bg-yellow-50 ring-yellow-600/20 dark:text-yellow-400 dark:bg-yellow-950/30 dark:ring-yellow-500/20",
    lamb:      "text-green-700 bg-green-50 ring-green-600/20 dark:text-green-400 dark:bg-green-950/30 dark:ring-green-500/20",
    mutton:    "text-lime-700 bg-lime-50 ring-lime-600/20 dark:text-lime-400 dark:bg-lime-950/30 dark:ring-lime-500/20",
    goat:      "text-teal-700 bg-teal-50 ring-teal-600/20 dark:text-teal-400 dark:bg-teal-950/30 dark:ring-teal-500/20",
    chicken:   "text-orange-700 bg-orange-50 ring-orange-600/20 dark:text-orange-400 dark:bg-orange-950/30 dark:ring-orange-500/20",
    pork:      "text-pink-700 bg-pink-50 ring-pink-600/20 dark:text-pink-400 dark:bg-pink-950/30 dark:ring-pink-500/20",
    cattle:    "text-amber-700 bg-amber-50 ring-amber-600/20 dark:text-amber-400 dark:bg-amber-950/30 dark:ring-amber-500/20",
    boran:     "text-blue-700 bg-blue-50 ring-blue-600/20 dark:text-blue-400 dark:bg-blue-950/30 dark:ring-blue-500/20",
    brahman:   "text-indigo-700 bg-indigo-50 ring-indigo-600/20 dark:text-indigo-400 dark:bg-indigo-950/30 dark:ring-indigo-500/20",
    simbra:    "text-violet-700 bg-violet-50 ring-violet-600/20 dark:text-violet-400 dark:bg-violet-950/30 dark:ring-violet-500/20",
    tuli:      "text-purple-700 bg-purple-50 ring-purple-600/20 dark:text-purple-400 dark:bg-purple-950/30 dark:ring-purple-500/20",
    mashona:   "text-rose-700 bg-rose-50 ring-rose-600/20 dark:text-rose-400 dark:bg-rose-950/30 dark:ring-rose-500/20",
    nkone:     "text-cyan-700 bg-cyan-50 ring-cyan-600/20 dark:text-cyan-400 dark:bg-cyan-950/30 dark:ring-cyan-500/20",
    angoni:    "text-emerald-700 bg-emerald-50 ring-emerald-600/20 dark:text-emerald-400 dark:bg-emerald-950/30 dark:ring-emerald-500/20",
    bonsmara:  "text-fuchsia-700 bg-fuchsia-50 ring-fuchsia-600/20 dark:text-fuchsia-400 dark:bg-fuchsia-950/30 dark:ring-fuchsia-500/20",
    beefmaster:"text-red-700 bg-red-50 ring-red-600/20 dark:text-red-400 dark:bg-red-950/30 dark:ring-red-500/20",
    aberdeen:  "text-stone-700 bg-stone-50 ring-stone-600/20 dark:text-stone-400 dark:bg-stone-950/30 dark:ring-stone-500/20",
    crossbreed:"text-sky-700 bg-sky-50 ring-sky-600/20 dark:text-sky-400 dark:bg-sky-950/30 dark:ring-sky-500/20",
    heifer:    "text-yellow-700 bg-yellow-50 ring-yellow-600/20 dark:text-yellow-400 dark:bg-yellow-950/30 dark:ring-yellow-500/20",
    steer:     "text-orange-700 bg-orange-50 ring-orange-600/20 dark:text-orange-400 dark:bg-orange-950/30 dark:ring-orange-500/20",
    breeding:  "text-green-700 bg-green-50 ring-green-600/20 dark:text-green-400 dark:bg-green-950/30 dark:ring-green-500/20",
    communal:  "text-slate-700 bg-slate-50 ring-slate-600/20 dark:text-slate-400 dark:bg-slate-950/30 dark:ring-slate-500/20",
    sheep:     "text-lime-700 bg-lime-50 ring-lime-600/20 dark:text-lime-400 dark:bg-lime-950/30 dark:ring-lime-500/20",
    pigs:      "text-pink-700 bg-pink-50 ring-pink-600/20 dark:text-pink-400 dark:bg-pink-950/30 dark:ring-pink-500/20",
  }
  return map[species] ?? "text-muted-foreground bg-muted ring-border"
}

export function PricesHeadBoard() {
  const { data } = useQuery({
    queryKey: ["head-summary"],
    queryFn: queryHeadSummary,
    refetchOnWindowFocus: false,
  })
  const { data: statsData } = useQuery({
    queryKey: ["market-stats"],
    queryFn: queryMarketStats,
    refetchOnWindowFocus: false,
  })
  const { data: cdmData } = useQuery({
    queryKey: ["cdm-board"],
    queryFn: () => queryCdmPrices({ p: 1, limit: 1 } as any),
    refetchOnWindowFocus: false,
  })
  const { data: lwtMeta } = useQuery({
    queryKey: ["lwt-total"],
    queryFn: () => queryProducerPriceLists({ p: 1, limit: 1 } as any),
    refetchOnWindowFocus: false,
  })

  const entries: HeadEntry[] = data?.data?.data ?? []
  const stats: MarketStat[] = statsData?.data ?? []
  const lwtTotal: number = lwtMeta?.data?.total ?? 0
  const cdmTotal: number = cdmData?.data?.total ?? 0
  const current = stats[0]
  const prev = stats[1]

  type GradeItem = {
    key: string
    label: string
    gradeDesc: string
    gradeCode: string
    gradeColor: string
    delivered: number | undefined
    prevDelivered: number | undefined
  }

  const allGrades: GradeItem[] = [
    { key: "beef_super",         label: "Beef",    gradeDesc: "Super",            gradeCode: "S",   gradeColor: gradeColor("beef"),    delivered: current?.beef_super_delivered,         prevDelivered: prev?.beef_super_delivered },
    { key: "beef_choice",        label: "Beef",    gradeDesc: "Choice",           gradeCode: "CH",  gradeColor: gradeColor("beef"),    delivered: current?.beef_choice_delivered,        prevDelivered: prev?.beef_choice_delivered },
    { key: "beef_commercial",    label: "Beef",    gradeDesc: "Commercial",       gradeCode: "CM",  gradeColor: gradeColor("beef"),    delivered: current?.beef_commercial_delivered,    prevDelivered: prev?.beef_commercial_delivered },
    { key: "beef_economy",       label: "Beef",    gradeDesc: "Economy",          gradeCode: "EC",  gradeColor: gradeColor("beef"),    delivered: current?.beef_economy_delivered,       prevDelivered: prev?.beef_economy_delivered },
    { key: "beef_manufacturing", label: "Beef",    gradeDesc: "Manufacturing",    gradeCode: "MF",  gradeColor: gradeColor("beef"),    delivered: current?.beef_manufacturing_delivered, prevDelivered: prev?.beef_manufacturing_delivered },
    { key: "lamb_super_premium", label: "Lamb",    gradeDesc: "Super Premium",    gradeCode: "SP",  gradeColor: gradeColor("lamb"),    delivered: current?.lamb_super_premium_delivered, prevDelivered: prev?.lamb_super_premium_delivered },
    { key: "lamb_choice",        label: "Lamb",    gradeDesc: "Choice",           gradeCode: "CH",  gradeColor: gradeColor("lamb"),    delivered: current?.lamb_choice_delivered,        prevDelivered: prev?.lamb_choice_delivered },
    { key: "lamb_standard",      label: "Lamb",    gradeDesc: "Standard",         gradeCode: "ST",  gradeColor: gradeColor("lamb"),    delivered: current?.lamb_standard_delivered,      prevDelivered: prev?.lamb_standard_delivered },
    { key: "lamb_inferior",      label: "Lamb",    gradeDesc: "Inferior",         gradeCode: "IN",  gradeColor: gradeColor("lamb"),    delivered: current?.lamb_inferior_delivered,      prevDelivered: prev?.lamb_inferior_delivered },
    { key: "mutton_super",       label: "Mutton",  gradeDesc: "Super",            gradeCode: "S",   gradeColor: gradeColor("mutton"),  delivered: current?.mutton_super_delivered,       prevDelivered: prev?.mutton_super_delivered },
    { key: "mutton_choice",      label: "Mutton",  gradeDesc: "Choice",           gradeCode: "CH",  gradeColor: gradeColor("mutton"),  delivered: current?.mutton_choice_delivered,      prevDelivered: prev?.mutton_choice_delivered },
    { key: "mutton_standard",    label: "Mutton",  gradeDesc: "Standard",         gradeCode: "ST",  gradeColor: gradeColor("mutton"),  delivered: current?.mutton_standard_delivered,    prevDelivered: prev?.mutton_standard_delivered },
    { key: "mutton_ordinary",    label: "Mutton",  gradeDesc: "Ordinary",         gradeCode: "OR",  gradeColor: gradeColor("mutton"),  delivered: current?.mutton_ordinary_delivered,    prevDelivered: prev?.mutton_ordinary_delivered },
    { key: "mutton_inferior",    label: "Mutton",  gradeDesc: "Inferior",         gradeCode: "IN",  gradeColor: gradeColor("mutton"),  delivered: current?.mutton_inferior_delivered,    prevDelivered: prev?.mutton_inferior_delivered },
    { key: "goat_super",         label: "Goat",    gradeDesc: "Super",            gradeCode: "S",   gradeColor: gradeColor("goat"),    delivered: current?.goat_super_delivered,         prevDelivered: prev?.goat_super_delivered },
    { key: "goat_choice",        label: "Goat",    gradeDesc: "Choice",           gradeCode: "CH",  gradeColor: gradeColor("goat"),    delivered: current?.goat_choice_delivered,        prevDelivered: prev?.goat_choice_delivered },
    { key: "goat_standard",      label: "Goat",    gradeDesc: "Standard",         gradeCode: "ST",  gradeColor: gradeColor("goat"),    delivered: current?.goat_standard_delivered,      prevDelivered: prev?.goat_standard_delivered },
    { key: "goat_inferior",      label: "Goat",    gradeDesc: "Inferior",         gradeCode: "IN",  gradeColor: gradeColor("goat"),    delivered: current?.goat_inferior_delivered,      prevDelivered: prev?.goat_inferior_delivered },
    { key: "chicken_a1",         label: "Chicken", gradeDesc: "A1 · over 1.75kg", gradeCode: "A1",  gradeColor: gradeColor("chicken"), delivered: current?.chicken_a1_delivered,         prevDelivered: prev?.chicken_a1_delivered },
    { key: "chicken_a2",         label: "Chicken", gradeDesc: "A2",               gradeCode: "A2",  gradeColor: gradeColor("chicken"), delivered: current?.chicken_a2_delivered,         prevDelivered: prev?.chicken_a2_delivered },
    { key: "chicken_a3",         label: "Chicken", gradeDesc: "A3",               gradeCode: "A3",  gradeColor: gradeColor("chicken"), delivered: current?.chicken_a3_delivered,         prevDelivered: prev?.chicken_a3_delivered },
    { key: "chicken_off_layers", label: "Chicken", gradeDesc: "Off Layers",       gradeCode: "OL",  gradeColor: gradeColor("chicken"), delivered: current?.chicken_off_layers_delivered, prevDelivered: prev?.chicken_off_layers_delivered },
    { key: "pork_super",         label: "Pork",    gradeDesc: "Super",            gradeCode: "SP",  gradeColor: gradeColor("pork"),    delivered: current?.pork_super_delivered,         prevDelivered: prev?.pork_super_delivered },
    { key: "pork_manufacturing", label: "Pork",    gradeDesc: "Manufacturing",    gradeCode: "MF",  gradeColor: gradeColor("pork"),    delivered: current?.pork_manufacturing_delivered, prevDelivered: prev?.pork_manufacturing_delivered },
  ]

  const produceItems: GradeItem[] = [
    { key: "chicken", label: "Chicken", gradeDesc: "A Grade · over 1.75kg", gradeCode: "A",  gradeColor: gradeColor("chicken"), delivered: current?.chicken_a1_delivered, prevDelivered: prev?.chicken_a1_delivered },
    { key: "pork",    label: "Pork",    gradeDesc: "Super",                  gradeCode: "SP", gradeColor: gradeColor("pork"),    delivered: current?.pork_super_delivered, prevDelivered: prev?.pork_super_delivered },
    { key: "beef",    label: "Beef",    gradeDesc: "Super Grade",            gradeCode: "S",  gradeColor: gradeColor("beef"),    delivered: current?.beef_super_delivered, prevDelivered: prev?.beef_super_delivered },
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

              {/* Card 1: Two empty boxes */}
              <li className="flex flex-col gap-4">
                <div className="overflow-hidden rounded-lg outline outline-1 outline-gray-200 dark:outline-white/10 px-6 py-8 flex-1" />
                <div className="overflow-hidden rounded-lg outline outline-1 outline-gray-200 dark:outline-white/10 px-6 py-8 flex-1" />
              </li>

              {/* Card 2: Most Requested Buyer Prices */}
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

            {/* ── Per-head table ── */}
            <PricesTabNav />
            {entries.length > 0 && (
              <div className="mt-2 px-4 md:px-8 py-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-xs text-muted-foreground">
                        <th className="text-left py-2 pr-4 font-medium w-8 tabular-nums">#</th>
                        <th className="text-left py-2 font-medium w-24">Code</th>
                        <th className="text-left py-2 pl-2 font-medium">Breed · Grade</th>
                        <th className="text-left py-2 pl-2 font-medium">Avg/Head</th>
                        <th className="text-left py-2 pl-2 font-medium hidden sm:table-cell">Avg Weight</th>
                        <th className="text-left py-2 pl-2 font-medium hidden sm:table-cell">Change</th>
                        <th className="text-left py-2 pl-2 font-medium hidden sm:table-cell">High</th>
                        <th className="text-left py-2 pl-2 font-medium hidden sm:table-cell">Low</th>
                        <th className="text-left py-2 pl-2 font-medium hidden lg:table-cell">Trend</th>
                      </tr>
                    </thead>
                    <tbody>
                      {entries.map((entry, idx) => {
                        const produce = entry.category.charAt(0) + entry.category.slice(1).toLowerCase()
                        return (
                          <tr key={`${entry.template_type}_${entry.category}_${entry.code}_${entry.name}`} className="border-b border-border/50 last:border-0 hover:bg-muted/40 transition-colors">
                            <td className="py-3 pr-4 text-muted-foreground tabular-nums text-xs">{idx + 1}</td>
                            <td className="py-3 pr-2">
                              <span className={`inline-flex items-center justify-center rounded-md px-2 py-0.5 text-xs font-bold ring-1 ring-inset min-w-[36px] shrink-0 ${gradeColor(entry.category.toLowerCase())}`}>
                                {entry.code}
                              </span>
                            </td>
                            <td className="py-3 pl-2 font-medium text-foreground">
                              <Link
                                href={`/prices/${produce.toLowerCase()}?code=${entry.code.toLowerCase()}&type=${entry.template_type}`}
                                className="hover:underline"
                              >
                                <p className="font-semibold leading-tight">{entry.name}</p>
                                <p className="text-xs text-muted-foreground font-normal leading-tight mt-0.5">{produce}</p>
                              </Link>
                            </td>
                            <td className="py-3 pl-2 tabular-nums font-semibold">
                              ${toDollars(entry.avg)}
                            </td>
                            <td className="py-3 pl-2 tabular-nums text-muted-foreground hidden sm:table-cell">
                              {gramsToKg(entry.avg_weight_grams)}
                            </td>
                            <td className="py-3 pl-2 tabular-nums font-medium hidden sm:table-cell">
                              {(() => {
                                const t = entry.trend ?? []
                                if (t.length < 2) return <span className="text-muted-foreground">—</span>
                                const prevVal = t[t.length - 2], curr = t[t.length - 1]
                                if (!prevVal) return <span className="text-muted-foreground">—</span>
                                const pct = ((curr - prevVal) / prevVal) * 100
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

      </div>
    </main>
  )
}
