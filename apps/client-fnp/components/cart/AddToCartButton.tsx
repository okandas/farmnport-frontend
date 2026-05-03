"use client"

import { Minus, Plus, Loader2 } from "lucide-react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { addToCart, getCart, updateCartItem, removeFromCart } from "@/lib/query"
import { useCart } from "@/contexts/cart-context"

export type CartProductType = "agrochemical" | "feed" | "animal_health" | "plant_nutrition" | "document"

interface AddToCartButtonProps {
  productId: string
  productType: CartProductType
  productName: string
  productSlug: string
  imageSrc?: string
  unitPrice: number | null
  available?: boolean
  loginRedirect: string
}

export function AddToCartButton({
  productId,
  productType,
  productName,
  productSlug,
  imageSrc,
  unitPrice,
  available = true,
  loginRedirect,
}: AddToCartButtonProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const { openCart } = useCart()
  const qc = useQueryClient()

  const { data: cartData } = useQuery({
    queryKey: ["cart"],
    queryFn: () => getCart().then((r) => r.data),
    enabled: !!session,
    staleTime: 0,
  })

  const cartItem = (cartData as any)?.items?.find((i: any) => i.product_id === productId)
  const cartQty: number = cartItem?.quantity ?? 0

  const addMutation = useMutation({
    mutationFn: addToCart,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cart"] })
      openCart()
    },
    onError: () => toast.error("Failed to add to cart"),
  })

  const updateMutation = useMutation({
    mutationFn: ({ qty }: { qty: number }) =>
      qty < 1 ? removeFromCart(productId) : updateCartItem(productId, qty),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cart"] }),
    onError: () => toast.error("Failed to update cart"),
  })

  const isMutating = addMutation.isPending || updateMutation.isPending

  function handleAdd() {
    if (!session) {
      router.push(`/login?next=${loginRedirect}`)
      return
    }
    if (!unitPrice) {
      toast.info("Please contact us for pricing")
      return
    }
    addMutation.mutate({
      product_id: productId,
      product_type: productType,
      product_name: productName,
      product_slug: productSlug,
      image_src: imageSrc ?? "",
      unit_price: unitPrice,
      quantity: 1,
    })
  }

  if (cartQty > 0) {
    return (
      <div className="flex items-center mt-3 rounded-md border border-primary overflow-hidden">
        <button
          onClick={() => updateMutation.mutate({ qty: cartQty - 1 })}
          disabled={isMutating}
          className="flex-1 flex items-center justify-center h-9 hover:bg-primary/10 transition-colors disabled:opacity-60"
        >
          <Minus className="w-3.5 h-3.5 text-primary" />
        </button>
        <span className="px-3 text-sm font-bold text-primary tabular-nums">
          {isMutating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : cartQty}
        </span>
        <button
          onClick={() => updateMutation.mutate({ qty: cartQty + 1 })}
          disabled={isMutating}
          className="flex-1 flex items-center justify-center h-9 hover:bg-primary/10 transition-colors disabled:opacity-60"
        >
          <Plus className="w-3.5 h-3.5 text-primary" />
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={handleAdd}
      disabled={addMutation.isPending || !available}
      className="flex items-center justify-center gap-2 w-full bg-primary hover:bg-primary/90 disabled:opacity-60 text-primary-foreground font-medium text-sm h-9 px-3 rounded-md transition-colors mt-3"
    >
      {addMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
      {available ? "Add to Cart" : "Out of Stock"}
    </button>
  )
}
