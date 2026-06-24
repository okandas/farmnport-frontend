"use client"

import { useSession } from "next-auth/react"
import { useQuery } from "@tanstack/react-query"
import { Loader2, Package } from "lucide-react"
import Link from "next/link"
import { myLots } from "@/lib/query"
import { centsToDollars } from "@/lib/utilities"

const STATUS_STYLES: Record<string, string> = {
  live:      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  fulfilled: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  pending:   "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  expired:   "bg-muted text-muted-foreground",
}

function lotStatus(lot: any): { label: string; style: string } {
  if (lot.has_accepted_bid) return { label: "Fulfilled", style: STATUS_STYLES.fulfilled }
  const expired = lot.expires_at && new Date(lot.expires_at) < new Date()
  if (expired) return { label: "Expired", style: STATUS_STYLES.expired }
  if (!lot.moderated) return { label: "Pending", style: STATUS_STYLES.pending }
  return { label: "Live", style: STATUS_STYLES.live }
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
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
      <h1 className="text-xl font-bold mb-6">My Lots</h1>

      {lots.length === 0 ? (
        <div className="text-center py-16 space-y-4">
          <Package className="w-12 h-12 mx-auto text-muted-foreground/40" />
          <p className="font-semibold">No lots yet</p>
          <p className="text-sm text-muted-foreground">When you post a lot, it will appear here.</p>
        </div>
      ) : (
        <div className="divide-y">
          {lots.map((lot) => {
            const { label, style } = lotStatus(lot)
            return (
              <Link key={lot.id} href={`/account/lots/${lot.slug}`} className="flex items-start justify-between gap-3 py-4 hover:bg-muted/50 transition-colors px-1">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm font-mono">{lot.slug}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${style}`}>{label}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${lot.type === "sell" ? "bg-blue-50 text-blue-700" : "bg-green-50 text-green-700"}`}>
                      {lot.type === "sell" ? "Selling" : "Buying"}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground capitalize">
                    {lot.breed?.name ?? lot.farm_produce?.name ?? "—"} · {lot.quantity?.toLocaleString()} {lot.unit}
                  </p>
                  <p className="text-xs text-muted-foreground">Listed {formatDate(lot.created)}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-semibold text-sm">{centsToDollars(lot.price_per_unit_cents)}</p>
                  <p className="text-xs text-muted-foreground">per {lot.unit}</p>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
