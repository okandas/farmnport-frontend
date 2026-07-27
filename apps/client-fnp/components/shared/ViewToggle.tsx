"use client"

import { LayoutGrid, List } from "lucide-react"

interface ViewToggleProps {
  view: "grid" | "list"
  onViewChange: (view: "grid" | "list") => void
}

export function ViewToggle({ view, onViewChange }: ViewToggleProps) {
  return (
    <div className="flex items-center border rounded-md">
      <button
        onClick={() => onViewChange("grid")}
        className={`p-1.5 transition-colors ${view === "grid" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
        aria-label="Grid view"
      >
        <LayoutGrid className="h-4 w-4" />
      </button>
      <button
        onClick={() => onViewChange("list")}
        className={`p-1.5 transition-colors ${view === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
        aria-label="List view"
      >
        <List className="h-4 w-4" />
      </button>
    </div>
  )
}
