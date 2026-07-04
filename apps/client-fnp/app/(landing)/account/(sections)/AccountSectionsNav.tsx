"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useRef } from "react"
import { ChevronLeft, ChevronRight, Info } from "lucide-react"

export type NavItem = { label: string; href: string; tooltip?: string }

export default function AccountSectionsNav({
  items,
  children,
}: {
  items: NavItem[]
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const scrollRef = useRef<HTMLDivElement>(null)

  function scroll(dir: "left" | "right") {
    scrollRef.current?.scrollBy({ left: dir === "left" ? -160 : 160, behavior: "smooth" })
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Mobile nav — scrollable pills */}
      <div className="lg:hidden border-b -mx-4 px-4 sm:-mx-6 sm:px-6">
        <div className="relative flex items-center">
          <button
            onClick={() => scroll("left")}
            className="absolute -left-1 z-10 flex items-center justify-center h-8 w-8 rounded-full border bg-background shadow-sm hover:bg-muted transition-colors"
          >
            <ChevronLeft className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          </button>
          <div ref={scrollRef} className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-3 px-8">
            {items.map(({ label, href, tooltip }) => {
              const active = pathname === href || pathname.startsWith(href + "/")
              return (
                <Link
                  key={href}
                  href={href}
                  className={`shrink-0 px-4 py-2 rounded-lg border text-sm font-medium transition-colors whitespace-nowrap inline-flex items-center gap-1.5 ${
                    active
                      ? "bg-primary text-primary-foreground border-primary"
                      : "text-muted-foreground border-border hover:bg-primary hover:text-primary-foreground hover:border-primary"
                  }`}
                >
                  {label}
                  {tooltip && <span className="relative group"><Info className="w-3.5 h-3.5 opacity-60" /><span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-56 rounded-md bg-popover border border-border p-2 text-xs text-popover-foreground font-normal shadow-md z-50 whitespace-normal">{tooltip}</span></span>}
                </Link>
              )
            })}
          </div>
          <button
            onClick={() => scroll("right")}
            className="absolute -right-1 z-10 flex items-center justify-center h-8 w-8 rounded-full border bg-background shadow-sm hover:bg-muted transition-colors"
          >
            <ChevronRight className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-56 shrink-0">
        <nav className="flex flex-col">
          {items.map(({ label, href, tooltip }) => {
            const active = pathname === href || pathname.startsWith(href + "/")
            return (
              <Link
                key={href}
                href={href}
                className={`w-full text-left px-3 py-2.5 text-sm font-medium transition-colors whitespace-nowrap inline-flex items-center gap-1.5 ${
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {label}
                {tooltip && <span className="relative group"><Info className="w-3.5 h-3.5 opacity-60" /><span className="absolute left-full top-1/2 -translate-y-1/2 ml-2 hidden group-hover:block w-56 rounded-md bg-popover border border-border p-2 text-xs text-popover-foreground font-normal shadow-md z-50 whitespace-normal">{tooltip}</span></span>}
              </Link>
            )
          })}
        </nav>
      </aside>

      <main className="flex-1 min-w-0">{children}</main>
    </div>
  )
}
