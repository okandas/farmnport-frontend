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
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <span className="capitalize">{row.original.status || "-"}</span>
    ),
  },
  {
    accessorKey: "created",
    header: "Date Added",
    cell: ({ row }) => {
      const date = row.original.created
      if (!date) return "-"
      return new Date(date).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const location = row?.original
      return <RestaurantLocationDropDown location={location} />
    },
  },
]
