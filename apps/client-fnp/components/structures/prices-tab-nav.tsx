"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export function PricesTabNav() {
  const pathname = usePathname()
  const isHead = pathname === "/prices/head"

  return (
    <nav className="border-b bg-background sticky top-0 z-10">
      <div className="px-4 sm:px-6 lg:px-8 flex items-center gap-0">
        <Link
          href="/prices"
          className={`px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
            !isHead
              ? "border-foreground text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Per kg
        </Link>
        <Link
          href="/prices/head"
          className={`px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
            isHead
              ? "border-foreground text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Per Head
        </Link>
      </div>
    </nav>
  )
}
