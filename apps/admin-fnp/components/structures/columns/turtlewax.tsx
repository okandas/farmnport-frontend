"use client"

import { ColumnDef } from "@tanstack/react-table"
import { TurtlewaxProductItem } from "@/lib/schemas"
import { Checkbox } from "@/components/ui/checkbox"
import { TurtlewaxProductControlDropDown } from "@/components/structures/dropdowns/turtlewax-dropdown"
import { formatDate, centsToDollars } from "@/lib/utilities"

export const turtlewaxProductColumns: ColumnDef<TurtlewaxProductItem>[] = [
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
    accessorKey: "sku",
    header: "SKU",
  },
  {
    accessorKey: "turtlewax_category",
    header: "Category",
    cell: ({ row }) => {
      const category = (row.original as any).turtlewax_category
      return <span>{category?.name || "-"}</span>
    },
  },
  {
    accessorKey: "sale_price",
    header: "Price",
    cell: ({ row }) => {
      const variants = row.original.variants as { name: string; sale_price: number }[] | undefined
      if (variants && variants.length > 0) {
        return (
          <div className="space-y-0.5">
            {variants.map((v, i) => (
              <div key={i} className="text-xs">
                <span className="text-muted-foreground">{v.name}:</span>{" "}
                {v.sale_price > 0 ? centsToDollars(v.sale_price) : "—"}
              </div>
            ))}
          </div>
        )
      }
      const price = row.getValue("sale_price") as number
      return price > 0 ? centsToDollars(price) : "—"
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
      return <TurtlewaxProductControlDropDown product={product} />
    },
  },
]
