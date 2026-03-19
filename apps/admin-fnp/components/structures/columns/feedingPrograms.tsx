"use client"

import { ColumnDef } from "@tanstack/react-table"
import { FeedingProgram } from "@/lib/schemas"
import { Checkbox } from "@/components/ui/checkbox"
import { FeedingProgramControlDropDown } from "@/components/structures/dropdowns/feedingProgram-dropdown"

export const feedingProgramColumns: ColumnDef<FeedingProgram>[] = [
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
    cell: ({ row }) => (
      <span className="capitalize">{row.original.name}</span>
    ),
  },
  {
    accessorKey: "farm_produce_name",
    header: "Animal",
    cell: ({ row }) => (
      <span className="capitalize">{row.original.farm_produce_name || "-"}</span>
    ),
  },
  {
    id: "stages",
    header: "Stages",
    cell: ({ row }) => (
      <span>{row.original.stages?.length || 0}</span>
    ),
  },
  {
    accessorKey: "published",
    header: "Status",
    cell: ({ row }) => (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        row.original.published
          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
          : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
      }`}>
        {row.original.published ? "Published" : "Draft"}
      </span>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const program = row?.original
      return <FeedingProgramControlDropDown program={program} />
    },
  },
]
