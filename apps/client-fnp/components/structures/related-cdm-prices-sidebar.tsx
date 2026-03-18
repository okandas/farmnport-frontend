"use client"

import Link from "next/link"
import { formatDate, capitalizeFirstLetter, slug } from "@/lib/utilities"
import { Calendar } from "lucide-react"

interface CdmPriceData {
  id: string
  client_name: string
  effectiveDate: string
  exchange_rate: number
}

interface RelatedCdmPricesSidebarProps {
  currentClientName: string
  currentPriceId: string
  allPrices: CdmPriceData[]
}

function getCdmSlug(price: CdmPriceData) {
  const dateSlug = new Date(price.effectiveDate).toISOString().split('T')[0]
  const nameSlug = slug(price.client_name)
  return `${nameSlug}-${dateSlug}`
}

export function RelatedCdmPricesSidebar({ currentClientName, currentPriceId, allPrices }: RelatedCdmPricesSidebarProps) {
  const sameClientPrices = allPrices
    .filter(p => p.client_name.toLowerCase() === currentClientName.toLowerCase() && p.id !== currentPriceId)
    .slice(0, 5)

  const otherClientPrices = allPrices
    .filter(p => p.client_name.toLowerCase() !== currentClientName.toLowerCase())
    .slice(0, 3)

  return (
    <div className="space-y-6">
      {sameClientPrices.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wide">
            Other Dates — {capitalizeFirstLetter(currentClientName)}
          </h3>
          <div className="space-y-3">
            {sameClientPrices.map((price) => (
              <Link key={price.id} href={`/prices/cdm/${getCdmSlug(price)}`} className="block">
                <div className="rounded-lg border bg-card p-3 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(price.effectiveDate)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {otherClientPrices.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wide">
            Other Buyers
          </h3>
          <div className="space-y-3">
            {otherClientPrices.map((price) => (
              <Link key={price.id} href={`/prices/cdm/${getCdmSlug(price)}`} className="block">
                <div className="rounded-lg border bg-card p-3 hover:bg-muted/50 transition-colors">
                  <p className="text-sm font-medium text-foreground mb-1">
                    {capitalizeFirstLetter(price.client_name)}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(price.effectiveDate)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
