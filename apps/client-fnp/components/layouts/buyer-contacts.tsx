"use client"

import Link from "next/link"
import { BadgeCheck } from "lucide-react"

import { ApplicationUser, AuthenticatedUser } from "@/lib/schemas"
import { capitalizeFirstLetter, slug, titleCase } from "@/lib/utilities"
import { Badge } from "@/components/ui/badge"
import { Contacts } from "@/components/layouts/contacts"

interface BuyerContactsCardProps {
  buyer: ApplicationUser
  user: AuthenticatedUser | null
}

export function BuyerContactsCard({ buyer, user }: BuyerContactsCardProps) {
  return (
    <div className="flex gap-4 rounded-lg border bg-card p-4 hover:border-primary/30 hover:shadow-sm transition-all">
      <div className="hidden sm:flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-muted/30 text-muted-foreground text-lg font-bold">
        {buyer.name?.charAt(0)?.toUpperCase()}
      </div>
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
        <Contacts user={user} client={buyer} quickOverview={true} />
      </div>
    </div>
  )
}
