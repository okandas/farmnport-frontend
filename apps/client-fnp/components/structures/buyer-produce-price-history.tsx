"use client"

import Link from "next/link"
import { useState } from "react"
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
  avg_amount_head?: number
  max_amount_head?: number
  min_amount_head?: number
}

interface DateEntry {
  date: string
  count: number
  categories: string[]
  types: string[]
}

const codeColors = [
  "bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-950/30 dark:text-blue-400 dark:ring-blue-500/20",
  "bg-green-50 text-green-700 ring-green-600/20 dark:bg-green-950/30 dark:text-green-400 dark:ring-green-500/20",
  "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-950/30 dark:text-amber-400 dark:ring-amber-500/20",
  "bg-purple-50 text-purple-700 ring-purple-600/20 dark:bg-purple-950/30 dark:text-purple-400 dark:ring-purple-500/20",
  "bg-rose-50 text-rose-700 ring-rose-600/20 dark:bg-rose-950/30 dark:text-rose-400 dark:ring-rose-500/20",
  "bg-cyan-50 text-cyan-700 ring-cyan-600/20 dark:bg-cyan-950/30 dark:text-cyan-400 dark:ring-cyan-500/20",
  "bg-orange-50 text-orange-700 ring-orange-600/20 dark:bg-orange-950/30 dark:text-orange-400 dark:ring-orange-500/20",
  "bg-teal-50 text-teal-700 ring-teal-600/20 dark:bg-teal-950/30 dark:text-teal-400 dark:ring-teal-500/20",
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

function weightDisplay(minG?: number, maxG?: number): string {
  if (minG == null) return ""
  const min = minG / 1000
  const max = maxG != null ? maxG / 1000 : null
  return max != null ? `${min}–${max} kg` : `${min}+ kg`
}

function GradeTable({ entries, date }: { entries: SeriesEntry[]; date: string }) {
  const isHeadPriced = entries.some(e => (e.avg_amount_head ?? 0) > 0)

  return (
    <div className="rounded-xl border bg-card shadow-sm">
      <div className="px-5 py-2.5 border-b flex items-center justify-between">
        <h4 className="text-sm font-semibold text-foreground">Prices</h4>
        <span className="text-xs text-muted-foreground">{new Date(date).toLocaleDateString("en-GB")}</span>
      </div>
      <div className="overflow-x-auto">
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
                ) : (
                  <>
                    <td className="px-4 py-2.5 text-sm text-muted-foreground hidden sm:table-cell">{weightDisplay(entry.weight_min_grams, entry.weight_max_grams) || "—"}</td>
                    <td className="px-4 py-2.5 text-right text-sm font-semibold text-foreground tabular-nums">{centsToDisplay(entry.pricing?.delivered ?? entry.price_per_kg)}</td>
                    <td className="px-4 py-2.5 text-right text-sm text-muted-foreground tabular-nums">{centsToDisplay(entry.pricing?.collected)}</td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
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
  const [historyPage, setHistoryPage] = useState(1)
  const nameSlug = slug(clientName)
  const activeDate = effectiveDate ?? ""

  const { data: gradeData, isLoading: gradesLoading, isError } = useQuery({
    queryKey: ["series-client-history", clientSlug, produce, activeDate],
    queryFn: () => querySeriesClientHistory(clientSlug, produce, activeDate),
    enabled: !!activeDate,
    refetchOnWindowFocus: false,
  })

  const { data: datesData, isLoading: datesLoading } = useQuery({
    queryKey: ["series-client-dates", clientSlug, produce, historyPage],
    queryFn: () => querySeriesClientDates(clientSlug, produce, historyPage),
    refetchOnWindowFocus: false,
  })

  const gradeEntries: SeriesEntry[] = gradeData?.data?.data ?? []
  const dateEntries: DateEntry[] = datesData?.data?.data ?? []
  const totalDates: number = datesData?.data?.total ?? 0
  const totalPages = Math.ceil(totalDates / 10)
  const produceName = capitalizeFirstLetter(produce)

  // If no effectiveDate in URL, use the first date from the list
  const resolvedDate = activeDate || (dateEntries[0]?.date ?? null)

  return (
    <main className="min-h-screen">
      <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-5xl mx-auto space-y-8">

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
              <span className="text-foreground">{new Date(resolvedDate).toLocaleDateString("en-GB")}</span>
            </>
          )}
        </p>

        {isError ? (
          <p className="text-sm text-muted-foreground">Failed to load price history.</p>
        ) : (
          <>
            <div>
              <h2 className="text-2xl font-bold text-foreground">{clientName}</h2>
              <p className="text-sm text-muted-foreground mt-1">
                {produceName} · {totalDates} upload{totalDates !== 1 ? "s" : ""}
              </p>
            </div>

            {/* Active date grades */}
            {gradesLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-12 bg-muted/40 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : gradeEntries.length > 0 && resolvedDate ? (
              <GradeTable entries={gradeEntries} date={resolvedDate} />
            ) : null}

            {/* Upload history */}
            <div className="rounded-xl border bg-card shadow-sm">
              <div className="px-5 py-2.5 border-b flex items-center justify-between">
                <h4 className="text-sm font-semibold text-foreground">Upload History</h4>
                {totalDates > 0 && <span className="text-xs text-muted-foreground">{totalDates} submission{totalDates !== 1 ? "s" : ""}</span>}
              </div>
              {datesLoading ? (
                <div className="p-4 space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-9 bg-muted/40 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="px-4 py-2 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Date</th>
                        <th className="px-4 py-2 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Grades</th>
                        <th className="px-4 py-2 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground hidden sm:table-cell">Type</th>
                        <th className="px-4 py-2 text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground">View</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {dateEntries.map((d) => {
                        const isActive = d.date === resolvedDate
                        const slug_ = `${nameSlug}-${d.date}`
                        return (
                          <tr key={d.date} className={`transition-colors ${isActive ? "bg-primary/5" : "hover:bg-muted/40"}`}>
                            <td className="px-4 py-2.5 text-sm font-medium text-foreground tabular-nums whitespace-nowrap">
                              {isActive
                                ? new Date(d.date).toLocaleDateString("en-GB")
                                : <Link href={`/prices/${slug_}/${produce}`} className="hover:underline">{new Date(d.date).toLocaleDateString("en-GB")}</Link>
                              }
                            </td>
                            <td className="px-4 py-2.5 text-sm text-muted-foreground">{d.count} grade{d.count !== 1 ? "s" : ""}</td>
                            <td className="px-4 py-2.5 text-sm text-muted-foreground hidden sm:table-cell">
                              {d.types.map(t => t === "cdm" ? "Cold Dress Mass" : t === "lwt" ? "Liveweight" : t.toUpperCase()).join(", ")}
                            </td>
                            <td className="px-4 py-2.5 text-right">
                              {isActive
                                ? <span className="text-xs font-medium text-primary">Viewing</span>
                                : <Link href={`/prices/${slug_}/${produce}`} className="text-xs text-muted-foreground hover:text-foreground hover:underline">View →</Link>
                              }
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-1 px-4 py-3 border-t">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                    <button
                      key={n}
                      onClick={() => setHistoryPage(n)}
                      className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                        historyPage === n ? "bg-foreground text-background" : "text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  )
}
