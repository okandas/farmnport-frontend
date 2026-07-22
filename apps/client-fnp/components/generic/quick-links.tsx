"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const LINKS = [
  { label: "Bookings", href: "/bookings" },
  { label: "Lots", href: "/lots" },
  { label: "Prices", href: "/prices" },
]

export function QuickLinks() {
  const pathname = usePathname()

  const visible = LINKS.filter((l) => l.href !== pathname && !pathname.startsWith(l.href + "/"))

  if (visible.length === 0) return null

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">Quick Links</p>
      <div className="space-y-1">
        {visible.map(({ label, href }) => (
          <Link
            key={href}
            href={href}
            className="block text-sm text-foreground hover:text-primary transition-colors py-1"
          >
            {label}
          </Link>
        ))}
      </div>
    </div>
  )
}
