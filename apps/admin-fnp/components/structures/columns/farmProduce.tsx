"use client"

import { ColumnDef } from "@tanstack/react-table"
import { FarmProduce } from "@/lib/schemas"
import { Checkbox } from "@/components/ui/checkbox"

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
]
