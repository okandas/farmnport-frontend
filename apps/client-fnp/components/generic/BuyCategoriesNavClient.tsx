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
    <div className="mb-6 lg:mb-0">
      {/* Desktop: vertical sidebar */}
      <nav className="hidden lg:block">
        <h3 className="text-sm font-bold mb-3">Refine by Category</h3>
        <Link
          href="/buy"
          className={`flex items-center gap-1.5 px-3 py-2 text-sm transition-colors ${
            pathname === "/buy"
              ? "font-semibold text-primary border-l-2 border-primary bg-primary/5"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {pathname !== "/buy" && <ChevronLeft className="h-3 w-3" />}
          All Categories
        </Link>
        <div className="mt-1 space-y-0.5">
          {categories.map(({ label, href }) => {
            const isActive = pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className={`block px-3 py-1.5 text-sm transition-colors ${
                  isActive
                    ? "font-semibold text-primary border-l-2 border-primary bg-primary/5"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                {label}
              </Link>
            )
          })}
        </div>
        <div className="mt-4 border-t" />
      </nav>

      {/* Mobile: horizontal scroll with chevron buttons */}
      <div className="lg:hidden relative flex items-center">
        <button
          onClick={() => scroll("left")}
          className="absolute -left-1 z-10 flex items-center justify-center h-8 w-8 rounded-full bg-background shadow-sm hover:bg-muted transition-colors"
        >
          <ChevronLeft className="h-4 w-4 text-muted-foreground" />
        </button>

        <div
          ref={scrollRef}
          className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-3 px-8"
        >
          {categories.map(({ label, href }) => {
            const isActive = pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className={`shrink-0 px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {label}
              </Link>
            )
          })}
        </div>

        <button
          onClick={() => scroll("right")}
          className="absolute -right-1 z-10 flex items-center justify-center h-8 w-8 rounded-full bg-background shadow-sm hover:bg-muted transition-colors"
        >
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>
    </div>
  )
}
