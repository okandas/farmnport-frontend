"use client"

import { capitalizeFirstLetter, centsToDollars } from "@/lib/utilities"

const gradeColors = [
  "text-green-700 bg-green-50 ring-green-600/20 dark:text-green-400 dark:bg-green-950/30 dark:ring-green-500/20",
  "text-lime-700 bg-lime-50 ring-lime-600/20 dark:text-lime-400 dark:bg-lime-950/30 dark:ring-lime-500/20",
  "text-yellow-700 bg-yellow-50 ring-yellow-600/20 dark:text-yellow-400 dark:bg-yellow-950/30 dark:ring-yellow-500/20",
  "text-amber-700 bg-amber-50 ring-amber-600/20 dark:text-amber-400 dark:bg-amber-950/30 dark:ring-amber-500/20",
  "text-orange-700 bg-orange-50 ring-orange-600/20 dark:text-orange-400 dark:bg-orange-950/30 dark:ring-orange-500/20",
  "text-red-700 bg-red-50 ring-red-600/10 dark:text-red-400 dark:bg-red-950/30 dark:ring-red-500/20",
]
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
  produce?: string
}

type ProducerPriceListKeys = "beef" | "lamb" | "mutton" | "goat" | "chicken" | "pork" | "slaughter"

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

const gradeLabels: Record<string, string> = {
  super: "Super",
  choice: "Choice",
  commercial: "Commercial",
  economy: "Economy",
  manufacturing: "Manufacturing",
  condemned: "Condemned",
  superPremium: "Super Premium",
  standard: "Standard",
  ordinary: "Ordinary",
  inferior: "Inferior",
  a_grade_over_1_75: "A Grade Over 1.75 kgs",
  a_grade_1_55_1_75: "A Grade 1.55 – 1.75 kgs",
  a_grade_under_1_55: "A Grade Under 1.55 kgs",
  off_layers: "Off Layers",
  cattle: "Cattle",
  sheep: "Sheep",
  pigs: "Pigs",
  chicken: "Chicken",
}

const formatGradeName = (key: string): string => {
  if (gradeLabels[key]) return gradeLabels[key]
  return key.split("_").map((word) => capitalizeFirstLetter(word)).join(" ")
}

export function PriceDetailsGrid({ priceList, produce }: PriceDetailsGridProps) {
  const categories = pricingTypes[priceList.client_specialization] || []

  const renderableCategories = categories.filter((pricingType) => {
    if (produce && pricingType !== produce) return false
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
          <div className="rounded-xl border bg-card shadow-sm">
            <div className="px-5 pt-4 pb-2">
              <h3 className="text-sm font-bold tracking-tight">
                {capitalizeFirstLetter(pricingType)} Prices
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
                  <tr className="border-b">
                    <th className="px-5 py-2 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                      Grade
                    </th>
                    <th className="px-5 py-2 text-left text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                      Code
                    </th>
                    <th className="px-5 py-2 text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                      Delivered
                    </th>
                    <th className="px-5 py-2 text-right text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
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
                      <tr key={index} className="hover:bg-muted/30 transition-colors">
                        <td className="px-5 py-2.5">
                          <span className="text-sm font-medium text-foreground">
                            {formatGradeName(key)}
                          </span>
                        </td>
                        <td className="px-5 py-2.5">
                          <span className={`inline-flex items-center justify-center rounded-md px-2 py-0.5 text-xs font-bold ring-1 ring-inset min-w-[36px] ${gradeColors[index % gradeColors.length]}`}>
                            {grades?.[pricingType]?.[key] || "—"}
                          </span>
                        </td>
                        <td className="px-5 py-2.5 text-right">
                          <span className="text-sm font-semibold text-foreground">
                            {centsToDollars(deliveredPrice)}
                          </span>
                        </td>
                        <td className="px-5 py-2.5 text-right">
                          <span className="text-sm text-muted-foreground">
                            {collectedPrice > 0 ? centsToDollars(collectedPrice) : "—"}
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
