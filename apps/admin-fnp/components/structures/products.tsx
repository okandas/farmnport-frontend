"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ProductItem } from "@/lib/schemas"
import { Checkbox } from "@/components/ui/checkbox"
import { ProductControlDropDown } from "@/components/structures/product-dropdown"

export const productColums: ColumnDef<ProductItem>[] = [
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
    id: "actions",
    cell: ({ row }) => {
      const product = row?.original
      return <ProductControlDropDown product={product} />
    },
  },
]
