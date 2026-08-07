"use client"

import { Minus, Plus, Loader2 } from "lucide-react"
import { useUnifiedCart } from "@/hooks/use-unified-cart"

export type CartProductType = "agrochemical" | "feed" | "animal_health" | "plant_nutrition" | "document" | "seed_product" | "equipment"

interface AddToCartButtonProps {
  productId: string
  sku?: string
  productType: CartProductType
  productName: string
  productSlug: string
  imageSrc?: string
  unitPrice: number | null
  available?: boolean
  loginRedirect: string
  singleUnit?: boolean
}

export function AddToCartButton({
  productId,
  sku,
  productType,
  productName,
  productSlug,
  imageSrc,
  unitPrice,
  available = true,
  singleUnit = false,
}: AddToCartButtonProps) {
  const { addItem, updateItem, getItemQty, isMutating } = useUnifiedCart()

  const cartQty = getItemQty(productId, sku)

  function handleAdd() {
    if (!unitPrice) return
    addItem({
      product_id: productId,
      sku,
      product_type: productType,
      product_name: productName,
      product_slug: productSlug,
      image_src: imageSrc ?? "",
      unit_price: Math.round(unitPrice),
      quantity: 1,
    })
  }

  if (cartQty > 0) {
    if (singleUnit) {
      return (
        <button
          onClick={() => updateItem(productId, 0, sku)}
          disabled={isMutating}
          className="w-full mt-3 h-9 rounded-md border border-destructive/40 text-destructive text-sm font-medium hover:bg-destructive/10 transition-colors disabled:opacity-50"
        >
          {isMutating ? "Removing…" : "Remove"}
        </button>
      )
    }
    return (
      <div className="flex items-center mt-3 rounded-md border border-primary overflow-hidden">
        <button
          onClick={() => updateItem(productId, cartQty - 1, sku)}
          disabled={isMutating}
          className="flex-1 flex items-center justify-center h-9 hover:bg-primary/10 transition-colors disabled:opacity-60"
        >
          <Minus className="w-3.5 h-3.5 text-primary" />
        </button>
        <span className="px-3 text-sm font-bold text-primary tabular-nums">
          {isMutating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : cartQty}
        </span>
        <button
          onClick={() => updateItem(productId, cartQty + 1, sku)}
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
      disabled={isMutating || !available}
      className={`flex items-center justify-center gap-2 w-full border font-medium text-sm h-9 px-3 rounded-md transition-colors ${available ? "border-border hover:bg-muted text-foreground" : "border-transparent text-destructive cursor-not-allowed"}`}
    >
      {isMutating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
      {available ? "Add to Cart" : "Out of Stock"}
    </button>
  )
}
