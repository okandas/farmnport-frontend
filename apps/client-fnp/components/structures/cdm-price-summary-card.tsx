"use client"

import Link from "next/link"
import { formatDate, capitalizeFirstLetter, slug } from "@/lib/utilities"
import { CdmPrice } from "@/lib/schemas"

interface CdmPriceSummaryCardProps {
  price: CdmPrice
  rank?: number
}

const teethColors: Record<string, string> = {
  "MT": "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  "2T": "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  "4T": "bg-violet-500/10 text-violet-700 dark:text-violet-400",
  "6T": "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  "8T": "bg-orange-500/10 text-orange-700 dark:text-orange-400",
}

const avatarColors = [
  "bg-blue-500", "bg-emerald-500", "bg-violet-500", "bg-orange-500",
  "bg-rose-500", "bg-cyan-500", "bg-amber-600", "bg-indigo-500",
]

export function CdmPriceSummaryCard({ price, rank }: CdmPriceSummaryCardProps) {
  const formattedDate = formatDate(price.effectiveDate)
  const dateSlug = new Date(price.effectiveDate).toISOString().split('T')[0]
  const nameSlug = slug(price.client_name)
  const priceSlug = `${nameSlug}-${dateSlug}`

  const teethCategories = price.liveweight
    ? [...new Set(price.liveweight.map((lw) => lw.teeth).filter(Boolean))]
    : []

  const initials = price.client_name
    .split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()
  const color = avatarColors[(rank ?? 0) % avatarColors.length]

  return (
    <Link
      href={`/prices/cdm/${priceSlug}`}
      className="grid grid-cols-[2.5rem_1fr_auto] items-center gap-3 px-5 py-4 border-b last:border-0 hover:bg-muted/20 transition-colors group"
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
            {capitalizeFirstLetter(price.client_name)}
          </p>
          <div className="flex gap-1 mt-1 flex-wrap">
            {teethCategories.map((t) => (
              <span key={t} className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${teethColors[t as string] || "bg-slate-500/10 text-slate-600 dark:text-slate-400"}`}>
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="text-right">
        <p className="text-xs text-muted-foreground tabular-nums">{formattedDate}</p>
      </div>
    </Link>
  )
}
