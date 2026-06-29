"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { useQueryState } from "nuqs"
import { querySeriesSummary, querySeriesChart, querySeriesBuyers, queryMarketNews } from "@/lib/query"
import { makeAbbveriation, slug } from "@/lib/utilities"
import { PriceChart } from "@/components/structures/price-chart"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetClose } from "@/components/ui/sheet"

const toDollars = (v: number) => (v / 100).toFixed(2)

type GradeEntry = {
  key: string
  produce: string
  grade: string
  code: string
  price_type: string
  template_type: string
  avg: number
  high: number
  low: number
  trend: number[]
  buyer_count: number
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

function KgStats({ totalBuyers, gradeCount, avg, high, low }: {
  totalBuyers: number
  gradeCount: number
  avg: number
  high: number
  low: number
}) {
  return (
    <>
      <div className="mb-3 pb-3 border-b flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Available Buyers</p>
        <p className="text-sm font-semibold text-foreground">{totalBuyers}</p>
      </div>
      <div className="mb-3 pb-3 border-b flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Available Grade Prices</p>
        <p className="text-sm font-semibold text-foreground">{gradeCount}</p>
      </div>
      {avg > 0 && (
        <>
          <div className="mb-3 pb-3 border-b flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Avg Price</p>
            <p className="text-sm font-semibold text-foreground">${(avg / 100).toFixed(2)}/kg</p>
          </div>
          <div className="mb-3 pb-3 border-b flex items-center justify-between">
            <p className="text-sm text-muted-foreground">All-time High</p>
            <p className="text-sm font-semibold text-green-600">${(high / 100).toFixed(2)}/kg</p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">All-time Low</p>
            <p className="text-sm font-semibold text-red-500">${(low / 100).toFixed(2)}/kg</p>
          </div>
        </>
      )}
    </>
  )
}

// Point-based slicing — calculates how many entries to show based on the
// actual density of the data (total points / total days spanned).
function filterByRange(history: { value: number; date: string }[], range: TimeRange) {
  if (range === "All" || history.length < 2) return history
  const days = range === "1M" ? 30 : range === "3M" ? 90 : range === "6M" ? 180 : 365
  const spanDays = (new Date(history[history.length - 1].date).getTime() - new Date(history[0].date).getTime()) / 86400000
  const pointsPerDay = history.length / spanDays
  const points = Math.max(1, Math.round(pointsPerDay * days))
  return history.slice(-points)
}

// ── Market Insights ───────────────────────────────────────────────────────────

interface MarketNewsItem {
  id: string
  guid: string
  title: string
  link: string
  description: string
  published_at: string
  source: string
  source_url: string
}

function addUTM(url: string): string {
  try {
    const u = new URL(url)
    u.searchParams.set("utm_source", "farmnport")
    u.searchParams.set("utm_medium", "prices_board")
    u.searchParams.set("utm_campaign", "market_news")
    return u.toString()
  } catch {
    return url
  }
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

function NewsSheet({ item, open, onClose }: { item: MarketNewsItem | null; open: boolean; onClose: () => void }) {
  return (
    <Sheet open={open} onOpenChange={v => { if (!v) onClose() }}>
      <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col">
        <div className="flex items-center gap-3 px-5 py-4 border-b">
          <SheetClose asChild>
            <button className="text-muted-foreground hover:text-foreground transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
            </button>
          </SheetClose>
        </div>
        {item && (
          <div className="flex-1 overflow-y-auto">
            <div className="px-5 py-5 border-b">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">TLDR</p>
              <p className="text-base font-bold text-foreground leading-snug mb-3">{item.title}</p>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
            </div>
            <div className="px-5 py-5">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-3">Sources</p>
              <div className="rounded-xl border bg-muted/20 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-[11px] font-bold text-muted-foreground">{item.source[0]}</span>
                    <span className="text-sm font-semibold text-foreground">{item.source}</span>
                  </div>
                  <a href={addUTM(item.link)} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                  </a>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed mb-3">{item.description}</p>
                <p className="text-[11px] text-muted-foreground/60">{timeAgo(item.published_at)}</p>
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}

const NEWS_PAGE_SIZE = 20

function InsightsTimeline() {
  const [selected, setSelected] = useState<MarketNewsItem | null>(null)
  const [page, setPage] = useState(1)
  const [allItems, setAllItems] = useState<MarketNewsItem[]>([])
  const [total, setTotal] = useState(0)
  const sentinelRef = useRef<HTMLDivElement>(null)

  const { data, isFetching } = useQuery({
    queryKey: ["market-news", page],
    queryFn: () => queryMarketNews(page, NEWS_PAGE_SIZE),
    refetchOnWindowFocus: false,
  })

  useEffect(() => {
    const incoming: MarketNewsItem[] = data?.data?.data ?? []
    const t: number = data?.data?.total ?? 0
    if (incoming.length === 0) return
    setTotal(t)
    setAllItems(prev => {
      const existingGuids = new Set(prev.map(i => i.guid))
      const fresh = incoming.filter(i => !existingGuids.has(i.guid))
      return [...prev, ...fresh]
    })
  }, [data])

  const hasMore = allItems.length < total

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !isFetching && hasMore) setPage(p => p + 1) },
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [isFetching, hasMore])

  return (
    <>
      <NewsSheet item={selected} open={!!selected} onClose={() => setSelected(null)} />
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4">Latest News</p>
        {allItems.map((item, i) => (
          <div key={item.guid} className="relative pb-6 last:pb-0">
            {i < allItems.length - 1 && (
              <span className="absolute left-[4px] top-[18px] bottom-0 w-px bg-border" />
            )}
            <div className="flex gap-3">
              <div className="mt-[9px] shrink-0 w-2 flex justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 block" />
              </div>
              <button onClick={() => setSelected(item)} className="min-w-0 flex-1 text-left">
                <p className="text-[11px] text-muted-foreground mb-1">{timeAgo(item.published_at)}</p>
                <p className="text-xs font-semibold text-foreground leading-snug mb-2">{item.title}</p>
                <div className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="w-4 h-4 rounded-full bg-muted flex items-center justify-center text-[9px] font-bold leading-none text-muted-foreground">{item.source[0]}</span>
                  1 source
                </div>
              </button>
            </div>
          </div>
        ))}
        <div ref={sentinelRef} className="h-4" />
        {isFetching && (
          <div className="space-y-4 pt-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="flex gap-3">
                <div className="mt-[9px] shrink-0 w-2 flex justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-muted/60 block" />
                </div>
                <div className="flex-1 space-y-1.5">
                  <div className="h-2.5 w-16 bg-muted/60 rounded animate-pulse" />
                  <div className="h-3 w-full bg-muted/60 rounded animate-pulse" />
                  <div className="h-3 w-3/4 bg-muted/60 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        )}
        {allItems.length === 0 && !isFetching && (
          <p className="text-xs text-muted-foreground">No news available</p>
        )}
      </div>
    </>
  )
}

export function ProduceGradeBoard({
  produce,
  code: initialCode,
  priceType: initialPriceType,
}: {
  produce: string
  code: string
  priceType: string
}) {
  const [codeParam, setCodeParam] = useQueryState("code", { defaultValue: initialCode.toLowerCase(), shallow: true })
  const [typeParam, setTypeParam] = useQueryState("type", { defaultValue: initialPriceType.toLowerCase(), shallow: true })
  const [timeRange, setTimeRange] = useState<TimeRange>("All")
  const [selectedKey, setSelectedKey] = useState<string | null>(null)
  const [chartKey, setChartKey] = useState(0)
  const [buyersPage, setBuyersPage] = useState(1)

  const overviewRef = useRef<HTMLDivElement>(null)
  const buyersRef = useRef<HTMLDivElement>(null)

  const { data: seriesSummaryData } = useQuery({
    queryKey: ["series-summary"],
    queryFn: querySeriesSummary,
    refetchOnWindowFocus: false,
  })

  const gradeEntries: GradeEntry[] = (seriesSummaryData?.data?.data ?? [])
    .map((e: any): GradeEntry => ({
      key: `${e.template_type}_${e.category}_${e.code}_${e.name}`,
      produce: e.category.charAt(0) + e.category.slice(1).toLowerCase(),
      grade: e.name,
      code: e.code,
      price_type: e.template_type === "cdm" ? "Cold Dress Mass" : "Liveweight",
      template_type: e.template_type,
      avg: e.avg,
      high: e.high,
      low: e.low,
      trend: e.trend,
      buyer_count: e.buyer_count ?? 0,
    }))
    .filter((e: GradeEntry) => e.produce.toLowerCase() === produce.toLowerCase())
    .sort((a: GradeEntry, b: GradeEntry) => b.avg - a.avg)

  const produceName = produce.charAt(0).toUpperCase() + produce.slice(1)
  const priceTypes = Array.from(new Set(gradeEntries.map(e => e.price_type)))

  const activeCategory = produce.toUpperCase()
  const activeTemplateType = typeParam === "cdm" ? "cdm" : "lwt"

  const { data: buyersData, status: buyersStatus } = useQuery({
    queryKey: ["series-buyers", activeCategory, codeParam, activeTemplateType],
    queryFn: () => querySeriesBuyers(activeCategory, codeParam, activeTemplateType),
    enabled: !!codeParam,
    refetchOnWindowFocus: false,
  })

  const buyerRelations: BuyerEntry[] = buyersData?.data?.data ?? []
  const buyersTotal: number = buyersData?.data?.total ?? 0

  useLayoutEffect(() => {
    if (gradeEntries.length === 0) return
    setSelectedKey(null)
    let match: GradeEntry | undefined
    if (codeParam && typeParam) {
      const typeLabel = typeParam === "cdm" ? "Cold Dress Mass" : "Liveweight"
      match = gradeEntries.find(e => e.code.toLowerCase() === codeParam.toLowerCase() && e.price_type === typeLabel)
    } else if (codeParam) {
      match = gradeEntries.find(e => e.code.toLowerCase() === codeParam.toLowerCase())
    }
    setSelectedKey((match ?? gradeEntries[0]).key)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [produce, gradeEntries.length])

  const best = (selectedKey ? gradeEntries.find(e => e.key === selectedKey) : null) ?? gradeEntries[0]
  const activeType = best?.price_type ?? priceTypes[0] ?? ""
  const activeKey = best?.key ?? ""
  const peerGrades = gradeEntries.filter(e => e.price_type === activeType)


  const { data: chartData, isLoading: isChartLoading } = useQuery({
    queryKey: ["series-chart", activeCategory, codeParam, activeTemplateType],
    queryFn: () => querySeriesChart(activeCategory, codeParam, activeTemplateType),
    enabled: !!codeParam,
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

  function handleTypeSwitch(type: string) {
    const first = gradeEntries.find(e => e.price_type === type)
    if (first) { setSelectedKey(first.key); setChartKey(k => k + 1) }
  }
  function handleGradeSelect(k: string) {
    setSelectedKey(k)
    setChartKey(n => n + 1)
    const entry = gradeEntries.find(e => e.key === k)
    if (entry) {
      setCodeParam(entry.code.toLowerCase())
      setTypeParam(entry.price_type === "Cold Dress Mass" ? "cdm" : "lwt")
    }
    setBuyersPage(1)
  }
  function handleTimeRange(r: TimeRange) { setTimeRange(r); setChartKey(k => k + 1) }

  return (
    <main className="min-h-screen scroll-smooth">
      <div className="flex flex-col lg:flex-row">
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
                  <KgStats totalBuyers={buyersTotal} gradeCount={peerGrades.length} avg={best.avg} high={best.high} low={best.low} />
                </div>
              )}
            </div>

            {/* chart area */}
            <div className="flex-1 min-w-0 pt-4 md:pt-6 px-4 flex flex-col pb-6">
              {priceTypes.length > 0 && (
                <div className="flex items-center gap-0 border-b mb-4 -mx-4 px-4">
                  {priceTypes.map(type => (
                    <button key={type} onClick={() => handleTypeSwitch(type)}
                      className={`px-4 py-2.5 text-xs font-semibold border-b-2 -mb-px transition-colors ${activeType === type ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
                      {type}
                    </button>
                  ))}
                </div>
              )}
              <div className="flex items-center justify-between gap-2 mb-4">
                <Select value={activeKey} onValueChange={handleGradeSelect}>
                  <SelectTrigger className="h-8 text-xs w-48 focus:ring-0 focus:ring-offset-0"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {peerGrades.map(e => <SelectItem key={e.key} value={e.key} className="text-xs">{e.grade}</SelectItem>)}
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
                {isChartLoading ? (
                  <div className="w-full h-full rounded-lg bg-muted/30 animate-pulse" />
                ) : chartValues.length > 0 ? (
                  <PriceChart
                    values={chartValues.length === 1 ? [chartValues[0], chartValues[0]] : chartValues}
                    dates={chartDates.length === 1 ? [chartDates[0], chartDates[0]] : chartDates}
                    animKey={chartKey}
                  />
                ) : null}
              </div>
              {best && (
                <div className="md:hidden mt-6 pt-4 border-t">
                  <KgStats totalBuyers={buyersTotal} gradeCount={peerGrades.length} avg={best.avg} high={best.high} low={best.low} />
                </div>
              )}
            </div>

          </div>{/* end overview */}

          {/* ── buyers section ── */}
          <div id="section-buyers" ref={buyersRef} className="px-4 md:px-8 py-8">
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
                    <div className="h-4 bg-muted rounded animate-pulse w-14" />
                  </div>
                ))}
              </div>
            ) : buyerRelations.length === 0 ? (
              <p className="text-sm text-muted-foreground">No buyers listed for this produce yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-xs text-muted-foreground">
                      <th className="text-left py-2 pr-4 font-medium w-8 tabular-nums">#</th>
                      <th className="text-left py-2 font-medium">Buyer</th>
                      <th className="text-left py-2 pl-2 font-medium">Per kg</th>
                      <th className="text-left py-2 pl-2 font-medium">Change</th>
                      <th className="text-left py-2 pl-2 font-medium">Booking</th>
                    </tr>
                  </thead>
                  <tbody>
                    {buyerRelations.map((b, i) => {
                      const currentPrice = b.grade_delivered_usd > 0 ? b.grade_delivered_usd : b.grade_collected_usd
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
                            {currentPrice > 0
                              ? <>${toDollars(currentPrice)}<span className="text-xs font-normal text-muted-foreground">/kg</span></>
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
          <div className="sticky top-6 pt-6 overflow-y-auto max-h-screen [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <div className="px-5 mb-5">
              <p className="text-sm"><span className="font-bold text-foreground">Market</span>{" "}<span className="font-normal text-muted-foreground">Insights</span></p>
            </div>
            <div className="px-5 pb-8">
              <InsightsTimeline />
            </div>
          </div>
        </aside>
      </div>
    </main>
  )
}
