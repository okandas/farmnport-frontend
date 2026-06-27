"use client"

import { ColumnDef } from "@tanstack/react-table"
import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { CheckCircle2, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { centsToDollars } from "@/lib/utilities"
import { adminAcceptBid } from "@/lib/query"
import { toast } from "@/components/ui/use-toast"
import { LotImageGallery } from "@/components/ui/lot-image-gallery"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

function SupplyPhotoCell({ supplyImages }: { supplyImages?: any }) {
  const [open, setOpen] = useState(false)
  const mainImage = supplyImages?.main_image ?? null
  const images = supplyImages?.images ?? []
  if (!mainImage && images.length === 0) return <span className="text-xs text-muted-foreground">—</span>
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="shrink-0">
        <img src={mainImage.img.src} alt="Supply photo" className="w-10 h-10 rounded object-cover hover:opacity-80 transition-opacity" />
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Supply photos</DialogTitle>
          </DialogHeader>
          <LotImageGallery mainImage={mainImage} images={images} />
        </DialogContent>
      </Dialog>
    </>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    accepted: "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    rejected: "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    paid: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    completed: "bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    expired: "bg-gray-50 text-gray-600 dark:bg-gray-800/30 dark:text-gray-400",
    closed: "bg-gray-50 text-gray-500 dark:bg-gray-800/30 dark:text-gray-500",
  }
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium capitalize ${map[status] ?? "bg-gray-50 text-gray-600"}`}>
      {status}
    </span>
  )
}

function AcceptButton({ bid }: { bid: any }) {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [confirm, setConfirm] = useState("")
  const slug = bid.lot_slug

  const { mutate, isPending } = useMutation({
    mutationFn: () => adminAcceptBid(bid.id),
    onSuccess: () => {
      setOpen(false)
      setConfirm("")
      toast({ title: "Bid accepted", description: "Winner notified. All other bids on this lot have been rejected." })
      queryClient.invalidateQueries({ queryKey: ["lot-bids"] })
    },
    onError: () => {
      toast({ title: "Failed to accept bid", variant: "destructive" })
    },
  })

  if (bid.status !== "pending") return null

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-sm font-medium text-green-700 hover:text-green-800 transition-colors"
      >
        <CheckCircle2 className="w-4 h-4" />
        Accept
      </button>

      <Dialog open={open} onOpenChange={(v) => { setOpen(v); setConfirm("") }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Accept Bid</DialogTitle>
            <DialogDescription>
              This will accept <span className="font-semibold text-foreground capitalize">{bid.bidder_name}</span>'s bid of{" "}
              <span className="font-semibold text-foreground">{centsToDollars(bid.offered_price_per_unit_cents)}/{bid.unit}</span> and auto-reject all other pending bids on this lot.
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

export const bidColumns: ColumnDef<any>[] = [
  {
    id: "supply_photo",
    header: "Photos",
    cell: ({ row }) => <SupplyPhotoCell supplyImages={row.original.supply_images} />,
  },
  {
    accessorKey: "bidder_name",
    header: "Bidder",
    cell: ({ row }) => (
      <span className="font-medium capitalize text-sm">{row.original.bidder_name}</span>
    ),
  },
  {
    accessorKey: "offered_price_per_unit_cents",
    header: "Bid Price",
    cell: ({ row }) => (
      <span>{row.original.offered_price_per_unit_cents ? centsToDollars(row.original.offered_price_per_unit_cents) : "—"}</span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    accessorKey: "created",
    header: "Placed",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {new Date(row.original.created).toLocaleDateString("en-GB")}{" "}{new Date(row.original.created).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
      </span>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => <AcceptButton bid={row.original} />,
  },
]
