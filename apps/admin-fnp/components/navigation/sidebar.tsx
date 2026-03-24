"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronDown } from "lucide-react"
import { SidebarNavigationGroup } from "@/types"

import { cn } from "@/lib/utilities"
import { Icons } from "@/components/icons/lucide"

interface SidebarNavigationProps {
  navigationGroups: SidebarNavigationGroup[]
}

export function SidebarNavigation({ navigationGroups }: SidebarNavigationProps) {
  const path = usePathname()

  const isActive = (href: string) =>
    path === href || (href !== "/dashboard" && path.startsWith(href))

  // Auto-expand the group that contains the active route
  const initialOpen = navigationGroups.reduce<Record<number, boolean>>(
    (acc, group, index) => {
      const hasActiveItem = group.items.some(
        (item) => item.href && isActive(item.href)
      )
      acc[index] = hasActiveItem || group.items.length <= 1
      return acc
    },
    {}
  )

  const [openGroups, setOpenGroups] = useState<Record<number, boolean>>(initialOpen)

  // Open the active group, close the rest
  useEffect(() => {
    const next: Record<number, boolean> = {}
    navigationGroups.forEach((group, index) => {
      const hasActiveItem = group.items.some(
        (item) => item.href && isActive(item.href)
      )
      next[index] = hasActiveItem || group.items.length <= 1
    })
    setOpenGroups(next)
  }, [path])

  const toggleGroup = (index: number) => {
    setOpenGroups((prev) => ({ ...prev, [index]: !prev[index] }))
  }

  return (
    <nav className="flex flex-col gap-1 py-2">
      {navigationGroups.map((group, groupIndex) => {
        const isSingleItem = group.items.length <= 1
        const isOpen = openGroups[groupIndex] ?? false

        return (
          <div key={groupIndex}>
            {isSingleItem ? (
              <h4 className="mb-1 mt-3 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {group.label}
              </h4>
            ) : (
              <button
                onClick={() => toggleGroup(groupIndex)}
                className="flex w-full items-center justify-between mt-3 mb-1 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
              >
                {group.label}
                <ChevronDown
                  className={cn(
                    "h-3.5 w-3.5 transition-transform",
                    !isOpen && "-rotate-90"
                  )}
                />
              </button>
            )}
            {(isSingleItem || isOpen) && (
              <div className="grid items-start gap-0.5">
                {group.items.map((navLink, index) => {
                  const Icon = Icons[navLink.icon ?? "arrowRight"]
                  return (
                    navLink.href && (
                      <Link key={index} href={navLink.disabled ? "/" : navLink.href}>
                        <span
                          className={cn(
                            "group flex items-center rounded-md px-3 py-1.5 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                            navLink.href && isActive(navLink.href) ? "bg-accent" : "transparent",
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
            )}
          </div>
        )
      })}
    </nav>
  )
}
