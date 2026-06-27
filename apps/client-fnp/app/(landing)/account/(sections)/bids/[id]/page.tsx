"use client"

import { use, useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Loader2, Gavel, ChevronLeft } from "lucide-react"
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

  // Poll Paynow every 4s while bid is accepted and awaiting payment
  useEffect(() => {
    if (!bid || bid.status !== "accepted") return
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
          clearInterval(interval)
        } else if (["Cancelled", "Disputed", "Refunded"].includes(res.data?.status)) {
          qc.invalidateQueries({ queryKey: ["my-bids"] })
          clearInterval(interval)
        }
      } catch {}
    }, 60000)
    return () => clearInterval(interval)
  }, [bid?.status, id])

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
          <p className="font-semibold">Sign in to view this bid</p>
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
          <Gavel className="w-12 h-12 mx-auto text-muted-foreground/40" />
          <p className="font-semibold">Bid not found</p>
          <Link href="/account/bids" className="text-sm text-primary hover:underline">Back to bids</Link>
        </div>
      </div>
    )
  }

  const isAccepted = bid.status === "accepted"
  const isPaid = bid.status === "paid" || bid.status === "completed"

  return (
    <div>
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-4">
        <Link href="/account" className="hover:text-foreground transition-colors">Account</Link>
        <span>/</span>
        <Link href="/account/bids" className="hover:text-foreground transition-colors">My Bids</Link>
        <span>/</span>
        <span className="text-foreground font-medium font-mono">{bid.lot_slug}</span>
      </nav>

      <p className="text-sm text-muted-foreground mb-6">
        {bid.lot_type === "request"
          ? <>Your supply offer on lot <Link href={`/lots/${bid.lot_slug}`} className="text-primary hover:underline font-mono">{bid.lot_slug}</Link> was accepted — you have been selected to supply.</>
          : isPaid
            ? <>Your bid on lot <Link href={`/lots/${bid.lot_slug}`} className="text-primary hover:underline font-mono">{bid.lot_slug}</Link> was accepted and payment confirmed.</>
            : isAccepted
              ? <>Your bid on lot <Link href={`/lots/${bid.lot_slug}`} className="text-primary hover:underline font-mono">{bid.lot_slug}</Link> was accepted — complete payment to secure this lot.</>
              : <>You placed a bid on lot <Link href={`/lots/${bid.lot_slug}`} className="text-primary hover:underline font-mono">{bid.lot_slug}</Link>.</>
        }
      </p>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href={`/lots/${bid.lot_slug}`} className="text-base font-bold font-mono hover:text-primary transition-colors">{bid.lot_slug}</Link>
          <span className={`text-xs px-2.5 py-1 rounded-md font-medium ${STATUS_STYLES[bid.status] ?? "bg-muted text-muted-foreground"}`}>
            {capitalize(bid.status)}
          </span>
        </div>
        <Link href="/account/bids" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ChevronLeft className="w-4 h-4" />
          All Bids
        </Link>
      </div>

      <div className="flex gap-6">
        {/* Image */}
        {(bid.lot_main_image || bid.lot_images?.length > 0) && (
          <div className="w-2/3 shrink-0">
            <LotImageGallery mainImage={bid.lot_main_image} images={bid.lot_images} />
          </div>
        )}

        {/* Details */}
        <div className="flex-1 flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Your Bid</p>
              <p className="font-semibold text-lg">{centsToDollars(bid.offered_price_per_unit_cents)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Quantity</p>
              <p className="font-semibold">{bid.quantity} {bid.unit}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Placed</p>
              <p className="font-semibold text-sm">{formatDate(bid.created)}</p>
            </div>
            {bid.reviewed_at && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Accepted</p>
                <p className="font-semibold text-sm">{formatDate(bid.reviewed_at)}</p>
              </div>
            )}
            {bid.notes && (
              <div className="col-span-2">
                <p className="text-xs text-muted-foreground mb-1">Notes</p>
                <p className="text-sm">{bid.notes}</p>
              </div>
            )}
            {bid.delivery_location && (
              <div className="col-span-2">
                <p className="text-xs text-muted-foreground mb-1">Delivery Location</p>
                <p className="text-sm">{bid.delivery_location}</p>
              </div>
            )}
          </div>

          {isPaid && (
            <div className="border-l-2 border-green-500 pl-3">
              <p className="text-sm font-semibold text-green-700 dark:text-green-400">Payment received — lot secured</p>
              <p className="text-xs text-muted-foreground mt-0.5">We will be in touch to arrange delivery.</p>
            </div>
          )}

          {isAccepted && bid.lot_type === "request" && (
            <div className="border-l-2 border-green-500 pl-3">
              <p className="text-sm font-semibold text-green-700 dark:text-green-400">You have been selected to supply</p>
              <p className="text-xs text-muted-foreground mt-0.5">The buyer will arrange payment and logistics shortly.</p>
            </div>
          )}

          {isAccepted && bid.lot_type !== "request" && bid.payment_deadline && (
            <div className="space-y-3">
              <div className="border-l-2 border-amber-500 pl-3">
                <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">Bid accepted — payment required</p>
                <p className="text-xs text-muted-foreground mt-0.5"><Countdown deadline={bid.payment_deadline} /></p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  disabled={paying}
                  onClick={async () => {
                    setPaying(true)
                    try {
                      const res = await initiateBidPayment(bid.id, {})
                      const redirectUrl = res.data?.redirect_url
                      if (redirectUrl) window.open(redirectUrl, "_blank")
                    } catch {
                      // silent
                    } finally {
                      setPaying(false)
                    }
                  }}
                  className="inline-flex items-center gap-2 rounded-md bg-primary text-primary-foreground text-sm font-semibold px-4 py-1.5 hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {paying ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Pay Now
                </button>
                <button
                  disabled={checking}
                  onClick={async () => {
                    setChecking(true)
                    try {
                      await pollBidPayment(id)
                      await refetch()
                    } catch {
                      // silent
                    } finally {
                      setChecking(false)
                    }
                  }}
                  className="inline-flex items-center gap-2 rounded-md border text-sm font-semibold px-4 py-1.5 hover:bg-muted transition-colors disabled:opacity-50"
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
