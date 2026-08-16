"use client"

import { use, useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Loader2, ChevronLeft } from "lucide-react"
import Link from "next/link"
import { myBidByID, initiateBidPayment, pollBidPayment, respondToBid } from "@/lib/query"
import { trackPurchase } from "@/lib/analytics"
import { centsToDollars } from "@/lib/utilities"
import { LotImageGallery } from "@/components/ui/lot-image-gallery"
import { AcceptedOfferCard } from "@/components/lots/AcceptedOfferCard"

const STATUS_STYLES: Record<string, string> = {
  pending:    "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  countered:  "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  accepted:   "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  rejected:   "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  paid:       "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  completed:  "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  expired:    "bg-muted text-muted-foreground",
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
}

function Countdown({ deadline }: { deadline: string }) {
  const diff = new Date(deadline).getTime() - Date.now()
  if (diff <= 0) return <span className="text-red-600 font-semibold">Deadline passed</span>
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  return (
    <span className="font-semibold text-amber-700 dark:text-amber-400">
      {hours}h {minutes}m remaining
    </span>
  )
}

export default function BidDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: session, status } = useSession()
  const qc = useQueryClient()

  const { data: bid, isLoading, refetch } = useQuery({
    queryKey: ["my-bid", id],
    queryFn: () => myBidByID(id).then((r) => r.data),
    enabled: !!session && !!id,
    refetchOnMount: "always",
  })

  const [responding, setResponding] = useState<string | null>(null)
  const [counterPrice, setCounterPrice] = useState("")
  const [showCounterInput, setShowCounterInput] = useState(false)

  async function handleBidderRespond(action: "accept" | "reject") {
    setResponding(action)
    try {
      await respondToBid(id, { action })
      await refetch()
    } catch {
      // silent
    } finally {
      setResponding(null)
    }
  }

  async function handleBidderCounter() {
    const cents = Math.round(parseFloat(counterPrice) * 100)
    if (!cents || cents <= 0) return
    setResponding("counter")
    try {
      await respondToBid(id, { action: "counter", price_per_unit_cents: cents })
      setShowCounterInput(false)
      setCounterPrice("")
      await refetch()
    } catch {
      // silent
    } finally {
      setResponding(null)
    }
  }

  // Poll Paynow only after buyer clicks Pay Now (not for suppliers)
  const [polling, setPolling] = useState(false)

  useEffect(() => {
    if (!polling || !bid || bid.status !== "accepted" || bid.lot_type === "request") return
    const interval = setInterval(async () => {
      try {
        const res = await pollBidPayment(id)
        await refetch()
        if (res.data?.paid) {
          trackPurchase({
            transaction_id: bid.id,
            value: (bid.offered_price_per_unit_cents * bid.quantity) / 100,
            items: [{
              item_id: bid.lot_slug,
              item_name: `Lot ${bid.lot_slug} — ${bid.quantity} ${bid.unit}`,
              item_category: "lot",
              price: bid.offered_price_per_unit_cents / 100,
              quantity: bid.quantity,
            }],
          })
          qc.invalidateQueries({ queryKey: ["my-bids"] })
          setPolling(false)
          clearInterval(interval)
        } else if (["Cancelled", "Disputed", "Refunded"].includes(res.data?.status)) {
          qc.invalidateQueries({ queryKey: ["my-bids"] })
          setPolling(false)
          clearInterval(interval)
        }
      } catch {}
    }, 5000)
    return () => clearInterval(interval)
  }, [polling, bid?.status, id])

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
          <p className="font-semibold">Sign in to view this offer</p>
          <Link
            href={`/login?next=/account/bids/${id}`}
            className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground text-sm font-semibold px-6 py-2.5 hover:bg-primary/90 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    )
  }

  if (!bid) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center space-y-3">
          <p className="font-semibold">Offer not found</p>
          <Link href="/account/bids" className="text-sm text-primary hover:underline">Back to my offers</Link>
        </div>
      </div>
    )
  }

  const isAccepted = bid.status === "accepted"
  const isPaid = bid.status === "paid" || bid.status === "completed"
  const isSupplier = bid.lot_type === "request"
  const isBuyer = bid.lot_type === "sell"

  return (
    <div>
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-4">
        <Link href="/account" className="hover:text-foreground transition-colors">Account</Link>
        <span>/</span>
        <Link href="/account/bids" className="hover:text-foreground transition-colors">My Offers</Link>
        <span>/</span>
        <span className="text-foreground font-medium">{bid.lot_slug}</span>
      </nav>

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">
            {isSupplier ? "Your Supply Offer" : "Your Buy Offer"}
          </h1>
          <span className={`inline-flex text-xs px-2.5 py-1 rounded-md font-medium ${STATUS_STYLES[bid.status] ?? "bg-muted text-muted-foreground"}`}>
            {capitalize(bid.status)}
          </span>
          <p className="text-sm text-muted-foreground max-w-xl leading-relaxed">
            {isSupplier && isAccepted
              ? `You offered to supply ${bid.quantity} ${bid.unit} at ${centsToDollars(bid.offered_price_per_unit_cents)} per ${bid.unit}. The buyer accepted your offer. You will receive ${centsToDollars(bid.offered_price_per_unit_cents * bid.quantity)} once payment is confirmed. Please prepare your supply for delivery within 2 days of payment confirmation.`
              : isSupplier && isPaid
              ? `You supplied ${bid.quantity} ${bid.unit} at ${centsToDollars(bid.offered_price_per_unit_cents)} per ${bid.unit}. Payment of ${centsToDollars(bid.offered_price_per_unit_cents * bid.quantity)} has been confirmed. Arrange delivery and provide proof of delivery.`
              : isSupplier
              ? `You offered to supply ${bid.quantity} ${bid.unit} at ${centsToDollars(bid.offered_price_per_unit_cents)} per ${bid.unit}. Waiting for the buyer to review your offer.`
              : isBuyer && isAccepted
              ? `Your offer to buy ${bid.quantity} ${bid.unit} at ${centsToDollars(bid.offered_price_per_unit_cents)} per ${bid.unit} was accepted. Complete payment of ${centsToDollars(bid.offered_price_per_unit_cents * bid.quantity)} to secure this lot.`
              : isBuyer && isPaid
              ? `You bought ${bid.quantity} ${bid.unit} at ${centsToDollars(bid.offered_price_per_unit_cents)} per ${bid.unit}. Payment of ${centsToDollars(bid.offered_price_per_unit_cents * bid.quantity)} confirmed. The seller will arrange delivery within 2 days.`
              : bid.status === "countered" && bid.countered_by === "lot_owner"
              ? `The seller made a counter-offer of ${centsToDollars(bid.offered_price_per_unit_cents)} per ${bid.unit} (total ${centsToDollars(bid.total_cents)}). You can accept, decline, or counter back.`
              : bid.status === "countered" && bid.countered_by === "bidder"
              ? `You counter-offered ${centsToDollars(bid.offered_price_per_unit_cents)} per ${bid.unit}. Waiting for the seller to respond.`
              : `You offered to buy ${bid.quantity} ${bid.unit} at ${centsToDollars(bid.offered_price_per_unit_cents)} per ${bid.unit}. Waiting for the seller to review your offer.`
            }
          </p>
          <Link href={`/lots/${bid.lot_slug}`} className="text-sm text-primary hover:underline">
            View lot →
          </Link>
          {bid.payment_deadline && isAccepted && (
            <div className="mt-2">
              <p className="text-lg font-bold text-amber-700 dark:text-amber-400">
                Payment deadline: <Countdown deadline={bid.payment_deadline} />
              </p>
              <p className="text-xs text-muted-foreground">If payment is not received in time, your offer will be automatically rejected.</p>
            </div>
          )}
        </div>
        <Link href="/account/bids" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground shrink-0">
          <ChevronLeft className="w-4 h-4" />
          My Offers
        </Link>
      </div>

      {/* Counter-offer history */}
      {bid.counter_offers?.length > 0 && (
        <div className="mb-6 space-y-2">
          <p className="text-sm font-semibold">Negotiation history</p>
          <div className="space-y-1.5">
            {bid.counter_offers.map((co: any, i: number) => (
              <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="font-medium capitalize text-foreground">{co.by_name}</span>
                <span>→</span>
                <span className="font-semibold text-foreground">{centsToDollars(co.price_per_unit_cents)}/{bid.unit}</span>
                {co.notes && <span className="italic">"{co.notes}"</span>}
                <span className="text-xs text-muted-foreground/60">{formatDate(co.created_at)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bidder response to counter-offer */}
      {bid.status === "countered" && bid.countered_by === "lot_owner" && (
        <div className="mb-8 p-4 rounded-lg border border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-950/30 space-y-3">
          <p className="text-sm font-semibold">Respond to counter-offer</p>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              disabled={!!responding}
              onClick={() => handleBidderRespond("accept")}
              className="text-xs font-semibold px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {responding === "accept" ? <Loader2 className="w-3 h-3 animate-spin" /> : `Accept at ${centsToDollars(bid.offered_price_per_unit_cents)}/${bid.unit}`}
            </button>
            <button
              disabled={!!responding}
              onClick={() => setShowCounterInput(!showCounterInput)}
              className="text-xs font-semibold px-4 py-2 rounded-md bg-purple-600 text-white hover:bg-purple-700 transition-colors disabled:opacity-50"
            >
              Counter
            </button>
            <button
              disabled={!!responding}
              onClick={() => handleBidderRespond("reject")}
              className="text-xs font-semibold px-4 py-2 rounded-md border hover:bg-muted transition-colors disabled:opacity-50"
            >
              {responding === "reject" ? <Loader2 className="w-3 h-3 animate-spin" /> : "Decline"}
            </button>
          </div>
          {showCounterInput && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">$</span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                placeholder="Your price per unit"
                value={counterPrice}
                onChange={(e) => setCounterPrice(e.target.value)}
                className="w-32 text-sm px-3 py-2 rounded-md border bg-background"
              />
              <span className="text-sm text-muted-foreground">/{bid.unit}</span>
              <button
                disabled={!!responding || !counterPrice}
                onClick={handleBidderCounter}
                className="text-xs font-semibold px-4 py-2 rounded-md bg-purple-600 text-white hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                {responding === "counter" ? <Loader2 className="w-3 h-3 animate-spin" /> : "Send Counter"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Image + Details */}
      <div className="flex flex-col sm:flex-row gap-6 mb-8">
        {(bid.lot_main_image || bid.lot_images?.length > 0) && (
          <div className="w-full sm:w-80 shrink-0">
            <LotImageGallery mainImage={bid.lot_main_image} images={bid.lot_images} />
          </div>
        )}

        <div className="flex-1">
          <AcceptedOfferCard
            bid={bid}
            viewAs="bidder"
            onPay={async (bidId) => {
              const res = await initiateBidPayment(bidId, {})
              if (res.data?.redirect_url) setPolling(true)
              return res
            }}
            onPoll={async (bidId) => {
              setPolling(true)
              return pollBidPayment(bidId)
            }}
            onRefetch={() => refetch()}
          />
        </div>
      </div>
    </div>
  )
}
