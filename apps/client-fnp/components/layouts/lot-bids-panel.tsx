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
  lotUnit: string
}

export function LotBidsPanel({ total, bids, top_bid, accepted, lotUnit }: Props) {
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

      {/* Summary row */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{total} {total === 1 ? "offer" : "offers"} placed</span>
        {top_bid && (
          <span className="font-medium text-foreground">
            Best: {centsToDollars(top_bid.offered_price_per_unit_cents)}/{lotUnit}
          </span>
        )}
      </div>

      {/* Bid list */}
      <div className="space-y-2">
        {bids.map((bid) => (
          <div key={bid.id} className="flex items-center justify-between rounded-lg border bg-card px-4 py-3 text-sm">
            <div className="space-y-0.5">
              <p className="font-medium capitalize">{bid.bidder_role === "buyer" ? "Buyer" : "Seller"}</p>
              <p className="text-xs text-muted-foreground">
                {bid.quantity.toLocaleString()} {bid.unit}
                {bid.status === "accepted" && <span className="ml-2 text-green-600 font-medium">· Accepted</span>}
                {bid.status === "rejected" && <span className="ml-2 text-red-500 font-medium">· Not accepted</span>}
              </p>
            </div>
            <div className="text-right space-y-0.5">
              <p className="font-semibold">{centsToDollars(bid.offered_price_per_unit_cents)}/{bid.unit}</p>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(bid.created), { addSuffix: true })}
              </p>
            </div>
          </div>
        ))}
      </div>

    </div>
  )
}
