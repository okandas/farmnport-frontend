"use client"

import Link from "next/link"
import { ColumnDef } from "@tanstack/react-table"

import { CdmPrice } from "@/lib/schemas"
import { formatDate } from "@/lib/utilities"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { CdmPriceControlDropDown } from "@/components/structures/dropdowns/cdm-price-dropdown"

export const cdmPriceColumns: ColumnDef<CdmPrice>[] = [
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
    accessorKey: "exchange_rate",
    header: "Exchange Rate",
    cell: ({ row }) => {
      const rate = row.getValue("exchange_rate") as number
      return <span>{rate ? rate.toFixed(2) : "-"}</span>
    },
  },
  {
    id: "see_price",
    header: "View",
    cell: ({ row }) => {
      const priceId = row.original.id
      return (
        <Link href={`/dashboard/farmnport/cdm-prices/${priceId}/edit`}>
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
      const price = row?.original
      return <CdmPriceControlDropDown price={price} />
    },
  },
]
