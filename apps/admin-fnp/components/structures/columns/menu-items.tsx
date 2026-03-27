"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MenuItem } from "@/lib/schemas"
import { centsToDollars } from "@/lib/utilities"
import { Checkbox } from "@/components/ui/checkbox"
import { MenuItemDropDown } from "@/components/structures/dropdowns/menu-item-dropdown"

export const menuItemColumns: ColumnDef<MenuItem>[] = [
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
    accessorKey: "price_cents",
    header: "Price",
    cell: ({ row }) => centsToDollars(row.original.price_cents || 0),
  },
  {
    accessorKey: "category_name",
    header: "Category",
  },
  {
    accessorKey: "composition",
    header: "Composition",
    cell: ({ row }) => {
      const composition = row.original.composition
      if (!composition || composition.length === 0) return "-"
      return composition.map(c => c.component_name).join(", ")
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <span className="capitalize">{row.original.status || "-"}</span>
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
  {
    id: "actions",
    cell: ({ row }) => <MenuItemDropDown menuItem={row.original} />,
  },
]
