"use client"

import Link from "next/link"
import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { querySeriesClientDates } from "@/lib/query"
import { capitalizeFirstLetter, slug } from "@/lib/utilities"

interface DateEntry {
  date: string
  count: number
  categories: string[]
  types: string[]
  has_head: boolean
}

const typeLabel = (t: string) => {
  if (t === "cdm") return "Cold Dress Mass"
  if (t === "lwt") return "Liveweight"
  return t.toUpperCase()
}

export function BuyerPriceUploads({ clientName }: { clientName: string }) {
  const [page, setPage] = useState(1)
  const clientSlug = slug(clientName)

  const { data, isLoading } = useQuery({
    queryKey: ["buyer-price-uploads", clientSlug, page],
    queryFn: () => querySeriesClientDates(clientSlug, "", page),
    refetchOnWindowFocus: false,
  })

  const dateEntries: DateEntry[] = data?.data?.data ?? []
  const total: number = data?.data?.total ?? 0
  const totalPages = Math.ceil(total / 10)

  if (isLoading) {
    return (
      <div className="rounded-xl border bg-card shadow-sm p-5 space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-9 bg-muted/40 rounded-lg animate-pulse" />
        ))}
      </div>
    )
  }

  if (dateEntries.length === 0 && !isLoading) return null

  return (
    <div className="rounded-xl border bg-card shadow-sm">
      <div className="px-5 py-2.5 border-b flex items-center justify-between">
        <h4 className="text-sm font-semibold text-foreground">Price Upload History</h4>
        <span className="text-xs text-muted-foreground">{total} submission{total !== 1 ? "s" : ""}</span>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b">
              <th className="px-4 py-2 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Date</th>
              <th className="px-4 py-2 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Categories</th>
              <th className="px-4 py-2 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground hidden sm:table-cell">Type</th>
              <th className="px-4 py-2 text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground">View</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {dateEntries.map((d) => (
              <tr key={d.date} className="hover:bg-muted/40 transition-colors">
                <td className="px-4 py-2.5 text-sm font-medium text-foreground tabular-nums whitespace-nowrap">
                  {new Date(d.date).toLocaleDateString("en-GB")}
                </td>
                <td className="px-4 py-2.5">
                  <div className="flex flex-wrap gap-1">
                    {d.categories.sort().map(cat => (
                      <Link
                        key={cat}
                        href={`/prices/${clientSlug}-${d.date}/${cat.toLowerCase()}`}
                        className="inline-flex items-center text-xs px-2 py-0.5 rounded-md bg-muted hover:bg-muted/60 text-foreground font-medium transition-colors ring-1 ring-border"
                      >
                        {capitalizeFirstLetter(cat.toLowerCase())}
                      </Link>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-2.5 text-sm text-muted-foreground hidden sm:table-cell">
                  {[...d.types.map(typeLabel), ...(d.has_head ? ["Per Head"] : [])].join(", ")}
                </td>
                <td className="px-4 py-2.5 text-right">
                  <Link
                    href={`/prices/${clientSlug}-${d.date}/${d.categories[0]?.toLowerCase() ?? ""}`}
                    className="text-xs font-medium text-muted-foreground hover:text-foreground hover:underline whitespace-nowrap"
                  >
                    View →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1 px-4 py-3 border-t">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
            <button
              key={n}
              onClick={() => setPage(n)}
              className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                page === n ? "bg-foreground text-background" : "text-muted-foreground hover:bg-muted"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
