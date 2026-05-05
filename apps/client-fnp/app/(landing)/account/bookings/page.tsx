"use client"

import { useSession } from "next-auth/react"
import { useQuery } from "@tanstack/react-query"
import { Loader2, CalendarDays, Truck } from "lucide-react"
import Link from "next/link"

import { myBookings } from "@/lib/query"

const STATUS_STYLES: Record<string, string> = {
  pending:   "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  confirmed: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  approved:  "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  ready:     "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  completed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })
}

interface Booking {
  id: string
  booking_ref: string
  type: "livestock" | "delivery"
  status: string
  booking_date: string
  time_slot?: string
  created: string
  livestock?: {
    event_title: string
    product_name: string
    quantity: number
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
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
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
        <span className="text-foreground font-medium">My Bookings</span>
      </nav>
      <h1 className="text-xl font-bold mb-6">My Bookings</h1>

        {bookings.length === 0 ? (
          <div className="text-center py-16 space-y-4">
            <CalendarDays className="w-12 h-12 mx-auto text-muted-foreground/40" />
            <p className="font-semibold">No bookings yet</p>
            <p className="text-sm text-muted-foreground">
              Reserve livestock from upcoming batches or book a delivery slot.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {bookings.map((booking) => (
              <Link
                key={booking.id}
                href={`/account/bookings/${booking.id}`}
                className="block border rounded-xl p-4 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm">{booking.booking_ref}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[booking.status] ?? "bg-muted text-muted-foreground"}`}>
                        {capitalize(booking.status)}
                      </span>
                      <span className="text-xs text-muted-foreground capitalize flex items-center gap-1">
                        {booking.type === "delivery" ? <Truck className="w-3 h-3" /> : <CalendarDays className="w-3 h-3" />}
                        {booking.type}
                      </span>
                    </div>

                    {booking.type === "livestock" && booking.livestock && (
                      <p className="text-xs text-muted-foreground">
                        {booking.livestock.event_title} · {booking.livestock.quantity} units
                      </p>
                    )}

                    {booking.type === "delivery" && booking.delivery && (
                      <p className="text-xs text-muted-foreground">
                        {booking.delivery.delivery_location_name} · {booking.delivery.goods}
                      </p>
                    )}

                    <p className="text-xs text-muted-foreground">
                      {formatDate(booking.booking_date)}
                      {booking.time_slot ? ` · ${booking.time_slot}` : ""}
                    </p>
                  </div>

                  {booking.type === "livestock" && booking.livestock && (
                    <div className="text-right shrink-0">
                      <p className="font-bold text-sm">
                        ${(booking.livestock.deposit_amount / 100).toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {booking.livestock.deposit_paid ? "Deposit paid" : "Deposit due"}
                      </p>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
    </div>
  )
}
