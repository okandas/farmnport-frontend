"use client"

import Link from "next/link"
import { useState, useEffect, useRef } from "react"
import { useQuery } from "@tanstack/react-query"
import { querySeriesClientHistory, querySeriesClientDates } from "@/lib/query"
import { capitalizeFirstLetter, slug } from "@/lib/utilities"

interface SeriesEntry {
  id?: string
  effective_date: string
  client_name: string
  template_type: string
  code: string
  name: string
  category: string
  pricing: {
    collected?: number
    delivered?: number
  }
  price_per_kg?: number
  weight_min_grams?: number
  weight_max_grams?: number
  avg_weight_grams?: number
  avg_amount_head?: number
  max_amount_head?: number
  min_amount_head?: number
}

interface DateEntry {
  date: string
  count: number
  categories: string[]
  types: string[]
  has_head: boolean
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
function codeColor(code: string): string {
  let hash = 0
  for (let i = 0; i < code.length; i++) hash = (hash * 31 + code.charCodeAt(i)) >>> 0
  return codeColors[hash % codeColors.length]
}
function centsToDisplay(cents?: number): string {
  if (cents == null || cents === 0) return "—"
  return `$${(cents / 100).toFixed(2)}`
}
function gramsToKg(grams?: number): string {
  if (grams == null || grams === 0) return "—"
  return `${(grams / 1000).toFixed(1)} kg`
}
function weightDisplay(minG?: number, maxG?: number): string {
  if (minG == null) return ""
  const min = minG / 1000
  const max = maxG != null ? maxG / 1000 : null
  return max != null ? `${min}–${max} kg` : `${min}+ kg`
}
const typeLabel = (t: string) => {
  if (t === "cdm") return "Cold Dress Mass"
  if (t === "lwt") return "Liveweight"
  return t.toUpperCase()
}

function GradePanel({ clientSlug, produce, date }: { clientSlug: string; produce: string; date: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ["series-client-history", clientSlug, produce, date],
    queryFn: () => querySeriesClientHistory(clientSlug, produce, date),
    enabled: !!date,
    refetchOnWindowFocus: false,
  })

  const entries: SeriesEntry[] = data?.data?.data ?? []
  const isHeadPriced = entries.some(e => (e.avg_amount_head ?? 0) > 0)
  const isLwt = !isHeadPriced && entries[0]?.template_type === "lwt"

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b flex items-center justify-between">
        <span className="text-sm font-semibold text-foreground">
          {new Date(date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
        </span>
        <span className="text-xs text-muted-foreground capitalize">{produce}</span>
      </div>

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
                    <th className="px-4 py-2 text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Avg/Head</th>
                    <th className="px-4 py-2 text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Max/Head</th>
                    <th className="px-4 py-2 text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Min/Head</th>
                  </>
                ) : (
                  <>
                    <th className="px-4 py-2 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground hidden sm:table-cell">Weight</th>
                    <th className="px-4 py-2 text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Delivered</th>
                    <th className="px-4 py-2 text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Collected</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {entries.map((entry, i) => (
                <tr key={`${entry.code}-${i}`} className="transition-colors hover:bg-muted/40">
                  <td className="px-4 py-2.5">
                    <span className={`inline-flex items-center justify-center rounded-md px-2 py-0.5 text-xs font-bold ring-1 ring-inset min-w-[36px] ${codeColor(entry.code)}`}>
                      {entry.code}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-sm font-medium text-foreground">{entry.name}</td>
                  {isHeadPriced ? (
                    <>
                      <td className="px-4 py-2.5 text-right text-sm font-semibold text-foreground tabular-nums">{centsToDisplay(entry.avg_amount_head)}</td>
                      <td className="px-4 py-2.5 text-right text-sm text-muted-foreground tabular-nums hidden sm:table-cell">{centsToDisplay(entry.max_amount_head)}</td>
                      <td className="px-4 py-2.5 text-right text-sm text-muted-foreground tabular-nums hidden sm:table-cell">{centsToDisplay(entry.min_amount_head)}</td>
                    </>
                  ) : isLwt ? (
                    <>
                      <td className="px-4 py-2.5 text-xs text-muted-foreground hidden sm:table-cell whitespace-nowrap">{gramsToKg(entry.avg_weight_grams)}</td>
                      <td className="px-4 py-2.5 text-right text-xs font-semibold text-foreground tabular-nums whitespace-nowrap">{centsToDisplay(entry.price_per_kg)}</td>
                      <td className="px-4 py-2.5 text-right text-sm font-semibold text-foreground tabular-nums">{centsToDisplay(entry.avg_amount_head)}</td>
                      <td className="px-4 py-2.5 text-right text-sm text-muted-foreground tabular-nums">{centsToDisplay(entry.max_amount_head)}</td>
                      <td className="px-4 py-2.5 text-right text-sm text-muted-foreground tabular-nums">{centsToDisplay(entry.min_amount_head)}</td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-2.5 text-sm text-muted-foreground hidden sm:table-cell">{weightDisplay(entry.weight_min_grams, entry.weight_max_grams) || "—"}</td>
                      <td className="px-4 py-2.5 text-right text-sm font-semibold text-foreground tabular-nums">{centsToDisplay(entry.pricing?.delivered)}</td>
                      <td className="px-4 py-2.5 text-right text-sm text-muted-foreground tabular-nums">{centsToDisplay(entry.pricing?.collected)}</td>
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

export function BuyerProducePriceHistory({
  clientSlug,
  clientName,
  produce,
  effectiveDate,
}: {
  clientSlug: string
  clientName: string
  produce: string
  effectiveDate: string | null
}) {
  const nameSlug = slug(clientName)
  const produceName = capitalizeFirstLetter(produce)

  const [page, setPage] = useState(1)
  const [allDates, setAllDates] = useState<DateEntry[]>([])
  const [total, setTotal] = useState(0)
  const [selectedDate, setSelectedDate] = useState<string | null>(effectiveDate)
  const sentinelRef = useRef<HTMLDivElement>(null)

  const { data, isFetching } = useQuery({
    queryKey: ["series-client-dates", clientSlug, produce, page],
    queryFn: () => querySeriesClientDates(clientSlug, produce, page),
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

  const resolvedDate = selectedDate ?? effectiveDate ?? ""

  // Auto-select first date if none from URL
  useEffect(() => {
    if (!selectedDate && allDates.length > 0) {
      setSelectedDate(allDates[0].date)
    }
  }, [allDates, selectedDate])

  // Update document title on date change
  useEffect(() => {
    if (!resolvedDate) return
    const dateLabel = new Date(resolvedDate).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
    document.title = `${clientName} ${capitalizeFirstLetter(produce)} Prices ${dateLabel} | farmnport.com`
  }, [resolvedDate, clientName, produce])

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

  return (
    <main className="min-h-screen">
      <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-5xl mx-auto space-y-6">

        {/* Breadcrumb */}
        <p className="text-sm text-muted-foreground flex items-center gap-1.5 flex-wrap">
          <Link href="/prices" className="hover:text-foreground">Prices</Link>
          <span>/</span>
          <Link href={`/buyer/${nameSlug}`} className="hover:text-foreground">{clientName}</Link>
          <span>/</span>
          <span className="text-foreground font-semibold">{produceName}</span>
          {resolvedDate && (
            <>
              <span>/</span>
              <span className="text-foreground">{new Date(resolvedDate).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</span>
            </>
          )}
        </p>

        <div>
          <h1 className="text-2xl font-bold text-foreground">{clientName} {produceName} Prices Zimbabwe</h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            {clientName} is a {produceName.toLowerCase()} buyer in Zimbabwe. View their latest buying prices per grade, including liveweight and per-head rates, to know what your {produceName.toLowerCase()} is worth before you sell.
          </p>
        </div>

        {/* Mobile: stacked cards. Desktop: two-panel side by side */}
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-0 lg:rounded-md lg:border lg:bg-card lg:shadow-sm lg:overflow-hidden" style={{ height: undefined }}>

          {/* Left sidebar — date selector */}
          <div className="rounded-md border bg-card shadow-sm lg:rounded-none lg:border-0 lg:border-r lg:shadow-none flex flex-col min-h-0 lg:w-[280px] lg:shrink-0">
            <div className="px-4 py-3 border-b flex items-center justify-between shrink-0">
              <h4 className="text-sm font-semibold text-foreground">Select a Date</h4>
              <span className="text-xs text-muted-foreground">{total} upload{total !== 1 ? "s" : ""}</span>
            </div>

            <div className="overflow-y-auto max-h-60 lg:max-h-[520px]">
              {allDates.map(d => {
                const isActive = d.date === resolvedDate
                return (
                  <button
                    key={d.date}
                    onClick={() => setSelectedDate(d.date)}
                    className={`w-full text-left px-4 py-3 border-b last:border-b-0 transition-colors border-l-2 ${
                      isActive
                        ? "bg-muted border-l-foreground"
                        : "border-l-transparent hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-sm tabular-nums ${isActive ? "font-semibold text-foreground" : "font-medium text-foreground"}`}>
                        {new Date(d.date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                      </span>
                      <span className="text-xs text-muted-foreground">{d.count} grade{d.count !== 1 ? "s" : ""}</span>
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
          <div className="rounded-md border bg-card shadow-sm lg:rounded-none lg:border-0 lg:shadow-none flex flex-col flex-1 overflow-hidden lg:h-[560px]">
            {resolvedDate ? (
              <GradePanel
                clientSlug={clientSlug}
                produce={produce}
                date={resolvedDate}
              />
            ) : (
              <div className="flex-1 flex items-center justify-center p-8">
                <p className="text-sm text-muted-foreground">Select a date to view prices</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </main>
  )
}
