"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { queryGradeSummary, queryGradeChart, queryClients } from "@/lib/query"
import { makeAbbveriation } from "@/lib/utilities"
import { PriceChart } from "@/components/structures/price-chart"

const toDollars = (v: number) => (v / 100).toFixed(2)
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
  buyer_count: number
}

type TimeRange = "1M" | "3M" | "6M" | "1Y" | "All"
const TIME_RANGES: TimeRange[] = ["1M", "3M", "6M", "1Y", "All"]

function ProduceStats({ totalBuyers, gradeCount }: { totalBuyers: number; gradeCount: number }) {
  return (
    <>
      <div className="mb-4 pb-4 border-b flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Available Buyers</p>
        <p className="text-sm font-semibold text-foreground">{totalBuyers}</p>
      </div>
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Available Grade Prices</p>
        <p className="text-sm font-semibold text-foreground">{gradeCount}</p>
      </div>
    </>
  )
}

function filterByRange(history: { value: number; date: string }[], range: TimeRange) {
  if (range === "All") return history
  const now = Date.now()
  const days = range === "1M" ? 30 : range === "3M" ? 90 : range === "6M" ? 180 : 365
  const cutoff = now - days * 86400000
  return history.filter(p => new Date(p.date).getTime() >= cutoff)
}

export function ProduceGradeBoard({
  produce,
  code,
  priceType,
}: {
  produce: string
  code: string
  priceType: string
}) {
  const [timeRange, setTimeRange] = useState<TimeRange>("All")
  const [selectedKey, setSelectedKey] = useState<string | null>(null)
  const [chartKey, setChartKey] = useState(0)
  const [buyersPage, setBuyersPage] = useState(1)

  const overviewRef = useRef<HTMLDivElement>(null)
  const buyersRef = useRef<HTMLDivElement>(null)

  const { data: gradeSummaryData } = useQuery({
    queryKey: ["grade-summary"],
    queryFn: queryGradeSummary,
    refetchOnWindowFocus: false,
  })

  const { data: buyersData, status: buyersStatus, error: buyersError } = useQuery({
    queryKey: ["produce-buyers", produce, buyersPage],
    queryFn: () => { console.log("[buyers query] firing for", produce); return queryClients("buyer", { produce: [produce], p: buyersPage }) },
    enabled: !!produce,
    refetchOnWindowFocus: false,
    retry: false,
  })

  const allEntries: GradeEntry[] = gradeSummaryData?.data?.data ?? []
  const produceBuyers: Record<string, number> = gradeSummaryData?.data?.produce_buyers ?? {}

  const gradeEntries = allEntries
    .filter(e => e.produce.toLowerCase() === produce.toLowerCase())
    .sort((a, b) => b.avg - a.avg)

  const produceName = produce.charAt(0).toUpperCase() + produce.slice(1)
  const totalBuyers = produceBuyers[produceName] ?? 0
  const priceTypes = Array.from(new Set(gradeEntries.map(e => e.price_type)))


  useEffect(() => {
    if (gradeEntries.length === 0) return
    setSelectedKey(null)

    let match: GradeEntry | undefined

    if (code && priceType) {
      const typeLabel = priceType === "cdm" ? "Cold Dress Mass" : "Liveweight"
      match = gradeEntries.find(
        e => e.code.toLowerCase() === code.toLowerCase() && e.price_type === typeLabel
      )
    } else if (code) {
      match = gradeEntries.find(e => e.code.toLowerCase() === code.toLowerCase())
    }

    setSelectedKey((match ?? gradeEntries[0]).key)

    if (code || priceType) {
      window.history.replaceState(null, "", `/prices/${produce}`)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [produce, gradeEntries.length])

  const best = (selectedKey ? gradeEntries.find(e => e.key === selectedKey) : null) ?? gradeEntries[0]
  const activeType = best?.price_type ?? priceTypes[0] ?? ""
  const activeKey = best?.key ?? ""
  const peerGrades = gradeEntries.filter(e => e.price_type === activeType)

  const { data: chartData } = useQuery({
    queryKey: ["grade-chart", produce, activeKey],
    queryFn: () => queryGradeChart(produce, best?.code ?? ""),
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

  type BuyerEntry = {
    _id: string
    name: string
    slug: string
    province: string
    latest_price_relation?: {
      effective_date: string
      price_data: Record<string, { pricing?: { delivered?: number } }>
    }
  }
  const buyerRelations: BuyerEntry[] = buyersData?.data?.data ?? []
  const buyersTotal: number = buyersData?.data?.total ?? 0
  const buyersPageCount = Math.ceil(buyersTotal / 20)

  function handleTypeSwitch(type: string) {
    const first = gradeEntries.find(e => e.price_type === type)
    if (first) { setSelectedKey(first.key); setChartKey(k => k + 1) }
  }
  function handleGradeSelect(k: string) { setSelectedKey(k); setChartKey(k => k + 1) }
  function handleTimeRange(r: TimeRange) { setTimeRange(r); setChartKey(k => k + 1) }

  return (
    <main className="min-h-screen scroll-smooth">

      {/* ── outer row: left+chart | sidebar ── */}
      <div className="flex flex-col lg:flex-row">

        {/* left column: overview + buyers */}
        <div className="flex-1 min-w-0">

        {/* ── overview ── */}
        <div id="section-overview" ref={overviewRef} className="flex flex-col md:flex-row border-b">

        {/* info panel */}
        <div className="md:w-80 lg:w-96 xl:w-[420px] md:shrink-0 md:border-r border-b md:border-b-0 pt-6 px-4 md:pt-8 md:px-6 pb-6 md:pb-10">
          <p className="text-sm text-muted-foreground mb-5 flex items-center gap-1.5">
            <Link href="/prices" className="hover:text-foreground">Prices</Link>
            <span>/</span>
            <span className="text-foreground font-semibold">{produceName} Price</span>
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
            </div>
          )}

          {best && (
            <div className="hidden md:block">
              <ProduceStats totalBuyers={totalBuyers} gradeCount={peerGrades.length} />
            </div>
          )}
        </div>

        {/* chart area */}
        <div className="flex-1 min-w-0 pt-4 md:pt-6 px-4 flex flex-col pb-6">

          {/* price type tabs */}
          {priceTypes.length > 0 && (
            <div className="flex items-center gap-0 border-b mb-4 -mx-4 px-4">
              {priceTypes.map(type => (
                <button
                  key={type}
                  onClick={() => handleTypeSwitch(type)}
                  className={`px-4 py-2.5 text-xs font-semibold border-b-2 -mb-px transition-colors ${
                    activeType === type
                      ? "border-foreground text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          )}

          {/* grade pills + time range */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2 sm:gap-4">
            <div className="flex items-center gap-1 flex-wrap">
              {peerGrades.map(e => (
                <button
                  key={e.key}
                  onClick={() => handleGradeSelect(e.key)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all duration-200 ${
                    activeKey === e.key
                      ? "bg-foreground text-background border-foreground shadow-sm"
                      : "bg-background text-muted-foreground border-border hover:text-foreground"
                  }`}
                >
                  {e.grade}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-0.5 bg-muted rounded-xl p-1 self-start sm:shrink-0">
              {TIME_RANGES.map(r => (
                <button
                  key={r}
                  onClick={() => handleTimeRange(r)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all duration-150 ${
                    timeRange === r
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* chart */}
          <div>
            {chartValues.length > 0 && (
              <PriceChart
                values={chartValues.length === 1 ? [chartValues[0], chartValues[0]] : chartValues}
                dates={chartDates.length === 1 ? [chartDates[0], chartDates[0]] : chartDates}
                animKey={chartKey}
              />
            )}
          </div>

          {/* stats — mobile only */}
          {best && (
            <div className="md:hidden mt-6 pt-4 border-t">
              <ProduceStats totalBuyers={totalBuyers} gradeCount={peerGrades.length} />
            </div>
          )}
        </div>

        </div>{/* end overview */}

        {/* ── buyers section ── */}
        <div id="section-buyers" ref={buyersRef} className="px-4 md:px-8 py-8">
        <p className="text-lg font-semibold text-foreground mb-4">{produceName} Buyers</p>
        {buyersStatus === "pending" ? <p className="text-sm text-muted-foreground">Loading... (status: {buyersStatus})</p> : buyersStatus === "error" ? (
          <p className="text-sm text-red-500">Error: {String(buyersError)}</p>
        ) : buyerRelations.length === 0 ? (
          <p className="text-sm text-muted-foreground">No buyers listed for this produce yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-xs text-muted-foreground">
                  <th className="text-left py-2 pr-8 font-medium w-8 tabular-nums">#</th>
                  <th className="text-left py-2 font-medium">Buyer</th>
                  <th className="text-right py-2 font-medium">Latest Price</th>
                </tr>
              </thead>
              <tbody>
                {buyerRelations.map((b, i) => {
                  const rel = b.latest_price_relation
                  const latestDelivered = rel
                    ? Object.values(rel.price_data ?? {}).find(
                        (v: any) => v !== null && typeof v === "object" && !Array.isArray(v) && (v?.pricing?.delivered ?? 0) > 0
                      )?.pricing?.delivered
                    : undefined
                  return (
                  <tr key={i} className="border-b border-border/50 last:border-0 hover:bg-muted/40 transition-colors">
                    <td className="py-3 pr-8 text-muted-foreground tabular-nums text-xs">{(buyersPage - 1) * 20 + i + 1}</td>
                    <td className="py-3 pr-8 font-medium text-foreground capitalize">
                      <span className="inline-flex items-center gap-2">
                        <span className="inline-flex items-center justify-center border border-border text-xs font-mono text-muted-foreground w-7 h-6 rounded shrink-0">
                          {makeAbbveriation(b.name).toUpperCase().slice(0, 2)}
                        </span>
                        {b.name}
                      </span>
                    </td>
                    <td className="py-3 text-right tabular-nums text-sm font-semibold">
                      {latestDelivered
                        ? <>${toDollars(latestDelivered)}<span className="text-xs font-normal text-muted-foreground">/kg</span></>
                        : <span className="text-muted-foreground font-normal text-xs">—</span>}
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
              <button
                key={n}
                onClick={() => setBuyersPage(n)}
                className={`w-8 h-8 rounded text-xs font-medium transition-colors ${
                  buyersPage === n
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
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
      </div>{/* end outer row */}

    </main>
  )
}
