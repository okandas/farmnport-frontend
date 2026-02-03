"use client"

import { ProducerPriceList } from "@/lib/schemas"
import { centsToDollars, cn, ucFirst } from "@/lib/utilities"
import { Button } from "@/components/ui/button"

type ProducerPriceListKeys =
  | "beef"
  | "lamb"
  | "mutton"
  | "goat"
  | "chicken"
  | "pork"
  | "slaughter"

interface PriceListTableViewProps {
  producerPriceList: ProducerPriceList
  showBookButton?: boolean
}

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

export function PriceListTableView({
  producerPriceList,
  showBookButton = true,
}: PriceListTableViewProps) {
  const formattedDate = producerPriceList.effectiveDate
    ? new Date(producerPriceList.effectiveDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : null

  const formatGradeName = (key: string): string => {
    // Handle special cases with numbers (weight ranges)
    // a_grade_over_1_75 -> A Grade Over 1.75 kg
    // a_grade_1_55_1_75 -> A Grade 1.55-1.75 kg
    // a_grade_under_1_55 -> A Grade Under 1.55 kg

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

    // Handle super_premium -> Super Premium
    if (key === 'super_premium' || key === 'superPremium') {
      return 'Super Premium'
    }

    // Handle off_layers -> Off Layers
    if (key === 'off_layers') {
      return 'Off Layers'
    }

    // Default: replace underscores with spaces and capitalize each word
    return key
      .split('_')
      .map(word => ucFirst(word))
      .join(' ')
  }

  return (
    <div className="mx-auto w-full max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {ucFirst(producerPriceList.client_name)}
        </h1>
        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-gray-500 dark:text-gray-400">Category:</span>
            <span className="font-medium text-gray-900 dark:text-white">{ucFirst(producerPriceList.client_specialization)}</span>
          </div>
          {formattedDate && (
            <div className="flex items-center gap-2">
              <span className="text-gray-500 dark:text-gray-400">Effective:</span>
              <time dateTime={new Date(producerPriceList.effectiveDate).toISOString()} className="font-medium text-gray-900 dark:text-white">
                {formattedDate}
              </time>
            </div>
          )}
          <div className="flex items-center gap-2">
            <span className="text-gray-500 dark:text-gray-400">Basis:</span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-primary/10 text-primary">
              {ucFirst(producerPriceList.pricing_basis)}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {pricingTypes[producerPriceList?.client_specialization].map(
          (pricingType, typeIndex) => {
            if (producerPriceList[pricingType] === undefined) return null

            return (
              <div key={typeIndex} className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 overflow-hidden shadow-sm">
                <div className="border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 px-6 py-4">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {ucFirst(pricingType)}
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Farmer prices for {pricingType}
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-800">
                        <th scope="col" className="w-[30%] px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                          Grade
                        </th>
                        <th scope="col" className="w-[20%] px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                          Code
                        </th>
                        <th scope="col" className="w-[25%] px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                          Delivered
                        </th>
                        <th scope="col" className="w-[25%] px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                          Collected
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-900">
                      {Object.keys(producerPriceList[pricingType]).map(
                        (key, index) => {
                          if (
                            key === "hasPrice" ||
                            key === "hasCollectedPrice" ||
                            key === "farm_produce_id"
                          ) {
                            return null
                          }
                          const gradePrices = producerPriceList[pricingType]
                          const gradeItem = gradePrices[key as keyof typeof gradePrices] as any
                          const deliveredPrice = gradeItem?.pricing?.delivered || 0
                          const collectedPrice = gradeItem?.pricing?.collected || 0

                          return (
                            <tr key={index} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/50 transition-colors">
                              <td className="whitespace-nowrap px-6 py-4">
                                <div className="flex flex-col">
                                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                    {formatGradeName(key)}
                                  </span>
                                </div>
                              </td>
                              <td className="whitespace-nowrap px-6 py-4">
                                {grades?.[pricingType]?.[key] ? (
                                  <span
                                    className={cn(
                                      statuses[index % statuses.length],
                                      "inline-flex items-center rounded-md px-2.5 py-1 text-xs font-bold ring-1 ring-inset",
                                    )}
                                  >
                                    {grades[pricingType][key]}
                                  </span>
                                ) : (
                                  <span className="text-gray-400 dark:text-gray-600">-</span>
                                )}
                              </td>
                              <td className="whitespace-nowrap px-6 py-4 text-right">
                                <div className="flex flex-col items-end">
                                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                                    {centsToDollars(deliveredPrice)}
                                  </span>
                                  <span className="text-xs text-gray-500 dark:text-gray-400">per kg</span>
                                </div>
                              </td>
                              <td className="whitespace-nowrap px-6 py-4 text-right">
                                <div className="flex flex-col items-end">
                                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                    {collectedPrice > 0 ? centsToDollars(collectedPrice) : "-"}
                                  </span>
                                  {collectedPrice > 0 && (
                                    <span className="text-xs text-gray-500 dark:text-gray-400">per kg</span>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )
                        },
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          },
        )}
      </div>

      {showBookButton && (
        <div className="mt-8 flex justify-center">
          <Button size="lg">Book Now</Button>
        </div>
      )}
    </div>
  )
}
