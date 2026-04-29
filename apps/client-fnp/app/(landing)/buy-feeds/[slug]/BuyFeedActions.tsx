"use client"

import { Minus, Plus, Loader2 } from "lucide-react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { addToCart, getCart, updateCartItem, removeFromCart } from "@/lib/query"
import { useCart } from "@/contexts/cart-context"

interface BuyFeedActionsProps {
    product: {
        id: string
        name: string
        slug: string
        show_price?: boolean
        sale_price?: number
        available_for_sale?: boolean
        images?: { img?: { src?: string } }[]
    }
}

export function BuyFeedActions({ product }: BuyFeedActionsProps) {
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

    const cartItem = (cartData as any)?.items?.find((i: any) => i.product_id === product.id)
    const cartQty: number = cartItem?.quantity ?? 0

    const displayPrice = product.show_price && product.sale_price && product.sale_price > 0
        ? product.sale_price / 100
        : null

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
            qty < 1 ? removeFromCart(product.id) : updateCartItem(product.id, qty),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["cart"] }),
        onError: () => toast.error("Failed to update cart"),
    })

    const isMutating = addMutation.isPending || updateMutation.isPending

    function handleAddToCart() {
        if (!session) {
            router.push(`/login?next=/buy-feeds/${product.slug}`)
            return
        }
        if (!displayPrice) {
            toast.info("Please contact us for pricing")
            return
        }
        addMutation.mutate({
            product_id: product.id,
            product_type: "feed",
            product_name: product.name,
            product_slug: product.slug,
            image_src: product.images?.[0]?.img?.src ?? "",
            unit_price: displayPrice,
            quantity: 1,
        })
    }

    if (cartQty > 0) {
        return (
            <div className="flex items-center rounded-full border-2 border-primary overflow-hidden">
                <button
                    onClick={() => updateMutation.mutate({ qty: cartQty - 1 })}
                    disabled={isMutating}
                    className="flex-1 flex items-center justify-center h-12 hover:bg-primary/10 transition-colors disabled:opacity-60"
                >
                    <Minus className="w-4 h-4 text-primary" />
                </button>
                <span className="px-4 text-sm font-bold text-primary tabular-nums">
                    {isMutating ? <Loader2 className="w-4 h-4 animate-spin" /> : cartQty}
                </span>
                <button
                    onClick={() => updateMutation.mutate({ qty: cartQty + 1 })}
                    disabled={isMutating}
                    className="flex-1 flex items-center justify-center h-12 hover:bg-primary/10 transition-colors disabled:opacity-60"
                >
                    <Plus className="w-4 h-4 text-primary" />
                </button>
            </div>
        )
    }

    return (
        <button
            onClick={handleAddToCart}
            disabled={isMutating || !product.available_for_sale}
            className="flex items-center justify-center gap-2 w-full bg-primary hover:bg-primary/90 disabled:opacity-60 text-primary-foreground font-semibold text-base py-3 rounded-full transition-colors"
        >
            {isMutating && <Loader2 className="w-4 h-4 animate-spin" />}
            {product.available_for_sale ? "Add to Cart" : "Out of Stock"}
        </button>
    )
}
