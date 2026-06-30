"use client"

import Link from "next/link"
import { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import { centsToDollars } from "@/lib/utilities"
import { DocumentsDropDown } from "@/components/structures/dropdowns/documents-dropdown"

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
}

export const documentColumns: ColumnDef<any>[] = [
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
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => (
      <Link
        href={`/dashboard/farmnport/documents/${row.original.id}/edit`}
        className="font-medium hover:underline"
      >
        {row.original.title}
      </Link>
    ),
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => (
      <span className="capitalize">{row.original.category?.replace("-", " ") ?? "—"}</span>
    ),
  },
  {
    accessorKey: "file_type",
    header: "Type",
    cell: ({ row }) => (
      <span className="uppercase text-xs font-medium">{row.original.file_type ?? "—"}</span>
    ),
  },
  {
    accessorKey: "price_cents",
    header: "Price",
    cell: ({ row }) => (
      <span>{row.original.price_cents ? centsToDollars(row.original.price_cents) : "Free"}</span>
    ),
  },
  {
    accessorKey: "active",
    header: "Status",
    cell: ({ row }) => row.original.active
      ? <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">Active</span>
      : <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400">Inactive</span>,
  },
  {
    accessorKey: "created",
    header: "Created",
    cell: ({ row }) => <span className="text-muted-foreground">{row.original.created ? formatDate(row.original.created) : "—"}</span>,
  },
  {
    id: "actions",
    cell: ({ row }) => <DocumentsDropDown document={row.original} />,
  },
]
