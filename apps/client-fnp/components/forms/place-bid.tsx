"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useMutation, useQuery } from "@tanstack/react-query"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { useSession } from "next-auth/react"

import { placeBid, queryClient } from "@/lib/query"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
  onSuccess?: () => void
}

const Schema = z.object({
  quantity: z.coerce.number().positive("Enter a valid quantity"),
  offered_price_per_unit: z.coerce.number().min(0.01, "Enter your offered price"),
  notes: z.string().optional(),
  delivery_location: z.string().optional(),
})

type FormModel = z.infer<typeof Schema>

export function PlaceBidForm({ lot, onSuccess }: Props) {
  const isSelling = lot.type === "sell"

  const { data: session } = useSession()
  const username = (session?.user as any)?.username

  const { data: profileData } = useQuery({
    queryKey: ["my-profile", username],
    queryFn: () => queryClient(username),
    enabled: !!username,
  })
  const profile = (profileData as any)?.data

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormModel>({
    resolver: zodResolver(Schema),
    defaultValues: {
      quantity: lot.quantity,
      offered_price_per_unit: lot.price_per_unit_cents / 100,
    },
  })

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
      toast.success("Bid placed successfully! The lot owner will be notified.")
      onSuccess?.()
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message ?? "Failed to place bid"
      toast.error(msg)
    },
  })

  const location = [profile?.address, profile?.city, profile?.province]
    .filter(Boolean)
    .map((s: string) => titleCase(s))
    .join(", ")

  const whatsappLink = `https://wa.me/263${BID_SUPPORT_PHONE.replace(/^0/, "")}`

  return (
    <div className="space-y-5">
      <h3 className="text-base font-semibold">
        {isSelling ? "Place an Offer to Buy" : "Submit a Supply Offer"}
      </h3>

      <form onSubmit={handleSubmit((d) => mutate(d))} className="space-y-4">

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Quantity ({lot.unit})</Label>
            <Input
              type="number"
              step="0.01"
              min="0.01"
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
  )
}
