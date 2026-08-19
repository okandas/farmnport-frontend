"use client"

import { ColumnDef } from "@tanstack/react-table"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"

const STATUS_COLORS: Record<string, string> = {
  pending_payment: "bg-gray-100 text-gray-700",
  paid:            "bg-blue-100 text-blue-800",
  confirmed:       "bg-green-100 text-green-800",
  declined:        "bg-red-100 text-red-800",
  completed:       "bg-gray-100 text-gray-700",
  cancelled:       "bg-red-100 text-red-800",
  refunded:        "bg-orange-100 text-orange-800",
}

export interface ChefBookingRow {
  id: string
  booking_ref: string
  chef_name: string
  listing_title: string
  client_name: string
  event_date: string
  guest_count: number
  total_paid: number
  status: string
  created: string
}

export const chefBookingColumns: ColumnDef<ChefBookingRow>[] = [
  {
    accessorKey: "booking_ref",
    header: "Ref",
    cell: ({ row }) => (
      <Link
        href={`/dashboard/chefs/bookings/${row.original.id}`}
        className="font-mono text-xs text-primary hover:underline"
      >
        {row.original.booking_ref}
      </Link>
    ),
  },
  {
    accessorKey: "chef_name",
    header: "Chef",
    cell: ({ row }) => (
      <span className="text-sm">{row.original.chef_name}</span>
    ),
  },
  {
    accessorKey: "client_name",
    header: "Client",
    cell: ({ row }) => (
      <span className="text-sm capitalize">{row.original.client_name}</span>
    ),
  },
  {
    accessorKey: "event_date",
    header: "Event",
    cell: ({ row }) => (
      <div>
        <p className="text-sm">{row.original.event_date}</p>
        <p className="text-xs text-muted-foreground">{row.original.guest_count} guests</p>
      </div>
    ),
  },
  {
    accessorKey: "total_paid",
    header: "Total",
    cell: ({ row }) => (
      <span className="text-sm font-medium">${(row.original.total_paid / 100).toFixed(2)}</span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge className={STATUS_COLORS[row.original.status] ?? "bg-gray-100 text-gray-700"}>
        {row.original.status.replace("_", " ")}
      </Badge>
    ),
  },
  {
    accessorKey: "created",
    header: "Submitted",
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground">
        {format(new Date(row.original.created), "d MMM yyyy")}
      </span>
    ),
  },
]
