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
  return (
    <div>
      <div className="flex items-center gap-2 flex-wrap">
        <h4 className="text-lg hover:underline hover:decoration-2">
          <Link href={`/buyer/${slug(buyer.name)}`}>{titleCase(buyer.name)}</Link>
        </h4>
        {buyer.verified && (
          <BadgeCheck className="h-4 w-4 flex-shrink-0 text-green-700" aria-hidden="true" />
        )}
        {buyer.has_prices && (
          <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200 hover:bg-green-50 text-xs rounded-md">
            Pricing Available
          </Badge>
        )}
        {buyer.has_booking && (
          <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-50 text-xs rounded-md">
            Online Bookings
          </Badge>
        )}
      </div>

      {buyer.short_description && buyer.short_description.length > 0 && (
        <p className={`text-sm text-muted-foreground mt-0.5 ${buyer.short_description.toLowerCase().startsWith('note:') ? 'text-lime-700 dark:text-lime-500' : ''}`}>
          {capitalizeFirstLetter(buyer.short_description)}
        </p>
      )}

      <dl className="grid grid-cols-1 lg:grid-cols-2 text-sm leading-6 mt-1">
        {buyer.created && (
          <div className="flex gap-x-4 py-1 items-start self-start">
            <dt className="flex items-center gap-1 text-xs text-muted-foreground w-24 shrink-0 pt-0.5">
              <Icons.calender className="h-3.5 w-3.5 shrink-0" />
              Date Joined
            </dt>
            <dd className="text-sm font-medium leading-6">{formatDate(buyer.created)}</dd>
          </div>
        )}

        {buyer.primary_category && (
          <div className="flex gap-x-4 py-1 items-start self-start">
            <dt className="flex items-center gap-1 text-xs text-muted-foreground w-24 shrink-0 pt-0.5">
              <Icons.info className="h-3.5 w-3.5 shrink-0" />
              Category
            </dt>
            <dd className="text-sm font-medium leading-6">{capitalizeFirstLetter(buyer.primary_category.name)}</dd>
          </div>
        )}

        <div className="flex gap-x-4 py-1 items-start self-start">
          <dt className="flex items-center gap-1 text-xs text-muted-foreground w-24 shrink-0 pt-0.5">
            <Icons.map className="h-3.5 w-3.5 shrink-0" />
            Location
          </dt>
          <dd className="text-sm font-medium leading-6">
            {(() => {
              const city = buyer.city?.split(' ').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
              const province = buyer.province?.split(' ').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
              return city?.toLowerCase() === province?.toLowerCase() ? city : `${city}, ${province}`
            })()}
          </dd>
        </div>

        {(buyer.main_produce || (buyer.other_produce ?? []).length > 0) && (
          <div className="flex gap-x-4 py-1 items-start self-start">
            <dt className="flex items-center gap-1 text-xs text-muted-foreground w-24 shrink-0 pt-0.5">
              <Icons.tag className="h-3.5 w-3.5 shrink-0" />
              Buys
            </dt>
            <dd className="text-sm font-medium leading-6">
              {[buyer.main_produce, ...(buyer.other_produce ?? [])].filter(Boolean).map((p: any) => capitalizeFirstLetter(p.name)).join(', ')}
            </dd>
          </div>
        )}
      </dl>
    </div>
  )
}
