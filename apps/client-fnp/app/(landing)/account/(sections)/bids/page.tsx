"use client"

import { useSession } from "next-auth/react"
import { useQuery } from "@tanstack/react-query"
import { Loader2 } from "lucide-react"
import Link from "next/link"
import { myBids } from "@/lib/query"
import { centsToDollars } from "@/lib/utilities"


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

  const { data, isLoading, isError } = useQuery({
    queryKey: ["my-bids"],
    queryFn: () => myBids().then((r) => r.data),
    enabled: !!session,
    refetchOnMount: "always",
    retry: false,
  })

  const isImpersonating = !!(session?.user as any)?.impersonated_by

  if (status === "loading" || isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (isError && isImpersonating) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center space-y-3">
          <p className="font-semibold">Impersonation session expired</p>
          <p className="text-sm text-muted-foreground">Please re-impersonate this user from the admin panel.</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center space-y-4">
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
      <h1 className="text-2xl font-bold">My Offers</h1>
      <p className="text-sm text-muted-foreground mb-6">Offers you placed on lots posted by other users.</p>

      {bids.length === 0 ? (
        <div className="text-center py-16 space-y-4">
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
        <div className="space-y-4">
          {bids.map((bid) => (
            <div key={bid.id} className="rounded-xl border p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-base font-bold min-w-0">
                  {capitalize(bid.status)}, {formatDate(bid.created)}
                </p>
                <Link
                  href={`/account/bids/${bid.id}`}
                  className="shrink-0 text-sm font-medium px-4 py-2 rounded-lg border hover:bg-muted transition-colors"
                >
                  Offer Details
                </Link>
              </div>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>{bid.lot_slug} · {bid.quantity} {bid.unit} · {centsToDollars(bid.total_cents)} · {bid.lot_type === "sell" ? "Selling" : "Buying"}</p>
                {bid.status === "accepted" && bid.lot_type === "request" && (
                  <p className="text-xs text-green-700 dark:text-green-400 font-medium">You have been selected to supply</p>
                )}
                {bid.status === "accepted" && bid.lot_type !== "request" && bid.payment_deadline && (
                  <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">Pay by {formatDate(bid.payment_deadline)}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
