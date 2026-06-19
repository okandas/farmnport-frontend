"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useEffect, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { useSession } from "next-auth/react"

import { placeBid, queryClient, queryMyBidOnLot } from "@/lib/query"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { centsToDollars, titleCase } from "@/lib/utilities"

const BID_SUPPORT_PHONE = process.env.NEXT_PUBLIC_BID_SUPPORT_PHONE!
const BID_SUPPORT_EMAIL = process.env.NEXT_PUBLIC_BID_SUPPORT_EMAIL!

interface Props {
  lot: {
    slug: string
    type: string
    quantity: number
    unit: string
    price_per_unit_cents: number
    address?: string
    city?: string
    province?: string
    farm_produce?: { name: string }
    breed?: { name: string }
  }
  topBidCents?: number
  onSuccess?: () => void
}

const Schema = z.object({
  quantity: z.coerce.number().positive("Enter a valid quantity"),
  offered_price_per_unit: z.coerce.number().min(0.01, "Enter your offered price"),
  notes: z.string().optional(),
  delivery_location: z.string().optional(),
})

type FormModel = z.infer<typeof Schema>

function calcSuggestedCents(baseCents: number): number {
  const inc = Math.round(baseCents * 0.02)
  const floored = Math.max(inc, 50)
  const capped = Math.min(floored, 2000)
  return baseCents + capped
}

export function PlaceBidForm({ lot, topBidCents, onSuccess }: Props) {
  const isSelling = lot.type === "sell"
  const router = useRouter()
  const qc = useQueryClient()
  const { data: session } = useSession()
  const username = (session?.user as any)?.username

  const { data: profileData } = useQuery({
    queryKey: ["my-profile", username],
    queryFn: () => queryClient(username),
    enabled: !!username,
  })
  const profile = (profileData as any)?.data

  const { data: existingBidData } = useQuery({
    queryKey: ["my-bid-on-lot", lot.slug, username],
    queryFn: () => queryMyBidOnLot(lot.slug),
    enabled: !!username,
    retry: false,
  })
  const existingBid = (existingBidData as any)?.data

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormModel>({
    resolver: zodResolver(Schema),
    defaultValues: {
      quantity: lot.quantity,
      offered_price_per_unit: lot.price_per_unit_cents / 100,
    },
  })

  useEffect(() => {
    if (!existingBid && !topBidCents) return
    let suggestedCents: number | undefined
    if (topBidCents && existingBid && topBidCents > existingBid.offered_price_per_unit_cents) {
      suggestedCents = topBidCents + 1000
    } else if (existingBid) {
      suggestedCents = calcSuggestedCents(existingBid.offered_price_per_unit_cents)
    } else if (topBidCents) {
      suggestedCents = calcSuggestedCents(topBidCents)
    }
    if (suggestedCents !== undefined) setValue("offered_price_per_unit", suggestedCents / 100)
  }, [existingBid, topBidCents])

  const qty = watch("quantity") || 0
  const price = watch("offered_price_per_unit") || 0
  const total = qty * price

  const { mutate, isPending } = useMutation({
    mutationFn: (data: FormModel) => placeBid(lot.slug, {
      quantity: Number(data.quantity),
      offered_price_per_unit_cents: Math.round(Number(data.offered_price_per_unit) * 100),
      notes: data.notes || undefined,
      delivery_location: data.delivery_location || undefined,
    }),
    onSuccess: () => {
      setPendingData(null)
      qc.invalidateQueries({ queryKey: ["my-bid-on-lot", lot.slug, username] })
      toast.success("Bid placed successfully! The lot owner will be notified.")
      setTimeout(() => router.refresh(), 300)
      onSuccess?.()
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message ?? "Failed to place bid"
      toast.error(msg)
    },
  })

  const [pendingData, setPendingData] = useState<FormModel | null>(null)

  const location = [profile?.address, profile?.city, profile?.province]
    .filter(Boolean)
    .map((s: string) => titleCase(s))
    .join(", ")

  const whatsappLink = `https://wa.me/263${BID_SUPPORT_PHONE.replace(/^0/, "")}`
  const qtyStep = ["head", "unit", "dozen"].includes(lot.unit) ? "1" : "0.01"

  const confirmQty = pendingData ? Number(pendingData.quantity) : 0
  const confirmPrice = pendingData ? Number(pendingData.offered_price_per_unit) : 0
  const confirmTotal = confirmQty * confirmPrice

  return (
    <>
    <Dialog open={!!pendingData} onOpenChange={(open) => { if (!open) setPendingData(null) }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Confirm your offer</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-1">
          <div className="rounded-lg bg-muted/50 px-4 py-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Price per {lot.unit}</span>
              <span className="font-semibold">${confirmPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Quantity</span>
              <span className="font-semibold">{confirmQty} {lot.unit}</span>
            </div>
            <div className="flex justify-between border-t border-border pt-2">
              <span className="text-muted-foreground">Estimated total</span>
              <span className="font-bold text-foreground">${confirmTotal.toFixed(2)}</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            By confirming, your offer will be sent to the {isSelling ? "seller" : "buyer"} for review.
          </p>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => setPendingData(null)} disabled={isPending}>Cancel</Button>
          <Button onClick={() => { if (pendingData) mutate(pendingData) }} disabled={isPending}>
            {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Confirm offer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    <div className="space-y-5">
      <h3 className="text-base font-semibold">
        {isSelling ? "Place an Offer to Buy" : "Submit a Supply Offer"}
      </h3>

      {existingBid && (() => {
        const isTopBidder = topBidCents !== undefined && existingBid.offered_price_per_unit_cents >= topBidCents
        return isTopBidder ? (
          <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3">
            <p className="text-xs text-green-800">
              You currently have the highest bid — <span className="font-semibold">${(existingBid.offered_price_per_unit_cents / 100).toFixed(2)}/{lot.unit}</span>.
            </p>
          </div>
        ) : (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
            <p className="text-xs text-amber-800">
              Your current offer: <span className="font-semibold">${(existingBid.offered_price_per_unit_cents / 100).toFixed(2)}/{lot.unit}</span>. A suggested raise has been pre-filled below.
            </p>
          </div>
        )
      })()}

      <form onSubmit={handleSubmit((d) => setPendingData(d))} className="space-y-4">

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Quantity ({lot.unit})</Label>
            <Input
              type="number"
              step={qtyStep}
              min={qtyStep}
              max={lot.quantity}
              placeholder={`Max ${lot.quantity}`}
              {...register("quantity")}
            />
            {errors.quantity && <p className="text-xs text-red-500">{errors.quantity.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>Your price per {lot.unit} ($)</Label>
            <Input
              type="number"
              step="0.01"
              min="0.01"
              placeholder={`Listed: ${centsToDollars(lot.price_per_unit_cents)}`}
              {...register("offered_price_per_unit")}
            />
            {errors.offered_price_per_unit && <p className="text-xs text-red-500">{errors.offered_price_per_unit.message}</p>}
          </div>
        </div>

        {total > 0 && (
          <div className="rounded-lg bg-muted/50 px-4 py-3 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Estimated total</span>
            <span className="font-semibold text-foreground">${total.toFixed(2)}</span>
          </div>
        )}

        {/* Location — read only, from logged-in user's own profile */}
        {location && (
          <div className="space-y-1">
            <Label>Your location</Label>
            <p className="text-sm font-medium text-foreground">{location}</p>
            <p className="text-xs text-muted-foreground">
              This is the address from your profile that will be shared with the {isSelling ? "buyer" : "seller"}.
              If it is incorrect, contact us on{" "}
              <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">WhatsApp</a>
              {" "}or{" "}
              <a href={`mailto:${BID_SUPPORT_EMAIL}`} className="underline hover:text-foreground">{BID_SUPPORT_EMAIL}</a>
            </p>
          </div>
        )}

        <Button type="submit" disabled={isPending} className="w-full">
          {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {isSelling ? "Submit Offer to Buy" : "Submit Supply Offer"}
        </Button>
      </form>
    </div>
    </>
  )
}
