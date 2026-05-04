"use client"

import { useParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { useQuery } from "@tanstack/react-query"
import { Loader2, Package, Truck, Store, CheckCircle2, XCircle, Clock, CreditCard, ChevronLeft } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { getOrder } from "@/lib/query"

const STATUS_STYLES: Record<string, string> = {
  pending:    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  paid:       "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  processing: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  dispatched: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  ready:      "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400",
  delivered:  "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  cancelled:  "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
}

const STATUS_ICONS: Record<string, React.ReactNode> = {
  pending:    <Clock className="w-3.5 h-3.5" />,
  paid:       <CreditCard className="w-3.5 h-3.5" />,
  processing: <Package className="w-3.5 h-3.5" />,
  dispatched: <Truck className="w-3.5 h-3.5" />,
  ready:      <CheckCircle2 className="w-3.5 h-3.5" />,
  delivered:  <CheckCircle2 className="w-3.5 h-3.5" />,
  cancelled:  <XCircle className="w-3.5 h-3.5" />,
}

const STATUS_STEPS_DELIVERY = ["pending", "paid", "processing", "dispatched", "delivered"]
const STATUS_STEPS_COLLECT  = ["pending", "paid", "processing", "ready", "delivered"]

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

interface OrderItem {
  product_id: string
  product_type: string
  product_name: string
  product_slug: string
  image_src: string
  unit_price: number
  quantity: number
  line_total: number
}

interface StatusChange {
  from: string
  to: string
  changed_by: string
  note: string
  timestamp: string
}

interface DeliveryAddress {
  name: string
  phone: string
  address: string
  city: string
  province: string
}

interface Order {
  id: string
  order_number: string
  status: string
  items: OrderItem[]
  subtotal: number
  delivery_fee: number
  total: number
  currency: string
  fulfillment: string
  delivery_address?: DeliveryAddress
  payment_provider: string
  payment_method: string
  payment_ref: string
  paid_at?: string
  status_history: StatusChange[]
  delivered_at?: string
  created: string
}

export default function OrderDetailPage() {
  const params = useParams()
  const { data: session, status } = useSession()
  const orderId = params.id as string

  const { data, isLoading } = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => getOrder(orderId).then((r) => r.data as Order),
    enabled: !!session && !!orderId,
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
          <p className="font-semibold">Sign in to view your order</p>
          <Link
            href={`/login?next=/account/orders/${orderId}`}
            className="inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold px-6 py-2.5 hover:bg-primary/90 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    )
  }

  const order = data

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Package className="w-12 h-12 mx-auto text-muted-foreground/40" />
          <p className="font-semibold">Order not found</p>
          <Link href="/account/orders" className="text-sm text-primary hover:underline">Back to orders</Link>
        </div>
      </div>
    )
  }

  const steps = order.fulfillment === "click_collect" ? STATUS_STEPS_COLLECT : STATUS_STEPS_DELIVERY
  const currentStepIndex = steps.indexOf(order.status)

  return (
    <div>
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-4">
        <Link href="/account" className="hover:text-foreground transition-colors">Account</Link>
        <span>/</span>
        <Link href="/account/orders" className="hover:text-foreground transition-colors">My Orders</Link>
        <span>/</span>
        <span className="text-foreground font-medium">{order.order_number}</span>
      </nav>

      <div className="space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold">{order.order_number}</h1>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_STYLES[order.status] ?? "bg-muted text-muted-foreground"}`}>
                {capitalize(order.status)}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">{formatDate(order.created)}</p>
          </div>
          <Link href="/account/orders" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground shrink-0">
            <ChevronLeft className="w-4 h-4" />
            All Orders
          </Link>
        </div>

        {/* Status Stepper */}
        {order.status !== "cancelled" && (
          <div className="border rounded-xl p-5">
            <h2 className="text-sm font-semibold mb-4">Order Progress</h2>
            <div className="flex items-center justify-between">
              {steps.map((step, i) => {
                const isCompleted = i <= currentStepIndex
                const isCurrent = i === currentStepIndex
                return (
                  <div key={step} className="flex flex-1 items-center">
                    <div className="flex flex-col items-center gap-1">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors ${
                        isCompleted
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-muted-foreground/20 text-muted-foreground/30"
                      } ${isCurrent ? "ring-2 ring-primary/20" : ""}`}>
                        {STATUS_ICONS[step]}
                      </div>
                      <span className={`text-xs capitalize text-center leading-tight ${isCompleted ? "font-medium text-foreground" : "text-muted-foreground/40"}`}>
                        {step}
                      </span>
                    </div>
                    {i < steps.length - 1 && (
                      <div className={`mx-1 h-0.5 flex-1 ${i < currentStepIndex ? "bg-primary" : "bg-muted"}`} />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Items */}
        <div className="border rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b bg-muted/30">
            <h2 className="font-semibold text-sm">Items ({order.items.length})</h2>
          </div>
          <div className="divide-y">
            {order.items.map((item, i) => (
              <div key={i} className="flex gap-3 p-4">
                <div className="relative w-14 h-14 rounded-lg border bg-white overflow-hidden shrink-0">
                  {item.image_src ? (
                    <Image src={item.image_src} alt={item.product_name} fill sizes="56px" className="object-contain p-1" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground/20 text-lg">📦</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium capitalize">{item.product_name}</p>
                  <p className="text-xs text-muted-foreground">Qty {item.quantity} × ${item.unit_price.toFixed(2)}</p>
                </div>
                <p className="text-sm font-semibold shrink-0">${item.line_total.toFixed(2)}</p>
              </div>
            ))}
          </div>
          {/* Totals */}
          <div className="px-5 py-4 border-t space-y-2 bg-muted/10">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>${order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Delivery</span>
              <span>{order.delivery_fee > 0 ? `$${order.delivery_fee.toFixed(2)}` : <span className="text-green-700 dark:text-green-400">{order.fulfillment === "click_collect" ? "Pickup" : "Free"}</span>}</span>
            </div>
            <div className="flex justify-between font-bold text-base border-t pt-2">
              <span>Total</span>
              <span>${order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {/* Fulfillment */}
          <div className="border rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-2">
              {order.fulfillment === "click_collect" ? (
                <Store className="w-4 h-4 text-muted-foreground" />
              ) : (
                <Truck className="w-4 h-4 text-muted-foreground" />
              )}
              <h2 className="font-semibold text-sm">
                {order.fulfillment === "click_collect" ? "Click & Collect" : "Delivery"}
              </h2>
            </div>
            {order.delivery_address ? (
              <div className="text-sm space-y-1 text-muted-foreground">
                <p className="text-foreground font-medium">{order.delivery_address.name}</p>
                <p>{order.delivery_address.address}</p>
                <p>{order.delivery_address.city}, {order.delivery_address.province}</p>
                {order.delivery_address.phone && <p>{order.delivery_address.phone}</p>}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Collect in person</p>
            )}
            {order.delivered_at && (
              <p className="text-xs text-green-700 dark:text-green-400">Delivered {formatDate(order.delivered_at)}</p>
            )}
          </div>

          {/* Payment */}
          <div className="border rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-muted-foreground" />
              <h2 className="font-semibold text-sm">Payment</h2>
            </div>
            <div className="text-sm space-y-1 text-muted-foreground">
              <p><span className="text-foreground capitalize">{order.payment_provider}</span>{order.payment_method ? ` — ${order.payment_method}` : ""}</p>
              <p>Ref: <span className="font-mono text-foreground">{order.payment_ref}</span></p>
              {order.paid_at && <p>Paid {formatDate(order.paid_at)}</p>}
            </div>
          </div>
        </div>

        {/* Timeline */}
        {order.status_history && order.status_history.length > 0 && (
          <div className="border rounded-xl p-5">
            <h2 className="font-semibold text-sm mb-4">Timeline</h2>
            <div className="space-y-4">
              {[...order.status_history].reverse().map((change, i, arr) => (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center shrink-0">
                    <div className="h-2 w-2 rounded-full bg-primary mt-1.5" />
                    {i < arr.length - 1 && <div className="w-px flex-1 bg-border mt-1" />}
                  </div>
                  <div className="pb-3">
                    <p className="text-sm font-medium capitalize">{change.to}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(change.timestamp)}</p>
                    {change.note && <p className="text-xs text-muted-foreground mt-0.5">{change.note}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
