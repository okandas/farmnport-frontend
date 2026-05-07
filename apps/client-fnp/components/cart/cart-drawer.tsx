"use client"

import Image from "next/image"
import Link from "next/link"
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useSession } from "next-auth/react"
import { toast } from "sonner"

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

import { useCart } from "@/contexts/cart-context"
import { getCart, removeFromCart, updateCartItem } from "@/lib/query"

interface CartItem {
  product_id: string
  product_type: string
  product_name: string
  product_slug: string
  image_src: string
  unit_price: number
  quantity: number
}

interface Cart {
  id: string
  items: CartItem[]
}

export function CartDrawer() {
  const { isOpen, closeCart } = useCart()
  const { data: session } = useSession()
  const qc = useQueryClient()

  const { data: cartData, isLoading } = useQuery({
    queryKey: ["cart"],
    queryFn: () => getCart().then((r) => r.data as Cart),
    enabled: !!session && isOpen,
    staleTime: 0,
  })

  const removeMutation = useMutation({
    mutationFn: (productId: string) => removeFromCart(productId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cart"] }),
    onError: () => toast.error("Failed to remove item"),
  })

  const updateMutation = useMutation({
    mutationFn: ({ productId, quantity }: { productId: string; quantity: number }) =>
      updateCartItem(productId, quantity),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cart"] }),
    onError: () => toast.error("Failed to update quantity"),
  })

  const items: CartItem[] = cartData?.items ?? []
  const subtotal = items.reduce((sum, i) => sum + (i.unit_price * i.quantity) / 100, 0)

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeCart()}>
      <SheetContent side="right" className="flex flex-col w-[calc(100%-3rem)] sm:max-w-md p-0">
        <SheetHeader className="px-6 py-4 border-b">
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Cart
            {items.length > 0 && (
              <span className="ml-auto mr-6 text-sm font-normal text-muted-foreground">
                {items.length} {items.length === 1 ? "item" : "items"}
              </span>
            )}
          </SheetTitle>
        </SheetHeader>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {!session ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <ShoppingCart className="w-12 h-12 text-muted-foreground/40" />
              <p className="text-muted-foreground">Sign in to view your cart</p>
              <Link
                href="/login"
                onClick={closeCart}
                className="inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold px-6 py-2.5 hover:bg-primary/90 transition-colors"
              >
                Sign In
              </Link>
            </div>
          ) : isLoading ? (
            <div className="space-y-4">
              {[1, 2].map((n) => (
                <div key={n} className="flex gap-3 animate-pulse">
                  <div className="w-16 h-16 rounded-lg bg-muted shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <ShoppingCart className="w-12 h-12 text-muted-foreground/40" />
              <p className="font-semibold">Your cart is empty</p>
              <p className="text-sm text-muted-foreground">
                Browse products and add them to your cart
              </p>
              <Link
                href="/buy-agrochemicals"
                onClick={closeCart}
                className="inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold px-6 py-2.5 hover:bg-primary/90 transition-colors"
              >
                Shop Now
              </Link>
            </div>
          ) : (
            <div className="divide-y">
              {items.map((item) => (
                <div key={item.product_id} className="flex gap-3 py-4">
                  {/* Image */}
                  <div className="relative w-16 h-16 rounded-lg border bg-white overflow-hidden shrink-0">
                    {item.image_src ? (
                      <Image
                        src={item.image_src}
                        alt={item.product_name}
                        fill
                        sizes="64px"
                        className="object-contain p-1"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground/20 text-xl">
                        📦
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold capitalize leading-snug truncate">
                      {item.product_name}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize mt-0.5">
                      {item.product_type.replace("_", " ")}
                    </p>
                    <p className="text-sm font-bold mt-1">
                      ${((item.unit_price * item.quantity) / 100).toFixed(2)}
                    </p>

                    {/* Qty controls */}
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() =>
                          updateMutation.mutate({
                            productId: item.product_id,
                            quantity: item.quantity - 1,
                          })
                        }
                        disabled={updateMutation.isPending}
                        className="w-6 h-6 rounded border flex items-center justify-center hover:bg-muted transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-sm font-medium w-6 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateMutation.mutate({
                            productId: item.product_id,
                            quantity: item.quantity + 1,
                          })
                        }
                        disabled={updateMutation.isPending}
                        className="w-6 h-6 rounded border flex items-center justify-center hover:bg-muted transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => removeMutation.mutate(item.product_id)}
                        disabled={removeMutation.isPending}
                        className="ml-auto text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer totals + checkout */}
        {session && items.length > 0 && (
          <div className="border-t px-6 py-4 space-y-3">
            <div className="flex justify-between font-bold text-base text-sm">
              <span>Total</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <Link
              href="/checkout"
              onClick={closeCart}
              className="block w-full text-center bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm py-3 rounded-full transition-colors"
            >
              Checkout · ${subtotal.toFixed(2)}
            </Link>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
