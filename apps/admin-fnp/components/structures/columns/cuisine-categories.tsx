"use client"

import { ColumnDef } from "@tanstack/react-table"
import { CuisineCategory } from "@/lib/schemas"
import { Checkbox } from "@/components/ui/checkbox"
import { CuisineCategoryDropDown } from "@/components/structures/dropdowns/cuisine-category-dropdown"

export const cuisineCategoryColumns: ColumnDef<CuisineCategory>[] = [
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
      return <span className="capitalize">{row.original.name}</span>
    },
  },
  {
    accessorKey: "slug",
    header: "Slug",
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
    cell: ({ row }) => <CuisineCategoryDropDown category={row.original} />,
  },
]
