"use client"

import Link from "next/link"
import { formatDate, capitalizeFirstLetter, slug } from "@/lib/utilities"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "lucide-react"

interface PriceListData {
  id: string
  client_name: string
  client_specialization: string
  effectiveDate: Date | string
  pricing_basis?: string
}

interface RelatedPricesSidebarProps {
  currentClientName: string
  currentPriceId: string
  allPrices: PriceListData[]
}

export function RelatedPricesSidebar({ currentClientName, currentPriceId, allPrices }: RelatedPricesSidebarProps) {
  // Filter to show other prices from same client and other clients (excluding current price)
  const sameClientPrices = allPrices
    .filter(p => p.client_name.toLowerCase() === currentClientName.toLowerCase() && p.id !== currentPriceId)
    .slice(0, 3)

  const otherClientPrices = allPrices
    .filter(p => p.client_name.toLowerCase() !== currentClientName.toLowerCase())
    .slice(0, 5)

  return (
    <div className="space-y-6">
      {sameClientPrices.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-card-foreground mb-3 uppercase tracking-wide">
            More from {capitalizeFirstLetter(currentClientName)}
          </h3>
          <div className="space-y-2">
            {sameClientPrices.map((price) => {
              const dateSlug = new Date(price.effectiveDate).toISOString().split('T')[0]
              const nameSlug = slug(price.client_name)
              const priceSlug = `${nameSlug}-${dateSlug}`

              return (
                <Link key={price.id} href={`/prices/${priceSlug}`}>
                  <div className="rounded-lg border bg-card p-3 hover:bg-muted/50 transition-colors cursor-pointer">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(price.effectiveDate.toString())}</span>
                    </div>
                    {price.pricing_basis && (
                      <Badge variant="outline" className="text-xs">
                        {price.pricing_basis}
                      </Badge>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {otherClientPrices.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-card-foreground mb-3 uppercase tracking-wide">
            Other Buyers & Producers
          </h3>
          <div className="space-y-2">
            {otherClientPrices.map((price) => {
              const dateSlug = new Date(price.effectiveDate).toISOString().split('T')[0]
              const nameSlug = slug(price.client_name)
              const priceSlug = `${nameSlug}-${dateSlug}`

              return (
                <Link key={price.id} href={`/prices/${priceSlug}`}>
                  <div className="rounded-lg border bg-card p-3 hover:bg-muted/50 transition-colors cursor-pointer">
                    <p className="text-sm font-medium text-card-foreground mb-1">
                      {capitalizeFirstLetter(price.client_name)}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(price.effectiveDate.toString())}</span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
