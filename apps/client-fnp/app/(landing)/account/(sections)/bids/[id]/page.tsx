"use client"

import { use, useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Loader2, ChevronLeft } from "lucide-react"
import Link from "next/link"
import { myBidByID, initiateBidPayment, pollBidPayment } from "@/lib/query"
import { trackPurchase } from "@/lib/analytics"
import { centsToDollars } from "@/lib/utilities"
import { LotImageGallery } from "@/components/ui/lot-image-gallery"

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
  const [paying, setPaying] = useState(false)
  const [checking, setChecking] = useState(false)

  const qc = useQueryClient()

  const { data: bid, isLoading, refetch } = useQuery({
    queryKey: ["my-bid", id],
    queryFn: () => myBidByID(id).then((r) => r.data),
    enabled: !!session && !!id,
    refetchOnMount: "always",
  })

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

      {/* Image + Details */}
      <div className="flex flex-col sm:flex-row gap-6 mb-8">
        {(bid.lot_main_image || bid.lot_images?.length > 0) && (
          <div className="w-full sm:w-80 shrink-0">
            <LotImageGallery mainImage={bid.lot_main_image} images={bid.lot_images} />
          </div>
        )}

        <div className="flex-1 space-y-6">
          {/* Invoice-style details */}
          <div className="border-t border-b py-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Offer Summary</p>
                <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                  <span>Placed: <span className="font-medium text-foreground">{formatDate(bid.created)}</span></span>
                  {bid.reviewed_at && <span>{isAccepted || isPaid ? "Accepted" : "Reviewed"}: <span className="font-medium text-foreground">{formatDate(bid.reviewed_at)}</span></span>}
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Lot No.</p>
                <Link href={`/lots/${bid.lot_slug}`} className="text-sm font-bold text-foreground hover:text-primary">{bid.lot_slug}</Link>
              </div>
            </div>

            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-xs text-muted-foreground uppercase tracking-wide">
                  <th className="text-left py-2 font-medium">Lot Description</th>
                  <th className="text-right py-2 font-medium">Quantity</th>
                  <th className="text-right py-2 font-medium">Price</th>
                  <th className="text-right py-2 font-medium">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-3 font-medium">{bid.farm_produce_name || bid.lot_slug}</td>
                  <td className="py-3 text-right">{bid.quantity} {bid.unit}</td>
                  <td className="py-3 text-right">{centsToDollars(bid.offered_price_per_unit_cents)}/{bid.unit}</td>
                  <td className="py-3 text-right font-semibold">{centsToDollars(bid.offered_price_per_unit_cents * bid.quantity)}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={3} className="py-3 text-right font-semibold text-muted-foreground">Total</td>
                  <td className="py-3 text-right text-lg font-bold">{centsToDollars(bid.offered_price_per_unit_cents * bid.quantity)}</td>
                </tr>
              </tfoot>
            </table>

            {bid.notes && (
              <div className="pt-3 border-t text-xs">
                <p className="text-muted-foreground">Notes</p>
                <p className="text-sm mt-1">{bid.notes}</p>
              </div>
            )}
            {bid.delivery_location && (
              <div className="pt-3 border-t text-xs">
                <p className="text-muted-foreground">Delivery Location</p>
                <p className="text-sm mt-1">{bid.delivery_location}</p>
              </div>
            )}
          </div>

          {/* Status action */}
          {isPaid && (
            <div className="rounded-lg bg-green-50 dark:bg-green-900/20 p-4 space-y-1">
              <p className="text-sm font-semibold text-green-800 dark:text-green-300">Payment confirmed</p>
              <p className="text-xs text-green-700 dark:text-green-400">Lot secured. We will be in touch to arrange delivery.</p>
              {bid.payment_ref && <p className="text-xs font-mono text-green-800 dark:text-green-300">Ref: {bid.payment_ref}</p>}
            </div>
          )}


          {isAccepted && isBuyer && bid.payment_deadline && (
            <div className="space-y-3">
              <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 p-4 space-y-1">
                <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">Offer accepted — payment required</p>
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  Complete payment to secure this lot. Time remaining: <Countdown deadline={bid.payment_deadline} />
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  disabled={paying}
                  onClick={async () => {
                    setPaying(true)
                    try {
                      const res = await initiateBidPayment(bid.id, {})
                      const redirectUrl = res.data?.redirect_url
                      if (redirectUrl) {
                        window.open(redirectUrl, "_blank")
                        setPolling(true)
                      }
                    } catch {
                      // silent
                    } finally {
                      setPaying(false)
                    }
                  }}
                  className="inline-flex items-center gap-2 rounded-md bg-primary text-primary-foreground text-sm font-semibold px-5 py-2.5 hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {paying ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Pay Now
                </button>
                <button
                  disabled={checking}
                  onClick={async () => {
                    setChecking(true)
                    setPolling(true)
                    try {
                      await pollBidPayment(id)
                      await refetch()
                    } catch {
                      // silent
                    } finally {
                      setChecking(false)
                    }
                  }}
                  className="inline-flex items-center gap-2 rounded-md border text-sm font-semibold px-5 py-2.5 hover:bg-muted transition-colors disabled:opacity-50"
                >
                  {checking ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  I have paid
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
