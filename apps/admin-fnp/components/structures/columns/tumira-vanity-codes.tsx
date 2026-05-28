"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"

export type TumiraVanityCode = {
  id: string
  ward_code: string
  display: string
  tier: number
  price_cents: number
  state: string
  business_name: string
  claimed_at: string
  created: string
}

export const tumiraVanityCodeColumns: ColumnDef<TumiraVanityCode>[] = [
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
    id: "code",
    header: "Code",
    cell: ({ row }) => (
      <span className="font-mono text-sm">{row.original.ward_code} {row.original.display}</span>
    ),
  },
  {
    accessorKey: "tier",
    header: "Tier",
    cell: ({ row }) => (
      <span>Tier {row.original.tier}</span>
    ),
  },
  {
    accessorKey: "price_cents",
    header: "Price",
    cell: ({ row }) => (
      <span>${(row.original.price_cents / 100).toFixed(2)}</span>
    ),
  },
  {
    accessorKey: "state",
    header: "State",
    cell: ({ row }) => (
      <span className="capitalize">{row.original.state || "-"}</span>
    ),
  },
  {
    accessorKey: "business_name",
    header: "Business",
    cell: ({ row }) => (
      <span>{row.original.business_name || "-"}</span>
    ),
  },
  {
    accessorKey: "claimed_at",
    header: "Claimed",
    cell: ({ row }) => {
      const date = row.original.claimed_at
      if (!date) return "-"
      return new Date(date).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    },
  },
]
