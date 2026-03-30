"use client"

import { ColumnDef } from "@tanstack/react-table"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { formatDate } from "@/lib/utilities"

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  paid: "bg-blue-100 text-blue-800",
  processing: "bg-purple-100 text-purple-800",
  dispatched: "bg-indigo-100 text-indigo-800",
  ready: "bg-teal-100 text-teal-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
}

export interface OrderRow {
  id: string
  order_number: string
  client_name: string
  client_email: string
  status: string
  total: number
  order_type: string
  fulfillment: string
  items: { product_name: string; quantity: number }[]
  created: string
}

export const orderColumns: ColumnDef<OrderRow>[] = [
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
    accessorKey: "order_number",
    header: "Order",
    cell: ({ row }) => {
      const order = row.original
      return (
        <Link
          href={`/dashboard/farmnport/sales/orders/${order.id}`}
          className="font-medium text-primary hover:underline"
        >
          {order.order_number}
        </Link>
      )
    },
  },
  {
    accessorKey: "client_name",
    header: "Customer",
    cell: ({ row }) => {
      const order = row.original
      return (
        <div>
          <span className="text-sm">{order.client_name}</span>
          <p className="text-xs text-muted-foreground">{order.client_email}</p>
        </div>
      )
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      return (
        <Badge variant="secondary" className={STATUS_COLORS[status] ?? ""}>
          {status}
        </Badge>
      )
    },
  },
  {
    accessorKey: "total",
    header: "Total",
    cell: ({ row }) => {
      const total = row.getValue("total") as number
      return <span className="font-medium">${total.toFixed(2)}</span>
    },
  },
  {
    accessorKey: "order_type",
    header: "Channel",
    cell: ({ row }) => {
      const type = row.getValue("order_type") as string
      return <span className="text-sm capitalize">{type.replace("_", " ")}</span>
    },
  },
  {
    accessorKey: "fulfillment",
    header: "Fulfillment",
    cell: ({ row }) => {
      const fulfillment = row.getValue("fulfillment") as string
      return (
        <span className="text-sm capitalize">
          {fulfillment === "click_collect" ? "Click & Collect" : fulfillment}
        </span>
      )
    },
  },
  {
    accessorKey: "created",
    header: "Date",
    cell: ({ row }) => {
      return <span className="text-sm">{formatDate(row.original.created)}</span>
    },
  },
]
