"use client"

import { use } from "react"
import { useSession } from "next-auth/react"
import { useQuery } from "@tanstack/react-query"
import { Loader2, ChevronLeft } from "lucide-react"
import Link from "next/link"
import { myLotBids } from "@/lib/query"
import { centsToDollars } from "@/lib/utilities"
import { LotImageGallery } from "@/components/ui/lot-image-gallery"
import { formatDistanceToNow } from "date-fns"

const STATUS_STYLES: Record<string, string> = {
  pending:   "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  accepted:  "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  rejected:  "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  closed:    "bg-muted text-muted-foreground",
}

function capitalize(s: string) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : "—"
}

export default function MyLotDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const { data: session } = useSession()

  const { data, isLoading } = useQuery({
    queryKey: ["my-lot-bids", slug],
    queryFn: () => myLotBids(slug).then((r) => r.data),
    enabled: !!session,
    refetchOnMount: "always",
  })

  const bids: any[] = data?.data ?? []
  const total: number = data?.total ?? 0
  const accepted = bids.find((b) => b.status === "accepted")

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div>
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-4">
        <Link href="/account" className="hover:text-foreground transition-colors">Account</Link>
        <span>/</span>
        <Link href="/account/lots" className="hover:text-foreground transition-colors">My Lots</Link>
        <span>/</span>
        <span className="text-foreground font-medium font-mono">{slug}</span>
      </nav>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold font-mono">{slug}</h1>
        <Link href="/account/lots" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ChevronLeft className="w-4 h-4" />
          My Lots
        </Link>
      </div>

      {accepted && (
        <div className="rounded-xl bg-green-50 dark:bg-green-900/20 p-4 mb-6 space-y-1">
          <p className="text-sm font-semibold text-green-800 dark:text-green-300">Offer accepted — {centsToDollars(accepted.offered_price_per_unit_cents)}</p>
          <p className="text-xs text-green-700 dark:text-green-400 capitalize">From {accepted.bidder_name} · {accepted.quantity} {accepted.unit}</p>
          {accepted.supply_images?.main_image && (
            <div className="mt-3">
              <LotImageGallery mainImage={accepted.supply_images.main_image} images={accepted.supply_images.images ?? []} />
            </div>
          )}
        </div>
      )}

      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold">{total} offer{total !== 1 ? "s" : ""} received</p>
      </div>

      {bids.length === 0 ? (
        <p className="text-sm text-muted-foreground py-8 text-center">No offers yet.</p>
      ) : (
        <div className="divide-y">
          {bids.map((bid) => (
            <div key={bid.id} className="flex items-start gap-3 py-4">
              {bid.supply_images?.main_image && (
                <img src={bid.supply_images.main_image.img.src} alt="Supply" className="w-12 h-12 rounded-lg object-cover shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-sm capitalize">{bid.bidder_name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${STATUS_STYLES[bid.status] ?? "bg-muted text-muted-foreground"}`}>
                    {capitalize(bid.status)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {bid.quantity} {bid.unit} · {formatDistanceToNow(new Date(bid.created), { addSuffix: true })}
                </p>
              </div>
              <p className="font-semibold text-sm shrink-0">{centsToDollars(bid.offered_price_per_unit_cents)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
