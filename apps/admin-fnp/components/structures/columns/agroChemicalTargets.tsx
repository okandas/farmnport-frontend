"use client"

import { ColumnDef } from "@tanstack/react-table"
import { AgroChemicalTarget } from "@/lib/schemas"
import { Checkbox } from "@/components/ui/checkbox"
import { formatDate } from "@/lib/utilities"
import { AgroChemicalTargetControlDropDown } from "@/components/structures/dropdowns/agroChemicalTarget-dropdown"

export const agroChemicalTargetColumns: ColumnDef<AgroChemicalTarget>[] = [
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
    accessorKey: "scientific_name",
    header: "Scientific Name",
    cell: ({ row }) => (
      <span className="max-w-md truncate">
        {row.original.scientific_name || "-"}
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
  {
    id: "actions",
    cell: ({ row }) => {
      const target = row?.original
      return <AgroChemicalTargetControlDropDown target={target} />
    },
  },
]
