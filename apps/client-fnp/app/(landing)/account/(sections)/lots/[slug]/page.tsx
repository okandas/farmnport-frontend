"use client"

import { use, useState } from "react"
import { useSession } from "next-auth/react"
import { useQuery } from "@tanstack/react-query"
import { Loader2, ChevronLeft } from "lucide-react"
import Link from "next/link"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { myLotBids, initiateLotOwnerBidPayment, pollLotOwnerBidPayment, respondToBid } from "@/lib/query"
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
  const [paying, setPaying] = useState(false)
  const [checking, setChecking] = useState(false)
  const [responding, setResponding] = useState<string | null>(null)

  async function handleRespond(bidId: string, action: "accept" | "reject") {
    setResponding(bidId + action)
    try {
      await respondToBid(bidId, { action })
      await refetch()
    } catch {
      // silent
    } finally {
      setResponding(null)
    }
  }

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["my-lot-bids", slug],
    queryFn: () => myLotBids(slug).then((r) => r.data),
    enabled: !!session,
    refetchOnMount: "always",
  })

  const bids: any[] = data?.data ?? []
  const total: number = data?.total ?? 0
  const lot: any = data?.lot ?? null
  const accepted = bids.find((b) => ["accepted", "paid", "completed"].includes(b.status))

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

      {lot && (
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          {lot.main_image?.img?.src ? (
            <img src={lot.main_image.img.src} alt={lot.farm_produce?.name ?? "Lot"} className="w-full sm:w-80 h-48 sm:h-80 rounded-lg object-cover shrink-0" />
          ) : (
            <div className="w-full sm:w-80 h-48 sm:h-80 rounded-lg bg-muted/30 shrink-0" />
          )}
          <div className="flex-1 min-w-0 flex flex-col gap-3">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-xl font-bold leading-tight">{lot.farm_produce?.name ?? slug}</h1>
                {lot.breed?.name && <p className="text-sm text-muted-foreground mt-0.5">{lot.breed.name}</p>}
              </div>
              <Link href="/account/lots" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground shrink-0">
                <ChevronLeft className="w-4 h-4" />
                My Lots
              </Link>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">
                {lot.quantity?.toLocaleString()} {lot.farm_produce?.name ?? "items"} · {centsToDollars(lot.price_per_unit_cents)} per {capitalize(lot.unit)}
              </p>
              {lot.produce_condition?.name && (
                <p className="text-xs text-muted-foreground">Condition: {lot.produce_condition.name}</p>
              )}
            </div>
            <div className="mt-auto flex items-center gap-2">
              <span className={`inline-flex items-center text-xs px-2 py-0.5 rounded-md font-medium ${lot.type === "sell" ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"}`}>
                {lot.type === "sell" ? "Selling" : "Buying"}
              </span>
              {lot.expires_at && (
                <span className="text-xs text-muted-foreground">
                  Expires {new Date(lot.expires_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {!lot && (
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-base font-bold font-mono">{slug}</h1>
          <Link href="/account/lots" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ChevronLeft className="w-4 h-4" />
            My Lots
          </Link>
        </div>
      )}

      {accepted && (
        <div className="rounded-xl border p-5 mb-8">
          <div className="flex items-center gap-3 mb-4">
            {accepted.supply_images?.main_image && (
              <Dialog>
                <DialogTrigger asChild>
                  <img src={accepted.supply_images.main_image.img.src} alt="Supply" className="w-14 h-14 rounded-lg object-cover cursor-pointer hover:opacity-80 transition-opacity shrink-0" />
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <LotImageGallery mainImage={accepted.supply_images.main_image} images={accepted.supply_images.images ?? []} />
                </DialogContent>
              </Dialog>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-semibold capitalize">{accepted.bidder_name}</p>
              <p className="text-xs text-muted-foreground">{lot?.type === "sell" ? "Buyer" : "Supplier"}</p>
            </div>
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ${STATUS_STYLES[accepted.status]}`}>
              {capitalize(accepted.status)}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 py-3 mb-4 text-center">
            <div>
              <p className="text-[11px] text-muted-foreground uppercase tracking-wide">Quantity</p>
              <p className="text-sm font-semibold mt-0.5">{accepted.quantity} {accepted.unit}</p>
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground uppercase tracking-wide">Price</p>
              <p className="text-sm font-semibold mt-0.5">{centsToDollars(accepted.offered_price_per_unit_cents)}/{accepted.unit}</p>
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground uppercase tracking-wide">Total</p>
              <p className="text-sm font-semibold mt-0.5">{centsToDollars(accepted.offered_price_per_unit_cents * accepted.quantity)}</p>
            </div>
          </div>

          {["paid", "completed"].includes(accepted.status) ? (
            <div className="rounded-lg bg-green-50 dark:bg-green-900/20 p-3 space-y-1">
              <p className="text-xs font-semibold text-green-800 dark:text-green-300">Payment confirmed</p>
              <p className="text-xs text-green-700 dark:text-green-400">
                {lot?.type === "sell" ? "Payment received from buyer. Arrange delivery." : "Held securely — released to supplier on delivery."}
              </p>
              {accepted.payment_ref && (
                <p className="text-xs font-mono text-green-800 dark:text-green-300">Ref: {accepted.payment_ref}</p>
              )}
            </div>
          ) : lot?.type === "sell" ? (
            <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 p-3 space-y-1">
              <p className="text-xs font-semibold text-amber-800 dark:text-amber-300">Waiting for buyer to pay</p>
              <p className="text-xs text-amber-700 dark:text-amber-400">
                {accepted.bidder_name} has 24 hours to complete payment. You will be notified once payment is received.
              </p>
            </div>
          ) : (
            <>
              <div className="rounded-lg bg-muted/50 p-3 space-y-1 mb-3">
                <p className="text-xs font-semibold">Ready to pay?</p>
                <p className="text-xs text-muted-foreground">Your payment is held securely by Farmnport and only released to the supplier once delivery is confirmed.</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  disabled={paying}
                  onClick={async () => {
                    setPaying(true)
                    try {
                      const res = await initiateLotOwnerBidPayment(accepted.id, {})
                      const redirectUrl = res.data?.redirect_url
                      if (redirectUrl) window.open(redirectUrl, "_blank")
                    } catch (e) {
                      console.error("pay error", e)
                    } finally {
                      setPaying(false)
                    }
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-md bg-primary text-primary-foreground text-sm font-semibold px-4 py-2 hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {paying ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Pay Now
                </button>
                <button
                  disabled={checking}
                  onClick={async () => {
                    setChecking(true)
                    try {
                      await pollLotOwnerBidPayment(accepted.id)
                      await refetch()
                    } catch {
                      // silent
                    } finally {
                      setChecking(false)
                    }
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-md border text-sm font-semibold px-4 py-2 hover:bg-muted transition-colors disabled:opacity-50"
                >
                  {checking ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  I have paid
                </button>
              </div>
            </>
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
            <div key={bid.id} className="py-4 space-y-2">
              <div className="flex items-center gap-3">
                {bid.supply_images?.main_image ? (
                  <Dialog>
                    <DialogTrigger asChild>
                      <img src={bid.supply_images.main_image.img.src} alt="Supply" className="w-12 h-12 rounded-lg object-cover shrink-0 cursor-pointer hover:opacity-80 transition-opacity" />
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <LotImageGallery mainImage={bid.supply_images.main_image} images={bid.supply_images.images ?? []} />
                    </DialogContent>
                  </Dialog>
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-muted/30 shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm capitalize truncate">{bid.bidder_name}</span>
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
              {!accepted && bid.status === "pending" && (
                <div className="flex items-center gap-1.5 pl-15 sm:pl-0 sm:justify-end">
                  <button
                    disabled={!!responding}
                    onClick={() => handleRespond(bid.id, "accept")}
                    className="text-xs font-semibold px-3 py-1.5 rounded-md bg-green-600 text-white hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    {responding === bid.id + "accept" ? <Loader2 className="w-3 h-3 animate-spin" /> : "Accept"}
                  </button>
                  <button
                    disabled={!!responding}
                    onClick={() => handleRespond(bid.id, "reject")}
                    className="text-xs font-semibold px-3 py-1.5 rounded-md border hover:bg-muted transition-colors disabled:opacity-50"
                  >
                    {responding === bid.id + "reject" ? <Loader2 className="w-3 h-3 animate-spin" /> : "Decline"}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
