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
  return new Date(d).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })
}

interface Order {
  id: string
  order_number: string
  status: string
  total: number
  currency: string
  items: { product_name: string }[]
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
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Package className="w-12 h-12 mx-auto text-muted-foreground/40" />
          <p className="font-semibold">Sign in to view your orders</p>
          <Link
            href="/login?next=/account/orders"
            className="inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold px-6 py-2.5 hover:bg-primary/90 transition-colors"
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
      <h1 className="text-xl font-bold mb-6">My Orders</h1>

        {orders.length === 0 ? (
          <div className="text-center py-16 space-y-4">
            <Package className="w-12 h-12 mx-auto text-muted-foreground/40" />
            <p className="font-semibold">No orders yet</p>
            <p className="text-sm text-muted-foreground">When you place an order, it will appear here.</p>
            <Link
              href="/buy-agrochemicals"
              className="inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold px-6 py-2.5 hover:bg-primary/90 transition-colors"
            >
              Shop Now
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <Link key={order.id} href={`/account/orders/${order.id}`} className="block border rounded-xl p-4 hover:bg-muted/30 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm">{order.order_number}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[order.status] ?? "bg-muted text-muted-foreground"}`}>
                        {capitalize(order.status)}
                      </span>
                      <span className="text-xs text-muted-foreground capitalize">
                        {order.fulfillment === "click_collect" ? "Pickup" : "Delivery"}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(order.created)} · {order.items.length} {order.items.length === 1 ? "item" : "items"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {order.items.slice(0, 2).map(i => i.product_name).join(", ")}
                      {order.items.length > 2 ? ` +${order.items.length - 2} more` : ""}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold">${order.total.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">{order.currency}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
    </div>
  )
}
