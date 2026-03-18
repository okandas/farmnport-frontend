"use client"

import Link from "next/link"
import { formatDate, capitalizeFirstLetter, slug } from "@/lib/utilities"
import { ArrowRight, Calendar } from "lucide-react"
import { CdmPrice } from "@/lib/schemas"

interface CdmPriceSummaryCardProps {
  price: CdmPrice
}

export function CdmPriceSummaryCard({ price }: CdmPriceSummaryCardProps) {
  const formattedDate = formatDate(price.effectiveDate)
  const dateSlug = new Date(price.effectiveDate).toISOString().split('T')[0]
  const nameSlug = slug(price.client_name)
  const priceSlug = `${nameSlug}-${dateSlug}`

  return (
    <Link href={`/prices/cdm/${priceSlug}`} className="block group">
      <div className="flex items-center justify-between gap-3 py-3 px-1 hover:bg-muted/30 transition-colors">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
            {capitalizeFirstLetter(price.client_name)}
          </h3>
          <div className="flex items-center gap-1.5 mt-0.5 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3 shrink-0" />
            <span>{formattedDate}</span>
          </div>
        </div>
        <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0" />
      </div>
    </Link>
  )
}
