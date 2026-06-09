"use client"

import Link from "next/link"
import { useState, useEffect, useRef } from "react"
import { useQuery } from "@tanstack/react-query"
import { querySeriesClientDates, querySeriesClientHistory } from "@/lib/query"
import { capitalizeFirstLetter, slug } from "@/lib/utilities"

interface DateEntry {
  date: string
  count: number
  categories: string[]
  types: string[]
  has_head: boolean
}

interface SeriesEntry {
  code: string
  name: string
  category: string
  template_type: string
  pricing: { collected?: number; delivered?: number }
  price_per_kg?: number
  avg_weight_grams?: number
  avg_amount_head?: number
  max_amount_head?: number
  min_amount_head?: number
}

const codeColors = [
  "bg-blue-50 text-blue-700 ring-blue-600/20",
  "bg-green-50 text-green-700 ring-green-600/20",
  "bg-amber-50 text-amber-700 ring-amber-600/20",
  "bg-purple-50 text-purple-700 ring-purple-600/20",
  "bg-rose-50 text-rose-700 ring-rose-600/20",
  "bg-cyan-50 text-cyan-700 ring-cyan-600/20",
  "bg-orange-50 text-orange-700 ring-orange-600/20",
  "bg-teal-50 text-teal-700 ring-teal-600/20",
]
function codeColor(code: string) {
  let h = 0
  for (let i = 0; i < code.length; i++) h = (h * 31 + code.charCodeAt(i)) >>> 0
  return codeColors[h % codeColors.length]
}
function cents(v?: number) {
  if (v == null || v === 0) return "—"
  return `$${(v / 100).toFixed(2)}`
}
function grams(v?: number) {
  if (v == null || v === 0) return "—"
  return `${(v / 1000).toFixed(1)} kg`
}
const typeLabel = (t: string) => {
  if (t === "cdm") return "Cold Dress Mass"
  if (t === "lwt") return "Liveweight"
  return t.toUpperCase()
}

function GradePanel({
  clientSlug,
  date,
  categories,
  initialEntries,
  initialCategory,
}: {
  clientSlug: string
  date: string
  categories: string[]
  initialEntries?: SeriesEntry[]
  initialCategory?: string
}) {
  const [activeCategory, setActiveCategory] = useState(initialCategory ?? categories[0]?.toLowerCase() ?? "")

  useEffect(() => {
    setActiveCategory(categories[0]?.toLowerCase() ?? "")
  }, [date])

  const { data, isLoading } = useQuery({
    queryKey: ["grade-panel", clientSlug, date, activeCategory],
    queryFn: () => querySeriesClientHistory(clientSlug, activeCategory, date),
    enabled: !!date && !!activeCategory,
    refetchOnWindowFocus: false,
  })

  const entries: SeriesEntry[] = data?.data?.data ?? (initialEntries && initialCategory === activeCategory ? initialEntries : [])
  const isHeadPriced = entries.some(e => (e.avg_amount_head ?? 0) > 0)
  const isLwt = !isHeadPriced && entries[0]?.template_type === "lwt"

  return (
    <div className="flex flex-col h-full">
      {/* Panel header */}
      <div className="px-4 py-3 border-b flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-foreground">
            {new Date(date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
          </span>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat.toLowerCase())}
              className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${
                activeCategory === cat.toLowerCase()
                  ? "bg-foreground text-background"
                  : "bg-muted text-muted-foreground hover:bg-muted/70"
              }`}
            >
              {capitalizeFirstLetter(cat.toLowerCase())}
            </button>
          ))}
        </div>
        <Link
          href={`/prices/${clientSlug}-${date}/${activeCategory}`}
          className="text-xs text-muted-foreground hover:text-foreground hover:underline"
        >
          Full view →
        </Link>
      </div>

      {/* Grade table */}
      <div className="flex-1 overflow-y-auto overflow-x-auto">
        {isLoading ? (
          <div className="p-4 space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-9 bg-muted/40 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : entries.length === 0 ? (
          <p className="p-6 text-sm text-muted-foreground text-center">No data</p>
        ) : (
          <table className="min-w-full">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-2 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Code</th>
                <th className="px-4 py-2 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Grade</th>
                {isHeadPriced ? (
                  <>
                    <th className="px-4 py-2 text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Avg/Head</th>
                    <th className="px-4 py-2 text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground hidden sm:table-cell">Max/Head</th>
                    <th className="px-4 py-2 text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground hidden sm:table-cell">Min/Head</th>
                  </>
                ) : isLwt ? (
                  <>
                    <th className="px-4 py-2 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground hidden sm:table-cell">Avg Weight</th>
                    <th className="px-4 py-2 text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Per kg</th>
                  </>
                ) : (
                  <>
                    <th className="px-4 py-2 text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Delivered</th>
                    <th className="px-4 py-2 text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Collected</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {entries.map((entry, i) => (
                <tr key={`${entry.code}-${i}`} className="hover:bg-muted/40 transition-colors">
                  <td className="px-4 py-2.5">
                    <span className={`inline-flex items-center justify-center rounded-md px-2 py-0.5 text-xs font-bold ring-1 ring-inset min-w-[36px] ${codeColor(entry.code)}`}>
                      {entry.code}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-sm font-medium text-foreground">{entry.name}</td>
                  {isHeadPriced ? (
                    <>
                      <td className="px-4 py-2.5 text-right text-sm font-semibold text-foreground tabular-nums">{cents(entry.avg_amount_head)}</td>
                      <td className="px-4 py-2.5 text-right text-sm text-muted-foreground tabular-nums hidden sm:table-cell">{cents(entry.max_amount_head)}</td>
                      <td className="px-4 py-2.5 text-right text-sm text-muted-foreground tabular-nums hidden sm:table-cell">{cents(entry.min_amount_head)}</td>
                    </>
                  ) : isLwt ? (
                    <>
                      <td className="px-4 py-2.5 text-xs text-muted-foreground hidden sm:table-cell whitespace-nowrap">{grams(entry.avg_weight_grams)}</td>
                      <td className="px-4 py-2.5 text-right text-xs font-semibold text-foreground tabular-nums whitespace-nowrap">{cents(entry.price_per_kg)}</td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-2.5 text-right text-sm font-semibold text-foreground tabular-nums">{cents(entry.pricing?.delivered)}</td>
                      <td className="px-4 py-2.5 text-right text-sm text-muted-foreground tabular-nums">{cents(entry.pricing?.collected)}</td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

interface LatestPrices {
  date: string
  category: string
  entries: SeriesEntry[]
}

export function BuyerPriceUploads({ clientName, latestPrices }: { clientName: string; latestPrices?: LatestPrices | null }) {
  const clientSlug = slug(clientName)
  const [page, setPage] = useState(1)
  const [allDates, setAllDates] = useState<DateEntry[]>([])
  const [total, setTotal] = useState(0)
  const [selectedDate, setSelectedDate] = useState<string | null>(latestPrices?.date ?? null)
  const sentinelRef = useRef<HTMLDivElement>(null)

  const { data, isFetching } = useQuery({
    queryKey: ["buyer-price-uploads", clientSlug, page],
    queryFn: () => querySeriesClientDates(clientSlug, "", page),
    refetchOnWindowFocus: false,
  })

  // Accumulate pages
  useEffect(() => {
    const incoming: DateEntry[] = data?.data?.data ?? []
    const t: number = data?.data?.total ?? 0
    if (incoming.length === 0) return
    setTotal(t)
    setAllDates(prev => {
      const existingDates = new Set(prev.map(d => d.date))
      const fresh = incoming.filter(d => !existingDates.has(d.date))
      return [...prev, ...fresh]
    })
  }, [data])

  // Auto-select first date
  useEffect(() => {
    if (allDates.length > 0 && !selectedDate) {
      setSelectedDate(allDates[0].date)
    }
  }, [allDates, selectedDate])

  // Infinite scroll sentinel
  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isFetching && allDates.length < total) {
          setPage(p => p + 1)
        }
      },
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [isFetching, allDates.length, total])

  if (allDates.length === 0 && !isFetching) return null

  const selectedEntry = allDates.find(d => d.date === selectedDate)

  return (
    <div className="rounded-md border bg-card shadow-sm overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr]" style={{ height: 560 }}>

        {/* Left sidebar — date list */}
        <div className="border-b lg:border-b-0 lg:border-r flex flex-col min-h-0 max-h-60 lg:max-h-none">
          <div className="px-4 py-3 border-b flex items-center justify-between">
            <h4 className="text-sm font-semibold text-foreground">Price History</h4>
            <span className="text-xs text-muted-foreground">{total} upload{total !== 1 ? "s" : ""}</span>
          </div>

          <div className="overflow-y-auto flex-1">
            {allDates.map(d => {
              const isActive = d.date === selectedDate
              return (
                <button
                  key={d.date}
                  onClick={() => setSelectedDate(d.date)}
                  className={`w-full text-left px-4 py-3 border-b last:border-b-0 transition-colors ${
                    isActive ? "bg-muted" : "hover:bg-muted/50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-sm tabular-nums ${isActive ? "font-semibold text-foreground" : "font-medium text-foreground"}`}>
                      {new Date(d.date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                    </span>
                    <span className="text-xs text-muted-foreground">{d.count} grade{d.count !== 1 ? "s" : ""}</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-1">
                    {d.categories.sort().map(cat => (
                      <span key={cat} className="text-[11px] px-1.5 py-0.5 bg-muted/60 rounded text-muted-foreground">
                        {capitalizeFirstLetter(cat.toLowerCase())}
                      </span>
                    ))}
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    {[...d.types.map(typeLabel), ...(d.has_head ? ["Per Head"] : [])].join(" · ")}
                  </p>
                </button>
              )
            })}

            {/* Infinite scroll sentinel */}
            <div ref={sentinelRef} className="h-4" />
            {isFetching && (
              <div className="px-4 py-3 space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-12 bg-muted/40 rounded-lg animate-pulse" />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right panel — grade data */}
        <div className="flex flex-col overflow-hidden">
          {selectedDate && selectedEntry ? (
            <GradePanel
              clientSlug={clientSlug}
              date={selectedDate}
              categories={selectedEntry.categories}
              initialEntries={latestPrices?.date === selectedDate ? latestPrices.entries : undefined}
              initialCategory={latestPrices?.date === selectedDate ? latestPrices.category : undefined}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center p-8">
              <p className="text-sm text-muted-foreground">Select a date to view prices</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
