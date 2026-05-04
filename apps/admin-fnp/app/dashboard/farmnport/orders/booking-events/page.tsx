"use client"

import { useQuery } from "@tanstack/react-query"
import Link from "next/link"
import { PlusCircle, CalendarDays } from "lucide-react"

import { queryAdminBookingEvents } from "@/lib/query"
import { DashboardHeader } from "@/components/state/dashboardHeader"
import { DashboardShell } from "@/components/state/dashboardShell"
import { Placeholder } from "@/components/state/placeholder"

const STATUS_STYLES: Record<string, string> = {
  draft:     "bg-muted text-muted-foreground",
  open:      "bg-green-100 text-green-800",
  closed:    "bg-yellow-100 text-yellow-800",
  fulfilled: "bg-blue-100 text-blue-800",
  cancelled: "bg-red-100 text-red-800",
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
}

export default function BookingEventsPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-booking-events"],
    queryFn: () => queryAdminBookingEvents(),
    refetchOnWindowFocus: false,
  })

  if (isLoading) {
    return (
      <DashboardShell>
        <DashboardHeader heading="Booking Events" text="Manage pre-order livestock batches." />
        <Placeholder><Placeholder.Title>Loading Events</Placeholder.Title></Placeholder>
      </DashboardShell>
    )
  }

  if (isError) {
    return (
      <DashboardShell>
        <DashboardHeader heading="Booking Events" text="Manage pre-order livestock batches." />
        <Placeholder>
          <Placeholder.Icon name="close" />
          <Placeholder.Title>Error loading events</Placeholder.Title>
        </Placeholder>
      </DashboardShell>
    )
  }

  const events: any[] = data?.data?.events ?? []

  return (
    <DashboardShell>
      <DashboardHeader heading="Booking Events" text="Manage pre-order livestock batches.">
        <Link
          href="/dashboard/farmnport/orders/booking-events/new"
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground text-sm font-medium px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          New Event
        </Link>
      </DashboardHeader>

      {events.length === 0 ? (
        <div className="border rounded-xl py-16 text-center space-y-3">
          <CalendarDays className="w-10 h-10 mx-auto text-muted-foreground/40" />
          <p className="font-semibold">No booking events yet</p>
          <p className="text-sm text-muted-foreground">Create a pre-order batch to let clients reserve livestock.</p>
          <Link
            href="/dashboard/farmnport/orders/booking-events/new"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground text-sm font-medium px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            Create First Event
          </Link>
        </div>
      ) : (
        <div className="rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Title</th>
                <th className="text-left px-4 py-3 font-medium">Product</th>
                <th className="text-left px-4 py-3 font-medium">Open / Close</th>
                <th className="text-left px-4 py-3 font-medium">Booked</th>
                <th className="text-left px-4 py-3 font-medium">Deposit/unit</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {events.map((event) => (
                <tr key={event.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 font-medium">{event.title}</td>
                  <td className="px-4 py-3 text-muted-foreground">{event.product_name}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                    {formatDate(event.open_date)} → {formatDate(event.close_date)}
                  </td>
                  <td className="px-4 py-3">
                    {event.total_booked} / {event.total_available}
                  </td>
                  <td className="px-4 py-3">
                    ${(event.deposit_per_unit / 100).toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[event.status] ?? "bg-muted text-muted-foreground"}`}>
                      {capitalize(event.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/dashboard/farmnport/orders/booking-events/${event.id}/edit`}
                      className="text-xs text-primary hover:underline"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardShell>
  )
}
