"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import { BreedDropDown } from "@/components/structures/dropdowns/breed-dropdown"

export const breedColumns: ColumnDef<any>[] = [
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
    cell: ({ row }) => <span className="capitalize">{row.getValue("name")}</span>,
  },
  {
    accessorKey: "farm_produce",
    header: "Farm Produce",
    cell: ({ row }) => {
      const fp = row.original.farm_produce
      return <span className="capitalize">{fp?.name || "—"}</span>
    },
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => {
      const fp = row.original.farm_produce
      return <span className="text-muted-foreground capitalize">{fp?.category_slug?.replace(/-/g, " ") || "—"}</span>
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <BreedDropDown breed={row.original} />,
  },
]
