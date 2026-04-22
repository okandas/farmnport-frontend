"use client"

import { ColumnDef } from "@tanstack/react-table"
import { RestaurantSubscriptionPlan } from "@/lib/schemas"
import { Checkbox } from "@/components/ui/checkbox"
import { SubscriptionPlanDropDown } from "@/components/structures/dropdowns/subscription-plan-dropdown"

export const subscriptionPlanColumns: ColumnDef<RestaurantSubscriptionPlan>[] = [
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
    accessorKey: "name",
    header: "Plan Name",
  },
  {
    accessorKey: "tier",
    header: "Tier",
    cell: ({ row }) => (
      <span className="capitalize">{row.original.tier}</span>
    ),
  },
  {
    accessorKey: "price_cents",
    header: "Price (ex. VAT)",
    cell: ({ row }) => `$${(row.original.price_cents / 100).toFixed(2)}`,
  },
  {
    id: "total_incl_vat",
    header: "Total (incl. VAT)",
    cell: ({ row }) => `$${((row.original.price_cents * (1 + row.original.vat_rate / 100)) / 100).toFixed(2)}`,
  },
  {
    accessorKey: "vat_rate",
    header: "VAT Rate",
    cell: ({ row }) => `${row.original.vat_rate}%`,
  },
  {
    accessorKey: "currency",
    header: "Currency",
    cell: ({ row }) => row.original.currency.toUpperCase(),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <span className="capitalize">{row.original.status}</span>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => <SubscriptionPlanDropDown plan={row.original} />,
  },
]
