"use client"

import { ColumnDef } from "@tanstack/react-table"
import { AnimalHealthTarget } from "@/lib/schemas"
import { Checkbox } from "@/components/ui/checkbox"
import { formatDate } from "@/lib/utilities"
import { AnimalHealthTargetControlDropDown } from "@/components/structures/dropdowns/animalHealthTarget-dropdown"

export const animalHealthTargetColumns: ColumnDef<AnimalHealthTarget>[] = [
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
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => (
      <div className="max-w-xs block truncate" title={row.original.description || ""}>
        {row.original.description || "-"}
      </div>
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
      return <AnimalHealthTargetControlDropDown target={target} />
    },
  },
]
