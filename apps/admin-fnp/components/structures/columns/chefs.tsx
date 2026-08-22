"use client"

import { ColumnDef } from "@tanstack/react-table"
import Link from "next/link"
import Image from "next/image"
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
  pending:   "bg-yellow-100 text-yellow-800",
  approved:  "bg-green-100 text-green-800",
  suspended: "bg-red-100 text-red-800",
}

const TYPE_LABELS: Record<string, string> = {
  solo: "Solo Chef",
  catering: "Catering",
  private_kitchen: "Private Kitchen",
}

export interface ChefRow {
  id: string
  name: string
  slug: string
  city: string
  phone: string
  email: string
  enabled_types: string[]
  profile_image?: { img?: { src?: string } }
  status: string
  featured: boolean
  created: string
}

export const chefColumns: ColumnDef<ChefRow>[] = [
  {
    accessorKey: "name",
    header: "Chef",
    cell: ({ row }) => {
      const src = row.original.profile_image?.img?.src
      return (
        <Link
          href={`/dashboard/chefs/${row.original.id}/edit`}
          className="flex items-center gap-3"
        >
          {src ? (
            <Image
              src={src}
              alt={row.original.name}
              width={32}
              height={32}
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-muted/30" />
          )}
          <span className="font-medium text-sm text-primary hover:underline">
            {row.original.name}
          </span>
        </Link>
      )
    },
  },
  {
    accessorKey: "city",
    header: "City",
    cell: ({ row }) => (
      <span className="text-sm capitalize">{row.original.city}</span>
    ),
  },
  {
    accessorKey: "enabled_types",
    header: "Types",
    cell: ({ row }) => (
      <div className="flex gap-1 flex-wrap">
        {(row.original.enabled_types ?? []).map((t) => (
          <Badge key={t} variant="outline" className="text-xs rounded-md">
            {TYPE_LABELS[t] ?? t}
          </Badge>
        ))}
      </div>
    ),
  },
  {
    accessorKey: "phone",
    header: "Contact",
    cell: ({ row }) => (
      <div>
        <p className="text-sm">{row.original.phone}</p>
        <p className="text-xs text-muted-foreground">{row.original.email}</p>
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
            <Link href={`/dashboard/chefs/${row.original.id}/edit`}>Edit</Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
]
