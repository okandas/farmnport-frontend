"use client"

import { ColumnDef } from "@tanstack/react-table"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"

const STATUS_COLORS: Record<string, string> = {
  pending:   "bg-yellow-100 text-yellow-800",
  confirmed: "bg-green-100 text-green-800",
  seated:    "bg-blue-100 text-blue-800",
  completed: "bg-gray-100 text-gray-700",
  cancelled: "bg-red-100 text-red-800",
  no_show:   "bg-orange-100 text-orange-800",
}

export interface ReservationRow {
  id: string
  reservation_ref: string
  full_name: string
  contact: string
  client_email?: string
  restaurant_name: string
  location_name: string
  date: string
  preferred_time: string
  number_of_guests: number
  status: string
  created: string
}

export const reservationColumns: ColumnDef<ReservationRow>[] = [
  {
    accessorKey: "reservation_ref",
    header: "Ref",
    cell: ({ row }) => (
      <Link
        href={`/dashboard/restaurants/reservations/${row.original.id}`}
        className="font-mono text-xs text-primary hover:underline"
      >
        {row.original.reservation_ref}
      </Link>
    ),
  },
  {
    accessorKey: "full_name",
    header: "Guest",
    cell: ({ row }) => (
      <div>
        <p className="font-medium text-sm">{row.original.full_name}</p>
        <p className="text-xs text-muted-foreground">{row.original.contact}</p>
      </div>
    ),
  },
  {
    accessorKey: "restaurant_name",
    header: "Restaurant",
    cell: ({ row }) => (
      <div>
        <p className="text-sm capitalize">{row.original.restaurant_name}</p>
        <p className="text-xs text-muted-foreground capitalize">{row.original.location_name}</p>
      </div>
    ),
  },
  {
    accessorKey: "date",
    header: "Date & Time",
    cell: ({ row }) => (
      <div>
        <p className="text-sm">{row.original.date}</p>
        <p className="text-xs text-muted-foreground">{row.original.preferred_time} · {row.original.number_of_guests} guests</p>
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge className={STATUS_COLORS[row.original.status] ?? "bg-gray-100 text-gray-700"}>
        {row.original.status}
      </Badge>
    ),
  },
  {
    accessorKey: "created",
    header: "Submitted",
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground">
        {format(new Date(row.original.created), "d MMM yyyy, HH:mm")}
      </span>
    ),
  },
]
