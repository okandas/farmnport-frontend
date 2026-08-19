"use client"

import { ColumnDef } from "@tanstack/react-table"
import { AgroChemicalItem } from "@/lib/schemas"
import { Checkbox } from "@/components/ui/checkbox"
import { AgroChemicalControlDropDown } from "@/components/structures/dropdowns/agroChemical-dropdown"
import { formatDate, centsToDollars } from "@/lib/utilities"

export const agroChemicalColumns: ColumnDef<AgroChemicalItem>[] = [
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
    cell: ({ row }) => {
      const images = (row.original as any).images as { img: { src: string } }[] | undefined
      const src = images && images.length > 0 ? images[0].img.src : null
      return (
        <div className="flex items-center gap-3">
          {src ? (
            <img src={src} alt="" className="w-10 h-10 rounded object-cover shrink-0" />
          ) : (
            <div className="w-10 h-10 rounded bg-muted/30 shrink-0" />
          )}
          <span className="capitalize">{row.getValue("name") as string}</span>
        </div>
      )
    },
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
    accessorKey: "sale_price",
    header: "Price",
    cell: ({ row }) => {
      const variants = (row.original as any).variants as { name: string; sale_price: number }[] | undefined
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
      return <AgroChemicalControlDropDown product={product} />
    },
  },
]
