"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useQueryStates, parseAsArrayOf, parseAsString } from "nuqs"
import { queryProducerPriceLists } from "@/lib/query"
import { Button } from "@/components/ui/button"
import { PriceSummaryCard } from "@/components/structures/price-summary-card"
import { ChevronLeft, ChevronRight } from "lucide-react"

export function PriceCardsView() {
  const [currentPage, setCurrentPage] = useState(1)

  const [filters] = useQueryStates({
    categories: parseAsArrayOf(parseAsString),
    produce: parseAsArrayOf(parseAsString),
    provinces: parseAsArrayOf(parseAsString),
  })

  const { isError, isLoading, data } = useQuery({
    queryKey: ["producer-price-lists", { p: currentPage, ...filters }],
    queryFn: () => queryProducerPriceLists({ p: currentPage }),
    refetchOnWindowFocus: false,
  })

  const producePriceLists = data?.data?.data || []
  const total = data?.data?.total || 0
  const totalPages = Math.ceil(total / 20)

  if (isError) {
    return (
      <div className="text-center py-12 px-4 border-2 border-dashed border-destructive/30 rounded-xl">
        <p className="text-lg font-medium mb-2">Error loading price lists</p>
        <p className="text-sm text-muted-foreground">Please try refreshing the page</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-40 rounded-xl border bg-card animate-pulse" />
        ))}
      </div>
    )
  }

  if (producePriceLists.length === 0) {
    return (
      <div className="text-center py-12 px-4 border-2 border-dashed rounded-xl">
        <p className="text-lg font-medium mb-2">No price lists found</p>
        <p className="text-sm text-muted-foreground">Check back later for updated prices</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {producePriceLists.length} of {total} price lists • Page {currentPage} of {totalPages}
        </p>
      </div>

      <div className="space-y-4">
        {producePriceLists.map((priceList: any) => (
          <PriceSummaryCard key={priceList.id} priceList={priceList} />
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
              let pageNumber
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
