"use client"

import { use, useState } from "react"
import Link from "next/link"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { CheckCircle2, Loader2 } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Icons } from "@/components/icons/lucide"
import { cn, centsToDollars } from "@/lib/utilities"
import { queryAdminLot, queryLotBids, adminAcceptBid } from "@/lib/query"
import { FormSkeleton } from "@/components/state/skeleton-table"
import { DashboardShell } from "@/components/state/dashboardShell"
import { DashboardHeader } from "@/components/state/dashboardHeader"
import { Placeholder } from "@/components/state/placeholder"
import { BidsTable } from "@/components/structures/tables/bids"
import { LotImageGallery } from "@/components/ui/lot-image-gallery"
import { toast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

function capitalizeFirst(s?: string) {
  if (!s) return "—"
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function TopBidPanel({ slug, unit, lotType }: { slug: string; unit: string; lotType: string }) {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [confirm, setConfirm] = useState("")
  const isRequest = lotType === "request"

  const { data } = useQuery({
    queryKey: ["lot-bids", slug, { p: 1 }],
    queryFn: () => queryLotBids(slug, 1),
    refetchOnWindowFocus: false,
  })

  const bids: any[] = data?.data?.data ?? []
  const topBid = bids
    .filter((b) => b.status === "pending")
    .sort((a, b) => isRequest
      ? a.offered_price_per_unit_cents - b.offered_price_per_unit_cents
      : b.offered_price_per_unit_cents - a.offered_price_per_unit_cents
    )[0] ?? null

  const { mutate, isPending } = useMutation({
    mutationFn: () => adminAcceptBid(topBid.id),
    onSuccess: () => {
      setOpen(false)
      setConfirm("")
      toast({ title: "Bid accepted", description: "Winner notified. All other bids on this lot have been rejected." })
      queryClient.invalidateQueries({ queryKey: ["lot-bids", slug] })
    },
    onError: () => {
      toast({ title: "Failed to accept bid", variant: "destructive" })
    },
  })

  if (!topBid) return null

  return (
    <>
      <div className="rounded-lg border border-green-200 bg-green-50/50 dark:bg-green-900/10 dark:border-green-800 p-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">{isRequest ? "Best Offer" : "Top Bid"}</p>
          <p className="text-lg font-bold text-green-700 dark:text-green-400">
            {centsToDollars(topBid.offered_price_per_unit_cents)}
          </p>
          <p className="text-xs text-muted-foreground capitalize">{topBid.bidder_name}</p>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-1.5 text-sm font-semibold text-green-700 hover:text-green-800 dark:text-green-400 transition-colors shrink-0"
        >
          <CheckCircle2 className="w-4 h-4" />
          Accept Top Bid
        </button>
      </div>

      <Dialog open={open} onOpenChange={(v) => { setOpen(v); setConfirm("") }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Accept Top Bid</DialogTitle>
            <DialogDescription>
              This will accept <span className="font-semibold text-foreground">{topBid.bidder_name}</span>'s bid of{" "}
              <span className="font-semibold text-foreground">{centsToDollars(topBid.offered_price_per_unit_cents)}/{unit}</span> and auto-reject all other pending bids on this lot.
              <br /><br />
              Type the lot number <span className="font-mono font-semibold text-foreground">{slug}</span> to confirm.
            </DialogDescription>
          </DialogHeader>
          <Input
            placeholder={slug}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="mt-2"
          />
          <div className="flex justify-end gap-2 mt-2">
            <button
              onClick={() => { setOpen(false); setConfirm("") }}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5"
            >
              Cancel
            </button>
            <button
              onClick={() => mutate()}
              disabled={confirm !== slug || isPending}
              className="flex items-center gap-1.5 text-sm font-semibold text-white bg-green-700 hover:bg-green-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors px-4 py-1.5 rounded-md"
            >
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              Confirm Accept
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default function LotDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)

  const { isLoading, isError, data } = useQuery({
    queryKey: ["admin-lot", slug],
    queryFn: () => queryAdminLot(slug),
    refetchOnWindowFocus: false,
  })

  const lot = data?.data

  if (isLoading) {
    return (
      <DashboardShell>
        <FormSkeleton />
      </DashboardShell>
    )
  }

  if (isError || !lot) {
    return (
      <DashboardShell>
        <Placeholder>
          <Placeholder.Icon name="close" />
          <Placeholder.Title>Lot Not Found</Placeholder.Title>
        </Placeholder>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell>
      <DashboardHeader
        heading={lot.breed?.name ? `${capitalizeFirst(lot.breed.name)} — ${lot.slug}` : lot.slug}
        text={`${capitalizeFirst(lot.type === "sell" ? "Selling" : "Buying")} · ${capitalizeFirst(lot.form)} · ${lot.quantity?.toLocaleString()} ${lot.unit}`}
      >
        <Link
          href="/dashboard/farmnport/lots"
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
        >
          <Icons.chevronLeft className="w-4 h-4 mr-1" />
          Back
        </Link>
        {!lot.has_accepted_bid && (
          <Link
            href={`/dashboard/farmnport/lots/${slug}/edit`}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            <Icons.edit className="w-4 h-4 mr-2" />
            Edit Lot
          </Link>
        )}
      </DashboardHeader>

      <div className="flex gap-6">
        {/* Left: images + stats */}
        <div className="w-80 shrink-0 flex flex-col gap-3">
          {(lot.main_image || lot.images?.length > 0) && (
            <LotImageGallery mainImage={lot.main_image} images={lot.images} />
          )}
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 rounded-lg border bg-muted/30 px-4 py-3">
            <div>
              <p className="text-xs text-muted-foreground">Starting Price</p>
              <p className="text-sm font-semibold">{lot.price_per_unit_cents ? centsToDollars(lot.price_per_unit_cents) : "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Status</p>
              {(() => {
                const expired = lot.expires_at && new Date(lot.expires_at) < new Date()
                if (lot.has_accepted_bid) return <p className="text-sm font-semibold text-green-600">Fulfilled</p>
                if (expired) return <p className="text-sm font-semibold text-red-600">Expired</p>
                if (!lot.moderated) return <p className="text-sm font-semibold text-amber-600">Pending Approval</p>
                return <p className="text-sm font-semibold text-green-600">Live</p>
              })()}
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Client</p>
              <p className="text-sm font-semibold capitalize">{lot.client_name ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Expires</p>
              <p className="text-sm font-semibold">{lot.expires_at ? new Date(lot.expires_at).toLocaleDateString("en-GB") : "—"}</p>
            </div>
          </div>
          <TopBidPanel slug={slug} unit={lot.unit} lotType={lot.type} />
        </div>

        {/* Right: bids table */}
        <div className="flex-1 min-w-0">
          <h2 className="text-base font-semibold mb-3">Bids</h2>
          <BidsTable slug={slug} />
        </div>
      </div>
    </DashboardShell>
  )
}
