"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Beaker, Heart, Egg, Leaf, FileText } from "lucide-react"

const BUY_CATEGORIES = [
  { label: "Agrochemicals", icon: Beaker, href: "/buy-agrochemicals" },
  { label: "Animal Health", icon: Heart, href: "/buy-animal-health" },
  { label: "Animal Feed", icon: Egg, href: "/buy-feeds" },
  { label: "Plant Nutrition", icon: Leaf, href: "/buy-plant-nutrition" },
  { label: "Plans & Documents", icon: FileText, href: "/buy-documents" },
]

export function BuyCategoriesNav() {
  const pathname = usePathname()

  return (
    <div className="mb-6">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
        Buy Categories
      </p>
      <nav className="flex flex-col gap-0.5">
        {BUY_CATEGORIES.map(({ label, icon: Icon, href }) => {
          const isActive = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>
      <div className="mt-4 border-t" />
    </div>
  )
}
