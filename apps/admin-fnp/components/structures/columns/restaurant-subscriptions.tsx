"use client"

import { ColumnDef } from "@tanstack/react-table"
import Link from "next/link"
import { RestaurantSubscription } from "@/lib/schemas"
import { Checkbox } from "@/components/ui/checkbox"
import { formatDate } from "@/lib/utilities"

export const restaurantSubscriptionColumns: ColumnDef<RestaurantSubscription>[] = [
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
    accessorKey: "member_number",
    header: "Member #",
    cell: ({ row }) => (
      <span className="font-mono text-xs">{row.original.member_number}</span>
    ),
  },
  {
    accessorKey: "restaurant_name",
    header: "Restaurant",
    cell: ({ row }) => (
      <Link
        href={`/dashboard/restaurants/subscriptions/${row.original.id}`}
        className="font-medium text-blue-600 hover:underline"
      >
        {row.original.restaurant_name}
      </Link>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status
      const colors: Record<string, string> = {
        active: "text-green-600",
        expired: "text-yellow-600",
        cancelled: "text-red-600",
      }
      return <span className={`capitalize font-medium ${colors[status] ?? ""}`}>{status}</span>
    },
  },
  {
    accessorKey: "billing_email",
    header: "Billing Email",
  },
  {
    accessorKey: "cycle_end",
    header: "Cycle Ends",
    cell: ({ row }) => formatDate(row.original.cycle_end),
  },
  {
    accessorKey: "created",
    header: "Created",
    cell: ({ row }) => formatDate(row.original.created ?? ""),
  },
]
