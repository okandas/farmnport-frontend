"use client"

import Link from "next/link"
import { formatDate, capitalizeFirstLetter, slug } from "@/lib/utilities"

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
  rank?: number
}

type ProducerPriceListKeys = "beef" | "lamb" | "mutton" | "goat" | "chicken" | "pork" | "slaughter"

const produceKeys: ProducerPriceListKeys[] = ["beef", "lamb", "mutton", "goat", "chicken", "pork", "slaughter"]

const produceColors: Record<string, string> = {
  beef:      "bg-red-500/10 text-red-600 dark:text-red-400",
  lamb:      "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  mutton:    "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  goat:      "bg-lime-500/10 text-lime-700 dark:text-lime-400",
  chicken:   "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
  pork:      "bg-pink-500/10 text-pink-600 dark:text-pink-400",
  slaughter: "bg-slate-500/10 text-slate-600 dark:text-slate-400",
}

const avatarColors = [
  "bg-blue-500", "bg-emerald-500", "bg-violet-500", "bg-orange-500",
  "bg-rose-500", "bg-cyan-500", "bg-amber-600", "bg-indigo-500",
]

export function PriceSummaryCard({ priceList, rank }: PriceSummaryCardProps) {
  const formattedDate = formatDate(priceList.effectiveDate.toString())
  const dateSlug = new Date(priceList.effectiveDate).toISOString().split('T')[0]
  const nameSlug = slug(priceList.client_name)
  const priceSlug = `${nameSlug}-${dateSlug}`

  const availableProduce = produceKeys.filter(
    (key) => priceList[key] !== undefined && priceList[key] !== null
  )

  const initials = priceList.client_name
    .split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()
  const color = avatarColors[(rank ?? 0) % avatarColors.length]

  return (
    <Link
      href={`/prices/${priceSlug}`}
      className="grid grid-cols-[2.5rem_1fr_auto] sm:grid-cols-[2.5rem_1fr_auto_auto] items-center gap-3 px-5 py-4 border-b last:border-0 hover:bg-muted/20 transition-colors group"
    >
      {rank !== undefined ? (
        <span className="text-xs text-muted-foreground tabular-nums text-right">{rank}</span>
      ) : <span />}

      <div className="flex items-center gap-3 min-w-0">
        <div className={`h-9 w-9 shrink-0 rounded-full ${color} flex items-center justify-center shadow-sm`}>
          <span className="text-[11px] font-bold text-white">{initials}</span>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">
            {capitalizeFirstLetter(priceList.client_name)}
          </p>
          <div className="flex flex-wrap gap-1 mt-1">
            {availableProduce.map((p) => (
              <span key={p} className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${produceColors[p]}`}>
                {capitalizeFirstLetter(p)}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="text-right">
        <p className="text-xs text-muted-foreground tabular-nums">{formattedDate}</p>
        {priceList.pricing_basis && (
          <p className="text-[9px] uppercase tracking-wider text-muted-foreground mt-0.5">{priceList.pricing_basis}</p>
        )}
      </div>
    </Link>
  )
}
