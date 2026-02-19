"use client"

import Link from "next/link"
import { formatDate, capitalizeFirstLetter, centsToDollars, cn } from "@/lib/utilities"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Building2, ArrowRight } from "lucide-react"

interface PriceListData {
  id: string
  client_name: string
  client_specialization: string
  effectiveDate: Date | string
  pricing_basis?: string
  beef?: any
  lamb?: any
  mutton?: any
  goat?: any
  chicken?: any
  pork?: any
  slaughter?: any
}

interface PriceCardProps {
  priceList: PriceListData
}

type ProducerPriceListKeys = "beef" | "lamb" | "mutton" | "goat" | "chicken" | "pork" | "slaughter"

const statuses = [
  "text-green-700 bg-green-50 ring-green-600/20 dark:text-green-400 dark:bg-green-950/30 dark:ring-green-500/20",
  "text-lime-700 bg-lime-50 ring-lime-600/20 dark:text-lime-400 dark:bg-lime-950/30 dark:ring-lime-500/20",
  "text-yellow-700 bg-yellow-50 ring-yellow-600/20 dark:text-yellow-400 dark:bg-yellow-950/30 dark:ring-yellow-500/20",
  "text-amber-700 bg-amber-50 ring-amber-600/20 dark:text-amber-400 dark:bg-amber-950/30 dark:ring-amber-500/20",
  "text-orange-700 bg-orange-50 ring-orange-600/20 dark:text-orange-400 dark:bg-orange-950/30 dark:ring-orange-500/20",
  "text-red-700 bg-red-50 ring-red-600/10 dark:text-red-400 dark:bg-red-950/30 dark:ring-red-500/20",
]

const grades: Record<ProducerPriceListKeys, Record<string, string>> = {
  beef: { super: "S", choice: "O", commercial: "B", economy: "X", manufacturing: "J", condemned: "CD" },
  lamb: { superPremium: "SL", choice: "CL", standard: "TL", inferior: "IL" },
  mutton: { super: "SM", choice: "CM", standard: "TM", ordinary: "OM", inferior: "IM" },
  goat: { super: "SG", choice: "CG", standard: "TG", inferior: "IG" },
  chicken: { grade: "A" },
  pork: { super: "SP", manufacturing: "MP" },
  slaughter: { cattle: "SC", sheep: "SSH", pigs: "SPG", chicken: "SCH" },
}

const pricingTypes: Record<string, ProducerPriceListKeys[]> = {
  livestock: ["beef", "lamb", "mutton", "goat", "chicken", "pork", "slaughter"],
}

const formatGradeName = (key: string): string => {
  if (key === "superPremium") return "Super Premium"
  return key.split("_").map((word) => capitalizeFirstLetter(word)).join(" ")
}

export function PriceCard({ priceList }: PriceCardProps) {
  const formattedDate = formatDate(priceList.effectiveDate.toString())
  const categories = pricingTypes[priceList.client_specialization] || []

  return (
    <div className="group relative rounded-2xl border bg-card shadow-sm transition-all duration-300 hover:shadow-md hover:border-primary/30 overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />

      <div className="p-6 border-b bg-muted/20">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-2xl font-bold font-heading text-card-foreground mb-2">
              {capitalizeFirstLetter(priceList.client_name)}
            </h3>
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Farm Produce Category:</span>
              <span className="text-sm font-medium text-card-foreground">
                {capitalizeFirstLetter(priceList.client_specialization)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span className="font-medium">Effective:</span>
            <span>{formattedDate}</span>
          </div>
          {priceList.pricing_basis && (
            <div className="ml-auto">
              <Badge variant="outline" className="text-xs font-medium capitalize">
                {priceList.pricing_basis}
              </Badge>
            </div>
          )}
        </div>
      </div>

      <div className="p-6 space-y-4">
        {categories.map((pricingType, typeIndex) => {
          if (priceList[pricingType] === undefined) return null

          const categoryData = priceList[pricingType]
          const gradeEntries = Object.entries(categoryData).filter(
            ([key]) => !["hasPrice", "hasCollectedPrice", "farm_produce_id"].includes(key)
          )

          if (gradeEntries.length === 0) return null

          return (
            <div key={typeIndex} className="rounded-xl border bg-card/50 overflow-hidden">
              <div className="px-4 py-3 bg-muted/30 border-b">
                <h4 className="text-base font-semibold text-card-foreground">
                  {capitalizeFirstLetter(pricingType)}
                </h4>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border">
                  <thead className="bg-muted/20">
                    <tr>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Grade
                      </th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Code
                      </th>
                      <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Delivered
                      </th>
                      <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Collected
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border bg-card">
                    {gradeEntries.map(([key, value], index) => {
                      const gradeItem = value as any
                      const deliveredPrice = gradeItem?.pricing?.delivered || 0
                      const collectedPrice = gradeItem?.pricing?.collected || 0

                      return (
                        <tr key={index} className="hover:bg-muted/30 transition-colors duration-150">
                          <td className="px-4 py-3 text-sm font-medium text-card-foreground">
                            {formatGradeName(key)}
                          </td>
                          <td className="px-4 py-3">
                            {grades?.[pricingType]?.[key] ? (
                              <span className={cn(statuses[index % statuses.length], "inline-flex items-center rounded-md px-2.5 py-1 text-xs font-bold ring-1 ring-inset")}>
                                {grades[pricingType][key]}
                              </span>
                            ) : (
                              <span className="text-muted-foreground text-sm">-</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className="text-sm font-semibold text-card-foreground">
                              {centsToDollars(deliveredPrice)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className="text-sm font-medium text-muted-foreground">
                              {collectedPrice > 0 ? centsToDollars(collectedPrice) : "-"}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )
        })}
      </div>

      <div className="px-6 py-4 bg-muted/20 border-t">
        <Link href={`/prices/${priceList.id}`}>
          <Button variant="ghost" className="w-full group/btn" size="sm">
            <span>View Detailed Breakdown</span>
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
          </Button>
        </Link>
      </div>
    </div>
  )
}
