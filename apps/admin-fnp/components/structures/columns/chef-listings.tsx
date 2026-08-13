"use client"

import { ColumnDef } from "@tanstack/react-table"
import Link from "next/link"
import { MoreHorizontal } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { format } from "date-fns"

const STATUS_COLORS: Record<string, string> = {
  draft:  "bg-gray-100 text-gray-700",
  live:   "bg-green-100 text-green-800",
  paused: "bg-yellow-100 text-yellow-800",
}

const TYPE_LABELS: Record<string, string> = {
  solo: "Solo Chef",
  catering: "Catering",
  private_kitchen: "Private Kitchen",
}

export interface ChefListingRow {
  id: string
  chef_id: string
  type: string
  title: string
  price: number
  min_budget: number
  commission_pct: number
  status: string
  created: string
}

export const chefListingColumns: ColumnDef<ChefListingRow>[] = [
  {
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => (
      <Link
        href={`/dashboard/chefs/listings/${row.original.id}`}
        className="font-medium text-sm text-primary hover:underline"
      >
        {row.original.title}
      </Link>
    ),
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => (
      <Badge variant="outline" className="text-xs">
        {TYPE_LABELS[row.original.type] ?? row.original.type}
      </Badge>
    ),
  },
  {
    accessorKey: "price",
    header: "Price",
    cell: ({ row }) => {
      if (row.original.type === "catering") {
        return <span className="text-sm">Min ${(row.original.min_budget / 100).toFixed(2)}</span>
      }
      if (row.original.price) {
        return <span className="text-sm">${(row.original.price / 100).toFixed(2)}</span>
      }
      return <span className="text-sm text-muted-foreground">See plans</span>
    },
  },
  {
    accessorKey: "commission_pct",
    header: "Commission",
    cell: ({ row }) => (
      <span className="text-sm">{row.original.commission_pct}%</span>
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
    header: "Created",
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground">
        {format(new Date(row.original.created), "d MMM yyyy")}
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
            <Link href={`/dashboard/chefs/listings/${row.original.id}`}>View</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`/dashboard/chefs/listings/${row.original.id}/edit`}>Edit</Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
]
