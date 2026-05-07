"use client"

import { ColumnDef } from "@tanstack/react-table"
import { RestaurantLocation } from "@/lib/schemas"
import { Checkbox } from "@/components/ui/checkbox"
import { RestaurantLocationDropDown } from "@/components/structures/dropdowns/restaurant-location-dropdown"

export const restaurantLocationColumns: ColumnDef<RestaurantLocation>[] = [
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
    accessorKey: "restaurant_name",
    header: "Restaurant",
    cell: ({ row }) => (
      <span className="capitalize">{row.original.restaurant_name || "-"}</span>
    ),
  },
  {
    accessorKey: "address",
    header: "Address",
    cell: ({ row }) => (
      <span className="max-w-xs truncate block">{row.original.address || "-"}</span>
    ),
  },
  {
    accessorKey: "city",
    header: "City",
    cell: ({ row }) => (
      <span className="capitalize">{row.original.city || "-"}</span>
    ),
  },
  {
    accessorKey: "phone",
    header: "Phone",
  },
  {
    accessorKey: "is_main",
    header: "Main",
    cell: ({ row }) => (
      <span>{row.original.is_main ? "Yes" : "No"}</span>
    ),
  },
  {
    accessorKey: "accessible",
    header: "Status",
    cell: ({ row }) => {
      const { status, is_main, accessible } = row.original
      if (status !== "active") {
        return <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 capitalize">{status}</span>
      }
      if (is_main) {
        return <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700">Free</span>
      }
      if (accessible) {
        return <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700">Paid</span>
      }
      return <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-orange-100 text-orange-700">Not Subscribed</span>
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const location = row?.original
      return <RestaurantLocationDropDown location={location} />
    },
  },
]
