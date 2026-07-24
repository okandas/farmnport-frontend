"use client"

import { useSession } from "next-auth/react"
import { useQuery } from "@tanstack/react-query"
import { Loader2, CalendarCheck } from "lucide-react"
import Link from "next/link"

import { myPreOrders } from "@/lib/query"
import { centsToDollars } from "@/lib/utilities"

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
}

const STATUS_LABELS: Record<string, string> = {
  draft:                   "Draft",
  open:                    "Open",
  closed:                  "Closed",
  pending_stock_approval:  "Stock Approval",
  fulfilled:               "Fulfilled",
  cancelled:               "Cancelled",
}

export default function MyPreOrdersPage() {
  const { data: session, status } = useSession()

  const { data, isLoading } = useQuery({
    queryKey: ["my-booking-events"],
    queryFn: () => myPreOrders().then((r: any) => r.data),
    enabled: !!session,
    refetchOnMount: "always",
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
          <CalendarCheck className="w-12 h-12 mx-auto text-muted-foreground/40" />
          <p className="font-semibold">Sign in to view your booking events</p>
          <Link
            href="/login?next=/account/booking-preorders"
            className="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground text-sm font-semibold px-6 py-2.5 hover:bg-primary/90 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    )
  }

  const events: any[] = data?.data ?? []

  return (
    <div>
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-4">
        <Link href="/account" className="hover:text-foreground transition-colors">Account</Link>
        <span>/</span>
        <span className="text-foreground font-medium">My Bookings</span>
      </nav>
      <h1 className="text-2xl font-bold">My Bookings</h1>
      <p className="text-sm text-muted-foreground mb-6">Booking events you created for others to book from you.</p>

      {events.length === 0 ? (
        <div className="text-center py-16 space-y-4">
          <CalendarCheck className="w-12 h-12 mx-auto text-muted-foreground/40" />
          <p className="font-semibold">No booking events yet</p>
          <p className="text-sm text-muted-foreground">Create one to start accepting pre-orders.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {events.map((event: any) => {
            const statusLabel = STATUS_LABELS[event.status] ?? event.status ?? "Draft"
            const booked = event.total_booked ?? 0
            const available = event.total_available ?? 0

            return (
              <div key={event.id} className="rounded-xl border p-4 sm:p-5 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-base font-bold min-w-0">
                    {statusLabel}, {event.title || event.name || "—"}
                  </p>
                  <Link
                    href={`/account/booking-preorders/${event.id}`}
                    className="shrink-0 text-sm font-medium px-4 py-2 rounded-lg border hover:bg-muted transition-colors"
                  >
                    Manage
                  </Link>
                </div>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>
                    {event.product_name ? `${event.product_name} · ` : ""}
                    {booked}/{available} {event.unit} booked · {centsToDollars(event.unit_price)}/{event.unit}
                  </p>
                  <p>Opens {formatDate(event.open_date)} · Closes {formatDate(event.close_date)}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
