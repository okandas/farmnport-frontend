"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Menu } from "@/lib/schemas"
import { Checkbox } from "@/components/ui/checkbox"
import { MenuDropDown } from "@/components/structures/dropdowns/menu-dropdown"

export const menuColumns: ColumnDef<Menu>[] = [
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
    accessorKey: "note",
    header: "Note",
    cell: ({ row }) => row.original.note || "-",
  },
  {
    accessorKey: "locations",
    header: "Location",
    cell: ({ row }) => {
      const locations = row.original.locations
      if (!locations || locations.length === 0) return "-"
      if (locations.length === 1) {
        return <span className="capitalize">{locations[0].location_name}</span>
      }
      return (
        <span className="capitalize" title={locations.map((l) => l.location_name).join(", ")}>
          {locations[0].location_name}, {locations.length - 1}+
        </span>
      )
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <span className="capitalize">{row.original.status || "-"}</span>
    ),
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
    cell: ({ row }) => <MenuDropDown menu={row.original} />,
  },
]
