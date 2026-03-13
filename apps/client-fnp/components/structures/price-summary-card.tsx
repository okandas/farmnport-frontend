"use client"

import Link from "next/link"
import { formatDate, capitalizeFirstLetter, slug } from "@/lib/utilities"
import { ArrowRight } from "lucide-react"

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

const specializationColors: Record<string, { bg: string; accent: string; text: string }> = {
  livestock: { bg: "bg-amber-50 dark:bg-amber-950/20", accent: "bg-amber-500", text: "text-amber-700 dark:text-amber-400" },
  poultry: { bg: "bg-orange-50 dark:bg-orange-950/20", accent: "bg-orange-500", text: "text-orange-700 dark:text-orange-400" },
  dairy: { bg: "bg-blue-50 dark:bg-blue-950/20", accent: "bg-blue-500", text: "text-blue-700 dark:text-blue-400" },
  horticulture: { bg: "bg-green-50 dark:bg-green-950/20", accent: "bg-green-500", text: "text-green-700 dark:text-green-400" },
  grain: { bg: "bg-yellow-50 dark:bg-yellow-950/20", accent: "bg-yellow-500", text: "text-yellow-700 dark:text-yellow-400" },
  aquaculture: { bg: "bg-cyan-50 dark:bg-cyan-950/20", accent: "bg-cyan-500", text: "text-cyan-700 dark:text-cyan-400" },
  plantation: { bg: "bg-emerald-50 dark:bg-emerald-950/20", accent: "bg-emerald-500", text: "text-emerald-700 dark:text-emerald-400" },
}

const defaultColors = { bg: "bg-slate-50 dark:bg-slate-950/20", accent: "bg-slate-500", text: "text-slate-700 dark:text-slate-400" }

export function PriceSummaryCard({ priceList }: PriceSummaryCardProps) {
  const formattedDate = formatDate(priceList.effectiveDate.toString())
  const dateSlug = new Date(priceList.effectiveDate).toISOString().split('T')[0]
  const nameSlug = slug(priceList.client_name)
  const priceSlug = `${nameSlug}-${dateSlug}`

  const availableProduce = produceKeys.filter(
    (key) => priceList[key] !== undefined && priceList[key] !== null
  )

  const colors = specializationColors[priceList.client_specialization?.toLowerCase()] || defaultColors

  return (
    <Link href={`/prices/${priceSlug}`} className="block group">
      <div className={`relative rounded-xl ${colors.bg} border border-transparent hover:border-primary/20 p-4 transition-all duration-200 hover:shadow-md`}>
        <div className={`absolute left-0 top-4 bottom-4 w-1 rounded-r-full ${colors.accent}`} />

        <div className="pl-4 flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <h3 className="text-base font-semibold text-card-foreground truncate">
                {capitalizeFirstLetter(priceList.client_name)}
              </h3>
              <span className={`text-[11px] font-medium uppercase tracking-wider ${colors.text} shrink-0`}>
                {capitalizeFirstLetter(priceList.client_specialization)}
              </span>
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="text-green-600 dark:text-green-400">{formattedDate}</span>
              <span className="hidden sm:inline">{availableProduce.map(p => capitalizeFirstLetter(p)).join(", ")}</span>
              {priceList.pricing_basis && (
                <span className="hidden md:inline text-xs uppercase tracking-wide">{priceList.pricing_basis}</span>
              )}
            </div>
          </div>

          <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0 ml-4" />
        </div>
      </div>
    </Link>
  )
}
