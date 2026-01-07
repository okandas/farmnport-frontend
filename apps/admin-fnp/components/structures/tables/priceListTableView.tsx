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
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900">
          {ucFirst(producerPriceList.client_name)}
        </h1>
        <p className="mt-2 text-lg text-gray-700">
          Producer Price List - {ucFirst(producerPriceList.client_specialization)}
        </p>
        {formattedDate && (
          <p className="mt-1 text-sm text-gray-600">
            <time dateTime={new Date(producerPriceList.effectiveDate).toISOString()}>
              Effective Date: {formattedDate}
            </time>
          </p>
        )}
        <p className="mt-1 text-sm text-gray-600">
          Pricing Basis: {producerPriceList.pricing_basis}
        </p>
      </div>

      <div className="space-y-8">
        {pricingTypes[producerPriceList?.client_specialization].map(
          (pricingType, typeIndex) => {
            if (producerPriceList[pricingType] === undefined) return null

            return (
              <div key={typeIndex} className="rounded-lg border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {ucFirst(pricingType)}
                  </h2>
                  <p className="mt-1 text-sm text-gray-600">
                    Prices paid to farmers for {pricingType}
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="w-[30%] px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Grade
                        </th>
                        <th scope="col" className="w-[20%] px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                          Symbol
                        </th>
                        <th scope="col" className="w-[25%] px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                          Delivered Price
                        </th>
                        <th scope="col" className="w-[25%] px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                          Collected Price
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
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
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                                {formatGradeName(key)}
                              </td>
                              <td className="whitespace-nowrap px-6 py-4">
                                {grades?.[pricingType]?.[key] ? (
                                  <span
                                    className={cn(
                                      statuses[index % statuses.length],
                                      "inline-flex rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset",
                                    )}
                                  >
                                    {grades[pricingType][key]}
                                  </span>
                                ) : (
                                  <span className="text-gray-400">-</span>
                                )}
                              </td>
                              <td className="whitespace-nowrap px-6 py-4 text-right text-sm text-gray-900">
                                {centsToDollars(deliveredPrice)}
                              </td>
                              <td className="whitespace-nowrap px-6 py-4 text-right text-sm text-gray-600">
                                {collectedPrice > 0 ? centsToDollars(collectedPrice) : "-"}
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
