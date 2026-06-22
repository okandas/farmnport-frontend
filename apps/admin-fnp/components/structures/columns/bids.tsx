"use client"

import { ColumnDef } from "@tanstack/react-table"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { centsToDollars } from "@/lib/utilities"
import { adminAcceptBid } from "@/lib/query"
import { toast } from "@/components/ui/use-toast"

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    accepted: "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    rejected: "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    paid: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    completed: "bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    expired: "bg-gray-50 text-gray-600 dark:bg-gray-800/30 dark:text-gray-400",
  }
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium capitalize ${map[status] ?? "bg-gray-50 text-gray-600"}`}>
      {status}
    </span>
  )
}

function AcceptButton({ bid }: { bid: any }) {
  const queryClient = useQueryClient()
  const { mutate, isPending } = useMutation({
    mutationFn: () => adminAcceptBid(bid.id),
    onSuccess: () => {
      toast({ title: "Bid accepted", description: `Winner notified. All other bids on this lot have been rejected.` })
      queryClient.invalidateQueries({ queryKey: ["admin-bids"] })
    },
    onError: () => {
      toast({ title: "Failed to accept bid", variant: "destructive" })
    },
  })

  if (bid.status !== "pending") return null

  return (
    <Button size="sm" variant="outline" className="text-green-700 border-green-300 hover:bg-green-50" onClick={() => mutate()} disabled={isPending}>
      {isPending ? "Accepting…" : "Accept"}
    </Button>
  )
}

export const bidColumns: ColumnDef<any>[] = [
  {
    accessorKey: "bidder_name",
    header: "Bidder",
    cell: ({ row }) => (
      <div>
        <p className="font-medium capitalize">{row.original.bidder_name ?? "—"}</p>
        <p className="text-xs text-muted-foreground">{row.original.bidder_email}</p>
      </div>
    ),
  },
  {
    accessorKey: "lot_slug",
    header: "Lot",
    cell: ({ row }) => (
      <span className="text-sm font-mono text-muted-foreground">{row.original.lot_slug ?? "—"}</span>
    ),
  },
  {
    accessorKey: "lot_type",
    header: "Type",
    cell: ({ row }) => (
      row.original.lot_type === "sell"
        ? <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">Sell</span>
        : <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">Request</span>
    ),
  },
  {
    accessorKey: "quantity",
    header: "Qty",
    cell: ({ row }) => <span>{row.original.quantity?.toLocaleString()} {row.original.unit}</span>,
  },
  {
    accessorKey: "offered_price_per_unit_cents",
    header: "Bid Price",
    cell: ({ row }) => (
      <span>{row.original.offered_price_per_unit_cents ? `${centsToDollars(row.original.offered_price_per_unit_cents)}/${row.original.unit}` : "—"}</span>
    ),
  },
  {
    accessorKey: "total_cents",
    header: "Total",
    cell: ({ row }) => (
      <span className="font-medium">{row.original.total_cents ? centsToDollars(row.original.total_cents) : "—"}</span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    accessorKey: "created",
    header: "Placed",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {new Date(row.original.created).toLocaleDateString("en-GB")}
      </span>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => <AcceptButton bid={row.original} />,
  },
]
