"use client"

import { Fragment, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useQueryStates, parseAsArrayOf, parseAsString } from "nuqs"
import { queryProducerPriceLists } from "@/lib/query"
import { Button } from "@/components/ui/button"
import { PriceSummaryCard } from "@/components/structures/price-summary-card"
import { AdSenseInFeed } from "@/components/ads/AdSenseInFeed"
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"

interface PriceCardsViewProps {
  limit?: number
  viewAllHref?: string
}

export function PriceCardsView({ limit, viewAllHref }: PriceCardsViewProps = {}) {
  const [currentPage, setCurrentPage] = useState(1)

  const [filters] = useQueryStates({
    categories: parseAsArrayOf(parseAsString),
    produce: parseAsArrayOf(parseAsString),
    provinces: parseAsArrayOf(parseAsString),
  })

  const { isError, isLoading, data } = useQuery({
    queryKey: ["producer-price-lists", { p: currentPage, limit, ...filters }],
    queryFn: () => queryProducerPriceLists({ p: currentPage, ...(limit ? { limit } : {}) }),
    refetchOnWindowFocus: false,
  })

  const producePriceLists = data?.data?.data || []
  const total = data?.data?.total || 0
  const totalPages = Math.ceil(total / (limit || 20))

  if (isError) {
    return (
      <div className="text-center py-8 px-4">
        <p className="text-sm font-medium mb-1">Error loading price lists</p>
        <p className="text-xs text-muted-foreground">Please try refreshing the page</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className={limit ? "divide-y" : "space-y-3"}>
        {[...Array(limit || 6)].map((_, i) => (
          <div key={i} className={limit ? "py-3 px-1" : ""}>
            <div className={`h-[52px] rounded-lg ${limit ? "bg-muted/20" : "border bg-muted/30"} animate-pulse`} />
          </div>
        ))}
      </div>
    )
  }

  if (producePriceLists.length === 0) {
    return (
      <div className="text-center py-8 px-4">
        <p className="text-sm font-medium mb-1">No price lists found</p>
        <p className="text-xs text-muted-foreground">Check back later for updated prices</p>
      </div>
    )
  }

  // Preview mode — clean divider list inside parent card
  if (limit) {
    return (
      <div>
        <div className="divide-y">
          {producePriceLists.map((priceList: any) => (
            <PriceSummaryCard key={priceList.id} priceList={priceList} />
          ))}
        </div>
        {viewAllHref && total > limit && (
          <div className="pt-3 mt-1">
            <Link
              href={viewAllHref}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
            >
              View all liveweight prices
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}
      </div>
    )
  }

  // Full paginated mode
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {producePriceLists.length} of {total} price lists
        </p>
      </div>

      <div className="space-y-3">
        {producePriceLists.map((priceList: any, index: number) => (
          <Fragment key={priceList.id}>
            <PriceSummaryCard priceList={priceList} />
            {(index + 1) % 3 === 0 && index < producePriceLists.length - 1 && (
              <AdSenseInFeed />
            )}
          </Fragment>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>

          <div className="flex items-center gap-1">
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
                  onClick={() => setCurrentPage(pageNumber)}
                  className="w-9"
                >
                  {pageNumber}
                </Button>
              )
            })}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  )
}
