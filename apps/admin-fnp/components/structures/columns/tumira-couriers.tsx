"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"

export type TumiraCourier = {
  id: string
  name: string
  slug: string
  phone: string
  email: string
  type: string
  vehicle_type: string
  coverage_zones: string[]
  rating: number
  total_deliveries: number
  active: boolean
  verified: boolean
  created: string
}

export const tumiraCourierColumns: ColumnDef<TumiraCourier>[] = [
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
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "phone",
    header: "Phone",
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => (
      <span className="capitalize">{row.original.type || "-"}</span>
    ),
  },
  {
    accessorKey: "vehicle_type",
    header: "Vehicle",
    cell: ({ row }) => (
      <span className="capitalize">{row.original.vehicle_type?.replace(/_/g, " ") || "-"}</span>
    ),
  },
  {
    accessorKey: "rating",
    header: "Rating",
    cell: ({ row }) => (
      <span>{row.original.rating ? row.original.rating.toFixed(1) : "-"}</span>
    ),
  },
  {
    accessorKey: "total_deliveries",
    header: "Deliveries",
    cell: ({ row }) => (
      <span>{row.original.total_deliveries ?? 0}</span>
    ),
  },
  {
    accessorKey: "verified",
    header: "Verified",
    cell: ({ row }) => (
      <span>{row.original.verified ? "Yes" : "No"}</span>
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
