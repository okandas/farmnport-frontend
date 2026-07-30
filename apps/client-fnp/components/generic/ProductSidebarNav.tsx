"use client"

import { useRef } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface Category {
  label: string
  href: string
  paths?: string[]
  subs: { label: string; href: string }[]
}

const BUY_CATEGORIES: Category[] = [
  { label: "Bookings", href: "/bookings", subs: [] },
  { label: "Lots", href: "/lots", subs: [] },
  { label: "Agrochemicals", href: "/buy-agrochemicals", subs: [] },
  { label: "Animal Health", href: "/buy-animal-health", subs: [] },
  { label: "Animal Feed", href: "/buy-feeds", subs: [] },
  { label: "Equipment", href: "/buy-equipment", subs: [] },
  { label: "Plant Nutrition", href: "/buy-plant-nutrition", subs: [] },
  { label: "Seeds", href: "/buy-seed-products", subs: [] },
  { label: "Plans & Documents", href: "/buy-documents", subs: [] },
  { label: "Prices", href: "/prices", subs: [] },
  { label: "Buyers", href: "/buyers", subs: [] },
  { label: "Farmers", href: "/farmers", subs: [] },
]

const GUIDE_CATEGORIES: Category[] = [
  {
    label: "Agrochemicals",
    href: "/agrochemical-guides",
    subs: [
      { label: "Acaricides", href: "/agrochemical-guides/acaricides" },
      { label: "Fungicides", href: "/agrochemical-guides/fungicides" },
      { label: "Herbicides", href: "/agrochemical-guides/herbicides" },
      { label: "Insecticides", href: "/agrochemical-guides/insecticides" },
      { label: "Foliar Feeds", href: "/agrochemical-guides/foliar-feeds" },
      { label: "Seed Treatments", href: "/agrochemical-guides/seed-treatments" },
      { label: "Fertilizers", href: "/agrochemical-guides/fertilizers" },
      { label: "Nematicides", href: "/agrochemical-guides/nematicides" },
      { label: "Rodenticides", href: "/agrochemical-guides/rodenticides" },
      { label: "Suckercides", href: "/agrochemical-guides/suckercides" },
    ],
  },
  {
    label: "Plant Nutrition",
    href: "/plant-nutrition-guides",
    subs: [
      { label: "Fertilizers", href: "/plant-nutrition-guides/fertilizers" },
      { label: "Foliar Feeds", href: "/plant-nutrition-guides/foliar-feeds" },
      { label: "Biostimulants", href: "/plant-nutrition-guides/biostimulants" },
      { label: "Plant Growth Regulators", href: "/plant-nutrition-guides/plant-growth-regulators" },
      { label: "Adjuvants", href: "/plant-nutrition-guides/adjuvants" },
    ],
  },
  {
    label: "Animal Health",
    href: "/animal-health-guides",
    subs: [
      { label: "Antibiotics", href: "/animal-health-guides/antibiotics" },
      { label: "Vaccines", href: "/animal-health-guides/vaccines" },
      { label: "Tick & Flea Control", href: "/animal-health-guides/tick-flea-control" },
      { label: "Worm & Fluke Control", href: "/animal-health-guides/worm-fluke-control" },
      { label: "Nutrition & Supplements", href: "/animal-health-guides/nutrition-supplements" },
      { label: "Wound Remedies", href: "/animal-health-guides/wound-remedies" },
      { label: "Fly Control", href: "/animal-health-guides/fly-control" },
      { label: "Biosecurity & Disinfectants", href: "/animal-health-guides/biosecurity-disinfectants" },
    ],
  },
  { label: "Animal Nutrition", href: "/feed-guides", subs: [] },
  { label: "Seeds", href: "/seed-guides", subs: [] },
  { label: "Equipment", href: "/equipment-guides", subs: [] },
]

function isGuidePage(pathname: string): boolean {
  return pathname.includes("-guides") || pathname.startsWith("/spray-programs") || pathname.startsWith("/feeding-programs") || pathname.startsWith("/rearing-programs")
}

export function ProductSidebarNav() {
  const pathname = usePathname()
  const categories = isGuidePage(pathname) ? GUIDE_CATEGORIES : BUY_CATEGORIES
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
      <nav className="hidden lg:flex flex-col gap-0.5">
        {categories.map((cat) => {
          const isActive = pathname.startsWith(cat.href)
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
                  {cat.subs.map((sub) => (
                    <Link
                      key={sub.href}
                      href={sub.href}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors block ${
                        pathname.startsWith(sub.href)
                          ? "text-primary bg-primary/5"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      {sub.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </nav>

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
          {categories.map((cat) => (
            <Link
              key={cat.label}
              href={cat.href}
              className={`shrink-0 px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                pathname.startsWith(cat.href)
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {cat.label}
            </Link>
          ))}
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
