import { formatDistanceToNow } from "date-fns"
import { centsToDollars } from "@/lib/utilities"

interface PublicBid {
  id: string
  bidder_role: string
  quantity: number
  unit: string
  offered_price_per_unit_cents: number
  total_cents: number
  status: string
  created: string
}

interface Props {
  total: number
  bids: PublicBid[]
  top_bid: PublicBid | null
  accepted: PublicBid | null
  myBidId?: string
}

export function LotBidsPanel({ total, bids, top_bid, accepted, myBidId }: Props) {
  if (total === 0) {
    return (
      <div className="rounded-xl border border-dashed bg-muted/30 p-5 text-center space-y-1">
        <p className="text-sm font-medium text-foreground">No offers yet</p>
        <p className="text-xs text-muted-foreground">Be the first to place an offer on this lot.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">

      {/* Accepted deal banner */}
      {accepted && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-green-700 mb-1">Deal agreed</p>
          <p className="text-sm text-green-800">
            {accepted.quantity.toLocaleString()} {accepted.unit} @ {centsToDollars(accepted.offered_price_per_unit_cents)}/{accepted.unit}
          </p>
        </div>
      )}

      {/* Header row */}
      <div className="flex items-center justify-between border-b border-border pb-2">
        <span className="text-sm font-semibold text-foreground">Offers</span>
        {top_bid && (
          <span className="text-sm text-muted-foreground">
            Best offer: <span className="font-semibold text-foreground">{centsToDollars(top_bid.offered_price_per_unit_cents)}</span>
          </span>
        )}
      </div>

      {/* Bid list */}
      <div className="divide-y divide-border">
        {bids.map((bid) => {
          const isMe = myBidId === bid.id
          return (
            <div key={bid.id} className="flex items-center justify-between py-2.5 text-sm">
              <span className={`${isMe ? "text-green-600" : "text-foreground"}`}>
                <span className="font-medium">{isMe ? "Your bid" : bid.bidder_role === "buyer" ? "Buyer" : "Seller"}</span>
                <span className="text-muted-foreground"> · {bid.quantity.toLocaleString()} {bid.unit}</span>
                {bid.status === "accepted" && <span className="text-green-600 font-medium"> · Accepted</span>}
                {bid.status === "rejected" && <span className="text-red-400"> · Declined</span>}
                <span className="text-muted-foreground"> · {formatDistanceToNow(new Date(bid.created), { addSuffix: true })}</span>
              </span>
              <span className={`font-semibold tabular-nums shrink-0 ml-4 ${isMe ? "text-green-600" : "text-foreground"}`}>
                {centsToDollars(bid.offered_price_per_unit_cents)}
              </span>
            </div>
          )
        })}
      </div>

    </div>
  )
}
