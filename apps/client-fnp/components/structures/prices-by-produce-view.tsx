"use client"

import { parseAsStringLiteral, parseAsInteger, useQueryState } from "nuqs"
import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { formatDate, capitalizeFirstLetter, centsToDollars } from "@/lib/utilities"

const PRODUCE_TYPES = [
  { value: "beef", label: "Beef", emoji: "🥩" },
  { value: "lamb", label: "Lamb", emoji: "🐑" },
  { value: "mutton", label: "Mutton", emoji: "🐏" },
  { value: "goat", label: "Goat", emoji: "🐐" },
  { value: "chicken", label: "Chicken", emoji: "🐔" },
  { value: "pork", label: "Pork", emoji: "🐷" },
  { value: "slaughter", label: "Slaughter Services", emoji: "🔪" },
] as const

const produceValues = PRODUCE_TYPES.map((p) => p.value)

export function PricesByProduceView() {
  const [selectedProduce, setSelectedProduce] = useQueryState(
    "produce",
    parseAsStringLiteral(produceValues).withDefault("beef")
  )

  const [currentPage, setCurrentPage] = useQueryState(
    "page",
    parseAsInteger.withDefault(1)
  )

  const { isError, isLoading, data } = useQuery({
    queryKey: ["prices-by-produce", selectedProduce, currentPage],
    queryFn: async () => {
      const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3744"
      const response = await axios.get(
        `${baseURL}/v1/prices/produce/${selectedProduce}?p=${currentPage}`
      )
      return response.data
    },
    refetchOnWindowFocus: false,
  })

  const priceRelations = data?.data || []
  const total = data?.total || 0
  const totalPages = Math.ceil(total / 20)

  const handleProduceChange = (produce: typeof produceValues[number]) => {
    setSelectedProduce(produce)
    setCurrentPage(1)
  }

  if (isError) {
    return (
      <div className="text-center py-12 px-4 border-2 border-dashed border-destructive/30 rounded-xl">
        <p className="text-lg font-medium mb-2">Error loading prices</p>
        <p className="text-sm text-muted-foreground">Please try refreshing the page</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Produce Type Selector */}
      <div className="flex flex-wrap gap-2">
        {PRODUCE_TYPES.map((produce) => (
          <Button
            key={produce.value}
            variant={selectedProduce === produce.value ? "default" : "outline"}
            onClick={() => handleProduceChange(produce.value)}
            className="gap-2"
          >
            <span>{produce.emoji}</span>
            <span>{produce.label}</span>
            {selectedProduce === produce.value && total > 0 && (
              <Badge variant="secondary" className="ml-1">
                {total}
              </Badge>
            )}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-48 rounded-xl border bg-card animate-pulse" />
          ))}
        </div>
      ) : priceRelations.length === 0 ? (
        <div className="text-center py-12 px-4 border-2 border-dashed rounded-xl">
          <p className="text-lg font-medium mb-2">No prices found for {capitalizeFirstLetter(selectedProduce)}</p>
          <p className="text-sm text-muted-foreground">Try selecting a different produce type</p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {priceRelations.length} of {total} {capitalizeFirstLetter(selectedProduce)} prices • Page {currentPage} of {totalPages}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {priceRelations.map((relation: any) => (
              <div
                key={relation.id}
                className="rounded-xl border bg-card p-6 shadow-sm hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold font-heading text-card-foreground mb-1">
                      {capitalizeFirstLetter(relation.client_name)}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {capitalizeFirstLetter(relation.farm_produce_name)}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {capitalizeFirstLetter(relation.produce_category)}
                  </Badge>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Effective Date:</span>
                    <span className="font-medium">{formatDate(relation.effective_date)}</span>
                  </div>

                  {relation.price_data && (
                    <div className="pt-3 border-t space-y-2">
                      {relation.price_data.pricing?.delivered > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Delivered:</span>
                          <span className="text-lg font-semibold text-card-foreground">
                            {centsToDollars(relation.price_data.pricing.delivered)}
                          </span>
                        </div>
                      )}
                      {relation.price_data.pricing?.collected > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Collected:</span>
                          <span className="text-base font-medium">
                            {centsToDollars(relation.price_data.pricing.collected)}
                          </span>
                        </div>
                      )}
                      {relation.price_data.code && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Grade:</span>
                          <Badge variant="secondary" className="text-xs">
                            {relation.price_data.code}
                          </Badge>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
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
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
