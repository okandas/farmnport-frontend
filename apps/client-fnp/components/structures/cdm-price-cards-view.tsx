"use client"

import { Fragment, useState, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { useQueryStates, parseAsArrayOf, parseAsString } from "nuqs"

import { queryCdmPrices } from "@/lib/query"
import { CdmPrice } from "@/lib/schemas"
import { CdmPriceSummaryCard } from "@/components/structures/cdm-price-summary-card"
import { AdSenseInFeed } from "@/components/ads/AdSenseInFeed"
import { Button } from "@/components/ui/button"
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"

interface CdmPriceCardsViewProps {
  limit?: number
  viewAllHref?: string
}

export function CdmPriceCardsView({ limit, viewAllHref }: CdmPriceCardsViewProps = {}) {
  const [currentPage, setCurrentPage] = useState(1)

  const [filters] = useQueryStates({
    clients: parseAsArrayOf(parseAsString),
  })

  const { data, isLoading, isError } = useQuery({
    queryKey: ["cdm-prices", { p: currentPage, limit, ...filters }],
    queryFn: () => queryCdmPrices({ p: currentPage, ...(limit ? { limit } : {}) }),
    refetchOnWindowFocus: false,
  })

  const allPrices: CdmPrice[] = data?.data?.data || []
  const total = data?.data?.total || 0

  const prices = useMemo(() => {
    if (limit) return allPrices
    const clientFilter = filters.clients
    if (!clientFilter || clientFilter.length === 0) return allPrices
    return allPrices.filter(p => clientFilter.includes(p.client_name?.toLowerCase()))
  }, [allPrices, filters.clients, limit])

  const totalPages = Math.ceil(total / (limit || 20))

  if (isError) {
    return (
      <div className="text-center py-8 px-4">
        <p className="text-sm font-medium mb-1">Error loading CDM prices</p>
        <p className="text-xs text-muted-foreground">Please try refreshing the page</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className={limit ? "divide-y" : "space-y-3"}>
        {[...Array(limit || 4)].map((_, i) => (
          <div key={i} className={limit ? "py-3 px-1" : ""}>
            <div className={`h-[52px] rounded-lg ${limit ? "bg-muted/20" : "border bg-muted/30"} animate-pulse`} />
          </div>
        ))}
      </div>
    )
  }

  if (prices.length === 0) {
    return null
  }

  // Preview mode — clean divider list inside parent card
  if (limit) {
    return (
      <div>
        <div className="divide-y">
          {prices.map((price) => (
            <CdmPriceSummaryCard key={price.id} price={price} />
          ))}
        </div>
        {viewAllHref && total > limit && (
          <div className="pt-3 mt-1">
            <Link
              href={viewAllHref}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
            >
              View all CDM prices
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}
      </div>
    )
  }

  // Full paginated mode
  return (
    <div className="space-y-4">
      {/* Stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="rounded-xl border bg-card px-4 py-3.5">
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1.5">Price Lists</p>
          <p className="text-xl font-black tabular-nums text-foreground leading-none">{total}</p>
          <p className="text-[10px] text-muted-foreground mt-1">from verified buyers</p>
        </div>
        <div className="rounded-xl border bg-card px-4 py-3.5">
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1.5">Price Type</p>
          <p className="text-xl font-black text-foreground leading-none">CDM</p>
          <p className="text-[10px] text-muted-foreground mt-1">carcass grade · ex leakage</p>
        </div>
        <div className="hidden sm:block rounded-xl border bg-card px-4 py-3.5">
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1.5">Grades</p>
          <p className="text-xl font-black text-foreground leading-none">3</p>
          <p className="text-[10px] text-muted-foreground mt-1">Commercial · Economy · Manuf.</p>
        </div>
      </div>

      <div className="rounded-2xl border bg-card overflow-hidden shadow-sm">
        <div className="grid grid-cols-[2.5rem_1fr_auto] items-center gap-3 px-5 py-3 border-b bg-muted/50">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-right">#</span>
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Buyer</span>
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-right">Date</span>
        </div>
        {prices.map((price, index) => (
          <Fragment key={price.id}>
            <CdmPriceSummaryCard price={price} rank={(currentPage - 1) * 20 + index + 1} />
            {(index + 1) % 9 === 0 && index < prices.length - 1 && (
              <AdSenseInFeed />
            )}
          </Fragment>
        ))}
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
