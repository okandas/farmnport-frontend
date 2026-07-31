"use client"

import { LayoutGrid, List } from "lucide-react"

interface ViewToggleProps {
  view: "grid" | "list"
  onViewChange: (view: "grid" | "list") => void
}

export function ViewToggle({ view, onViewChange }: ViewToggleProps) {
  return (
    <button
      onClick={() => onViewChange(view === "grid" ? "list" : "grid")}
      className="p-1.5 border rounded-md text-muted-foreground hover:text-foreground transition-colors"
      aria-label={view === "grid" ? "Switch to list view" : "Switch to grid view"}
    >
      {view === "grid" ? <List className="h-4 w-4" /> : <LayoutGrid className="h-4 w-4" />}
    </button>
  )
}
