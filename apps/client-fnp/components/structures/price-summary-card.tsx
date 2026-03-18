"use client"

import Link from "next/link"
import { formatDate, capitalizeFirstLetter, slug } from "@/lib/utilities"
import { ArrowRight, Calendar } from "lucide-react"

interface PriceListData {
  id: string
  client_name: string
  client_specialization: string
  effectiveDate: Date | string
  pricing_basis?: string
  verified?: boolean
  beef?: any
  lamb?: any
  mutton?: any
  goat?: any
  chicken?: any
  pork?: any
  slaughter?: any
}

interface PriceSummaryCardProps {
  priceList: PriceListData
}

type ProducerPriceListKeys = "beef" | "lamb" | "mutton" | "goat" | "chicken" | "pork" | "slaughter"

const produceKeys: ProducerPriceListKeys[] = ["beef", "lamb", "mutton", "goat", "chicken", "pork", "slaughter"]

export function PriceSummaryCard({ priceList }: PriceSummaryCardProps) {
  const formattedDate = formatDate(priceList.effectiveDate.toString())
  const dateSlug = new Date(priceList.effectiveDate).toISOString().split('T')[0]
  const nameSlug = slug(priceList.client_name)
  const priceSlug = `${nameSlug}-${dateSlug}`

  const availableProduce = produceKeys.filter(
    (key) => priceList[key] !== undefined && priceList[key] !== null
  )

  return (
    <Link href={`/prices/${priceSlug}`} className="block group">
      <div className="flex items-center gap-4 px-4 py-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
        {/* Name + specialization */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-foreground truncate">
              {capitalizeFirstLetter(priceList.client_name)}
            </h3>
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider shrink-0">
              {capitalizeFirstLetter(priceList.client_specialization)}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formattedDate}
            </span>
            <span className="hidden sm:inline truncate">
              {availableProduce.map(p => capitalizeFirstLetter(p)).join(", ")}
            </span>
            {priceList.pricing_basis && (
              <span className="hidden md:inline uppercase tracking-wide">{priceList.pricing_basis}</span>
            )}
          </div>
        </div>

        <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
      </div>
    </Link>
  )
}
