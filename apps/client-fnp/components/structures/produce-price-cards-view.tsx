"use client"

import { Fragment, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Calendar, ArrowRight } from "lucide-react"
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

interface ProducePriceCardsViewProps {
  produceSlug: string
  limit?: number
  viewAllHref?: string
}

export function ProducePriceCardsView({ produceSlug, limit, viewAllHref }: ProducePriceCardsViewProps) {
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
      <div className="text-center py-4 px-4">
        <p className="text-sm font-medium mb-1">Error loading prices</p>
        <p className="text-xs text-muted-foreground">Please try refreshing the page</p>
      </div>
    )
  }

  if (isLoading) {
    if (limit) {
      return (
        <div className="divide-y">
          {[...Array(limit)].map((_, i) => (
            <div key={i} className="py-3 px-1">
              <div className="h-[52px] bg-muted/20 rounded-lg animate-pulse" />
            </div>
          ))}
        </div>
      )
    }
    return (
      <div className="space-y-4">
        <div className="h-5 w-32 bg-muted/20 rounded animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="rounded-xl border bg-card shadow-sm p-4 space-y-3">
              <div className="h-4 w-3/4 bg-muted/20 rounded animate-pulse" />
              <div className="h-3 w-1/2 bg-muted/20 rounded animate-pulse" />
              <div className="border-t pt-3 space-y-2">
                <div className="h-3 bg-muted/20 rounded animate-pulse" />
                <div className="h-3 w-2/3 bg-muted/20 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (priceRelations.length === 0) {
    return (
      <div className="text-center py-4 px-4">
        <p className="text-sm font-medium mb-1">No prices found for {capitalizeFirstLetter(produceSlug)}</p>
        <p className="text-xs text-muted-foreground">Check back later for updated prices</p>
      </div>
    )
  }

  // Preview mode — compact divider list, deduplicated by effective date
  if (limit) {
    const uniqueRelations = priceRelations.filter((relation: any, index: number, arr: any[]) =>
      arr.findIndex((r: any) => r.effective_date === relation.effective_date && r.client_name === relation.client_name) === index
    )

    return (
      <div>
        <div className="divide-y">
          {uniqueRelations.slice(0, limit).map((relation: any) => (
            <Link
              key={relation.id}
              href={priceDetailHref(relation)}
              className="flex items-center justify-between gap-3 py-3 px-1 hover:bg-muted/30 transition-colors group"
            >
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                  {capitalizeFirstLetter(relation.client_name)}
                </h3>
                <div className="flex items-center gap-1.5 mt-0.5 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3 shrink-0" />
                  <span>{formatDate(relation.effective_date)}</span>
                  {(() => {
                    const pd = parsePriceData(relation.price_data)
                    if (!pd) return null
                    return (
                      <>
                        {pd.code && (
                          <>
                            <span className="text-border">|</span>
                            <span>{pd.code}</span>
                          </>
                        )}
                        {pd.delivered > 0 && (
                          <>
                            <span className="text-border">|</span>
                            <span className="font-medium text-foreground">{centsToDollars(pd.delivered)}{relation.unit ? ` per ${relation.unit}` : ''}</span>
                          </>
                        )}
                      </>
                    )
                  })()}
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0" />
            </Link>
          ))}
        </div>
      </div>
    )
  }

  // Full paginated mode — 3-column card grid
  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        {total} {capitalizeFirstLetter(produceSlug)} Price{total !== 1 ? "s" : ""}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {priceRelations.map((relation: any, index: number) => {
          const pd = parsePriceData(relation.price_data)
          return (
            <Fragment key={relation.id}>
              {index > 0 && index % 9 === 0 && <AdSenseInFeed />}
              <Link
                href={priceDetailHref(relation)}
                className="group rounded-xl border bg-card shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-200 p-4 flex flex-col"
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors leading-tight">
                    {capitalizeFirstLetter(relation.client_name)}
                  </h3>
                  {pd?.code && (
                    <span className="shrink-0 text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                      {pd.code}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
                  <Calendar className="h-3 w-3 shrink-0" />
                  <span>{formatDate(relation.effective_date)}</span>
                </div>

                {pd && (pd.delivered > 0 || pd.collected > 0) && (
                  <div className="mt-auto space-y-1.5 border-t pt-3">
                    {pd.delivered > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Delivered</span>
                        <span className="text-sm font-semibold tabular-nums">{centsToDollars(pd.delivered)}{relation.unit ? <span className="text-xs font-normal text-muted-foreground">/{relation.unit}</span> : null}</span>
                      </div>
                    )}
                    {pd.collected > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Collected</span>
                        <span className="text-sm tabular-nums text-muted-foreground">{centsToDollars(pd.collected)}{relation.unit ? <span className="text-xs font-normal">/{relation.unit}</span> : null}</span>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center gap-1 mt-3 text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  View details
                  <ArrowRight className="h-3 w-3" />
                </div>
              </Link>
            </Fragment>
          )
        })}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t">
          <p className="text-xs text-muted-foreground">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setCurrentPage(p => Math.max(1, p - 1))
                window.scrollTo({ top: 0, behavior: "smooth" })
              }}
              disabled={currentPage === 1}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNumber: number
              if (totalPages <= 5) {
                pageNumber = i + 1
              } else if (currentPage <= 3) {
                pageNumber = i + 1
              } else if (currentPage >= totalPages - 2) {
                pageNumber = totalPages - 4 + i
              } else {
                pageNumber = currentPage - 2 + i
              }
              return (
                <Button
                  key={pageNumber}
                  variant={currentPage === pageNumber ? "default" : "ghost"}
                  size="sm"
                  onClick={() => {
                    setCurrentPage(pageNumber)
                    window.scrollTo({ top: 0, behavior: "smooth" })
                  }}
                  className="h-8 w-8 p-0 text-xs"
                >
                  {pageNumber}
                </Button>
              )
            })}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setCurrentPage(p => Math.min(totalPages, p + 1))
                window.scrollTo({ top: 0, behavior: "smooth" })
              }}
              disabled={currentPage === totalPages}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
