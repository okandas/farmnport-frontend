"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import { SeedProductDropDown } from "@/components/structures/dropdowns/seedProduct-dropdown"

export const seedProductColumns: ColumnDef<any>[] = [
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
    accessorKey: "farm_produce",
    header: "Farm Produce",
    cell: ({ row }) => {
      const fp = row.original.farm_produce
      return <span>{fp?.name || "—"}</span>
    },
  },
  {
    accessorKey: "breed_obj",
    header: "Variety",
    cell: ({ row }) => {
      const breed = row.original.breed_obj
      return <span>{breed?.name || "—"}</span>
    },
  },
  {
    accessorKey: "brand",
    header: "Brand",
    cell: ({ row }) => {
      const brand = row.original.brand
      return <span>{brand?.name || "—"}</span>
    },
  },
  {
    accessorKey: "available_for_sale",
    header: "For Sale",
    cell: ({ row }) => {
      const active = row.getValue("available_for_sale") as boolean
      return (
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${active ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" : "bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-400"}`}>
          {active ? "Active" : "Draft"}
        </span>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <SeedProductDropDown product={row.original} />,
  },
]
