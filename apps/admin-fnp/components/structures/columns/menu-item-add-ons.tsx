"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MenuItemAddOn } from "@/lib/schemas"
import { centsToDollars } from "@/lib/utilities"
import { Checkbox } from "@/components/ui/checkbox"
import { MenuItemAddOnDropDown } from "@/components/structures/dropdowns/menu-item-add-on-dropdown"

export const menuItemAddOnColumns: ColumnDef<MenuItemAddOn>[] = [
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
    accessorKey: "menu_name",
    header: "Menu",
    cell: ({ row }) => (
      <span className="capitalize">{row.original.menu_name || "-"}</span>
    ),
  },
  {
    accessorKey: "category_name",
    header: "Category",
    cell: ({ row }) => (
      <span className="capitalize">{row.original.category_name || "-"}</span>
    ),
  },
  {
    accessorKey: "price_cents",
    header: "Price",
    cell: ({ row }) => centsToDollars(row.original.price_cents || 0),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const s = row.original.status
      if (!s) return "-"
      const isActive = s === "active"
      return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
          isActive
            ? "bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20 dark:bg-green-500/10 dark:text-green-400 dark:ring-green-500/20"
            : "bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/10 dark:bg-red-400/10 dark:text-red-400 dark:ring-red-400/20"
        }`}>
          {s}
        </span>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <MenuItemAddOnDropDown addOn={row.original} />,
  },
]
