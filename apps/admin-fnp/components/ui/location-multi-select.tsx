"use client"

import { MapPin, X } from "lucide-react"
import Link from "next/link"
import { SearchSelect } from "@/components/ui/search-select"

export type SelectedLocation = { id: string; name: string }

/**
 * LocationMultiSelect — tag-based multi-select for locations.
 *
 * Wraps SearchSelect for the add-new-item input and renders selected
 * items as dismissible tags. allLocations is pre-fetched by the parent;
 * this component filters locally so no extra API calls are needed.
 */
export function LocationMultiSelect({
  allLocations,
  selected,
  onChange,
  queryKey,
}: {
  allLocations: { id: string; name: string; active: boolean }[]
  selected: SelectedLocation[]
  onChange: (locs: SelectedLocation[]) => void
  queryKey?: string
}) {
  const available = allLocations.filter(
    (l) => l.active && !selected.find((s) => s.id === l.id)
  )

  function add(loc: { id: string; name: string }) {
    onChange([...selected, { id: loc.id, name: loc.name }])
  }

  function remove(id: string) {
    onChange(selected.filter((s) => s.id !== id))
  }

  return (
    <div className="space-y-2">
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selected.map((loc) => (
            <span
              key={loc.id}
              className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
            >
              <MapPin className="w-3 h-3" />
              {loc.name}
              <button
                type="button"
                onClick={() => remove(loc.id)}
                className="hover:text-destructive ml-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      <SearchSelect
        queryKey={[queryKey ?? "location-multi-select", selected.map((s) => s.id).join(","), String(available.length)]}
        queryFn={({ search }) =>
          Promise.resolve({
            data: {
              data: available.filter(
                (l) => !search || l.name.toLowerCase().includes(search.toLowerCase())
              ),
              total: available.length,
            },
          })
        }
        getItems={(page) => page?.data?.data ?? []}
        value=""
        onValueChange={() => {}}
        onItemSelect={(loc) => add(loc)}
        getLabel={(l) => l.name}
        getValue={(l) => l.id}
        placeholder="Add location..."
        searchPlaceholder="Search locations..."
        capitalize
      />

      <p className="text-xs text-muted-foreground">
        Can&apos;t find a location?{" "}
        <Link
          href="/dashboard/farmnport/orders/client-locations/new"
          target="_blank"
          className="text-primary hover:underline"
        >
          Add new location
        </Link>
      </p>
    </div>
  )
}
