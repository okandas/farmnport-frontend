"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"

export type TumiraWard = {
  id: string
  ward_code: string
  name: string
  district_name: string
  province_name: string
  delivery_tier: string
  active: boolean
  created: string
}

export const tumiraWardColumns: ColumnDef<TumiraWard>[] = [
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
    accessorKey: "ward_code",
    header: "Code",
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "district_name",
    header: "District",
  },
  {
    accessorKey: "province_name",
    header: "Province",
  },
  {
    accessorKey: "delivery_tier",
    header: "Tier",
    cell: ({ row }) => (
      <span className="capitalize">{row.original.delivery_tier || "-"}</span>
    ),
  },
  {
    accessorKey: "active",
    header: "Active",
    cell: ({ row }) => (
      <span>{row.original.active ? "Yes" : "No"}</span>
    ),
  },
  {
    accessorKey: "created",
    header: "Date Added",
    cell: ({ row }) => {
      const date = row.original.created
      if (!date) return "-"
      return new Date(date).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    },
  },
]
