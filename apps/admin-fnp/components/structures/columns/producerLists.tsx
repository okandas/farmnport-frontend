"use client"

import Link from "next/link"
import { ColumnDef } from "@tanstack/react-table"

import { ProducerPriceList } from "@/lib/schemas"
import { formatDate } from "@/lib/utilities"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { PriceControlDropDown } from "@/components/structures/dropdowns/price-dropdown"

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
    id: "see_price",
    header: "See Price",
    cell: ({ row }) => {
      const priceId = row.original.id

      return (
        <Link href={`/dashboard/prices/${priceId}`}>
          <Button variant="ghost" size="sm">
            View
          </Button>
        </Link>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const priceItem = row?.original

      return <PriceControlDropDown priceItem={priceItem} />
    },
  },
]
