"use client"

import { parseAsString, parseAsInteger, useQueryState } from "nuqs"
import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Search, X, ChevronLeft, ChevronRight } from "lucide-react"
import { formatDate, capitalizeFirstLetter, centsToDollars } from "@/lib/utilities"

export function PricesSearchView() {
  const [produceQuery, setProduceQuery] = useQueryState("q_produce", parseAsString.withDefault(""))
  const [clientQuery, setClientQuery] = useQueryState("q_client", parseAsString.withDefault(""))
  const [currentPage, setCurrentPage] = useQueryState("search_page", parseAsInteger.withDefault(1))

  const hasQuery = produceQuery.length > 0 || clientQuery.length > 0

  const { isError, isLoading, data } = useQuery({
    queryKey: ["prices-search", produceQuery, clientQuery, currentPage],
    queryFn: async () => {
      const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3744"
      const params = new URLSearchParams()
      if (produceQuery) params.append("produce", produceQuery)
      if (clientQuery) params.append("client", clientQuery)
      params.append("p", currentPage.toString())

      const response = await axios.get(`${baseURL}/v1/prices/search?${params.toString()}`)
      return response.data
    },
    enabled: hasQuery,
    refetchOnWindowFocus: false,
  })

  const priceRelations = data?.data || []
  const total = data?.total || 0
  const totalPages = Math.ceil(total / 20)

  const handleReset = () => {
    setProduceQuery("")
    setClientQuery("")
    setCurrentPage(1)
  }

  return (
    <div className="space-y-6">
      {/* Search Form */}
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Search Prices</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="space-y-2">
            <Label htmlFor="produce-search">Search by Produce</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="produce-search"
                type="text"
                placeholder="e.g., beef, lamb, chicken..."
                value={produceQuery}
                onChange={(e) => {
                  setProduceQuery(e.target.value)
                  setCurrentPage(1)
                }}
                className="pl-9"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="client-search">Search by Client/Buyer</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="client-search"
                type="text"
                placeholder="e.g., Premium Meat, Fresh Foods..."
                value={clientQuery}
                onChange={(e) => {
                  setClientQuery(e.target.value)
                  setCurrentPage(1)
                }}
                className="pl-9"
              />
            </div>
          </div>
        </div>

        {hasQuery && (
          <Button variant="outline" onClick={handleReset}>
            <X className="h-4 w-4 mr-2" />
            Clear Search
          </Button>
        )}
      </div>

      {/* Results */}
      {hasQuery && (
        <>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-48 rounded-xl border bg-card animate-pulse" />
              ))}
            </div>
          ) : isError ? (
            <div className="text-center py-12 px-4 border-2 border-dashed border-destructive/30 rounded-xl">
              <p className="text-lg font-medium mb-2">Error searching prices</p>
              <p className="text-sm text-muted-foreground">Please try again</p>
            </div>
          ) : priceRelations.length === 0 ? (
            <div className="text-center py-12 px-4 border-2 border-dashed rounded-xl">
              <p className="text-lg font-medium mb-2">No results found</p>
              <p className="text-sm text-muted-foreground">
                Try adjusting your search terms
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Found {total} results • Page {currentPage} of {totalPages}
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

                    <div className="space-y-2">
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
        </>
      )}
    </div>
  )
}
