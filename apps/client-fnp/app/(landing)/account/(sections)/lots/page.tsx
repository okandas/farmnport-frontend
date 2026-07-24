"use client"

import { useSession } from "next-auth/react"
import { useQuery } from "@tanstack/react-query"
import { Loader2, Package } from "lucide-react"
import Link from "next/link"

import { myLots } from "@/lib/query"
import { centsToDollars } from "@/lib/utilities"

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
}

function lotStatusLabel(lot: any): { label: string; style: string } {
  if (lot.has_accepted_bid && lot.type === "request")
    return { label: "Awaiting Payment", style: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400" }
  if (lot.has_accepted_bid)
    return { label: "Fulfilled", style: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" }
  const expired = lot.expires_at && new Date(lot.expires_at) < new Date()
  if (expired)
    return { label: "Expired", style: "bg-muted text-muted-foreground" }
  if (!lot.moderated)
    return { label: "Pending", style: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400" }
  return { label: "Live", style: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" }
}

export default function MyLotsPage() {
  const { data: session, status } = useSession()

  const { data, isLoading } = useQuery({
    queryKey: ["my-lots"],
    queryFn: () => myLots().then((r) => r.data),
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

  return (
    <div>
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-4">
        <Link href="/account" className="hover:text-foreground transition-colors">Account</Link>
        <span>/</span>
        <span className="text-foreground font-medium">My Lots</span>
      </nav>
      <h1 className="text-2xl font-bold">My Lots</h1>
      <p className="text-sm text-muted-foreground mb-6">Lots you posted for sale or to request produce.</p>

      {lots.length === 0 ? (
        <div className="text-center py-16 space-y-4">
          <Package className="w-12 h-12 mx-auto text-muted-foreground/40" />
          <p className="font-semibold">No lots yet</p>
          <p className="text-sm text-muted-foreground">When you post a lot, it will appear here.</p>
          <Link
            href="/lots"
            className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground text-sm font-semibold px-6 py-2.5 hover:bg-primary/90 transition-colors"
          >
            Browse Lots
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {lots.map((lot) => {
            const { label } = lotStatusLabel(lot)
            const price = lot.price_per_unit_cents ? `${centsToDollars(lot.price_per_unit_cents)}/${lot.unit}` : "Negotiable"
            const variety = lot.breed?.name ?? lot.farm_produce?.name ?? "—"

            return (
              <div key={lot._id || lot.id || lot.slug} className="rounded-xl border p-4 sm:p-5 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-base font-bold min-w-0">
                    {label}, {formatDate(lot.created)}
                  </p>
                  <Link
                    href={`/account/lots/${lot.slug}`}
                    className="shrink-0 text-sm font-medium px-4 py-2 rounded-lg border hover:bg-muted transition-colors"
                  >
                    Lot Details
                  </Link>
                </div>
                <p className="text-sm text-muted-foreground">
                  {variety} · {lot.quantity?.toLocaleString()} {lot.unit} · {price} · {lot.type === "sell" ? "Selling" : "Buying"}
                </p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
