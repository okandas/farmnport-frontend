"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"

import { queryCdmPrices } from "@/lib/query"
import { CdmPrice } from "@/lib/schemas"
import { CdmPriceCard } from "@/components/structures/cdm-price-card"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons/lucide"

export function CdmPriceCardsView() {
  const [page, setPage] = useState(1)

  const { data, isLoading, isError } = useQuery({
    queryKey: ["cdm-prices", { p: page }],
    queryFn: () => queryCdmPrices({ p: page }),
    refetchOnWindowFocus: false,
  })

  const prices: CdmPrice[] = data?.data?.data || []
  const total = data?.data?.total || 0
  const hasMore = prices.length > 0 && page * 20 < total

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Icons.spinner className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  if (isError || prices.length === 0) {
    return null
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold font-heading">CDM Cattle Pricing</h2>
      <div className="grid gap-6">
        {prices.map((price) => (
          <CdmPriceCard key={price.id} price={price} />
        ))}
      </div>
      {hasMore && (
        <div className="flex justify-center pt-4">
          <Button variant="outline" onClick={() => setPage((p) => p + 1)}>
            Load More
          </Button>
        </div>
      )}
    </div>
  )
}
