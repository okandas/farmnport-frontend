"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"

export type TumiraDeliveryPoint = {
  id: string
  tumira_code: string
  ward_code: string
  label: string
  state: string
  coordinates?: { coordinates: [number, number] } // [lng, lat]
  note: string
  created: string
}

export const tumiraDeliveryPointColumns: ColumnDef<TumiraDeliveryPoint>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "label",
    header: "Label",
    cell: ({ row }) => (
      <span>{row.original.label || "-"}</span>
    ),
  },
  {
    id: "town",
    header: "Town",
    cell: ({ row }) => {
      if (!row.original.tumira_code) return <span className="text-muted-foreground">—</span>
      const town = (row.original.ward_code || "").replace(/\d+$/, "")
      return <span className="font-mono text-sm">{town || "—"}</span>
    },
  },
  {
    accessorKey: "ward_code",
    header: "Ward",
    cell: ({ row }) => {
      if (!row.original.tumira_code) return <span className="text-muted-foreground">—</span>
      return <span className="font-mono text-sm">{row.original.ward_code}</span>
    },
  },
  {
    accessorKey: "tumira_code",
    header: "Tumira Code",
    cell: ({ row }) => {
      if (!row.original.tumira_code) return <span className="text-muted-foreground">—</span>
      return <span className="font-mono text-sm">{row.original.tumira_code}</span>
    },
  },
  {
    accessorKey: "coordinates",
    header: "GPS",
    cell: ({ row }) => {
      const coords = row.original.coordinates?.coordinates
      if (!coords) return <span className="text-muted-foreground text-sm">—</span>
      const [lng, lat] = coords
      if (lat === 0 && lng === 0) return <span className="text-muted-foreground text-sm">—</span>
      const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
      return (
        <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="3 11 22 2 13 21 11 13 3 11" />
          </svg>
        </a>
      )
    },
  },
  {
    accessorKey: "state",
    header: "State",
    cell: ({ row }) => (
      <span className="capitalize">{row.original.state || "-"}</span>
    ),
  },
  {
    accessorKey: "created",
    header: "Courier Count",
    cell: () => <span className="text-muted-foreground text-sm">—</span>,
  },
]
