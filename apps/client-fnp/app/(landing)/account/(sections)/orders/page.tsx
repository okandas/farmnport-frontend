"use client"

import { useSession } from "next-auth/react"
import { useQuery } from "@tanstack/react-query"
import { Loader2, Package } from "lucide-react"
import Link from "next/link"

import { myOrders } from "@/lib/query"

const STATUS_STYLES: Record<string, string> = {
  pending:    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  paid:       "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  processing: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  dispatched: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  ready:      "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  delivered:  "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  cancelled:  "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
}

interface OrderItem {
  product_name: string
  image_src?: string
  quantity: number
  unit_price: number
}

interface Order {
  id: string
  order_number: string
  status: string
  total: number
  currency: string
  items: OrderItem[]
  fulfillment: string
  created: string
}

export default function OrdersPage() {
  const { data: session, status } = useSession()

  const { data, isLoading } = useQuery({
    queryKey: ["my-orders"],
    queryFn: () => myOrders().then((r) => r.data),
    enabled: !!session,
  })

  if (status === "loading" || isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!session) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center space-y-4">
          <Package className="w-12 h-12 mx-auto text-muted-foreground/40" />
          <p className="font-semibold">Sign in to view your orders</p>
          <Link
            href="/login?next=/account/orders"
            className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground text-sm font-semibold px-6 py-2.5 hover:bg-primary/90 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    )
  }

  const orders: Order[] = (data as any)?.orders ?? []

  return (
    <div>
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-4">
        <Link href="/account" className="hover:text-foreground transition-colors">Account</Link>
        <span>/</span>
        <span className="text-foreground font-medium">My Orders</span>
      </nav>
      <h1 className="text-2xl font-bold">My Orders</h1>
      <p className="text-sm text-muted-foreground mb-6">Items you bought from the farmnport shop.</p>

        {orders.length === 0 ? (
          <div className="text-center py-16 space-y-4">
            <Package className="w-12 h-12 mx-auto text-muted-foreground/40" />
            <p className="font-semibold">No orders yet</p>
            <p className="text-sm text-muted-foreground">When you place an order, it will appear here.</p>
            <Link
              href="/buy-agrochemicals"
              className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground text-sm font-semibold px-6 py-2.5 hover:bg-primary/90 transition-colors"
            >
              Shop Now
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const thumbs = order.items.filter((i) => i.image_src)
              const maxThumbs = 5
              const extra = thumbs.length - maxThumbs

              return (
                <div key={order.id} className="rounded-xl border p-4 sm:p-5 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1.5">
                      <p className="text-base font-bold">
                        {capitalize(order.status)} — {formatDate(order.created)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {order.items.length} {order.items.length === 1 ? "item" : "items"} · ${(order.total / 100).toFixed(2)} · {order.fulfillment === "click_collect" ? "Pickup" : "Delivery"}
                      </p>
                    </div>
                    <Link
                      href={`/account/orders/${order.order_number}`}
                      className="shrink-0 text-sm font-medium px-4 py-2 rounded-lg border hover:bg-muted transition-colors"
                    >
                      Order Details
                    </Link>
                  </div>

                  {thumbs.length > 0 && (
                    <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
                      {thumbs.slice(0, maxThumbs).map((item, i) => (
                        <div key={i} className="shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg border bg-background overflow-hidden">
                          <img src={item.image_src} alt={item.product_name} className="w-full h-full object-contain p-1" />
                        </div>
                      ))}
                      {extra > 0 && (
                        <div className="shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg border bg-background flex items-center justify-center">
                          <span className="text-sm font-semibold text-muted-foreground">+{extra}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
    </div>
  )
}
