"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import { addToCart, clearCart, getCart, removeFromCart, updateCartItem } from "@/lib/query"
import { useGuestCart, type GuestCartItem } from "@/hooks/use-guest-cart"
import { useCart } from "@/contexts/cart-context"
import { trackAddToCart } from "@/lib/analytics"

export interface UnifiedCartItem {
  product_id: string
  sku?: string
  product_type: string
  product_name: string
  product_slug: string
  image_src: string
  unit_price: number
  quantity: number
  seller_id?: string
}

export function useUnifiedCart() {
  const { data: session } = useSession()
  const qc = useQueryClient()
  const { openCart } = useCart()
  const guest = useGuestCart()

  // If guest cart has items, we stay in guest mode even when logged in
  const useGuestMode = guest.hasItems || !session

  const { data: backendCart, isLoading: backendLoading } = useQuery({
    queryKey: ["cart"],
    queryFn: () => getCart().then((r) => r.data),
    enabled: !!session && !guest.hasItems,
    staleTime: 0,
  })

  const backendItems: UnifiedCartItem[] = (backendCart as any)?.items ?? []

  const items: UnifiedCartItem[] = useGuestMode ? guest.items : backendItems
  const isLoading = !useGuestMode && backendLoading
  const isGuest = useGuestMode

  // ── guest-side conflict detection ──────────────────────────
  function checkGuestConflict(item: GuestCartItem): string | null {
    if (guest.items.length === 0) return null
    const first = guest.items[0]

    // test vs real — we don't have is_test on guest items so skip this
    // digital vs physical
    if (first.product_type === "document" && item.product_type !== "document") return "digital_conflict"
    if (first.product_type !== "document" && item.product_type === "document") return "digital_conflict"

    return null
  }

  // ── backend add mutation ───────────────────────────────────
  const backendAddMutation = useMutation({
    mutationFn: addToCart,
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ["cart"] })
      openCart()
      if (variables.unit_price) {
        trackAddToCart({
          item_id: variables.product_id,
          item_name: variables.product_name,
          item_category: variables.product_type,
          price: variables.unit_price / 100,
          quantity: variables.quantity,
        })
      }
    },
    onError: (err: any, variables) => {
      if (err?.response?.status === 409) {
        const msg = err?.response?.data?.message
        const isTestConflict = msg === "test_conflict"
        const isDigitalConflict = msg === "digital_conflict"
        toast.warning(
          isTestConflict
            ? "Test products cannot be mixed with real products."
            : isDigitalConflict
              ? "Documents cannot be mixed with physical products."
              : "This item has a different pickup method.",
          {
            description: "Complete and pay for your current cart first, then add this item.",
            duration: Infinity,
            closeButton: true,
            action: {
              label: "Go to checkout",
              onClick: () => window.location.assign("/checkout"),
            },
            cancel: {
              label: "Start new cart",
              onClick: async () => {
                await clearCart()
                backendAddMutation.mutate(variables)
              },
            },
          }
        )
        return
      }
      toast.error("Failed to add to cart")
    },
  })

  const backendUpdateMutation = useMutation({
    mutationFn: ({ productId, qty, sku }: { productId: string; qty: number; sku?: string }) =>
      qty < 1 ? removeFromCart(productId, sku) : updateCartItem(productId, qty, sku),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cart"] }),
    onError: () => toast.error("Failed to update cart"),
  })

  // ── unified API ────────────────────────────────────────────
  function addItemToCart(item: UnifiedCartItem) {
    if (!item.unit_price) {
      toast.info("Please contact us for pricing")
      return
    }

    if (useGuestMode) {
      const conflict = checkGuestConflict(item)
      if (conflict) {
        toast.warning(
          conflict === "digital_conflict"
            ? "Documents cannot be mixed with physical products."
            : "This item has a different pickup method.",
          {
            description: "Complete and pay for your current cart first, then add this item.",
            duration: Infinity,
            closeButton: true,
            action: {
              label: "Go to checkout",
              onClick: () => window.location.assign("/checkout"),
            },
            cancel: {
              label: "Start new cart",
              onClick: () => {
                guest.clearItems()
                guest.addItem({ ...item, quantity: 1 })
                openCart()
              },
            },
          }
        )
        return
      }

      guest.addItem({
        product_id: item.product_id,
        sku: item.sku,
        product_type: item.product_type,
        product_name: item.product_name,
        product_slug: item.product_slug,
        image_src: item.image_src,
        unit_price: Math.round(item.unit_price),
        quantity: 1,
        seller_id: item.seller_id,
      })
      openCart()

      if (item.unit_price) {
        trackAddToCart({
          item_id: item.product_id,
          item_name: item.product_name,
          item_category: item.product_type,
          price: item.unit_price / 100,
          quantity: 1,
        })
      }
      return
    }

    backendAddMutation.mutate({
      product_id: item.product_id,
      sku: item.sku,
      product_type: item.product_type,
      product_name: item.product_name,
      product_slug: item.product_slug,
      image_src: item.image_src ?? "",
      unit_price: Math.round(item.unit_price),
      quantity: 1,
      seller_id: item.seller_id,
    })
  }

  function updateItemQty(productId: string, quantity: number, sku?: string) {
    if (useGuestMode) {
      guest.updateItem(productId, quantity, sku)
      return
    }
    backendUpdateMutation.mutate({ productId, qty: quantity, sku })
  }

  function removeItemFromCart(productId: string, sku?: string) {
    if (useGuestMode) {
      guest.removeItem(productId, sku)
      return
    }
    backendUpdateMutation.mutate({ productId, qty: 0, sku })
  }

  function getItemQty(productId: string, sku?: string): number {
    const found = items.find(
      (i) => i.product_id === productId && (i.sku ?? "") === (sku ?? "")
    )
    return found?.quantity ?? 0
  }

  const isMutating = backendAddMutation.isPending || backendUpdateMutation.isPending

  return {
    items,
    isLoading,
    isGuest,
    isMutating,
    itemCount: items.length,
    addItem: addItemToCart,
    updateItem: updateItemQty,
    removeItem: removeItemFromCart,
    getItemQty,
  }
}
