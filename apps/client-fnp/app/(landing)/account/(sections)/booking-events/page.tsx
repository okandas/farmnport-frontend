"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useQuery } from "@tanstack/react-query"
import { ColumnDef, PaginationState } from "@tanstack/react-table"
import { Loader2, CalendarCheck, Eye } from "lucide-react"
import Link from "next/link"

import { myPreOrders } from "@/lib/query"
import { centsToDollars } from "@/lib/utilities"
import { DataTable } from "@/components/structures/tables/data-table"

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
}

const STATUS_STYLES: Record<string, string> = {
  draft:                   "bg-muted text-muted-foreground",
  open:                    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  closed:                  "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  pending_stock_approval:  "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  fulfilled:               "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  cancelled:               "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
}

const STATUS_LABELS: Record<string, string> = {
  draft:                   "Draft",
  open:                    "Open",
  closed:                  "Closed",
  pending_stock_approval:  "Stock Approval",
  fulfilled:               "Fulfilled",
  cancelled:               "Cancelled",
}

const columns: ColumnDef<any>[] = [
  {
    accessorKey: "title",
    header: "Event",
    cell: ({ row }) => (
      <div className="space-y-0.5">
        <Link href={`/account/booking-events/${row.original.id}`} className="font-semibold text-sm hover:text-primary transition-colors line-clamp-1">
          {row.original.title || row.original.name || "—"}
        </Link>
        {row.original.product_name && (
          <p className="text-xs text-muted-foreground capitalize">{row.original.product_name}</p>
        )}
      </div>
    ),
  },
  {
    accessorKey: "total_available",
    header: "Available",
    cell: ({ row }) => (
      <span>
        {row.original.total_booked ?? 0}/{row.original.total_available?.toLocaleString()} {row.original.unit}
      </span>
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
    accessorKey: "deposit_per_unit",
    header: "Deposit",
    cell: ({ row }) => (
      <span>{centsToDollars(row.original.deposit_per_unit)}/{row.original.unit}</span>
    ),
  },
  {
    accessorKey: "open_date",
    header: "Opens",
    cell: ({ row }) => <span className="text-xs text-muted-foreground">{formatDate(row.original.open_date)}</span>,
  },
  {
    accessorKey: "close_date",
    header: "Closes",
    cell: ({ row }) => <span className="text-xs text-muted-foreground">{formatDate(row.original.close_date)}</span>,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status ?? "draft"
      return (
        <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[status] ?? STATUS_STYLES.draft}`}>
          {STATUS_LABELS[status] ?? status}
        </span>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <Link href={`/account/booking-events/${row.original.id}`} className="text-muted-foreground hover:text-foreground transition-colors">
        <Eye className="w-4 h-4" />
      </Link>
    ),
  },
]

export default function MyPreOrdersPage() {
  const { data: session, status } = useSession()
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 20 })
  const [search, setSearch] = useState("")

  const { data, isLoading } = useQuery({
    queryKey: ["my-booking-events", pagination.pageIndex],
    queryFn: () => myPreOrders(pagination.pageIndex + 1).then((r: any) => r.data),
    enabled: !!session,
    refetchOnMount: "always",
  })

  if (status === "loading" || isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center space-y-4">
          <CalendarCheck className="w-12 h-12 mx-auto text-muted-foreground/40" />
          <p className="font-semibold">Sign in to view your booking events</p>
          <Link
            href="/login?next=/account/booking-events"
            className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground text-sm font-semibold px-6 py-2.5 hover:bg-primary/90 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    )
  }

  const events: any[] = data?.data ?? []
  const total: number = data?.total ?? events.length

  return (
    <div>
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-4">
        <Link href="/account" className="hover:text-foreground transition-colors">Account</Link>
        <span>/</span>
        <span className="text-foreground font-medium">Booking Events</span>
      </nav>
      <h1 className="text-xl font-bold mb-6">My Booking Events</h1>

      <DataTable
        columns={columns}
        data={events}
        tableName="Booking Event"
        total={total}
        pagination={pagination}
        setPagination={setPagination}
        search={search}
        setSearch={setSearch}
        emptyMessage="No booking events yet. Create one to start accepting pre-orders."
      />
    </div>
  )
}
