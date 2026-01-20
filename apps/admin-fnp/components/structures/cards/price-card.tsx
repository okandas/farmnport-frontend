"use client"

import Link from "next/link"
import { ProducerPriceList } from "@/lib/schemas"
import { formatDate, ucFirst, centsToDollars, cn } from "@/lib/utilities"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Building2, ArrowRight } from "lucide-react"

interface PriceCardProps {
  priceList: ProducerPriceList
}

type ProducerPriceListKeys =
  | "beef"
  | "lamb"
  | "mutton"
  | "goat"
  | "chicken"
  | "pork"
  | "slaughter"

const statuses = [
  "text-green-700 bg-green-50 ring-green-600/20",
  "text-lime-700 bg-lime-50 ring-lime-600/20",
  "text-yellow-700 bg-yellow-50 ring-yellow-600/20",
  "text-amber-700 bg-amber-50 ring-amber-600/20",
  "text-orange-700 bg-orange-50 ring-orange-600/20",
  "text-red-700 bg-red-50 ring-red-600/10",
  "text-stone-600 bg-stone-50 ring-stone-500/10",
  "text-gray-600 bg-gray-50 ring-gray-500/10",
]

const grades: Record<ProducerPriceListKeys, Record<string, string>> = {
  beef: {
    super: "S",
    choice: "O",
    commercial: "B",
    economy: "X",
    manufacturing: "J",
    condemned: "CD",
  },
  lamb: {
    superPremium: "SL",
    choice: "CL",
    standard: "TL",
    inferior: "IL",
  },
  mutton: {
    super: "SM",
    choice: "CM",
    standard: "TM",
    ordinary: "OM",
    inferior: "IM",
  },
  goat: {
    super: "SG",
    choice: "CG",
    standard: "TG",
    inferior: "IG",
  },
  chicken: {
    grade: "A",
  },
  pork: {
    super: "SP",
    manufacturing: "MP",
  },
  slaughter: {
    cattle: "SC",
    sheep: "SSH",
    pigs: "SPG",
    chicken: "SCH",
  },
}

const pricingTypes: Record<string, ProducerPriceListKeys[]> = {
  livestock: ["beef", "lamb", "mutton", "goat", "chicken", "pork", "slaughter"],
}

const formatGradeName = (key: string): string => {
  if (key.includes('_over_')) {
    const weight = key.split('_over_')[1].replace(/_/g, '.')
    return `A Grade Over ${weight} kg`
  }

  if (key.includes('_under_')) {
    const weight = key.split('_under_')[1].replace(/_/g, '.')
    return `A Grade Under ${weight} kg`
  }

  if (key.match(/a_grade_\d+_\d+_\d+_\d+/)) {
    const parts = key.replace('a_grade_', '').split('_')
    const weight1 = `${parts[0]}.${parts[1]}`
    const weight2 = `${parts[2]}.${parts[3]}`
    return `A Grade ${weight1}-${weight2} kg`
  }

  if (key === 'super_premium' || key === 'superPremium') {
    return 'Super Premium'
  }

  if (key === 'off_layers') {
    return 'Off Layers'
  }

  return key
    .split('_')
    .map(word => ucFirst(word))
    .join(' ')
}

export function PriceCard({ priceList }: PriceCardProps) {
  const formattedDate = formatDate(priceList.effectiveDate.toString())
  const categories = pricingTypes[priceList.client_specialization] || []

  return (
    <div className="group relative rounded-2xl border border-gray-200/80 bg-white shadow-sm transition-all duration-300 hover:shadow-lg hover:border-gray-300 overflow-hidden">
      {/* Decorative top border - crypto style */}
      <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />

      {/* Header Section */}
      <div className="p-6 border-b border-gray-100 bg-gradient-to-br from-gray-50/50 to-white">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {ucFirst(priceList.client_name)}
            </h3>
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-600">
                {ucFirst(priceList.client_specialization)}
              </span>
            </div>
          </div>
        </div>

        {/* Meta info */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1.5 text-gray-600">
            <Calendar className="h-4 w-4" />
            <span className="font-medium">Effective:</span>
            <span>{formattedDate}</span>
          </div>
          <div className="ml-auto">
            <Badge variant="outline" className="text-xs font-medium capitalize">
              {priceList.pricing_basis}
            </Badge>
          </div>
        </div>
      </div>

      {/* Price Categories Grid */}
      <div className="p-6 space-y-4">
        {categories.map((pricingType, typeIndex) => {
          if (priceList[pricingType] === undefined) return null

          const categoryData = priceList[pricingType]
          const gradeEntries = Object.entries(categoryData).filter(
            ([key]) => !["hasPrice", "hasCollectedPrice", "farm_produce_id"].includes(key)
          )

          if (gradeEntries.length === 0) return null

          return (
            <div
              key={typeIndex}
              className="rounded-xl border border-gray-200/60 bg-gradient-to-br from-white to-gray-50/30 overflow-hidden"
            >
              {/* Category Header */}
              <div className="px-4 py-3 bg-gray-900/5 border-b border-gray-200/60">
                <h4 className="text-base font-semibold text-gray-900">
                  {ucFirst(pricingType)}
                </h4>
              </div>

              {/* Grades Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200/60">
                  <thead className="bg-gray-50/50">
                    <tr>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                        Grade
                      </th>
                      <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                        Code
                      </th>
                      <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-gray-600">
                        Delivered
                      </th>
                      <th className="px-4 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-gray-600">
                        Collected
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200/40 bg-white">
                    {gradeEntries.map(([key, value], index) => {
                      const gradeItem = value as any
                      const deliveredPrice = gradeItem?.pricing?.delivered || 0
                      const collectedPrice = gradeItem?.pricing?.collected || 0

                      return (
                        <tr
                          key={index}
                          className="hover:bg-blue-50/30 transition-colors duration-150"
                        >
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">
                            {formatGradeName(key)}
                          </td>
                          <td className="px-4 py-3">
                            {grades?.[pricingType]?.[key] ? (
                              <span
                                className={cn(
                                  statuses[index % statuses.length],
                                  "inline-flex items-center rounded-md px-2.5 py-1 text-xs font-bold ring-1 ring-inset"
                                )}
                              >
                                {grades[pricingType][key]}
                              </span>
                            ) : (
                              <span className="text-gray-400 text-sm">-</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className="text-sm font-semibold text-gray-900">
                              {centsToDollars(deliveredPrice)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className="text-sm font-medium text-gray-600">
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

      {/* Footer with action */}
      <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100">
        <Link href={`/dashboard/prices/${priceList.id}`}>
          <Button
            variant="ghost"
            className="w-full group/btn hover:bg-gray-900 hover:text-white transition-colors duration-200"
            size="sm"
          >
            <span>View Detailed Breakdown</span>
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
          </Button>
        </Link>
      </div>
    </div>
  )
}
