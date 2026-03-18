"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { SidebarNavigationGroup } from "@/types"

import { cn } from "@/lib/utilities"
import { Icons } from "@/components/icons/lucide"

interface SidebarNavigationProps {
  navigationGroups: SidebarNavigationGroup[]
}

export function SidebarNavigation({ navigationGroups }: SidebarNavigationProps) {
  const path = usePathname()

  return (
    <nav className="flex flex-col gap-6 py-2">
      {navigationGroups.map((group, groupIndex) => (
        <div key={groupIndex}>
          <h4 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {group.label}
          </h4>
          <div className="grid items-start gap-1">
            {group.items.map((navLink, index) => {
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
                      <Icon className="w-4 h-4 mr-2 shrink-0" />
                      <span>{navLink.title}</span>
                    </span>
                  </Link>
                )
              )
            })}
          </div>
        </div>
      ))}
    </nav>
  )
}
