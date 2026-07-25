"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"
import Link from "next/link"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { LotImageGallery } from "@/components/ui/lot-image-gallery"
import { centsToDollars } from "@/lib/utilities"

function capitalize(s: string) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : "—"
}

function Countdown({ deadline }: { deadline: string }) {
  const diff = new Date(deadline).getTime() - Date.now()
  if (diff <= 0) return <span className="text-red-600 font-semibold">Deadline passed</span>
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  return <span className="font-semibold">{hours}h {minutes}m remaining</span>
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  })
}

const STATUS_STYLES: Record<string, string> = {
  pending:   "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  accepted:  "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  rejected:  "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  paid:      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  completed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  closed:    "bg-muted text-muted-foreground",
}

interface AcceptedOfferCardProps {
  /** The accepted bid data */
  bid: any
  /** Lot data for description/produce info */
  lot?: any
  /** "owner" = lot owner viewing | "bidder" = person who placed the bid */
  viewAs: "owner" | "bidder"
  /** Payment function — called with bid ID */
  onPay: (bidId: string) => Promise<{ data?: { redirect_url?: string } }>
  /** Poll function — called with bid ID */
  onPoll: (bidId: string) => Promise<any>
  /** Refetch after poll */
  onRefetch: () => void
}

export function AcceptedOfferCard({ bid, lot, viewAs, onPay, onPoll, onRefetch }: AcceptedOfferCardProps) {
  const [paying, setPaying] = useState(false)
  const [checking, setChecking] = useState(false)

  const isAccepted = bid.status === "accepted"
  const isPaid = bid.status === "paid" || bid.status === "completed"
  const lotType = lot?.type ?? bid.lot_type ?? "sell"
  const isSupplierView = (viewAs === "bidder" && lotType === "request") || (viewAs === "owner" && lotType === "sell")
  const showPayButtons = !isSupplierView && isAccepted

  const produceName = lot?.farm_produce?.name ?? bid.farm_produce_name ?? bid.lot_slug
  const breedName = lot?.breed?.name ?? bid.breed_name
  const conditionName = lot?.produce_condition?.name ?? bid.produce_condition_name
  const lotSlug = lot?.slug ?? bid.lot_slug
  const lotShortId = lot?.short_id ?? bid.lot_short_id ?? lotSlug?.split("-").pop()
  const bidderName = bid.bidder_name ?? "Bidder"
  const quantity = bid.quantity
  const unit = bid.unit
  const priceCents = bid.offered_price_per_unit_cents
  const totalCents = priceCents * quantity
  const supplyImage = bid.supply_images?.main_image ?? null
  const supplyImages = bid.supply_images?.images ?? []

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        {supplyImage && (
          <Dialog>
            <DialogTrigger asChild>
              <img src={supplyImage.img.src} alt="Supply" className="w-12 h-12 rounded-lg object-cover cursor-pointer hover:opacity-80 transition-opacity shrink-0" />
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <LotImageGallery mainImage={supplyImage} images={supplyImages} />
            </DialogContent>
          </Dialog>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-lg font-bold capitalize">{bidderName}</p>
          <p className="text-sm text-muted-foreground">
            {lotType === "sell"
              ? `Buyer — offered to buy ${quantity} ${unit} at ${centsToDollars(priceCents)} per ${unit}.`
              : `Supplier — offered to supply ${quantity} ${unit} at ${centsToDollars(priceCents)} per ${unit}.`}
          </p>
        </div>
        <span className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ${STATUS_STYLES[bid.status] ?? STATUS_STYLES.closed}`}>
          {capitalize(bid.status)}
        </span>
      </div>

      {/* Invoice table */}
      <div className="border-t border-b py-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Offer Summary</p>
            <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
              <span>Placed: <span className="font-medium text-foreground">{formatDate(bid.created)}</span></span>
              {bid.reviewed_at && <span>Accepted: <span className="font-medium text-foreground">{formatDate(bid.reviewed_at)}</span></span>}
            </div>
          </div>
          {lotSlug && (
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Lot No.</p>
              <Link href={`/lots/${lotSlug}`} className="text-sm font-bold text-foreground hover:text-primary font-mono">{lotShortId?.toUpperCase()}</Link>
            </div>
          )}
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
              <td className="py-3">
                <p className="font-medium">{produceName}</p>
                {breedName && <p className="text-xs text-muted-foreground">{breedName}</p>}
                {conditionName && <p className="text-xs text-muted-foreground">{conditionName}</p>}
              </td>
              <td className="py-3 text-right">{quantity} {unit}</td>
              <td className="py-3 text-right">{centsToDollars(priceCents)}/{unit}</td>
              <td className="py-3 text-right font-semibold">{centsToDollars(totalCents)}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={3} className="py-3 text-right font-semibold text-muted-foreground">Total</td>
              <td className="py-3 text-right text-lg font-bold">{centsToDollars(totalCents)}</td>
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

      {/* Status + actions */}
      {isPaid && (
        <div className="rounded-lg bg-green-50 dark:bg-green-900/20 p-4 space-y-1">
          <p className="text-sm font-semibold text-green-800 dark:text-green-300">Payment confirmed</p>
          <p className="text-xs text-green-700 dark:text-green-400">
            {isSupplierView
              ? "Payment received. Arrange delivery within 2 days."
              : "Held securely — released to supplier on delivery."}
          </p>
          {bid.payment_ref && <p className="text-xs font-mono text-green-800 dark:text-green-300">Ref: {bid.payment_ref}</p>}
        </div>
      )}

      {isAccepted && isSupplierView && (
        <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 p-4 space-y-1">
          <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">Waiting for buyer to pay</p>
          <p className="text-xs text-amber-700 dark:text-amber-400">
            The buyer has 24 hours to complete payment. You will be notified once payment is received.
          </p>
          {bid.payment_deadline && (
            <p className="text-xs text-amber-700 dark:text-amber-400">
              <Countdown deadline={bid.payment_deadline} />
            </p>
          )}
        </div>
      )}

      {showPayButtons && (
        <div className="space-y-3">
          <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 p-4 space-y-1">
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">Payment required</p>
            <p className="text-xs text-amber-700 dark:text-amber-400">
              Your payment is held securely by Farmnport and only released to the supplier once delivery is confirmed.
              {bid.payment_deadline && <> Time remaining: <Countdown deadline={bid.payment_deadline} /></>}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              disabled={paying}
              onClick={async () => {
                setPaying(true)
                try {
                  const res = await onPay(bid.id)
                  const redirectUrl = res.data?.redirect_url
                  if (redirectUrl) window.open(redirectUrl, "_blank")
                } catch {
                  // silent
                } finally {
                  setPaying(false)
                }
              }}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-primary text-primary-foreground text-sm font-semibold px-5 py-2.5 hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {paying ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Pay Now
            </button>
            <button
              disabled={checking}
              onClick={async () => {
                setChecking(true)
                try {
                  await onPoll(bid.id)
                  onRefetch()
                } catch {
                  // silent
                } finally {
                  setChecking(false)
                }
              }}
              className="inline-flex items-center justify-center gap-2 rounded-md border text-sm font-semibold px-5 py-2.5 hover:bg-muted transition-colors disabled:opacity-50"
            >
              {checking ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              I have paid
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
