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

const produceColors: Record<string, string> = {
  beef: "bg-red-50 text-red-700 ring-red-600/10 dark:bg-red-950/30 dark:text-red-400",
  lamb: "bg-amber-50 text-amber-700 ring-amber-600/10 dark:bg-amber-950/30 dark:text-amber-400",
  mutton: "bg-orange-50 text-orange-700 ring-orange-600/10 dark:bg-orange-950/30 dark:text-orange-400",
  goat: "bg-lime-50 text-lime-700 ring-lime-600/10 dark:bg-lime-950/30 dark:text-lime-400",
  chicken: "bg-yellow-50 text-yellow-700 ring-yellow-600/10 dark:bg-yellow-950/30 dark:text-yellow-400",
  pork: "bg-pink-50 text-pink-700 ring-pink-600/10 dark:bg-pink-950/30 dark:text-pink-400",
  slaughter: "bg-slate-50 text-slate-700 ring-slate-600/10 dark:bg-slate-950/30 dark:text-slate-400",
}

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
      <div className="flex items-center justify-between gap-3 py-3 px-1 hover:bg-muted/30 transition-colors">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
              {capitalizeFirstLetter(priceList.client_name)}
            </h3>
          </div>
          <div className="flex items-center gap-1.5 mt-0.5 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3 shrink-0" />
            <span>{formattedDate}</span>
            {priceList.pricing_basis && (
              <>
                <span className="text-border">|</span>
                <span className="uppercase tracking-wide">{priceList.pricing_basis}</span>
              </>
            )}
          </div>
          {availableProduce.length > 0 && (
            <div className="flex gap-1 mt-1.5">
              {availableProduce.map((p) => (
                <span key={p} className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-medium ring-1 ring-inset ${produceColors[p]}`}>
                  {capitalizeFirstLetter(p)}
                </span>
              ))}
            </div>
          )}
        </div>
        <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0" />
      </div>
    </Link>
  )
}
