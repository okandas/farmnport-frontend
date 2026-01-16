"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Brand } from "@/lib/schemas"
import { Checkbox } from "@/components/ui/checkbox"
import { BrandControlDropDown } from "@/components/structures/dropdowns/brand-dropdown"

export const brandColumns: ColumnDef<Brand>[] = [
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
    accessorKey: "slogan",
    header: "Slogan",
    cell: ({ row }) => (
      <span className="max-w-md truncate">
        {row.original.slogan || "-"}
      </span>
    ),
  },
  {
    accessorKey: "slug",
    header: "Slug",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const brand = row?.original
      return <BrandControlDropDown brand={brand} />
    },
  },
]
