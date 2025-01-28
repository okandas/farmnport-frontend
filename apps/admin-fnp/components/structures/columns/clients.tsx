"use client"

import { createColumnHelper, ColumnDef } from "@tanstack/react-table"
import { PhoneNumberFormat } from "google-libphonenumber"

import { ApplicationUser } from "@/lib/schemas"
import { phoneUtility, formatDate } from "@/lib/utilities"
import { Checkbox } from "@/components/ui/checkbox"
import { ControlDropDown } from "@/components/structures/dropdowns/control-dropdown"

const columnHelper = createColumnHelper<ApplicationUser>()

 const proxyColumns = [

  columnHelper.display({
    id: 'select',
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
  }),
  columnHelper.accessor('name', {
    header: "Name"
  }),
  columnHelper.accessor('address', {
    header: "Address"
  }),
  columnHelper.accessor('created', {
    header: () => <div className="text-right">Joined</div>,
    cell: ({ row }) => {
      const date = row.getValue("created") as string
      return (
        <div className="font-medium text-right w-32">
          {formatDate(date)}
        </div>
      )
    },
  }),
  columnHelper.accessor('phone', {
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
        <div className="font-medium text-right w-40">
          <a href={`tel:${formatted}`}>{formatted}</a>
        </div>
      )
    },
  }),
  columnHelper.accessor('province', {
    header: "Province",
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  }),
  columnHelper.accessor('specialization', {
    header: "Specialization"
  }),
  columnHelper.display({
    id: 'actions',
    cell: ({ row }) => {
      const client = row?.original
      return <ControlDropDown client={client} />
    },
  }),
]

export const clientColumns = proxyColumns as ColumnDef<ApplicationUser>[];

