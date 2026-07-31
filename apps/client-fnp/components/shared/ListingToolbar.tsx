"use client"

import { ViewToggle } from "@/components/shared/ViewToggle"

interface ListingToolbarProps {
  view: "grid" | "list"
  onViewChange: (view: "grid" | "list") => void
  filterSlot: React.ReactNode
  count?: { showing: number; total: number }
}

export function ListingToolbar({ view, onViewChange, filterSlot, count }: ListingToolbarProps) {
  return (
    <>
      {/* Mobile: filter + view toggle on one row */}
      <div className="flex items-center justify-between mb-4 lg:hidden">
        {filterSlot}
        <ViewToggle view={view} onViewChange={onViewChange} />
      </div>

      {/* Desktop: view toggle aligned right (filter is in the sidebar) */}
      <div className="hidden lg:flex items-center justify-between mb-4">
        {count ? (
          <span className="text-sm text-muted-foreground">
            Showing {count.showing} of {count.total} products
          </span>
        ) : <span />}
        <ViewToggle view={view} onViewChange={onViewChange} />
      </div>
    </>
  )
}
