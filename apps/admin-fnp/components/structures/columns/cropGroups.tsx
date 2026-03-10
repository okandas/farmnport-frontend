"use client"

import { ColumnDef } from "@tanstack/react-table"
import { CropGroup } from "@/lib/schemas"
import { Checkbox } from "@/components/ui/checkbox"
import { formatDate } from "@/lib/utilities"
import { CropGroupControlDropDown } from "@/components/structures/dropdowns/cropGroup-dropdown"

export const cropGroupColumns: ColumnDef<CropGroup>[] = [
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
    id: "crops",
    header: "Crops",
    cell: ({ row }) => {
      const count = row.original.farm_produce_ids?.length || 0
      return <span>{count} {count === 1 ? "crop" : "crops"}</span>
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
      const cropGroup = row?.original
      return <CropGroupControlDropDown cropGroup={cropGroup} />
    },
  },
]
