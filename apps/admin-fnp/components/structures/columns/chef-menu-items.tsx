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
  active:   "bg-green-100 text-green-800",
  inactive: "bg-red-100 text-red-800",
}

export interface ChefMenuItemRow {
  id: string
  name: string
  chef_name: string
  menu_name: string
  description: string
  tags: string[]
  status: string
  created: string
}

export const chefMenuItemColumns: ColumnDef<ChefMenuItemRow>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <Link
        href={`/dashboard/chefs/menu-items/${row.original.id}/edit`}
        className="font-medium text-sm text-primary hover:underline"
      >
        {row.original.name}
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
    accessorKey: "menu_name",
    header: "Menu",
    cell: ({ row }) => (
      <span className="text-sm capitalize">{row.original.menu_name || "-"}</span>
    ),
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {(row.original.description ?? "").length > 50
          ? (row.original.description ?? "").slice(0, 50) + "…"
          : (row.original.description ?? "")}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge className={`rounded-md ${STATUS_COLORS[row.original.status] ?? "bg-gray-100 text-gray-700"}`}>
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
            <Link href={`/dashboard/chefs/menu-items/${row.original.id}/edit`}>Edit</Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
]
