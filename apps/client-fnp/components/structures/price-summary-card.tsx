"use client"

import Link from "next/link"
import { formatDate, capitalizeFirstLetter, slug } from "@/lib/utilities"
import { Badge } from "@/components/ui/badge"
import { Calendar, Building2, ArrowRight, CheckCircle2 } from "lucide-react"

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

const produceEmojis: Record<ProducerPriceListKeys, string> = {
  beef: "🥩",
  lamb: "🐑",
  mutton: "🐏",
  goat: "🐐",
  chicken: "🐔",
  pork: "🐷",
  slaughter: "🔪"
}

export function PriceSummaryCard({ priceList }: PriceSummaryCardProps) {
  const formattedDate = formatDate(priceList.effectiveDate.toString())
  const dateSlug = new Date(priceList.effectiveDate).toISOString().split('T')[0]
  const nameSlug = slug(priceList.client_name)
  const priceSlug = `${nameSlug}-${dateSlug}`

  // Get available produce types
  const availableProduce = (Object.keys(produceEmojis) as ProducerPriceListKeys[]).filter(
    (key) => priceList[key] !== undefined && priceList[key] !== null
  )

  return (
    <Link href={`/prices/${priceSlug}`}>
      <div className="group rounded-xl border bg-card p-4 sm:p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:border-primary/30 cursor-pointer">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-lg sm:text-xl font-bold font-heading text-card-foreground">
                  {capitalizeFirstLetter(priceList.client_name)}
                </h3>
                {priceList.verified && (
                  <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 flex-shrink-0" />
                )}
              </div>

              <div className="space-y-2.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <Building2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-xs text-muted-foreground uppercase tracking-wide">Farm Produce Category:</span>
                  <span className="text-sm font-medium text-card-foreground">
                    {capitalizeFirstLetter(priceList.client_specialization)}
                  </span>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-xs text-muted-foreground uppercase tracking-wide">Effective:</span>
                  <span className="text-sm font-medium text-card-foreground">{formattedDate}</span>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-3">
                  {priceList.pricing_basis && (
                    <Badge variant="outline" className="text-xs font-medium capitalize">
                      {priceList.pricing_basis}
                    </Badge>
                  )}

                  {availableProduce.length > 0 && (
                    <>
                      {availableProduce.map((produce) => (
                        <Badge key={produce} variant="secondary" className="text-xs font-medium whitespace-nowrap">
                          <span className="mr-1">{produceEmojis[produce]}</span>
                          {capitalizeFirstLetter(produce)}
                        </Badge>
                      ))}
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-2 text-primary opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-sm font-medium">View Details</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
      </div>
    </Link>
  )
}
