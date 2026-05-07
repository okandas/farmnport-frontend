"use client"

import { Fragment, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, TrendingDown, TrendingUp } from "lucide-react"
import { AdSenseInFeed } from "@/components/ads/AdSenseInFeed"
import { queryPricesByProduce } from "@/lib/query"
import { formatDate, capitalizeFirstLetter, centsToDollars } from "@/lib/utilities"

function parsePriceData(priceData: any) {
  if (!priceData || !Array.isArray(priceData) || priceData.length === 0) return null
  const grade = priceData[0]
  if (!grade?.Value || !Array.isArray(grade.Value)) return null
  const code = grade.Value.find((v: any) => v.Key === "code")?.Value
  const pricingArr = grade.Value.find((v: any) => v.Key === "pricing")?.Value
  let delivered = 0
  let collected = 0
  if (Array.isArray(pricingArr)) {
    delivered = pricingArr.find((v: any) => v.Key === "delivered")?.Value || 0
    collected = pricingArr.find((v: any) => v.Key === "collected")?.Value || 0
  }
  return { code, delivered, collected }
}

function priceDetailHref(relation: any) {
  const nameSlug = relation.client_name.toLowerCase().replace(/\s+/g, '-')
  const dateSlug = new Date(relation.effective_date).toISOString().split('T')[0]
  const produce = relation.produce_category?.toLowerCase() || ''
  return `/prices/${nameSlug}-${dateSlug}/${produce}`
}

const avatarColors = [
  "bg-blue-500", "bg-emerald-500", "bg-violet-500", "bg-orange-500",
  "bg-rose-500", "bg-cyan-500", "bg-amber-600", "bg-indigo-500",
  "bg-teal-500", "bg-fuchsia-500",
]

interface ProducePriceCardsViewProps {
  produceSlug: string
  limit?: number
}

export function ProducePriceCardsView({ produceSlug, limit }: ProducePriceCardsViewProps) {
  const [currentPage, setCurrentPage] = useState(1)

  const { isError, isLoading, data } = useQuery({
    queryKey: ["prices-by-produce", produceSlug, currentPage, limit],
    queryFn: () => queryPricesByProduce(produceSlug, { p: currentPage, ...(limit ? { limit } : {}) }),
    refetchOnWindowFocus: false,
  })

  const priceRelations = data?.data?.data || []
  const total = data?.data?.total || 0
  const totalPages = Math.ceil(total / (limit || 20))

  if (isError) {
    return (
      <div className="rounded-2xl border bg-card p-10 text-center">
        <p className="text-sm font-medium">Error loading prices</p>
        <p className="text-xs text-muted-foreground mt-1">Please try refreshing the page</p>
      </div>
    )
  }

  if (isLoading) {
    if (limit) {
      return (
        <div className="space-y-2">
          {[...Array(limit)].map((_, i) => (
            <div key={i} className="h-12 bg-muted/20 rounded-xl animate-pulse" />
          ))}
        </div>
      )
    }
    return (
      <div className="rounded-2xl border bg-card overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-4 border-b last:border-0">
            <div className="h-3 w-5 bg-muted/30 rounded animate-pulse" />
            <div className="h-8 w-8 rounded-full bg-muted/30 animate-pulse" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3.5 w-36 bg-muted/30 rounded animate-pulse" />
              <div className="h-2.5 w-20 bg-muted/20 rounded animate-pulse" />
            </div>
            <div className="h-4 w-16 bg-muted/30 rounded animate-pulse" />
            <div className="hidden sm:block h-4 w-16 bg-muted/20 rounded animate-pulse" />
          </div>
        ))}
      </div>
    )
  }

  if (priceRelations.length === 0) {
    return (
      <div className="rounded-2xl border bg-card p-10 text-center">
        <p className="text-sm font-medium">No prices found for {capitalizeFirstLetter(produceSlug)}</p>
        <p className="text-xs text-muted-foreground mt-1">Check back later for updated prices</p>
      </div>
    )
  }

  // Preview mode — compact rows inside parent card
  if (limit) {
    const uniqueRelations = priceRelations.filter((relation: any, index: number, arr: any[]) =>
      arr.findIndex((r: any) => r.effective_date === relation.effective_date && r.client_name === relation.client_name) === index
    )

    return (
      <div className="divide-y">
        {uniqueRelations.slice(0, limit).map((relation: any, index: number) => {
          const pd = parsePriceData(relation.price_data)
          const initials = relation.client_name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()
          const color = avatarColors[index % avatarColors.length]
          return (
            <Link
              key={relation.id}
              href={priceDetailHref(relation)}
              className="flex items-center gap-3 py-3 px-1 hover:bg-muted/20 transition-colors group"
            >
              <div className={`h-7 w-7 shrink-0 rounded-full ${color} flex items-center justify-center`}>
                <span className="text-[9px] font-bold text-white">{initials}</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                  {capitalizeFirstLetter(relation.client_name)}
                </p>
                <p className="text-[10px] text-muted-foreground">{formatDate(relation.effective_date)}</p>
              </div>
              {pd?.delivered ? (
                <span className="text-xs font-bold tabular-nums text-foreground">{centsToDollars(pd.delivered)}</span>
              ) : (
                <span className="text-xs text-muted-foreground">—</span>
              )}
            </Link>
          )
        })}
      </div>
    )
  }

  // Full paginated mode — crypto market table
  return (
    <div className="space-y-4">
      {/* Stats row */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span><span className="font-semibold text-foreground tabular-nums">{total}</span> listings</span>
        <span className="font-medium uppercase tracking-widest text-[10px]">All prices in USD · per kg</span>
      </div>

      <div className="rounded-2xl border bg-card overflow-hidden shadow-sm">
        {/* Column headers */}
        <div className="grid grid-cols-[2.5rem_1fr_6rem_6rem] sm:grid-cols-[2.5rem_1fr_7rem_7rem_5rem] items-center gap-2 px-5 py-3 border-b bg-muted/50 sticky top-0 z-10">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-right">#</span>
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Buyer</span>
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-right">Delivered</span>
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-right">Collected</span>
          <span className="hidden sm:block text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-right">Spread</span>
        </div>

        {priceRelations.map((relation: any, index: number) => {
          const pd = parsePriceData(relation.price_data)
          const rowNum = (currentPage - 1) * 20 + index + 1
          const initials = relation.client_name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()
          const color = avatarColors[index % avatarColors.length]
          const spread = pd && pd.delivered > 0 && pd.collected > 0 ? pd.delivered - pd.collected : null

          return (
            <Fragment key={relation.id}>
              {index > 0 && index % 9 === 0 && <AdSenseInFeed />}
              <Link
                href={priceDetailHref(relation)}
                className="grid grid-cols-[2.5rem_1fr_6rem_6rem] sm:grid-cols-[2.5rem_1fr_7rem_7rem_5rem] items-center gap-2 px-5 py-4 border-b last:border-0 hover:bg-muted/20 transition-colors group"
              >
                {/* Rank */}
                <span className="text-xs text-muted-foreground tabular-nums text-right">{rowNum}</span>

                {/* Buyer */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`h-9 w-9 shrink-0 rounded-full ${color} flex items-center justify-center shadow-sm`}>
                    <span className="text-[11px] font-bold text-white">{initials}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                      {capitalizeFirstLetter(relation.client_name)}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {pd?.code && (
                        <span className="text-[9px] font-mono font-bold text-muted-foreground bg-muted px-1.5 py-0.5 rounded-md">{pd.code}</span>
                      )}
                      <span className="text-[10px] text-muted-foreground">{formatDate(relation.effective_date)}</span>
                    </div>
                  </div>
                </div>

                {/* Delivered */}
                <div className="text-right">
                  {pd?.delivered ? (
                    <>
                      <p className="text-sm font-bold tabular-nums text-foreground">
                        {centsToDollars(pd.delivered)}
                      </p>
                      {relation.unit && <p className="text-[10px] text-muted-foreground">/{relation.unit}</p>}
                    </>
                  ) : <span className="text-xs text-muted-foreground">—</span>}
                </div>

                {/* Collected */}
                <div className="text-right">
                  {pd?.collected ? (
                    <>
                      <p className="text-sm tabular-nums font-medium text-muted-foreground">
                        {centsToDollars(pd.collected)}
                      </p>
                      {relation.unit && <p className="text-[10px] text-muted-foreground">/{relation.unit}</p>}
                    </>
                  ) : <span className="text-xs text-muted-foreground">—</span>}
                </div>

                {/* Spread */}
                <div className="hidden sm:block text-right">
                  {spread !== null ? (
                    <span className={`inline-flex items-center gap-0.5 text-xs font-semibold tabular-nums ${spread > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                      {spread > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      {centsToDollars(Math.abs(spread))}
                    </span>
                  ) : <span className="text-xs text-muted-foreground">—</span>}
                </div>
              </Link>
            </Fragment>
          )
        })}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">Page {currentPage} of {totalPages}</p>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" onClick={() => { setCurrentPage(p => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: "smooth" }) }} disabled={currentPage === 1} className="h-8 w-8 p-0">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNumber: number
              if (totalPages <= 5) pageNumber = i + 1
              else if (currentPage <= 3) pageNumber = i + 1
              else if (currentPage >= totalPages - 2) pageNumber = totalPages - 4 + i
              else pageNumber = currentPage - 2 + i
              return (
                <Button key={pageNumber} variant={currentPage === pageNumber ? "default" : "ghost"} size="sm" onClick={() => { setCurrentPage(pageNumber); window.scrollTo({ top: 0, behavior: "smooth" }) }} className="h-8 w-8 p-0 text-xs">
                  {pageNumber}
                </Button>
              )
            })}
            <Button variant="outline" size="sm" onClick={() => { setCurrentPage(p => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: "smooth" }) }} disabled={currentPage === totalPages} className="h-8 w-8 p-0">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
