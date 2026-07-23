"use client"

import Link from "next/link"
import { useState, useEffect, useRef } from "react"
import { useQuery } from "@tanstack/react-query"
import { queryProducerPriceLists, queryCdmPrices, querySeriesSummary, queryHeadSummary, queryMarketNews } from "@/lib/query"
import { PricesTabNav } from "@/components/structures/prices-tab-nav"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Sheet, SheetContent, SheetClose } from "@/components/ui/sheet"
import { driver } from "driver.js"
import "driver.js/dist/driver.css"

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

// ── Market News ───────────────────────────────────────────────────────────────

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

// ── Insights timeline ─────────────────────────────────────────────────────────

const PAGE_SIZE = 20

function InsightsTimeline() {
  const [selected, setSelected] = useState<MarketNewsItem | null>(null)
  const [page, setPage] = useState(1)
  const [allItems, setAllItems] = useState<MarketNewsItem[]>([])
  const [total, setTotal] = useState(0)
  const sentinelRef = useRef<HTMLDivElement>(null)

  const { data, isFetching } = useQuery({
    queryKey: ["market-news", page],
    queryFn: () => queryMarketNews(page, PAGE_SIZE),
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

              <button
                onClick={() => setSelected(item)}
                className="min-w-0 flex-1 text-left"
              >
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

// ── Main board ────────────────────────────────────────────────────────────────

export function PricesBoard({ mode = "kg" }: { mode?: Mode }) {
  const [ctaOpen, setCtaOpen] = useState(false)
  const [ctaGrade, setCtaGrade] = useState("")
  const [speciesFilter, setSpeciesFilter] = useState<string>("all")
  const [filterOpen, setFilterOpen] = useState(false)

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
  const { data: seriesSummaryData, isFetching: fetchingKg } = useQuery({
    queryKey: ["series-summary"],
    queryFn: querySeriesSummary,
    enabled: mode === "kg",
    refetchOnWindowFocus: false,
  })
  const { data: headSummaryData, isFetching: fetchingHead } = useQuery({
    queryKey: ["head-summary"],
    queryFn: queryHeadSummary,
    enabled: mode === "head",
    refetchOnWindowFocus: false,
  })
  const pricesLoading = mode === "kg" ? fetchingKg : fetchingHead

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

  const initialLoading = !cdmData && !seriesSummaryData && !headSummaryData

  useEffect(() => {
    if (initialLoading) return
    const key = "fnp_prices_trade_seen"
    if (typeof window === "undefined") return
    if (localStorage.getItem(key)) return

    const t = setTimeout(() => {
      const el = document.getElementById("prices-trade-btn")
      if (!el) return
      localStorage.setItem(key, "1")

      const d = driver({
        allowClose: true,
        steps: [
          {
            element: "#prices-trade-btn",
            popover: {
              title: "Trade on farmnport",
              description: "Buy or sell livestock and produce directly through the platform.",
              side: "bottom",
              align: "start",
            },
          },
        ],
      })
      d.drive()
    }, 1500)
    return () => clearTimeout(t)
  }, [initialLoading])

  if (initialLoading) {
    return (
      <main className="min-h-screen">
        {/* stat strip skeleton */}
        <div className="border-b bg-muted/30">
          <div className="px-4 sm:px-6 lg:px-8 py-2 flex gap-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-4 w-24 rounded bg-muted animate-pulse" />
            ))}
          </div>
        </div>

        <div className="flex items-stretch min-h-[calc(100vh-33px)]">
          <div className="flex-1 min-w-0">
            <div className="px-4 sm:px-6 lg:px-8 py-10">
              {/* hero skeleton */}
              <div className="mb-8">
                <div className="h-9 w-72 rounded bg-muted animate-pulse" />
                <div className="h-4 w-48 rounded bg-muted animate-pulse mt-3" />
              </div>

              {/* summary cards skeleton */}
              <ul className="grid grid-cols-1 gap-x-6 gap-y-4 lg:grid-cols-3 xl:gap-x-8 mb-10">
                {Array.from({ length: 3 }).map((_, i) => (
                  <li key={i} className="overflow-hidden rounded-lg outline outline-1 outline-gray-200 dark:outline-white/10">
                    <div className="px-5 py-5 space-y-4">
                      <div className="h-4 w-40 rounded bg-muted animate-pulse" />
                      {Array.from({ length: 3 }).map((_, j) => (
                        <div key={j} className="flex items-center gap-3">
                          <div className="h-6 w-10 rounded bg-muted animate-pulse" />
                          <div className="h-4 flex-1 rounded bg-muted animate-pulse" />
                          <div className="h-4 w-16 rounded bg-muted animate-pulse" />
                        </div>
                      ))}
                    </div>
                  </li>
                ))}
              </ul>

              {/* table skeleton */}
              <div className="h-8 w-64 rounded bg-muted animate-pulse mb-4" />
              <div className="space-y-4 px-4 md:px-8 py-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="h-4 w-10 rounded bg-muted animate-pulse" />
                    <div className="h-4 w-24 rounded bg-muted animate-pulse" />
                    <div className="h-4 flex-1 rounded bg-muted animate-pulse" />
                    <div className="h-4 w-16 rounded bg-muted animate-pulse" />
                    <div className="h-4 w-16 rounded bg-muted animate-pulse hidden sm:block" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <>
    <Dialog open={ctaOpen} onOpenChange={setCtaOpen}>
      <DialogContent className="max-w-md p-6 w-[calc(100%-2rem)] rounded-lg">
        <p className="text-lg font-bold text-foreground">Buy or Sell</p>
        <p className="text-sm text-muted-foreground mb-5">Trade livestock and produce online through farmnport.</p>
        <div className="grid grid-cols-2 gap-3">
          <Link href="/lots/new/buy" className="flex items-center justify-center px-4 py-2.5 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors">I Want Stock →</Link>
          <Link href="/lots/new/sell" className="flex items-center justify-center px-4 py-2.5 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors">I Am Selling →</Link>
          <Link href="/bookings/new/buy" className="flex items-center justify-center px-4 py-2.5 rounded-md border border-border text-sm font-semibold hover:bg-muted transition-colors">Book Regular Supply →</Link>
          <Link href="/bookings/new/sell" className="flex items-center justify-center px-4 py-2.5 rounded-md border border-border text-sm font-semibold hover:bg-muted transition-colors">Supply Regularly →</Link>
        </div>
      </DialogContent>
    </Dialog>
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

            {/* Card 1: Coming Soon — last on mobile, last on desktop */}
            <li className="flex flex-col gap-4 order-3 lg:order-3">
              <div className="overflow-hidden rounded-lg outline outline-1 outline-gray-200 dark:outline-white/10 flex-1">
                <div className="px-5 py-5 h-full flex flex-col justify-center">
                  <p className="text-sm font-semibold text-foreground mb-1">Booking Now Live</p>
                  <p className="text-xs text-muted-foreground">See what to sell and buy online.</p>
                  <Link href="/bookings" className="text-xs text-primary hover:underline mt-2 inline-block">View more →</Link>
                </div>
              </div>
              <div className="overflow-hidden rounded-lg outline outline-1 outline-gray-200 dark:outline-white/10 flex-1">
                <div className="px-5 py-5 h-full flex flex-col justify-center">
                  <p className="text-sm font-semibold text-foreground mb-1">Timed Lots</p>
                  <p className="text-xs text-muted-foreground">Now live.</p>
                  <Link href="/lots" className="text-xs text-primary hover:underline mt-2 inline-block">View more →</Link>
                </div>
              </div>
            </li>

            {/* Card 2: Most Requested — first on both mobile and desktop */}
            <li className="overflow-hidden rounded-lg outline outline-1 outline-gray-200 dark:outline-white/10 order-1 lg:order-1">
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

            {/* Card 3: Top Gainers — second on both */}
            <li className="overflow-hidden rounded-lg outline outline-1 outline-gray-200 dark:outline-white/10 order-2 lg:order-2">
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
          <div className="border-b bg-background sticky top-0 z-10 flex items-center justify-between">
            <PricesTabNav />
            <div className="px-4 sm:px-6 lg:px-8">
              <Popover open={filterOpen} onOpenChange={setFilterOpen}>
                <PopoverTrigger asChild>
                  <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="4" y1="21" y2="14"/><line x1="4" x2="4" y1="10" y2="3"/><line x1="12" x2="12" y1="21" y2="12"/><line x1="12" x2="12" y1="8" y2="3"/><line x1="20" x2="20" y1="21" y2="16"/><line x1="20" x2="20" y1="12" y2="3"/><line x1="2" x2="6" y1="14" y2="14"/><line x1="10" x2="14" y1="8" y2="8"/><line x1="18" x2="22" y1="16" y2="16"/></svg>
                    {speciesFilter === "all" ? "Filter" : speciesFilter.charAt(0).toUpperCase() + speciesFilter.slice(1)}
                  </button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-36 p-1">
                  {["all", "cattle", "sheep", "chicken"].map(s => (
                    <button key={s} onClick={() => { setSpeciesFilter(s); setFilterOpen(false) }}
                      className={`w-full text-left px-3 py-1.5 rounded text-xs font-medium transition-colors ${speciesFilter === s ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"}`}>
                      {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                  ))}
                </PopoverContent>
              </Popover>
            </div>
          </div>
          {pricesLoading && (
            <div className="mt-2 px-4 md:px-8 py-4 space-y-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="h-4 w-10 rounded bg-muted animate-pulse" />
                  <div className="h-4 w-24 rounded bg-muted animate-pulse" />
                  <div className="h-4 flex-1 rounded bg-muted animate-pulse" />
                  <div className="h-4 w-16 rounded bg-muted animate-pulse" />
                  <div className="h-4 w-16 rounded bg-muted animate-pulse hidden sm:block" />
                </div>
              ))}
            </div>
          )}
          {!pricesLoading && rawEntries.length > 0 && (
            <div className="mt-2 px-4 md:px-8 py-4">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px] text-sm">
                  <thead>
                    <tr className="border-b text-xs text-muted-foreground">
                      <th className="text-left py-2 pr-4 font-medium w-8 tabular-nums">#</th>
                      <th className="text-left py-2 font-medium">Code</th>
                      <th className="text-left py-2 pl-2 font-medium">{mode === "head" ? "Breed · Grade" : "Produce · Grade"}</th>
                      <th className="text-left py-2 pl-2 font-medium">
                        <button id="prices-trade-btn" onClick={() => { setCtaGrade(""); setCtaOpen(true) }} className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border border-primary text-primary hover:bg-primary/10 transition-colors">Trade</button>
                      </th>
                      <th className="text-left py-2 pl-2 font-medium">{mode === "head" ? "Avg/Head" : "Average"}</th>
                      {mode === "head" && <th className="text-left py-2 pl-2 font-medium ">Avg Weight</th>}
                      <th className="text-left py-2 pl-2 font-medium">Change</th>
                      <th className="text-left py-2 pl-2 font-medium">High</th>
                      <th className="text-left py-2 pl-2 font-medium">Low</th>
                      <th className="text-left py-2 pl-2 font-medium">Trend</th>
                      {mode === "head" && <th className="text-left py-2 pl-2 font-medium"></th>}
                    </tr>
                  </thead>
                  <tbody>
                    {[...rawEntries]
                      .filter(e => {
                        if (speciesFilter === "all") return true
                        const cat = (e.category ?? "").toLowerCase()
                        if (speciesFilter === "chicken") return cat === "chicken" || cat === "chickens"
                        return cat === speciesFilter
                      })
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
                            <td className="py-3 pl-2" />
                            <td className="py-3 pl-2 tabular-nums font-semibold">
                              ${toDollars(entry.avg)}<span className="text-xs font-normal text-muted-foreground">{unit}</span>
                            </td>
                            {mode === "head" && (
                              <td className="py-3 pl-2 tabular-nums text-muted-foreground ">
                                {gramsToKg((entry as HeadEntry).avg_weight_grams)}
                              </td>
                            )}
                            <td className="py-3 pl-2 tabular-nums font-medium ">
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
                            <td className="py-3 pl-2 tabular-nums font-medium text-green-600 dark:text-green-400 ">
                              {entry.high ? `$${toDollars(entry.high)}` : <span className="text-muted-foreground font-normal">—</span>}
                            </td>
                            <td className="py-3 pl-2 tabular-nums font-medium text-red-500 dark:text-red-400 ">
                              {entry.low ? `$${toDollars(entry.low)}` : <span className="text-muted-foreground font-normal">—</span>}
                            </td>
                            <td className="py-3 pl-2 ">
                              <MiniSparkline values={entry.trend ?? []} />
                            </td>
                            {mode === "head" && (
                              <td className="py-3 pl-2">
                                <Link
                                  href="/lots/new"
                                  className="text-[11px] font-medium text-primary hover:underline"
                                >
                                  Sell
                                </Link>
                              </td>
                            )}
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
        <div className="sticky top-6 pt-6 overflow-y-auto max-h-screen [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="px-5 mb-5 flex items-center justify-between">
            <p className="text-sm"><span className="font-bold text-foreground">Market</span> <span className="font-normal text-muted-foreground">Insights</span></p>
          </div>

          {/* Timeline */}
          <div className="px-5 pb-8">
            <InsightsTimeline />
          </div>
        </div>
      </aside>

      </div>{/* end flex below strip */}
    </main>
    </>
  )
}
