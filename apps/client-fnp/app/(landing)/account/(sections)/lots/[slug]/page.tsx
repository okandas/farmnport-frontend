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
import { AcceptedOfferCard } from "@/components/lots/AcceptedOfferCard"
import { formatDistanceToNow } from "date-fns"

const STATUS_STYLES: Record<string, string> = {
  pending:    "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  countered:  "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  accepted:   "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  rejected:   "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  closed:     "bg-muted text-muted-foreground",
}

function capitalize(s: string) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : "—"
}

export default function MyLotDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const { data: session } = useSession()
  const [responding, setResponding] = useState<string | null>(null)
  const [counterBidId, setCounterBidId] = useState<string | null>(null)
  const [counterPrice, setCounterPrice] = useState("")

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

  async function handleCounter(bidId: string) {
    const cents = Math.round(parseFloat(counterPrice) * 100)
    if (!cents || cents <= 0) return
    setResponding(bidId + "counter")
    try {
      await respondToBid(bidId, { action: "counter", price_per_unit_cents: cents })
      setCounterBidId(null)
      setCounterPrice("")
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
                <h1 className="text-xl font-bold leading-tight">
                  {lot.type === "sell" ? "Your Sell Lot" : "Your Supply Request Lot"} {lot.short_id || slug.split("-").pop()}
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  {lot.type === "sell"
                    ? `You are selling to buyers.`
                    : `You requested other farmers supply you with.`}
                </p>
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
              {lot.breed?.name && <p className="text-xs text-muted-foreground">Variety: {lot.breed.name}</p>}
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
        <div className="mb-8">
          <AcceptedOfferCard
            bid={accepted}
            lot={lot}
            viewAs="owner"
            onPay={(bidId) => initiateLotOwnerBidPayment(bidId, {})}
            onPoll={(bidId) => pollLotOwnerBidPayment(bidId)}
            onRefetch={() => refetch()}
          />
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
              {/* Counter-offer history */}
              {bid.counter_offers?.length > 0 && (
                <div className="pl-15 sm:pl-0 space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Negotiation history</p>
                  {bid.counter_offers.map((co: any, i: number) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="font-medium capitalize">{co.by_name}</span>
                      <span>→</span>
                      <span className="font-semibold text-foreground">{centsToDollars(co.price_per_unit_cents)}/{bid.unit}</span>
                      {co.notes && <span className="italic">"{co.notes}"</span>}
                      <span className="text-muted-foreground/60">{formatDistanceToNow(new Date(co.created_at), { addSuffix: true })}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Action buttons — show for pending bids or countered bids where it's the owner's turn */}
              {!accepted && (bid.status === "pending" || (bid.status === "countered" && bid.countered_by === "bidder")) && (
                <div className="space-y-2">
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
                      onClick={() => setCounterBidId(counterBidId === bid.id ? null : bid.id)}
                      className="text-xs font-semibold px-3 py-1.5 rounded-md bg-purple-600 text-white hover:bg-purple-700 transition-colors disabled:opacity-50"
                    >
                      Counter
                    </button>
                    <button
                      disabled={!!responding}
                      onClick={() => handleRespond(bid.id, "reject")}
                      className="text-xs font-semibold px-3 py-1.5 rounded-md border hover:bg-muted transition-colors disabled:opacity-50"
                    >
                      {responding === bid.id + "reject" ? <Loader2 className="w-3 h-3 animate-spin" /> : "Decline"}
                    </button>
                  </div>

                  {/* Inline counter-offer input */}
                  {counterBidId === bid.id && (
                    <div className="flex items-center gap-2 pl-15 sm:pl-0 sm:justify-end">
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-muted-foreground">$</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0.01"
                          placeholder="Price per unit"
                          value={counterPrice}
                          onChange={(e) => setCounterPrice(e.target.value)}
                          className="w-28 text-xs px-2 py-1.5 rounded-md border bg-background"
                        />
                        <span className="text-xs text-muted-foreground">/{bid.unit}</span>
                      </div>
                      <button
                        disabled={!!responding || !counterPrice}
                        onClick={() => handleCounter(bid.id)}
                        className="text-xs font-semibold px-3 py-1.5 rounded-md bg-purple-600 text-white hover:bg-purple-700 transition-colors disabled:opacity-50"
                      >
                        {responding === bid.id + "counter" ? <Loader2 className="w-3 h-3 animate-spin" /> : "Send"}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Show waiting message when lot owner has countered */}
              {bid.status === "countered" && bid.countered_by === "lot_owner" && (
                <p className="text-xs text-muted-foreground pl-15 sm:pl-0 sm:text-right">Waiting for {bid.bidder_name} to respond to your counter-offer</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
