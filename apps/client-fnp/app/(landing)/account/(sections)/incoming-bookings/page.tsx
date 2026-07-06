"use client"

import { useSession } from "next-auth/react"
import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import { Loader2, Truck, ChevronRight } from "lucide-react"
import Link from "next/link"

import { incomingBookings } from "@/lib/query"

const STATUS_STYLES: Record<string, string> = {
  pending:          "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  confirmed:        "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  pending_payment:  "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  paid:             "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  approved:         "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  ready:            "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  collected:        "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  completed:        "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  rejected:         "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  expired:          "bg-muted text-muted-foreground",
  cancelled:        "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
}

const STATUS_LABELS: Record<string, string> = {
  pending:          "Pending Approval",
  confirmed:        "Confirmed",
  pending_payment:  "Payment Processing",
  paid:             "Paid",
  approved:         "Approved",
  ready:            "Ready for Collection",
  collected:        "Collected",
  completed:        "Completed",
  rejected:         "Rejected",
  expired:          "Expired",
  cancelled:        "Cancelled",
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
}

export default function IncomingBookingsPage() {
  const { data: session } = useSession()
  const [statusFilter, setStatusFilter] = useState("")

  const { data, isLoading } = useQuery({
    queryKey: ["incoming-bookings", statusFilter],
    queryFn: () => incomingBookings(1, statusFilter || undefined).then((r) => r.data),
    enabled: !!session,
  })

  const bookings: any[] = (data as any)?.bookings ?? []

  return (
    <div>
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-4">
        <Link href="/account" className="hover:text-foreground transition-colors">Account</Link>
        <span>/</span>
        <span className="text-foreground font-medium">Incoming Bookings</span>
      </nav>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold">Incoming Bookings</h1>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-xs border rounded-lg px-2 py-1.5 bg-transparent"
        >
          <option value="">All statuses</option>
          {Object.entries(STATUS_LABELS).map(([val, label]) => (
            <option key={val} value={val}>{label}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <Truck className="w-10 h-10 mx-auto text-muted-foreground/40" />
          <p className="font-semibold">No incoming bookings</p>
          <p className="text-sm text-muted-foreground">Pre-order and delivery bookings will appear here.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {bookings.map((booking: any) => (
            <Link
              key={booking.id}
              href={`/account/incoming-bookings/${booking.id}`}
              className="flex items-center justify-between gap-4 border rounded-xl p-4 hover:bg-muted/30 transition-colors group"
            >
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm font-mono">{booking.booking_ref}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[booking.status] ?? "bg-muted text-muted-foreground"}`}>
                      {STATUS_LABELS[booking.status] ?? booking.status}
                    </span>
                  </div>
                  <span className="text-xs font-medium text-green-700 shrink-0">Received {formatDate(booking.created)}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {booking.client_name}
                  {booking.type === "pre-order" && booking.pre_order
                    ? ` · ${booking.pre_order.event_title} · ${booking.pre_order.quantity} ${booking.pre_order.unit || "units"}`
                    : booking.delivery?.delivery_location_name ? ` · ${booking.delivery.delivery_location_name}` : ""}
                </p>
                {booking.type === "pre-order" && booking.pre_order?.fulfillment_type && (
                  <p className="text-xs text-muted-foreground">
                    {booking.pre_order.fulfillment_type === "delivery" ? "Delivery" : "Collection"}
                    {booking.pre_order.collection_point_name ? ` · ${booking.pre_order.collection_point_name}` : ""}
                    {booking.pre_order.delivery_date ? ` · ${formatDate(booking.pre_order.delivery_date)}` : ""}
                  </p>
                )}
                {booking.delivery?.goods && (
                  <p className="text-xs text-muted-foreground truncate max-w-sm">{booking.delivery.goods}</p>
                )}
                {booking.type !== "pre-order" && (
                  <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                    Delivery {formatDate(booking.booking_date)}
                    {booking.time_slot ? ` · ${booking.time_slot}` : ""}
                  </p>
                )}
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 group-hover:text-foreground transition-colors" />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
