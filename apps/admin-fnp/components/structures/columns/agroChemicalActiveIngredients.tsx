"use client"

import { ColumnDef } from "@tanstack/react-table"
import { AgroChemicalActiveIngredient } from "@/lib/schemas"
import { Checkbox } from "@/components/ui/checkbox"
import { formatDate } from "@/lib/utilities"

export const agroChemicalActiveIngredientColumns: ColumnDef<AgroChemicalActiveIngredient>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
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
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => (
      <span className="max-w-md truncate">
        {row.original.description || "-"}
      </span>
    ),
  },
  {
    accessorKey: "created",
    header: "Date Created",
    cell: ({ row }) => (
      <span>{formatDate(row.original.created)}</span>
    ),
  },
]
