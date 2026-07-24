"use client"

import { useSession } from "next-auth/react"
import { useQuery } from "@tanstack/react-query"
import { Loader2, Gavel } from "lucide-react"
import Link from "next/link"
import { myBids } from "@/lib/query"
import { centsToDollars } from "@/lib/utilities"

const STATUS_STYLES: Record<string, string> = {
  pending:   "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  accepted:  "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  rejected:  "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  paid:      "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  completed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  expired:   "bg-muted text-muted-foreground",
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
}

interface Bid {
  id: string
  lot_slug: string
  lot_type: string
  quantity: number
  unit: string
  offered_price_per_unit_cents: number
  total_cents: number
  status: string
  payment_deadline?: string
  created: string
}

export default function MyBidsPage() {
  const { data: session, status } = useSession()

  const { data, isLoading } = useQuery({
    queryKey: ["my-bids"],
    queryFn: () => myBids().then((r) => r.data),
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
          <Gavel className="w-12 h-12 mx-auto text-muted-foreground/40" />
          <p className="font-semibold">Sign in to view your bids</p>
          <Link
            href="/login?next=/account/bids"
            className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground text-sm font-semibold px-6 py-2.5 hover:bg-primary/90 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    )
  }

  const bids: Bid[] = (data as any)?.data ?? []

  return (
    <div>
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-4">
        <Link href="/account" className="hover:text-foreground transition-colors">Account</Link>
        <span>/</span>
        <span className="text-foreground font-medium">My Offers</span>
      </nav>
      <h1 className="text-xl font-bold mb-6">My Offers</h1>

      {bids.length === 0 ? (
        <div className="text-center py-16 space-y-4">
          <Gavel className="w-12 h-12 mx-auto text-muted-foreground/40" />
          <p className="font-semibold">No bids yet</p>
          <p className="text-sm text-muted-foreground">When you place a bid on a lot, it will appear here.</p>
          <Link
            href="/lots"
            className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground text-sm font-semibold px-6 py-2.5 hover:bg-primary/90 transition-colors"
          >
            Browse Lots
          </Link>
        </div>
      ) : (
        <div className="divide-y">
          {bids.map((bid) => (
            <Link key={bid.id} href={`/account/bids/${bid.id}`} className="flex items-start justify-between gap-3 py-4 hover:bg-muted/50 transition-colors px-1">
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm font-mono">{bid.lot_slug}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${STATUS_STYLES[bid.status] ?? "bg-muted text-muted-foreground"}`}>
                    {capitalize(bid.status)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatDate(bid.created)} · {bid.quantity} {bid.unit}
                </p>
                {bid.status === "accepted" && bid.lot_type === "request" && (
                  <p className="text-xs text-green-700 dark:text-green-400 font-medium">You have been selected to supply</p>
                )}
                {bid.status === "accepted" && bid.lot_type !== "request" && bid.payment_deadline && (
                  <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">Pay by {formatDate(bid.payment_deadline)}</p>
                )}
              </div>
              <div className="text-right shrink-0 space-y-1">
                <p className="text-xs text-muted-foreground">{centsToDollars(bid.offered_price_per_unit_cents)}/{bid.unit}</p>
                <p className="font-semibold text-sm">{centsToDollars(bid.total_cents)}</p>
                <p className="text-xs text-muted-foreground">{bid.lot_type === "sell" ? "Selling" : "Buying"}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
