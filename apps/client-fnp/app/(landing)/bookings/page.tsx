"use client"

import { useQuery } from "@tanstack/react-query"
import Link from "next/link"
import { CalendarDays, Loader2 } from "lucide-react"

import { listBookingEvents } from "@/lib/query"
import { BuyCategoriesNav } from "@/components/generic/BuyCategoriesNav"

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
}

function EventCard({ event }: { event: any }) {
  const available = event.total_available - event.total_booked
  return (
    <Link
      href={`/bookings/${event.slug}`}
      className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg hover:border-primary/50 transition-all duration-200 group flex flex-col"
    >
      {/* Image area — matches ProductCard */}
      <div className="relative aspect-square bg-muted/30">
        {event.image_src && (
          <img src={event.image_src} alt={event.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-200 group-hover:scale-105" />
        )}
      </div>

      <div className="p-4 space-y-3 border-t flex flex-col flex-1">
        <h3 className="font-semibold text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors">
          {event.title}
        </h3>

        <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">{event.client_name}</p>

        <div className="text-xs text-muted-foreground pt-2 border-t space-y-1.5">
          <div className="flex justify-between">
            <span>Unit price</span>
            <span className="font-semibold text-foreground">${(event.unit_price / 100).toFixed(2)}</span>
          </div>
          {event.deposit_per_unit > 0 && (
            <div className="flex justify-between">
              <span>Deposit/unit</span>
              <span className="font-medium text-foreground">${(event.deposit_per_unit / 100).toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Available</span>
            <span className="font-medium text-foreground">{available} of {event.total_available}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Closes</span>
            <span className="font-medium text-foreground">{formatDate(event.close_date)}</span>
          </div>
        </div>

        <div className="mt-auto pt-1">
          <div className="w-full text-center text-sm font-medium py-2 rounded-md border hover:bg-muted transition-colors">
            Reserve Now
          </div>
        </div>
      </div>
    </Link>
  )
}

export default function BookingEventsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["booking-events"],
    queryFn: () => listBookingEvents({ status: "open" }),
  })

  const events: any[] = data?.data?.events ?? []

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-6">
        <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-6">
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          <span>/</span>
          <Link href="/buy" className="hover:text-foreground transition-colors">Buy</Link>
          <span>/</span>
          <span className="text-foreground font-medium">Pre-Orders</span>
        </nav>

        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight font-heading mb-2">Pre-Order Batches</h1>
          <p className="text-lg text-muted-foreground">Reserve livestock and farm produce from upcoming supplier batches.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full lg:w-64 flex-shrink-0">
            <BuyCategoriesNav />
          </aside>

          {/* Main content */}
          <main className="flex-1">
            {isLoading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : events.length === 0 ? (
              <div className="text-center py-20 space-y-3">
                <CalendarDays className="w-12 h-12 mx-auto text-muted-foreground/40" />
                <p className="font-semibold">No open batches right now</p>
                <p className="text-sm text-muted-foreground">Check back soon for upcoming pre-order batches.</p>
              </div>
            ) : (
              <div className="mb-4 text-sm text-muted-foreground">
                {events.length} Open {events.length === 1 ? "Lot" : "Lots"}
              </div>
            )}

            {events.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {events.map((event: any) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
