"use client"

import Link from "next/link"

import { BuyCategoriesNavClient } from "@/components/generic/BuyCategoriesNavClient"

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
      <div className="relative h-36 bg-muted/30">
        {event.image_src && (
          <img src={event.image_src} alt={event.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-200 group-hover:scale-105" />
        )}
        {event.is_test && (
          <span className="absolute top-2 right-2 bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">TEST</span>
        )}
      </div>

      <div className="p-4 space-y-3 border-t flex flex-col flex-1">
        <h3 className="font-semibold text-sm leading-tight group-hover:text-primary transition-colors">
          {event.name}
        </h3>
        {event.subtitle && (
          <p className="text-xs text-muted-foreground line-clamp-2">{event.subtitle}</p>
        )}

        <div className="text-xs text-muted-foreground pt-2 border-t space-y-1.5">
          <div className="flex justify-between">
            <span>Unit price</span>
            <span className="font-semibold text-foreground">${(event.unit_price / 100 * 1.069).toFixed(2)}</span>
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
          {(event.delivery_locations?.length > 0 || event.collection_locations?.length > 0) && (
            <div className="flex items-center justify-between">
              <span>Locations</span>
              <span className="font-medium text-foreground">
                {[...(event.delivery_locations || []), ...(event.collection_locations || [])].length}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span>Closes</span>
            <span className="font-medium text-foreground">
              {!event.close_date || event.close_date === "0001-01-01T00:00:00Z" ? "Always open" : formatDate(event.close_date)}
            </span>
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

interface BookingsClientProps {
  categories: { label: string; href: string }[]
  initialPreOrders: any[]
}

export function BookingsClient({ categories, initialPreOrders }: BookingsClientProps) {
  const events = initialPreOrders

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <aside className="w-full lg:w-64 flex-shrink-0">
        <BuyCategoriesNavClient categories={categories} />
      </aside>

      <main className="flex-1">
        {events.length === 0 ? (
          <div className="text-center py-20 space-y-3">
            <p className="font-semibold">No open batches right now</p>
            <p className="text-sm text-muted-foreground">Check back soon for upcoming forward booking batches.</p>
          </div>
        ) : (
          <div className="mb-4 text-sm text-muted-foreground">
            {events.length} Open {events.length === 1 ? "Pre-Order" : "Pre-Orders"}
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
  )
}
