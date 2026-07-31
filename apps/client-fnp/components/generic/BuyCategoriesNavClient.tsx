"use client"

import { useRef } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface BuyCategoriesNavClientProps {
  categories: { label: string; href: string }[]
}

export function BuyCategoriesNavClient({ categories }: BuyCategoriesNavClientProps) {
  const pathname = usePathname()
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return
    scrollRef.current.scrollBy({
      left: direction === "left" ? -200 : 200,
      behavior: "smooth",
    })
  }

  return (
    <div className="mb-6 lg:mb-6">
      {/* Desktop: vertical sidebar */}
      <nav className="hidden lg:flex flex-col gap-0.5">
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

      {/* Mobile: hidden — categories accessible via mobile nav Buy group */}

      <div className="mt-4 border-t max-lg:hidden" />
    </div>
  )
}
