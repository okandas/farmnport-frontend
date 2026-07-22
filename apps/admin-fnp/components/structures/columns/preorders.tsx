"use client"

import { ColumnDef } from "@tanstack/react-table"
import Link from "next/link"
import { centsToDollars } from "@/lib/utilities"
import { PreOrderDropDown } from "@/components/structures/dropdowns/preorder-dropdown"

const STATUS_STYLES: Record<string, string> = {
  draft:                  "bg-muted text-muted-foreground",
  open:                   "bg-green-100 text-green-800",
  closed:                 "bg-yellow-100 text-yellow-800",
  pending_stock_approval: "bg-purple-100 text-purple-800",
  fulfilled:              "bg-blue-100 text-blue-800",
  cancelled:              "bg-red-100 text-red-800",
}

function formatDate(d: string) {
  if (!d || d === "0001-01-01T00:00:00Z") return "—"
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, " ")
}

export const preorderColumns: ColumnDef<any>[] = [
  {
    accessorKey: "supplier",
    header: "Supplier",
    cell: ({ row }) => (
      <span className="text-foreground">{row.original.brand_name || row.original.client_name || "—"}</span>
    ),
  },
  {
    accessorKey: "produce_name",
    header: "Produce",
    cell: ({ row }) => (
      <span className="text-foreground capitalize">
        {[row.original.produce_name, row.original.breed_name].filter(Boolean).join(" · ") || "—"}
      </span>
    ),
  },
  {
    accessorKey: "dates",
    header: "Open / Close",
    cell: ({ row }) => {
      const close = row.original.close_date
      const isOpenEnded = !close || close === "0001-01-01T00:00:00Z"
      return (
        <span className="text-xs text-foreground whitespace-nowrap">
          {formatDate(row.original.open_date)} → {isOpenEnded ? "Always open" : formatDate(close)}
        </span>
      )
    },
  },
  {
    accessorKey: "booked",
    header: "Booked",
    cell: ({ row }) => (
      <span>{row.original.total_booked ?? 0} / {row.original.total_available}</span>
    ),
  },
  {
    accessorKey: "unit_price",
    header: "Price",
    cell: ({ row }) => (
      <span>{centsToDollars(row.original.unit_price)}/{row.original.unit}</span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[row.original.status] ?? "bg-muted text-muted-foreground"}`}>
        {capitalize(row.original.status)}
      </span>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => <PreOrderDropDown preorder={row.original} />,
  },
]
