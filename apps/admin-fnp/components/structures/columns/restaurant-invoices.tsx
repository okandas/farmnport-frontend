"use client"

import { ColumnDef } from "@tanstack/react-table"
import Link from "next/link"
import { RestaurantInvoice } from "@/lib/schemas"
import { Checkbox } from "@/components/ui/checkbox"
import { formatDate, centsToDollars } from "@/lib/utilities"

export const restaurantInvoiceColumns: ColumnDef<RestaurantInvoice>[] = [
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
    accessorKey: "invoice_id",
    header: "Invoice ID",
    cell: ({ row }) => (
      <Link
        href={`/dashboard/restaurants/invoices/${row.original.id}`}
        className="font-mono text-xs text-blue-600 hover:underline"
      >
        {row.original.invoice_id}
      </Link>
    ),
  },
  {
    accessorKey: "restaurant_name",
    header: "Restaurant",
    cell: ({ row }) => (
      <span className="capitalize">{row.original.restaurant_name}</span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status
      const colors: Record<string, string> = {
        pending: "text-yellow-600",
        paid: "text-green-600",
        cancelled: "text-red-600",
      }
      return <span className={`capitalize font-medium ${colors[status] ?? ""}`}>{status}</span>
    },
  },
  {
    id: "seats",
    header: "Locations",
    cell: ({ row }) => row.original.line_items.length,
  },
  {
    accessorKey: "subtotal_cents",
    header: "Subtotal",
    cell: ({ row }) => centsToDollars(row.original.subtotal_cents),
  },
  {
    accessorKey: "vat_cents",
    header: "VAT",
    cell: ({ row }) => centsToDollars(row.original.vat_cents),
  },
  {
    accessorKey: "total_cents",
    header: "Total",
    cell: ({ row }) => (
      <span className="font-semibold">{centsToDollars(row.original.total_cents)}</span>
    ),
  },
  {
    accessorKey: "due_date",
    header: "Due",
    cell: ({ row }) => formatDate(row.original.due_date),
  },
  {
    accessorKey: "paid_at",
    header: "Paid At",
    cell: ({ row }) => row.original.paid_at ? formatDate(row.original.paid_at) : "—",
  },
]
