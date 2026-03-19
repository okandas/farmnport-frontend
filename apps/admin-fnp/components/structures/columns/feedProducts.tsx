"use client"

import { ColumnDef } from "@tanstack/react-table"
import { FeedProduct } from "@/lib/schemas"
import { Checkbox } from "@/components/ui/checkbox"
import { FeedProductControlDropDown } from "@/components/structures/dropdowns/feedProduct-dropdown"
import { formatDate } from "@/lib/utilities"

export const feedProductColumns: ColumnDef<FeedProduct>[] = [
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
    accessorKey: "brand.name",
    header: "Brand",
    cell: ({ row }) => {
      const brand = row.original.brand
      return <span>{brand?.name || "-"}</span>
    },
  },
  {
    accessorKey: "animal",
    header: "Animal",
  },
  {
    accessorKey: "phase",
    header: "Phase",
  },
  {
    accessorKey: "form",
    header: "Form",
  },
  {
    accessorKey: "sale_price",
    header: "Price",
    cell: ({ row }) => {
        const price = row.getValue("sale_price") as number
        return price > 0 ? `$${price.toFixed(2)}` : "—"
    },
  },
  {
    accessorKey: "stock_level",
    header: "Stock",
    cell: ({ row }) => {
        const stock = row.getValue("stock_level") as number
        return stock > 0 ? stock : "—"
    },
  },
  {
    accessorKey: "created",
    header: "Date Created",
    cell: ({ row }) => {
      const created = row.original.created
      return <span>{formatDate(created)}</span>
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const product = row?.original
      return <FeedProductControlDropDown product={product} />
    },
  },
]
