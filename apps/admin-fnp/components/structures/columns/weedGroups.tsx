"use client"

import { ColumnDef } from "@tanstack/react-table"
import { WeedGroup } from "@/lib/schemas"
import { Checkbox } from "@/components/ui/checkbox"
import { formatDate } from "@/lib/utilities"
import { WeedGroupControlDropDown } from "@/components/structures/dropdowns/weedGroup-dropdown"

export const weedGroupColumns: ColumnDef<WeedGroup>[] = [
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
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => {
      const description = row.original.description
      return (
        <span className="max-w-md truncate">
          {description || "-"}
        </span>
      )
    },
  },
  {
    id: "targets",
    header: "Targets",
    cell: ({ row }) => {
      const count = row.original.target_ids?.length || 0
      return <span>{count} {count === 1 ? "target" : "targets"}</span>
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
      const weedGroup = row?.original
      return <WeedGroupControlDropDown weedGroup={weedGroup} />
    },
  },
]
