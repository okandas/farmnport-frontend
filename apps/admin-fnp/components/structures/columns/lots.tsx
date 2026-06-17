"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import { LotDropDown } from "@/components/structures/dropdowns/lot-dropdown"

function formatCents(cents: number) {
  if (!cents) return "Negotiable"
  return `$${(cents / 100).toFixed(2)}/kg`
}

function capitalizeFirst(s?: string) {
  if (!s) return "—"
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export const lotColumns: ColumnDef<any>[] = [
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
    accessorKey: "farm_produce",
    header: "Produce",
    cell: ({ row }) => (
      <span className="capitalize font-medium">{row.original.farm_produce?.name ?? "—"}</span>
    ),
  },
  {
    accessorKey: "breed",
    header: "Variety",
    cell: ({ row }) => (
      <span className="capitalize">{row.original.breed?.name ?? "—"}</span>
    ),
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => (
      <span className="capitalize">{row.original.type === "sell" ? "Selling" : "Buying"}</span>
    ),
  },
  {
    accessorKey: "form",
    header: "State",
    cell: ({ row }) => <span className="capitalize">{capitalizeFirst(row.original.form)}</span>,
  },
  {
    accessorKey: "quantity",
    header: "Quantity",
    cell: ({ row }) => <span>{row.original.quantity?.toLocaleString()} {row.original.unit}</span>,
  },
  {
    accessorKey: "price_per_unit_cents",
    header: "Price",
    cell: ({ row }) => <span>{formatCents(row.original.price_per_unit_cents)}/{row.original.unit}</span>,
  },
  {
    accessorKey: "province",
    header: "Location",
    cell: ({ row }) => (
      <span className="capitalize text-muted-foreground">
        {capitalizeFirst(row.original.province)}{row.original.city ? `, ${capitalizeFirst(row.original.city)}` : ""}
      </span>
    ),
  },
  {
    accessorKey: "moderated",
    header: "Status",
    cell: ({ row }) => (
      <span className={row.original.moderated ? "text-green-600 font-medium" : "text-amber-600 font-medium"}>
        {row.original.moderated ? "Live" : "Pending"}
      </span>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => <LotDropDown lot={row.original} />,
  },
]
