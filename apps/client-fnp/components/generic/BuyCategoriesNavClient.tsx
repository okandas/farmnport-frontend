"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

interface BuyCategoriesNavClientProps {
  categories: { label: string; href: string }[]
}

export function BuyCategoriesNavClient({ categories }: BuyCategoriesNavClientProps) {
  const pathname = usePathname()

  return (
    <div className="mb-6">
      <nav className="flex flex-col gap-0.5">
        {categories.map(({ label, href }) => {
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
