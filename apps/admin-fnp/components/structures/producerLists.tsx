"use client"

import { ColumnDef } from "@tanstack/react-table"

import { ProducerPriceList } from "@/lib/schemas"
import { formatDate } from "@/lib/utilities"
import { Checkbox } from "@/components/ui/checkbox"
import { PriceControlDropDown } from "@/components/structures/price-dropdown"

export const producerPriceListColumns: ColumnDef<ProducerPriceList>[] = [
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
    accessorKey: "effectiveDate",
    header: "Effective Date",
    cell: ({ row }) => {
      const date = row.getValue("effectiveDate") as string

      return <p className="text-base tracking-tight">{formatDate(date)}</p>
    },
  },
  {
    accessorKey: "client_name",
    header: "Client Name",
  },
  {
    accessorKey: "client_id",
    header: "Client ID",
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const priceItem = row?.original

      return <PriceControlDropDown priceItem={priceItem} />
    },
  },
]
