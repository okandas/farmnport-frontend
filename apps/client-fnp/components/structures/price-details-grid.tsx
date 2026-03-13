"use client"

import { capitalizeFirstLetter, centsToDollars, cn } from "@/lib/utilities"
import { AdSenseInFeed } from "@/components/ads/AdSenseInFeed"

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

interface PriceDetailsGridProps {
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

export function PriceDetailsGrid({ priceList }: PriceDetailsGridProps) {
  const categories = pricingTypes[priceList.client_specialization] || []

  // Filter to only renderable categories
  const renderableCategories = categories.filter((pricingType) => {
    if (priceList[pricingType] === undefined) return false
    const categoryData = priceList[pricingType]
    const gradeEntries = Object.entries(categoryData).filter(
      ([key]) => !["hasPrice", "hasCollectedPrice", "farm_produce_id"].includes(key)
    )
    return gradeEntries.length > 0
  })

  return (
    <div className="space-y-6">
      {renderableCategories.map((pricingType, renderIndex) => {
        const categoryData = priceList[pricingType]
        const gradeEntries = Object.entries(categoryData).filter(
          ([key]) => !["hasPrice", "hasCollectedPrice", "farm_produce_id"].includes(key)
        )

        return (
          <div key={renderIndex}>
          {renderIndex > 0 && renderIndex % 2 === 0 && <AdSenseInFeed />}
          <div className="rounded-xl border bg-card overflow-hidden shadow-sm">
            <div className="px-6 py-3 bg-gradient-to-r from-muted/30 to-card border-b">
              <h3 className="text-lg font-bold text-card-foreground">
                {capitalizeFirstLetter(pricingType)}
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full table-fixed">
                <colgroup>
                  <col className="w-[40%]" />
                  <col className="w-[15%]" />
                  <col className="w-[22.5%]" />
                  <col className="w-[22.5%]" />
                </colgroup>
                <thead>
                  <tr className="border-b border-border bg-muted/5">
                    <th className="px-6 py-2 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Grade
                    </th>
                    <th className="px-6 py-2 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Code
                    </th>
                    <th className="px-6 py-2 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Delivered
                    </th>
                    <th className="px-6 py-2 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Collected
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {gradeEntries.map(([key, value], index) => {
                    const gradeItem = value as any
                    const deliveredPrice = gradeItem?.pricing?.delivered || 0
                    const collectedPrice = gradeItem?.pricing?.collected || 0

                    return (
                      <tr key={index} className="hover:bg-muted/5 transition-colors">
                        <td className="px-6 py-2.5">
                          <span className="text-sm font-semibold text-card-foreground">
                            {formatGradeName(key)}
                          </span>
                        </td>
                        <td className="px-6 py-2.5">
                          {grades?.[pricingType]?.[key] ? (
                            <span className={cn(statuses[index % statuses.length], "inline-flex items-center justify-center rounded-md px-2 py-0.5 text-xs font-bold ring-1 ring-inset min-w-[40px]")}>
                              {grades[pricingType][key]}
                            </span>
                          ) : (
                            <span className="inline-flex items-center justify-center rounded-md px-2 py-0.5 text-xs font-bold ring-1 ring-inset min-w-[40px] text-gray-700 bg-gray-50 ring-gray-600/20 dark:text-gray-400 dark:bg-gray-950/30 dark:ring-gray-500/20">
                              NG
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-2.5 text-right">
                          <span className="text-sm font-bold text-card-foreground">
                            {centsToDollars(deliveredPrice)}
                          </span>
                        </td>
                        <td className="px-6 py-2.5 text-right">
                          <span className="text-sm font-semibold text-muted-foreground">
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
          </div>
        )
      })}
    </div>
  )
}
