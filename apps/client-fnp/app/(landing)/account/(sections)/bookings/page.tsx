"use client"

import { useSession } from "next-auth/react"
import { useQuery } from "@tanstack/react-query"
import { Loader2, CalendarDays } from "lucide-react"
import Link from "next/link"

import { myBookings } from "@/lib/query"


const STATUS_LABELS: Record<string, string> = {
  pending:          "Pending Approval",
  confirmed:        "Pay Now",
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

interface Booking {
  id: string
  booking_ref: string
  type: "pre-order" | "delivery" | "pickup"
  status: string
  booking_date: string
  time_slot?: string
  created: string
  pre_order?: {
    event_title: string
    produce_name: string
    quantity: number
    unit?: string
    deposit_amount: number
    deposit_paid: boolean
  }
  delivery?: {
    delivery_location_name: string
    goods: string
  }
}

export default function BookingsPage() {
  const { data: session, status } = useSession()

  const { data, isLoading } = useQuery({
    queryKey: ["my-bookings"],
    queryFn: () => myBookings().then((r) => r.data),
    enabled: !!session,
  })

  if (status === "loading" || isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!session) {
    return (
      <div className="py-16 flex items-center justify-center">
        <div className="text-center space-y-4">
          <CalendarDays className="w-12 h-12 mx-auto text-muted-foreground/40" />
          <p className="font-semibold">Sign in to view your bookings</p>
          <Link
            href="/login?next=/account/bookings"
            className="inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold px-6 py-2.5 hover:bg-primary/90 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    )
  }

  const bookings: Booking[] = (data as any)?.bookings ?? []

  return (
    <div>
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-4">
        <Link href="/account" className="hover:text-foreground transition-colors">Account</Link>
        <span>/</span>
        <span className="text-foreground font-medium">Booked</span>
      </nav>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Booked</h1>
          <p className="text-sm text-muted-foreground">Bookings you made as a customer from other sellers.</p>
        </div>
        <Link href="/bookings" className="text-sm text-primary hover:underline shrink-0">View available bookings</Link>
      </div>

        {bookings.length === 0 ? (
          <div className="text-center py-16 space-y-4">
            <CalendarDays className="w-12 h-12 mx-auto text-muted-foreground/40" />
            <p className="font-semibold">No bookings yet</p>
            <p className="text-sm text-muted-foreground">
              Reserve livestock from upcoming batches or book a delivery slot.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="rounded-xl border p-4 sm:p-5 space-y-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-base font-bold min-w-0">
                    {STATUS_LABELS[booking.status] ?? booking.status}, {formatDate(booking.booking_date)}
                  </p>
                  <Link
                    href={`/account/bookings/${booking.id}`}
                    className="shrink-0 text-sm font-medium px-4 py-2 rounded-lg border hover:bg-muted transition-colors"
                  >
                    Booking Details
                  </Link>
                </div>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>
                    {booking.booking_ref} · {booking.type === "pre-order" ? "Pre-Order" : booking.type}
                    {booking.time_slot ? ` · ${booking.time_slot}` : ""}
                  </p>
                  {booking.type === "pre-order" && booking.pre_order && (
                    <p>
                      {booking.pre_order.event_title} · {booking.pre_order.quantity} {booking.pre_order.unit || "units"}
                      {booking.pre_order.deposit_paid ? " · Paid" : ""}
                    </p>
                  )}
                  {booking.type === "delivery" && booking.delivery && (
                    <p>{booking.delivery.delivery_location_name} · {booking.delivery.goods}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
    </div>
  )
}
