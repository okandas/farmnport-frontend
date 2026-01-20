"use client"

import { createColumnHelper, ColumnDef } from "@tanstack/react-table"
import { PhoneNumberFormat } from "google-libphonenumber"
import Link from "next/link"

import { phoneUtility, formatDate, capitalizeFirstLetter } from "@/lib/utilities"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { BuyerContactDropDown } from "@/components/structures/dropdowns/buyer-contact-dropdown"

export type BuyerContact = {
  id: string
  client_id: string
  client_name: string
  name: string
  phone: string
  alternative_phone?: string
  email?: string
  position?: string
  notes?: string
  status: "active" | "archived" | "banned"
  created: string
  updated: string
}

const columnHelper = createColumnHelper<BuyerContact>()

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
    header: "Contact Name",
    cell: ({ row }) => {
      return (
        <div className="font-medium">
          {capitalizeFirstLetter(row.getValue("name"))}
        </div>
      )
    },
  }),
  columnHelper.accessor('client_name', {
    header: "Client",
    cell: ({ row }) => {
      return (
        <Link href={`/dashboard/users/${row.original.client_id}`} className="hover:underline">
          {capitalizeFirstLetter(row.getValue("client_name"))}
        </Link>
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
  columnHelper.accessor('position', {
    header: "Position",
    cell: ({ row }) => {
      const position = row.getValue("position") as string
      return position ? capitalizeFirstLetter(position) : "-"
    },
  }),
  columnHelper.accessor('status', {
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      const variant = status === "active" ? "default" : status === "archived" ? "secondary" : "destructive"
      return (
        <Badge variant={variant}>
          {capitalizeFirstLetter(status)}
        </Badge>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  }),
  columnHelper.accessor('created', {
    header: () => <div className="text-right">Added</div>,
    cell: ({ row }) => {
      const date = row.getValue("created") as string
      return (
        <div className="font-medium text-right w-32">
          {formatDate(date)}
        </div>
      )
    },
  }),
  columnHelper.display({
    id: 'actions',
    cell: ({ row }) => {
      const contact = row?.original
      return <BuyerContactDropDown contact={contact} />
    },
  }),
]

export const buyerContactsColumns = proxyColumns as ColumnDef<BuyerContact>[]
