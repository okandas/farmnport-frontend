"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { SidebarNavigationItem } from "@/types"

import { cn } from "@/lib/utilities"
import { Icons } from "@/components/icons/lucide"

interface SidebarNavigationProps {
  navigationLinks: SidebarNavigationItem[]
}

export function SidebarNavigation({ navigationLinks }: SidebarNavigationProps) {
  const path = usePathname()

  return (
    <nav className="grid items-start gap-2">
      {navigationLinks.map((navLink, index) => {
        const Icon = Icons[navLink.icon ?? "arrowRight"]
        return (
          navLink.href && (
            <Link key={index} href={navLink.disabled ? "/" : navLink.href}>
              <span
                className={cn(
                  "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                  path === navLink.href ? "bg-accent" : "transparent",
                  navLink.disabled && "cursor-not-allowed opacity-80"
                )}
              >
                <Icon className="w-4 h-4 mr-2" />
                <span>{navLink.title}</span>
              </span>
            </Link>
          )
        )
      })}
    </nav>
  )
}
