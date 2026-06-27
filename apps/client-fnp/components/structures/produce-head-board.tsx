"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { useQueryState } from "nuqs"
import { queryHeadSummary, querySeriesHeadChart, querySeriesBuyers } from "@/lib/query"
import { makeAbbveriation, slug } from "@/lib/utilities"
import { PriceChart } from "@/components/structures/price-chart"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const toDollars = (v: number) => (v / 100).toFixed(2)

type HeadEntry = {
  key: string
  produce: string
  grade: string
  code: string
  template_type: string
  avg: number
  high: number
  low: number
  avg_weight_grams: number
  trend: number[]
}

type BuyerEntry = {
  client_id: string
  client_name: string
  last_active: string
  grade_delivered_usd: number
  grade_collected_usd: number
  avg_amount_head: number
  max_amount_head: number
  min_amount_head: number
  has_booking: boolean
}

type TimeRange = "1M" | "3M" | "6M" | "1Y" | "All"
const TIME_RANGES: TimeRange[] = ["1M", "3M", "6M", "1Y", "All"]

function HeadStats({ totalBuyers, gradeCount, avg, maxHead, minHead }: {
  totalBuyers: number
  gradeCount: number
  avg: number
  maxHead: number
  minHead: number
}) {
  return (
    <>
      <div className="mb-3 pb-3 border-b flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Available Buyers</p>
        <p className="text-sm font-semibold text-foreground">{totalBuyers}</p>
      </div>
      <div className="mb-3 pb-3 border-b flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Available Grades</p>
        <p className="text-sm font-semibold text-foreground">{gradeCount}</p>
      </div>
      {avg > 0 && (
        <div className={`mb-3 pb-3 border-b flex items-center justify-between`}>
          <p className="text-sm text-muted-foreground">Avg Price</p>
          <p className="text-sm font-semibold text-foreground">${(avg / 100).toFixed(2)}</p>
        </div>
      )}
      {maxHead > 0 && (
        <div className="mb-3 pb-3 border-b flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Max Per Head</p>
          <p className="text-sm font-semibold text-foreground">${(maxHead / 100).toFixed(2)}</p>
        </div>
      )}
      {minHead > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Min Per Head</p>
          <p className="text-sm font-semibold text-foreground">${(minHead / 100).toFixed(2)}</p>
        </div>
      )}
    </>
  )
}

function filterByRange(history: { value: number; date: string }[], range: TimeRange) {
  if (range === "All" || history.length < 2) return history
  const days = range === "1M" ? 30 : range === "3M" ? 90 : range === "6M" ? 180 : 365
  const spanDays = (new Date(history[history.length - 1].date).getTime() - new Date(history[0].date).getTime()) / 86400000
  const pointsPerDay = history.length / spanDays
  const points = Math.max(1, Math.round(pointsPerDay * days))
  return history.slice(-points)
}

export function ProduceHeadBoard({
  produce,
  code: initialCode,
}: {
  produce: string
  code: string
}) {
  const [codeParam, setCodeParam] = useQueryState("code", { defaultValue: initialCode.toLowerCase(), shallow: true })
  const [timeRange, setTimeRange] = useState<TimeRange>("All")
  const [selectedKey, setSelectedKey] = useState<string | null>(null)
  const [chartKey, setChartKey] = useState(0)
  const [buyersPage, setBuyersPage] = useState(1)

  const { data: headSummaryData } = useQuery({
    queryKey: ["head-summary"],
    queryFn: queryHeadSummary,
    refetchOnWindowFocus: false,
  })

  const gradeEntries: HeadEntry[] = (headSummaryData?.data?.data ?? [])
    .map((e: any): HeadEntry => ({
      key: `${e.template_type}_${e.category}_${e.code}_${e.name}`,
      produce: e.category.charAt(0) + e.category.slice(1).toLowerCase(),
      grade: e.name,
      code: e.code,
      template_type: e.template_type,
      avg: e.avg,
      high: e.high,
      low: e.low,
      avg_weight_grams: e.avg_weight_grams ?? 0,
      trend: e.trend ?? [],
    }))
    .filter((e: HeadEntry) => e.produce.toLowerCase() === produce.toLowerCase())
    .sort((a: HeadEntry, b: HeadEntry) => b.avg - a.avg)

  const produceName = produce.charAt(0).toUpperCase() + produce.slice(1)
  const activeCategory = produce.toUpperCase()

  const { data: buyersData, status: buyersStatus } = useQuery({
    queryKey: ["series-buyers", activeCategory, codeParam, "lwt"],
    queryFn: () => querySeriesBuyers(activeCategory, codeParam, "lwt"),
    enabled: !!codeParam,
    refetchOnWindowFocus: false,
  })

  const buyerRelations: BuyerEntry[] = buyersData?.data?.data ?? []
  const buyersTotal: number = buyersData?.data?.total ?? 0

  useEffect(() => {
    if (gradeEntries.length === 0) return
    setSelectedKey(null)
    const match = codeParam
      ? gradeEntries.find(e => e.code.toLowerCase() === codeParam.toLowerCase())
      : undefined
    setSelectedKey((match ?? gradeEntries[0]).key)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [produce, gradeEntries.length])

  const best = (selectedKey ? gradeEntries.find(e => e.key === selectedKey) : null) ?? gradeEntries[0]
  const activeKey = best?.key ?? ""

  const { data: chartData } = useQuery({
    queryKey: ["series-chart", activeCategory, best?.code, best?.template_type ?? "lwt"],
    queryFn: () => querySeriesHeadChart(activeCategory, best?.code ?? "", best?.template_type ?? "lwt"),
    enabled: !!activeKey && !!best,
    refetchOnWindowFocus: false,
  })

  const rawHistory: { value: number; date: string }[] = chartData?.data?.history ?? []
  const filtered = filterByRange(rawHistory, timeRange)
  const chartValues = filtered.map(p => p.value)
  const chartDates = filtered.map(p => p.date)

  const bestChange = (() => {
    const t = best?.trend ?? []
    if (t.length < 2) return null
    const prev = t[t.length - 2], curr = t[t.length - 1]
    if (!prev) return null
    return ((curr - prev) / prev) * 100
  })()

  const buyersPageCount = Math.ceil(buyersTotal / 10)

  function handleGradeSelect(k: string) {
    setSelectedKey(k)
    setChartKey(n => n + 1)
    const entry = gradeEntries.find(e => e.key === k)
    if (entry) setCodeParam(entry.code.toLowerCase())
    setBuyersPage(1)
  }
  function handleTimeRange(r: TimeRange) { setTimeRange(r); setChartKey(k => k + 1) }

  return (
    <main className="min-h-screen scroll-smooth">
      <div className="flex flex-col lg:flex-row">
        <div className="flex-1 min-w-0">

          {/* ── overview ── */}
          <div className="flex flex-col md:flex-row border-b">

            {/* info panel */}
            <div className="md:w-80 lg:w-96 xl:w-[420px] md:shrink-0 md:border-r border-b md:border-b-0 pt-6 px-4 md:pt-8 md:px-6 pb-6 md:pb-10">
              <p className="text-sm text-muted-foreground mb-5 flex items-center gap-1.5">
                <Link href="/prices/head" className="hover:text-foreground">Per Head Prices</Link>
                <span>/</span>
                <span className="text-foreground font-semibold">{produceName}</span>
              </p>
              <h2 className="text-sm mb-4 font-bold text-foreground">{produceName}</h2>
              {best && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-4xl md:text-5xl font-bold text-foreground">${toDollars(best.avg)}</p>
                    <span className="text-sm text-muted-foreground">{best.grade}</span>
                    {bestChange !== null && (
                      <span className={`text-xs font-medium ${bestChange >= 0 ? "text-green-600" : "text-red-500"}`}>
                        {bestChange >= 0 ? "▲" : "▼"} {bestChange >= 0 ? "+" : ""}{bestChange.toFixed(2)}%
                      </span>
                    )}
                  </div>
                  {best.avg_weight_grams > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">Avg weight {(best.avg_weight_grams / 1000).toFixed(1)} kg</p>
                  )}
                </div>
              )}
              {best && (
                <div className="hidden md:block">
                  <HeadStats
                    totalBuyers={buyersTotal}
                    gradeCount={gradeEntries.length}
                    avg={best.avg}
                    maxHead={buyerRelations[0]?.max_amount_head ?? 0}
                    minHead={buyerRelations[0]?.min_amount_head ?? 0}
                  />
                </div>
              )}
            </div>

            {/* chart area */}
            <div className="flex-1 min-w-0 pt-4 md:pt-6 px-4 flex flex-col pb-6">
              <div className="flex items-center justify-between gap-2 mb-4">
                <Select value={activeKey} onValueChange={handleGradeSelect}>
                  <SelectTrigger className="h-8 text-xs w-48 focus:ring-0 focus:ring-offset-0"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {gradeEntries.map(e => <SelectItem key={e.key} value={e.key} className="text-xs">{e.grade}</SelectItem>)}
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-0.5 bg-muted rounded-xl p-1">
                  {TIME_RANGES.map(r => (
                    <button key={r} onClick={() => handleTimeRange(r)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all duration-150 ${timeRange === r ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                      {r}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ height: 300 }}>
                {chartValues.length > 0 && (
                  <PriceChart
                    values={chartValues.length === 1 ? [chartValues[0], chartValues[0]] : chartValues}
                    dates={chartDates.length === 1 ? [chartDates[0], chartDates[0]] : chartDates}
                    animKey={chartKey}
                  />
                )}
              </div>
              {best && (
                <div className="md:hidden mt-6 pt-4 border-t">
                  <HeadStats
                    totalBuyers={buyersTotal}
                    gradeCount={gradeEntries.length}
                    avg={best.avg}
                    maxHead={buyerRelations[0]?.max_amount_head ?? 0}
                    minHead={buyerRelations[0]?.min_amount_head ?? 0}
                  />
                </div>
              )}
            </div>

          </div>{/* end overview */}

          {/* ── buyers section ── */}
          <div className="px-4 md:px-8 py-8">
            <p className="text-lg font-semibold text-foreground mb-4">{produceName} Buyers</p>
            {buyersStatus === "pending" ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 py-3 border-b border-border/50 last:border-0">
                    <div className="w-6 h-4 bg-muted rounded animate-pulse shrink-0" />
                    <div className="w-7 h-6 bg-muted rounded animate-pulse shrink-0" />
                    <div className="h-4 bg-muted rounded animate-pulse flex-1 max-w-[140px]" />
                    <div className="h-4 bg-muted rounded animate-pulse w-14 ml-auto" />
                    <div className="h-4 bg-muted rounded animate-pulse w-14" />
                  </div>
                ))}
              </div>
            ) : buyerRelations.length === 0 ? (
              <p className="text-sm text-muted-foreground">No buyers listed for this breed yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-xs text-muted-foreground">
                      <th className="text-left py-2 pr-4 font-medium w-8 tabular-nums">#</th>
                      <th className="text-left py-2 font-medium">Buyer</th>
                      <th className="text-left py-2 pl-2 font-medium">Per Head</th>
                      <th className="text-left py-2 pl-2 font-medium">Change</th>
                      <th className="text-left py-2 pl-2 font-medium">Booking</th>
                    </tr>
                  </thead>
                  <tbody>
                    {buyerRelations.map((b, i) => {
                      const trend = best?.trend ?? []
                      const pct = trend.length >= 2 && trend[trend.length - 2]
                        ? ((trend[trend.length - 1] - trend[trend.length - 2]) / trend[trend.length - 2]) * 100
                        : null
                      return (
                        <tr key={b.client_id} className="border-b border-border/50 last:border-0 hover:bg-muted/40 transition-colors">
                          <td className="py-3 pr-4 text-muted-foreground tabular-nums text-xs">{(buyersPage - 1) * 10 + i + 1}</td>
                          <td className="py-3 font-medium text-foreground capitalize">
                            <span className="inline-flex items-center gap-2">
                              <span className="inline-flex items-center justify-center border border-border text-xs font-mono text-muted-foreground w-7 h-6 rounded shrink-0">
                                {makeAbbveriation(b.client_name).toUpperCase().slice(0, 2)}
                              </span>
                              <Link href={`/buyer/${slug(b.client_name)}`} className="hover:underline">{b.client_name}</Link>
                            </span>
                          </td>
                          <td className="py-3 pl-2 tabular-nums text-sm font-semibold">
                            {b.avg_amount_head > 0
                              ? <>${toDollars(b.avg_amount_head)}</>
                              : <span className="text-muted-foreground font-normal text-xs">—</span>}
                          </td>
                          <td className="py-3 pl-2 tabular-nums text-xs font-medium">
                            {pct !== null
                              ? <span className={pct >= 0 ? "text-green-600" : "text-red-500"}>{pct >= 0 ? "▲" : "▼"} {Math.abs(pct).toFixed(1)}%</span>
                              : <span className="text-muted-foreground">—</span>}
                          </td>
                          <td className="py-3 pl-2">
                            {b.has_booking
                              ? <Link href={`/book/${slug(b.client_name)}`} className="inline-flex items-center px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors whitespace-nowrap">Book Now →</Link>
                              : <Link href={`/buyer/${slug(b.client_name)}`} className="text-xs font-medium text-muted-foreground hover:text-foreground hover:underline whitespace-nowrap">Contact</Link>}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
            {buyersPageCount > 1 && (
              <div className="flex items-center justify-center gap-1 mt-6">
                {Array.from({ length: buyersPageCount }, (_, i) => i + 1).map(n => (
                  <button key={n} onClick={() => setBuyersPage(n)}
                    className={`w-8 h-8 rounded text-xs font-medium transition-colors ${buyersPage === n ? "bg-foreground text-background" : "text-muted-foreground hover:bg-muted"}`}>
                    {n}
                  </button>
                ))}
              </div>
            )}
          </div>{/* end buyers */}

        </div>{/* end left column */}

        {/* right sidebar */}
        <aside className="hidden lg:block w-72 xl:w-80 shrink-0 border-l">
          <div className="sticky top-10 pl-5 pt-6">
            <p className="text-sm mb-3">
              <span className="font-bold text-foreground">Market</span>{" "}
              <span className="font-normal text-muted-foreground">Insights</span>
            </p>
          </div>
        </aside>
      </div>
    </main>
  )
}
