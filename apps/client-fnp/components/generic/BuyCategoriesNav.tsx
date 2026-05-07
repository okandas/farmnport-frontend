"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const BUY_CATEGORIES = [
  { label: "Pre-Orders", href: "/bookings" },
  { label: "Agrochemicals", href: "/buy-agrochemicals" },
  { label: "Animal Health", href: "/buy-animal-health" },
  { label: "Animal Feed", href: "/buy-feeds" },
  { label: "Plant Nutrition", href: "/buy-plant-nutrition" },
  { label: "Plans & Documents", href: "/buy-documents" },
]

export function BuyCategoriesNav() {
  const pathname = usePathname()

  return (
    <div className="mb-6">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
        Buy Categories
      </p>
      <nav className="flex flex-col gap-0.5">
        {BUY_CATEGORIES.map(({ label, href }) => {
          const isActive = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {label}
            </Link>
          )
        })}
      </nav>
      <div className="mt-4 border-t" />
    </div>
  )
}
