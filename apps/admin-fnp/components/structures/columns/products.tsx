"use client"

import { ColumnDef } from "@tanstack/react-table"
import { AgroChemicalItem } from "@/lib/schemas"
import { Checkbox } from "@/components/ui/checkbox"
import { AgroChemicalControlDropDown } from "@/components/structures/dropdowns/agroChemical-dropdown"

export const agroChemicalColumns: ColumnDef<AgroChemicalItem>[] = [
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
    id: "actions",
    cell: ({ row }) => {
      const product = row?.original
      return <AgroChemicalControlDropDown product={product} />
    },
  },
]
