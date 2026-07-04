"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useQuery } from "@tanstack/react-query"
import { ColumnDef } from "@tanstack/react-table"
import { PaginationState } from "@tanstack/react-table"
import { Loader2, Package, MoreVertical, Eye } from "lucide-react"
import Link from "next/link"

import { myLots } from "@/lib/query"
import { centsToDollars } from "@/lib/utilities"
import { DataTable } from "@/components/structures/tables/data-table"

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
}

function lotStatusBadge(lot: any) {
  if (lot.has_accepted_bid && lot.type === "request")
    return <span className="inline-flex items-center rounded-md bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">Awaiting Payment</span>
  if (lot.has_accepted_bid)
    return <span className="inline-flex items-center rounded-md bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">Fulfilled</span>
  const expired = lot.expires_at && new Date(lot.expires_at) < new Date()
  if (expired)
    return <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">Expired</span>
  if (!lot.moderated)
    return <span className="inline-flex items-center rounded-md bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">Pending</span>
  return <span className="inline-flex items-center rounded-md bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">Live</span>
}

const columns: ColumnDef<any>[] = [
  {
    accessorKey: "slug",
    header: "Lot",
    cell: ({ row }) => (
      <Link href={`/account/lots/${row.original.slug}`} className="font-semibold text-sm font-mono hover:text-primary transition-colors">
        {row.original.slug}
      </Link>
    ),
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => (
      row.original.type === "sell"
        ? <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">Selling</span>
        : <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">Buying</span>
    ),
  },
  {
    accessorKey: "breed",
    header: "Variety",
    cell: ({ row }) => (
      <span className="capitalize">{row.original.breed?.name ?? row.original.farm_produce?.name ?? "—"}</span>
    ),
  },
  {
    accessorKey: "quantity",
    header: "Quantity",
    cell: ({ row }) => (
      <span>{row.original.quantity?.toLocaleString()} {row.original.unit}</span>
    ),
  },
  {
    accessorKey: "price_per_unit_cents",
    header: "Price",
    cell: ({ row }) => (
      <span>{row.original.price_per_unit_cents ? `${centsToDollars(row.original.price_per_unit_cents)}/${row.original.unit}` : "Negotiable"}</span>
    ),
  },
  {
    accessorKey: "moderated",
    header: "Status",
    cell: ({ row }) => lotStatusBadge(row.original),
  },
  {
    accessorKey: "created",
    header: "Listed",
    cell: ({ row }) => <span className="text-muted-foreground text-xs">{formatDate(row.original.created)}</span>,
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <Link href={`/account/lots/${row.original.slug}`} className="text-muted-foreground hover:text-foreground transition-colors">
        <Eye className="w-4 h-4" />
      </Link>
    ),
  },
]

export default function MyLotsPage() {
  const { data: session, status } = useSession()
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 20 })
  const [search, setSearch] = useState("")

  const { data, isLoading } = useQuery({
    queryKey: ["my-lots", pagination.pageIndex],
    queryFn: () => myLots(pagination.pageIndex + 1).then((r) => r.data),
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
          <Package className="w-12 h-12 mx-auto text-muted-foreground/40" />
          <p className="font-semibold">Sign in to view your lots</p>
          <Link
            href="/login?next=/account/lots"
            className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground text-sm font-semibold px-6 py-2.5 hover:bg-primary/90 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    )
  }

  const lots: any[] = data?.data ?? []
  const total: number = data?.total ?? lots.length

  return (
    <div>
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-4">
        <Link href="/account" className="hover:text-foreground transition-colors">Account</Link>
        <span>/</span>
        <span className="text-foreground font-medium">My Lots</span>
      </nav>
      <h1 className="text-xl font-bold mb-6">My Lots</h1>

      <DataTable
        columns={columns}
        data={lots}
        tableName="Lot"
        total={total}
        pagination={pagination}
        setPagination={setPagination}
        search={search}
        setSearch={setSearch}
        emptyMessage="No lots yet. When you post a lot, it will appear here."
      />
    </div>
  )
}
