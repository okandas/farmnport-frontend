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
          <div className="rounded-lg border bg-card overflow-hidden">
            <div className="px-5 py-3 border-b bg-muted/30">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
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
                          <span className="inline-flex items-center justify-center rounded px-2 py-0.5 text-xs font-semibold bg-muted text-muted-foreground min-w-[36px]">
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
