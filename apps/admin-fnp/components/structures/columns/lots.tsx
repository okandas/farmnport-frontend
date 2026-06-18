"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import { LotDropDown } from "@/components/structures/dropdowns/lot-dropdown"
import { centsToDollars } from "@/lib/utilities"

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
    accessorKey: "client_name",
    header: "Client",
    cell: ({ row }) => (
      <span className="capitalize font-medium">{row.original.client_name ?? "—"}</span>
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
      <span>{row.original.type === "sell"
        ? <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">Selling</span>
        : <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">Buying</span>
      }</span>
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
    cell: ({ row }) => <span>{row.original.price_per_unit_cents ? `${centsToDollars(row.original.price_per_unit_cents)}/${row.original.unit}` : "Negotiable"}</span>,
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
