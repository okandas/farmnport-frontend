"use client"

import { ColumnDef } from "@tanstack/react-table"
import { FarmProduce } from "@/lib/schemas"
import { Checkbox } from "@/components/ui/checkbox"
import { FarmProduceControlDropDown } from "@/components/structures/dropdowns/farm-produce-dropdown"

export const farmProduceColumns: ColumnDef<FarmProduce>[] = [
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
    accessorKey: "category_slug",
    header: "Category",
    cell: ({ row }) => {
      const categorySlug = row.getValue("category_slug") as string
      return (
        <span className="capitalize">
          {categorySlug.replace(/-/g, " ")}
        </span>
      )
    },
  },
  {
    accessorKey: "description",
    header: "Description",
  },
  {
    accessorKey: "lots_enabled",
    header: "Can Trade Lots",
    cell: ({ row }) => {
      const enabled = row.getValue("lots_enabled") as boolean
      return (
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${enabled ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" : "bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-400"}`}>
          {enabled ? "Yes" : "No"}
        </span>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <FarmProduceControlDropDown farmProduce={row.original} />,
  },
]
