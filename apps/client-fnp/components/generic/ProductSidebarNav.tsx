"use client"

import { useRef } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronLeft, ChevronRight } from "lucide-react"

const CATEGORIES = [
  {
    label: "Bookings",
    href: "/bookings",
    subs: [],
  },
  {
    label: "Lots",
    href: "/lots",
    subs: [],
  },
  {
    label: "Agrochemicals",
    paths: ["/buy-agrochemicals", "/agrochemical-guides"],
    href: "/buy-agrochemicals",
    subs: [
      { label: "Insecticides", href: "/agrochemical-guides/insecticides" },
      { label: "Fungicides", href: "/agrochemical-guides/fungicides" },
      { label: "Herbicides", href: "/agrochemical-guides/herbicides" },
      { label: "Acaricides", href: "/agrochemical-guides/acaricides" },
      { label: "Nematicides", href: "/agrochemical-guides/nematicides" },
      { label: "Seed Treatments", href: "/agrochemical-guides/seed-treatments" },
      { label: "Foliar Feeds", href: "/agrochemical-guides/foliar-feeds" },
      { label: "Fertilizers", href: "/agrochemical-guides/fertilizers" },
      { label: "Spray Programs", href: "/spray-programs" },
    ],
  },
  {
    label: "Animal Health",
    paths: ["/buy-animal-health", "/animal-health-guides"],
    href: "/buy-animal-health",
    subs: [
      { label: "Antibiotics", href: "/animal-health-guides/antibiotics" },
      { label: "Vaccines", href: "/animal-health-guides/vaccines" },
      { label: "Tick & Flea Control", href: "/animal-health-guides/tick-flea-control" },
      { label: "Worm & Fluke Control", href: "/animal-health-guides/worm-fluke-control" },
      { label: "Nutrition & Supplements", href: "/animal-health-guides/nutrition-supplements" },
      { label: "Wound Remedies", href: "/animal-health-guides/wound-remedies" },
      { label: "Fly Control", href: "/animal-health-guides/fly-control" },
      { label: "Biosecurity & Disinfectants", href: "/animal-health-guides/biosecurity-disinfectants" },
      { label: "Rearing Programs", href: "/rearing-programs" },
    ],
  },
  {
    label: "Animal Feed",
    paths: ["/buy-feeds", "/feed-guides"],
    href: "/buy-feeds",
    subs: [
      { label: "Feed Guides", href: "/feed-guides" },
      { label: "Feeding Programs", href: "/feeding-programs" },
    ],
  },
  {
    label: "Equipment",
    paths: ["/buy-equipment", "/equipment-guides"],
    href: "/buy-equipment",
    subs: [
      { label: "Equipment Guides", href: "/equipment-guides" },
    ],
  },
  {
    label: "Plant Nutrition",
    paths: ["/buy-plant-nutrition", "/plant-nutrition-guides"],
    href: "/buy-plant-nutrition",
    subs: [
      { label: "Fertilizers", href: "/plant-nutrition-guides/fertilizers" },
      { label: "Foliar Feeds", href: "/plant-nutrition-guides/foliar-feeds" },
      { label: "Biostimulants", href: "/plant-nutrition-guides/biostimulants" },
      { label: "Plant Growth Regulators", href: "/plant-nutrition-guides/plant-growth-regulators" },
    ],
  },
  {
    label: "Seeds",
    paths: ["/buy-seed-products", "/seed-guides"],
    href: "/buy-seed-products",
    subs: [
      { label: "Seed Guides", href: "/seed-guides" },
    ],
  },
  {
    label: "Plans & Documents",
    href: "/buy-documents",
    subs: [],
  },
  {
    label: "Prices",
    href: "/prices",
    subs: [],
  },
  {
    label: "Buyers",
    href: "/buyers",
    subs: [],
  },
  {
    label: "Farmers",
    href: "/farmers",
    subs: [],
  },
]

function isActiveCategory(pathname: string, cat: typeof CATEGORIES[0]): boolean {
  if (pathname.startsWith(cat.href)) return true
  if ("paths" in cat && cat.paths) {
    return cat.paths.some((p) => pathname.startsWith(p))
  }
  return false
}

const BUY_ONLY_LABELS = new Set(["Bookings", "Lots", "Plans & Documents", "Prices", "Buyers", "Farmers"])

function isGuidePage(pathname: string): boolean {
  return pathname.includes("-guides") || pathname.startsWith("/spray-programs") || pathname.startsWith("/feeding-programs") || pathname.startsWith("/rearing-programs")
}

export function ProductSidebarNav() {
  const pathname = usePathname()
  const onGuidePage = isGuidePage(pathname)
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
      {/* Desktop: vertical sidebar with subcategories */}
      <nav className="hidden lg:flex flex-col gap-0.5">
        {CATEGORIES.filter((cat) => !onGuidePage || !BUY_ONLY_LABELS.has(cat.label)).map((cat) => {
          const isActive = isActiveCategory(pathname, cat)
          return (
            <div key={cat.label}>
              <Link
                href={cat.href}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors block ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {cat.label}
              </Link>
              {isActive && cat.subs.length > 0 && (
                <div className="ml-3 mt-0.5 flex flex-col gap-0.5">
                  {cat.subs.map((sub) => {
                    const isSubActive = pathname.startsWith(sub.href)
                    return (
                      <Link
                        key={sub.href}
                        href={sub.href}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors block ${
                          isSubActive
                            ? "text-primary bg-primary/5"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        }`}
                      >
                        {sub.label}
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {/* Mobile: horizontal scroll */}
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
          {CATEGORIES.filter((cat) => !onGuidePage || !BUY_ONLY_LABELS.has(cat.label)).map((cat) => {
            const isActive = isActiveCategory(pathname, cat)
            return (
              <Link
                key={cat.label}
                href={cat.href}
                className={`shrink-0 px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {cat.label}
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

      <div className="mt-4 border-t max-lg:hidden" />
    </div>
  )
}
