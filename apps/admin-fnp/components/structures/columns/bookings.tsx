"use client"

import { ColumnDef } from "@tanstack/react-table"
import Link from "next/link"
import { CalendarDays, Truck, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const STATUS_STYLES: Record<string, string> = {
  pending:          "bg-yellow-100 text-yellow-800",
  confirmed:        "bg-blue-100 text-blue-800",
  pending_payment:  "bg-orange-100 text-orange-800",
  paid:             "bg-green-100 text-green-800",
  approved:         "bg-purple-100 text-purple-800",
  ready:            "bg-emerald-100 text-emerald-800",
  collected:        "bg-green-100 text-green-800",
  completed:        "bg-green-100 text-green-800",
  rejected:         "bg-red-100 text-red-800",
  expired:          "bg-muted text-muted-foreground",
  cancelled:        "bg-red-100 text-red-800",
}

const STATUS_LABELS: Record<string, string> = {
  pending:          "Pending",
  confirmed:        "Confirmed",
  pending_payment:  "Payment Processing",
  paid:             "Paid",
  approved:         "Approved",
  ready:            "Ready",
  collected:        "Collected",
  completed:        "Completed",
  rejected:         "Rejected",
  expired:          "Expired",
  cancelled:        "Cancelled",
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export const bookingColumns: ColumnDef<any>[] = [
  {
    accessorKey: "booking_ref",
    header: "Ref",
    cell: ({ row }) => (
      <Link href={`/dashboard/farmnport/orders/bookings/${row.original.id}`} className="font-mono text-xs font-medium hover:underline text-foreground">
        {row.original.booking_ref}
      </Link>
    ),
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => (
      <span className="flex items-center gap-1.5 text-muted-foreground text-xs">
        {row.original.type === "delivery" || row.original.type === "pickup" ? <Truck className="w-3.5 h-3.5" /> : <CalendarDays className="w-3.5 h-3.5" />}
        {row.original.type === "pre-order" ? "Pre-Order" : capitalize(row.original.type)}
      </span>
    ),
  },
  {
    accessorKey: "client_name",
    header: "Client",
    cell: ({ row }) => (
      <div>
        <p className="font-medium">{row.original.client_name}</p>
        <p className="text-xs text-muted-foreground">{row.original.client_phone}</p>
      </div>
    ),
  },
  {
    accessorKey: "details",
    header: "Details",
    cell: ({ row }) => {
      const b = row.original
      if (b.type === "pre-order" && b.pre_order)
        return <p className="truncate text-xs max-w-[200px]">{b.pre_order.event_title} · {b.pre_order.quantity} units</p>
      if (b.type === "delivery" && b.delivery)
        return <p className="truncate text-xs max-w-[200px]">{b.delivery.delivery_location_name} · {b.delivery.goods}</p>
      if (b.type === "pickup" && b.pickup)
        return <p className="truncate text-xs max-w-[200px]">{b.pickup.farm_address} · {b.pickup.goods}</p>
      return <span className="text-muted-foreground">—</span>
    },
  },
  {
    accessorKey: "booking_date",
    header: "Date",
    cell: ({ row }) => (
      <div className="text-xs text-muted-foreground whitespace-nowrap">
        {formatDate(row.original.booking_date)}
        {row.original.time_slot && <span className="block">{row.original.time_slot}</span>}
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[row.original.status] ?? "bg-muted text-muted-foreground"}`}>
        {STATUS_LABELS[row.original.status] ?? row.original.status}
      </span>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="w-8 h-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem asChild>
            <Link href={`/dashboard/farmnport/orders/bookings/${row.original.id}`}>Manage</Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
]
