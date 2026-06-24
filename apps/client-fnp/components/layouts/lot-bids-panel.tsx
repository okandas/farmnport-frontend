"use client"

import { useRef, useState, useEffect, useCallback } from "react"
import { useQuery } from "@tanstack/react-query"
import { formatDistanceToNow } from "date-fns"
import { centsToDollars } from "@/lib/utilities"
import { getLotBids } from "@/lib/query"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { LotImageGallery } from "@/components/ui/lot-image-gallery"

const PAGE_SIZE = 20

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
  slug: string
  lotType?: string
  myBidId?: string
  myBidMainImage?: { img: { id: string; src: string } } | null
  myBidImages?: { img: { id: string; src: string } }[]
}

export function LotBidsPanel({ slug, lotType, myBidId, myBidMainImage, myBidImages }: Props) {
  const [galleryOpen, setGalleryOpen] = useState(false)
  const [visible, setVisible] = useState(PAGE_SIZE)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const { data } = useQuery({
    queryKey: ["lot-bids", slug],
    queryFn: () => getLotBids(slug).then((r) => r.data),
    refetchInterval: 15000,
  })

  const bids: PublicBid[] = data?.bids ?? []
  const total: number = data?.total ?? 0
  const top_bid = data?.top_bid ?? null
  const accepted = data?.accepted ?? null
  const hasMore = visible < bids.length

  const loadMore = useCallback(() => {
    setVisible((v) => Math.min(v + PAGE_SIZE, bids.length))
  }, [bids.length])

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) loadMore()
      },
      { root: listRef.current, threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [hasMore, loadMore])

  if (total === 0) {
    return (
      <div className="py-4 text-center space-y-1">
        <p className="text-sm font-medium text-foreground">No offers yet</p>
        <p className="text-xs text-muted-foreground">Be the first to place an offer on this lot.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <Dialog open={galleryOpen} onOpenChange={setGalleryOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Your supply photos</DialogTitle>
          </DialogHeader>
          <LotImageGallery mainImage={myBidMainImage ?? null} images={myBidImages ?? []} />
        </DialogContent>
      </Dialog>
      <div className="flex items-center justify-between pb-1">
        <span className="text-sm font-semibold text-foreground">Offers</span>
        {top_bid && !accepted && (
          <div className="text-right">
            <p className="text-xs text-muted-foreground">{lotType === "request" ? "Best Offer" : "Top Bid"}</p>
            <p className="text-2xl font-bold text-foreground">{centsToDollars(top_bid.offered_price_per_unit_cents)}</p>
          </div>
        )}
      </div>

      <div ref={listRef} className="max-h-64 overflow-y-auto pr-1">
        {bids.slice(0, visible).map((bid) => {
          const isMe = myBidId === bid.id
          return (
            <div key={bid.id} className="flex items-center justify-between py-2 text-sm gap-3">
              {isMe && myBidMainImage && (
                <button type="button" onClick={() => setGalleryOpen(true)} className="shrink-0">
                  <img src={myBidMainImage.img.src} alt="Your supply photo" className="w-8 h-8 rounded object-cover hover:opacity-80 transition-opacity" />
                </button>
              )}
              <span className={`flex-1 min-w-0 ${isMe ? "text-green-600" : "text-foreground"}`}>
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
        {hasMore && <div ref={sentinelRef} className="h-4" />}
      </div>
    </div>
  )
}
