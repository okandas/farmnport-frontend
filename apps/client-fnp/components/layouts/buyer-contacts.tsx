"use client"

import Link from "next/link"
import { BadgeCheck } from "lucide-react"

import { ApplicationUser } from "@/lib/schemas"
import { capitalizeFirstLetter, slug, titleCase, formatDate } from "@/lib/utilities"
import { Icons } from "@/components/icons/lucide"
import { Badge } from "@/components/ui/badge"

interface BuyerContactsCardProps {
  buyer: ApplicationUser
}

export function BuyerContactsCard({ buyer }: BuyerContactsCardProps) {
  const city = buyer.city?.split(' ').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
  const province = buyer.province?.split(' ').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
  const location = city?.toLowerCase() === province?.toLowerCase() ? city : `${city}, ${province}`
  const produces = [buyer.main_produce, ...(buyer.other_produce ?? [])].filter(Boolean).map((p: any) => capitalizeFirstLetter(p.name))

  return (
    <div className="flex gap-4 rounded-lg border bg-card p-4 hover:border-primary/30 hover:shadow-sm transition-all">
      {/* Left — avatar placeholder */}
      <div className="hidden sm:flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-muted/30 text-muted-foreground text-lg font-bold">
        {buyer.name?.charAt(0)?.toUpperCase()}
      </div>

      {/* Right — content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h4 className="text-sm font-semibold hover:text-primary transition-colors">
            <Link href={`/buyer/${slug(buyer.name)}`}>{titleCase(buyer.name)}</Link>
          </h4>
          {buyer.verified && (
            <BadgeCheck className="h-4 w-4 flex-shrink-0 text-green-700" aria-hidden="true" />
          )}
          {buyer.has_prices && (
            <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200 hover:bg-green-50 text-[10px] rounded-md">
              Pricing Available
            </Badge>
          )}
          {buyer.has_booking && (
            <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-50 text-[10px] rounded-md">
              Online Bookings
            </Badge>
          )}
        </div>

        {buyer.short_description && buyer.short_description.length > 0 && (
          <p className={`text-xs text-muted-foreground mt-1 line-clamp-2 ${buyer.short_description.toLowerCase().startsWith('note:') ? 'text-lime-700 dark:text-lime-500' : ''}`}>
            {capitalizeFirstLetter(buyer.short_description)}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground">
          {location && (
            <span className="flex items-center gap-1">
              <Icons.map className="h-3 w-3 shrink-0" />
              {location}
            </span>
          )}
          {buyer.primary_category && (
            <span className="flex items-center gap-1">
              <Icons.info className="h-3 w-3 shrink-0" />
              {capitalizeFirstLetter(buyer.primary_category.name)}
            </span>
          )}
          {buyer.created && (
            <span className="flex items-center gap-1">
              <Icons.calender className="h-3 w-3 shrink-0" />
              Joined {formatDate(buyer.created)}
            </span>
          )}
        </div>

        {produces.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {produces.slice(0, 6).map((p) => (
              <span key={p} className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                {p}
              </span>
            ))}
            {produces.length > 6 && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                +{produces.length - 6} more
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
