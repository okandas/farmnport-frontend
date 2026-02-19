"use client"

import { useState, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { isAxiosError } from "axios"

import { queryProducerPriceLists } from "@/lib/query"
import { ProducerPriceList } from "@/lib/schemas"
import { ToastAction } from "@/components/ui/toast"
import { toast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Placeholder } from "@/components/state/placeholder"
import { PriceCard } from "@/components/structures/cards/price-card"
import { PriceFilters, PriceFilterState } from "@/components/structures/filters/price-filters"
import { ChevronLeft, ChevronRight } from "lucide-react"

const ITEMS_PER_PAGE = 10

export function PriceCardsView() {
  const [currentPage, setCurrentPage] = useState(1)
  const [filters, setFilters] = useState<PriceFilterState>({
    clientSearch: "",
    selectedProduce: [],
  })

  const { isError, isLoading, isFetching, refetch, data } = useQuery({
    queryKey: ["dashboard-producer-price-lists", { p: currentPage }],
    queryFn: () => queryProducerPriceLists({ p: currentPage }),
  })

  const producePriceLists: ProducerPriceList[] = data?.data?.data || []
  const total = data?.data?.total as number

  // Client-side filtering
  const filteredPriceLists = useMemo(() => {
    return producePriceLists.filter((priceList) => {
      // Client search filter
      if (filters.clientSearch) {
        const searchLower = filters.clientSearch.toLowerCase()
        const nameMatch = priceList.client_name.toLowerCase().includes(searchLower)
        if (!nameMatch) return false
      }

      // Produce type filter
      if (filters.selectedProduce.length > 0) {
        const hasProduce = filters.selectedProduce.some((produce) => {
          return priceList[produce as keyof ProducerPriceList] !== undefined
        })
        if (!hasProduce) return false
      }

      return true
    })
  }, [producePriceLists, filters])

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE)

  const handleFilterChange = (newFilters: PriceFilterState) => {
    setFilters(newFilters)
  }

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  if (isError) {
    if (isAxiosError(data)) {
      switch (data.code) {
        case "ERR_NETWORK":
          toast({
            description: "There seems to be a network error.",
            action: <ToastAction altText="Try again">Try again</ToastAction>,
          })
          break

        default:
          toast({
            title: "Uh oh! Failed to fetch price lists.",
            description: "There was a problem with your request.",
            action: (
              <ToastAction altText="Try again" onClick={() => refetch()}>
                Try again
              </ToastAction>
            ),
          })
          break
      }
    }
    return (
      <Placeholder>
        <Placeholder.Icon name="close" />
        <Placeholder.Title>Error Fetching Price Lists</Placeholder.Title>
        <Placeholder.Description>
          Error fetching price lists from the database
        </Placeholder.Description>
      </Placeholder>
    )
  }

  if (isLoading || isFetching) {
    return (
      <Placeholder>
        <Placeholder.Title>Loading Price Lists...</Placeholder.Title>
      </Placeholder>
    )
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Filters Sidebar */}
      <PriceFilters onFilterChange={handleFilterChange} />

      {/* Main Content Area */}
      <div className="flex-1 space-y-6">
        {/* Results Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {filteredPriceLists.length === producePriceLists.length
                ? `${total} Price Lists`
                : `${filteredPriceLists.length} of ${producePriceLists.length} Price Lists`}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Page {currentPage} of {totalPages}
            </p>
          </div>

          {/* View toggle could go here */}
        </div>

        {/* Price Cards Grid */}
        {filteredPriceLists.length === 0 ? (
          <div className="text-center py-12 px-4 border-2 border-dashed border-gray-300 rounded-xl">
            <p className="text-lg font-medium text-gray-900 mb-2">No price lists found</p>
            <p className="text-sm text-gray-500">
              Try adjusting your filters or search criteria
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredPriceLists.map((priceList) => (
              <PriceCard key={priceList.id} priceList={priceList} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-200 pt-6">
            <div className="text-sm text-gray-600">
              Showing page {currentPage} of {totalPages}
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviousPage}
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
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
