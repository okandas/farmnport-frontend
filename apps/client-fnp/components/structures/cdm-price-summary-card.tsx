"use client"

import Link from "next/link"
import { formatDate, capitalizeFirstLetter, slug } from "@/lib/utilities"
import { ArrowRight, Calendar } from "lucide-react"
import { CdmPrice } from "@/lib/schemas"

interface CdmPriceSummaryCardProps {
  price: CdmPrice
}

export function CdmPriceSummaryCard({ price }: CdmPriceSummaryCardProps) {
  const formattedDate = formatDate(price.effectiveDate)
  const dateSlug = new Date(price.effectiveDate).toISOString().split('T')[0]
  const nameSlug = slug(price.client_name)
  const priceSlug = `${nameSlug}-${dateSlug}`

  const teethCategories = price.liveweight
    ? [...new Set(price.liveweight.map((lw) => lw.teeth).filter(Boolean))]
    : []

  const teethColors: Record<string, string> = {
    "MT": "bg-emerald-50 text-emerald-700 ring-emerald-600/10 dark:bg-emerald-950/30 dark:text-emerald-400",
    "2T": "bg-blue-50 text-blue-700 ring-blue-600/10 dark:bg-blue-950/30 dark:text-blue-400",
    "4T": "bg-violet-50 text-violet-700 ring-violet-600/10 dark:bg-violet-950/30 dark:text-violet-400",
    "6T": "bg-amber-50 text-amber-700 ring-amber-600/10 dark:bg-amber-950/30 dark:text-amber-400",
    "8T": "bg-orange-50 text-orange-700 ring-orange-600/10 dark:bg-orange-950/30 dark:text-orange-400",
  }

  return (
    <Link href={`/prices/cdm/${priceSlug}`} className="block group">
      <div className="flex items-center justify-between gap-3 py-3 px-1 hover:bg-muted/30 transition-colors">
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
            {capitalizeFirstLetter(price.client_name)}
          </h3>
          <div className="flex items-center gap-1.5 mt-0.5 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3 shrink-0" />
            <span>{formattedDate}</span>
          </div>
          {teethCategories.length > 0 && (
            <div className="flex gap-1 mt-1.5">
              {teethCategories.map((t) => (
                <span key={t} className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-medium ring-1 ring-inset ${teethColors[t] || "bg-slate-50 text-slate-700 ring-slate-600/10 dark:bg-slate-950/30 dark:text-slate-400"}`}>
                  {t}
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
