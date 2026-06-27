"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import { MapPin } from "lucide-react"

export type TumiraGeocodedAddress = {
  id: string
  address: string
  lat: number
  lng: number
  ward_code: string
  tumira_code: string
  confirmed_count: number
  created: string
}

export const tumiraGeocodedAddressColumns: ColumnDef<TumiraGeocodedAddress>[] = [
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
    accessorKey: "address",
    header: "Address",
    cell: ({ row }) => (
      <span className="text-sm">{row.original.address || "—"}</span>
    ),
  },
  {
    accessorKey: "ward_code",
    header: "Ward",
    cell: ({ row }) => (
      <span className="font-mono text-sm">{row.original.ward_code || "—"}</span>
    ),
  },
  {
    accessorKey: "tumira_code",
    header: "Tumira Code",
    cell: ({ row }) => (
      <span className="font-mono text-sm">{row.original.tumira_code || "—"}</span>
    ),
  },
  {
    id: "deliveries",
    header: "Deliveries",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">{row.original.confirmed_count ?? 0}</span>
    ),
  },
  {
    id: "gps",
    header: "GPS",
    cell: ({ row }) => {
      const { lat, lng } = row.original
      if (!lat || !lng) return <span className="text-muted-foreground text-sm">—</span>
      return (
        <a
          href={`https://www.google.com/maps?q=${lat},${lng}`}
          target="_blank"
          rel="noreferrer"
          className="text-blue-600 hover:text-blue-800"
        >
          <MapPin className="w-4 h-4" />
        </a>
      )
    },
  },
  {
    accessorKey: "created",
    header: "Cached",
    cell: ({ row }) => {
      const date = row.original.created
      if (!date) return "—"
      return new Date(date).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    },
  },
]
