"use client"

import { useSession } from "next-auth/react"
import { useQuery } from "@tanstack/react-query"
import { Loader2 } from "lucide-react"
import Link from "next/link"

import { incomingBookings } from "@/lib/query"

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
  countered:        "Counter-Offer",
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
}

export default function IncomingBookingsPage() {
  const { data: session } = useSession()
  const { data, isLoading } = useQuery({
    queryKey: ["incoming-bookings"],
    queryFn: () => incomingBookings().then((r) => r.data),
    enabled: !!session,
  })

  const bookings: any[] = (data as any)?.bookings ?? []

  return (
    <div>
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-4">
        <Link href="/account" className="hover:text-foreground transition-colors">Account</Link>
        <span>/</span>
        <span className="text-foreground font-medium">Received Bids</span>
      </nav>

      <h1 className="text-2xl font-bold">Received Bids</h1>
      <p className="text-sm text-muted-foreground mb-6">Bids received on your bookings — review and respond.</p>

      {isLoading ? (
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <p className="font-semibold">No incoming bookings</p>
          <p className="text-sm text-muted-foreground">Bookings and supply offers will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking: any) => (
            <div
              key={booking.id}
              className="rounded-xl border p-4 sm:p-5 space-y-3"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-base font-bold">
                    {STATUS_LABELS[booking.status] ?? booking.status}, {formatDate(booking.created)}
                  </p>
                </div>
                <Link
                  href={`/account/incoming-bookings/${booking.id}`}
                  className="shrink-0 text-sm font-medium px-4 py-2 rounded-lg border hover:bg-muted transition-colors"
                >
                  Review
                </Link>
              </div>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>
                  {booking.booking_ref} · {booking.client_name}
                  {booking.type === "pre-order" && booking.pre_order
                    ? ` · ${booking.pre_order.event_title} · ${booking.pre_order.quantity} ${booking.pre_order.unit || "units"}`
                    : booking.delivery?.delivery_location_name ? ` · ${booking.delivery.delivery_location_name}` : ""}
                </p>
                {booking.type === "pre-order" && booking.pre_order?.fulfillment_type && (
                  <p>
                    {booking.pre_order.fulfillment_type === "delivery" ? "Delivery" : "Collection"}
                    {booking.pre_order.collection_point_name ? ` · ${booking.pre_order.collection_point_name}` : ""}
                    {booking.pre_order.delivery_date ? ` · ${formatDate(booking.pre_order.delivery_date)}` : ""}
                  </p>
                )}
                {booking.delivery?.goods && (
                  <p className="truncate max-w-sm">{booking.delivery.goods}</p>
                )}
                {booking.type !== "pre-order" && (
                  <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                    Delivery {formatDate(booking.booking_date)}
                    {booking.time_slot ? ` · ${booking.time_slot}` : ""}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
