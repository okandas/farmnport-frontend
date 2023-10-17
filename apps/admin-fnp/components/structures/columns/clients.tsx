"use client"

import { ColumnDef } from "@tanstack/react-table"
import { PhoneNumberFormat } from "google-libphonenumber"

import { ApplicationUser } from "@/lib/schemas"
import { phoneUtility } from "@/lib/utilities"
import { Checkbox } from "@/components/ui/checkbox"
import { ControlDropDown } from "@/components/structures/dropdowns/control-dropdown"

export const clientColumns: ColumnDef<ApplicationUser>[] = [
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
    accessorKey: "address",
    header: "Address",
  },
  {
    accessorKey: "phone",
    header: () => <div className="text-right">Phone</div>,
    cell: ({ row }) => {
      const phone = phoneUtility.parseAndKeepRawInput(
        row.getValue("phone"),
        "ZW",
      )
      const formatted = phoneUtility.format(
        phone,
        PhoneNumberFormat.INTERNATIONAL,
      )
      return (
        <div className="font-medium text-right">
          <a href={`tel:${formatted}`}>{formatted}</a>
        </div>
      )
    },
  },
  {
    accessorKey: "province",
    header: "Province",
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: "specialization",
    header: "Specialization",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const client = row?.original

      return <ControlDropDown client={client} />
    },
  },
]
