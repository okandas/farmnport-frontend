"use client"

import { createColumnHelper, ColumnDef } from "@tanstack/react-table"
import { PhoneNumberFormat } from "google-libphonenumber"
import { Phone, MessageCircle, Mail } from "lucide-react"

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
    header: () => <div className="text-center">Contact</div>,
    cell: ({ row }) => {
      const rawPhone = row.getValue("phone") as string
      const email = row.original.email
      let formatted = rawPhone
      let waNumber = rawPhone
      try {
        const parsed = phoneUtility.parseAndKeepRawInput(rawPhone, "ZW")
        formatted = phoneUtility.format(parsed, PhoneNumberFormat.INTERNATIONAL)
        waNumber = phoneUtility.format(parsed, PhoneNumberFormat.E164).replace("+", "")
      } catch {}
      return (
        <div className="flex items-center justify-center gap-2">
          <a href={`tel:${formatted}`} title={`Call ${formatted}`} className="p-1.5 rounded-md hover:bg-green-50 dark:hover:bg-green-900/20 text-green-600 dark:text-green-400">
            <Phone className="w-4 h-4" />
          </a>
          <a href={`https://wa.me/${waNumber}`} target="_blank" rel="noopener noreferrer" title={`WhatsApp ${formatted}`} className="p-1.5 rounded-md hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400">
            <MessageCircle className="w-4 h-4" />
          </a>
          <a href={`mailto:${email}`} title={`Email ${email}`} className="p-1.5 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400">
            <Mail className="w-4 h-4" />
          </a>
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
  columnHelper.accessor('primary_category', {
    header: "Main Category",
    cell: ({ row }) => {
      const category = row.getValue("primary_category") as ApplicationUser['primary_category']
      return category?.name || '-'
    },
  }),
  columnHelper.accessor('main_produce', {
    header: "Main Produce",
    cell: ({ row }) => {
      const produce = row.getValue("main_produce") as ApplicationUser['main_produce']
      return produce?.name || '-'
    },
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

