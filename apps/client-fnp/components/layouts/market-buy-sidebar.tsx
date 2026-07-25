"use client"

import { usePathname } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import Link from "next/link"

import { queryLots } from "@/lib/query"
import { BuyCategoriesNavClient } from "@/components/generic/BuyCategoriesNavClient"

interface MarketBuySidebarProps {
  categories: { label: string; href: string }[]
}

export function MarketBuySidebar({ categories }: MarketBuySidebarProps) {
  const pathname = usePathname()

  const { data } = useQuery({
    queryKey: ["lots-pending"],
    queryFn: () => queryLots({ p: 1 }),
    refetchOnWindowFocus: false,
  })

  const pending = (data?.data as any)?.pending ?? 0

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">Listing Type</p>
        <div className="space-y-1">
          {[
            { label: "All Lots", href: "/lots" },
            { label: "Selling", href: "/lots/selling" },
            { label: "Buying", href: "/lots/buying" },
            ...(pending > 0 ? [{ label: "Upcoming", href: "/lots/upcoming", count: pending }] : []),
          ].map(({ label, href, count }: { label: string; href: string; count?: number }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center justify-between text-sm px-2 py-1.5 rounded-md transition-colors ${
                pathname === href
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-foreground hover:bg-muted"
              }`}
            >
              <span>{label}</span>
              {count !== undefined && (
                <span className="text-xs text-muted-foreground">{count}</span>
              )}
            </Link>
          ))}
        </div>
      </div>

      <BuyCategoriesNavClient categories={categories} />
    </div>
  )
}
