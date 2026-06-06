"use client"

import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { querySeriesClientHistory } from "@/lib/query"
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

function weightDisplay(minG?: number, maxG?: number): string {
  if (minG == null) return ""
  const min = minG / 1000
  const max = maxG != null ? maxG / 1000 : null
  return max != null ? `${min}–${max} kg` : `${min}+ kg`
}

function toDateKey(isoDate: string): string {
  return new Date(isoDate).toISOString().split("T")[0]
}

function GradeTable({ entries }: { entries: SeriesEntry[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/30 text-xs text-muted-foreground">
            <th className="text-left py-2.5 px-4 font-medium">Code</th>
            <th className="text-left py-2.5 px-4 font-medium">Grade</th>
            <th className="text-left py-2.5 px-4 font-medium hidden sm:table-cell">Weight Band</th>
            <th className="text-right py-2.5 px-4 font-medium">Delivered</th>
            <th className="text-right py-2.5 px-4 font-medium">Collected</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, i) => {
            const delivered = entry.pricing?.delivered ?? entry.price_per_kg
            const collected = entry.pricing?.collected
            const weight = weightDisplay(entry.weight_min_grams, entry.weight_max_grams)
            return (
              <tr
                key={`${entry.code}-${i}`}
                className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors"
              >
                <td className="py-3 px-4">
                  <span className={`font-mono text-xs px-1.5 py-0.5 rounded-md ring-1 ring-inset whitespace-nowrap ${codeColor(entry.code)}`}>
                    {entry.code}
                  </span>
                </td>
                <td className="py-3 px-4 font-medium text-foreground">{entry.name}</td>
                <td className="py-3 px-4 text-muted-foreground hidden sm:table-cell">
                  {weight || "—"}
                </td>
                <td className="py-3 px-4 tabular-nums font-semibold text-right">
                  {centsToDisplay(delivered)}
                </td>
                <td className="py-3 px-4 tabular-nums font-medium text-right text-muted-foreground">
                  {centsToDisplay(collected)}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
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
  const { data, isLoading, isError } = useQuery({
    queryKey: ["series-client-history", clientSlug, produce],
    queryFn: () => querySeriesClientHistory(clientSlug, produce),
    refetchOnWindowFocus: false,
  })

  const allEntries: SeriesEntry[] = data?.data?.data ?? []
  const produceName = capitalizeFirstLetter(produce)

  // Group all entries by effective date (date string "YYYY-MM-DD")
  const byDate = allEntries.reduce<Record<string, SeriesEntry[]>>((acc, e) => {
    const key = toDateKey(e.effective_date)
    if (!acc[key]) acc[key] = []
    acc[key].push(e)
    return acc
  }, {})

  // Sorted dates descending
  const sortedDates = Object.keys(byDate).sort((a, b) => b.localeCompare(a))

  // The "active" date — from URL slug or the most recent
  const activeDate = effectiveDate ?? sortedDates[0] ?? null
  const activeEntries = activeDate ? (byDate[activeDate] ?? []) : []

  const nameSlug = slug(clientName)

  return (
    <main className="min-h-screen">
      <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-5xl mx-auto">

        {/* Breadcrumb */}
        <p className="text-sm text-muted-foreground mb-6 flex items-center gap-1.5 flex-wrap">
          <Link href="/prices" className="hover:text-foreground">Prices</Link>
          <span>/</span>
          <Link href={`/buyer/${nameSlug}`} className="hover:text-foreground">{clientName}</Link>
          <span>/</span>
          <span className="text-foreground font-semibold">{produceName}</span>
          {activeDate && (
            <>
              <span>/</span>
              <span className="text-foreground">{new Date(activeDate).toLocaleDateString("en-GB")}</span>
            </>
          )}
        </p>

        {/* Heading */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground">{clientName}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {produceName} prices · {sortedDates.length} upload{sortedDates.length !== 1 ? "s" : ""}
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-10 bg-muted/40 rounded animate-pulse" />
            ))}
          </div>
        ) : isError ? (
          <p className="text-sm text-muted-foreground">Failed to load price history.</p>
        ) : allEntries.length === 0 ? (
          <p className="text-sm text-muted-foreground">No price data found for {clientName} — {produceName}.</p>
        ) : (
          <div className="space-y-10">

            {/* Active date grades */}
            {activeDate && activeEntries.length > 0 && (
              <section>
                <p className="text-sm font-semibold text-foreground mb-3">
                  Prices for {new Date(activeDate).toLocaleDateString("en-GB")}
                </p>
                <GradeTable entries={activeEntries} />
              </section>
            )}

            {/* Upload history table */}
            <section>
              <p className="text-sm font-semibold text-foreground mb-3">Upload History</p>
              <div className="overflow-x-auto rounded-lg border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/30 text-xs text-muted-foreground">
                      <th className="text-left py-2.5 px-4 font-medium">Date</th>
                      <th className="text-left py-2.5 px-4 font-medium">Grades</th>
                      <th className="text-left py-2.5 px-4 font-medium hidden sm:table-cell">Type</th>
                      <th className="text-right py-2.5 px-4 font-medium">View</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedDates.map((dateKey) => {
                      const rows = byDate[dateKey]
                      const isActive = dateKey === activeDate
                      const slug_ = `${nameSlug}-${dateKey}`
                      const types = [...new Set(rows.map(r => r.template_type.toUpperCase()))]
                      return (
                        <tr
                          key={dateKey}
                          className={`border-b border-border/50 last:border-0 transition-colors ${isActive ? "bg-primary/5" : "hover:bg-muted/30"}`}
                        >
                          <td className="py-3 px-4 tabular-nums font-medium whitespace-nowrap">
                            {isActive
                              ? <span className="text-foreground">{new Date(dateKey).toLocaleDateString("en-GB")}</span>
                              : <Link href={`/prices/${slug_}/${produce}`} className="hover:underline text-foreground">
                                  {new Date(dateKey).toLocaleDateString("en-GB")}
                                </Link>
                            }
                          </td>
                          <td className="py-3 px-4 text-muted-foreground">
                            {rows.length} grade{rows.length !== 1 ? "s" : ""}
                          </td>
                          <td className="py-3 px-4 text-muted-foreground hidden sm:table-cell">
                            {types.join(", ")}
                          </td>
                          <td className="py-3 px-4 text-right">
                            {isActive ? (
                              <span className="text-xs text-primary font-medium">Viewing</span>
                            ) : (
                              <Link
                                href={`/prices/${slug_}/${produce}`}
                                className="text-xs text-muted-foreground hover:text-foreground hover:underline"
                              >
                                View →
                              </Link>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}
      </div>
    </main>
  )
}
