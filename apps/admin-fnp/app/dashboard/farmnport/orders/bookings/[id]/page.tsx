"use client"

import { useState, use } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Loader2, CalendarDays, Truck, Clock } from "lucide-react"
import Link from "next/link"

import { queryAdminBooking, updateBookingStatus } from "@/lib/query"
import { centsToDollars } from "@/lib/utilities"
import { toast } from "@/components/ui/use-toast"
import { DashboardHeader } from "@/components/state/dashboardHeader"
import { DashboardShell } from "@/components/state/dashboardShell"

const STATUS_STYLES: Record<string, string> = {
  pending:   "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  approved:  "bg-purple-100 text-purple-800",
  ready:     "bg-orange-100 text-orange-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
}

const STATUS_TRANSITIONS: Record<string, string[]> = {
  pending:   ["confirmed", "cancelled"],
  confirmed: ["ready", "cancelled"],
  approved:  ["ready", "cancelled"],
  ready:     ["completed", "cancelled"],
  completed: [],
  cancelled: [],
}

const LIVESTOCK_TRANSITIONS: Record<string, string[]> = {
  pending:   ["confirmed", "cancelled"],
  confirmed: ["ready", "cancelled"],
  ready:     ["completed", "cancelled"],
  completed: [],
  cancelled: [],
}

const DELIVERY_TRANSITIONS: Record<string, string[]> = {
  pending:   ["approved", "cancelled"],
  approved:  ["completed", "cancelled"],
  completed: [],
  cancelled: [],
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
}

function formatDateTime(d: string) {
  return new Date(d).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
}

function getTransitions(booking: any): string[] {
  if (!booking) return []
  if (booking.type === "livestock") return LIVESTOCK_TRANSITIONS[booking.status] ?? []
  if (booking.type === "delivery") return DELIVERY_TRANSITIONS[booking.status] ?? []
  return STATUS_TRANSITIONS[booking.status] ?? []
}

export default function AdminBookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const queryClient = useQueryClient()
  const [note, setNote] = useState("")

  const { data, isLoading } = useQuery({
    queryKey: ["admin-booking", id],
    queryFn: () => queryAdminBooking(id),
    refetchOnWindowFocus: false,
  })

  const statusMutation = useMutation({
    mutationFn: (status: string) => updateBookingStatus(id, status, note || undefined),
    onSuccess: (_, status) => {
      toast({ description: `Booking marked as ${status}` })
      setNote("")
      queryClient.invalidateQueries({ queryKey: ["admin-booking", id] })
      queryClient.invalidateQueries({ queryKey: ["admin-bookings"] })
    },
    onError: () => toast({ description: "Failed to update status", variant: "destructive" }),
  })

  if (isLoading) {
    return (
      <DashboardShell>
        <DashboardHeader heading="Booking" text="" />
        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>
      </DashboardShell>
    )
  }

  const booking = data?.data?.booking
  if (!booking) {
    return (
      <DashboardShell>
        <DashboardHeader heading="Booking not found" text="" />
      </DashboardShell>
    )
  }

  const nextStatuses = getTransitions(booking)

  return (
    <DashboardShell>
      <DashboardHeader
        heading={booking.booking_ref}
        text={`Created ${formatDateTime(booking.created)}`}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left — details */}
        <div className="lg:col-span-2 space-y-5">

          {/* Status badge */}
          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full font-medium ${STATUS_STYLES[booking.status] ?? "bg-muted text-muted-foreground"}`}>
              {booking.type === "delivery" ? <Truck className="w-4 h-4" /> : <CalendarDays className="w-4 h-4" />}
              {capitalize(booking.type)} · {capitalize(booking.status)}
            </span>
          </div>

          {/* Client */}
          <div className="border rounded-xl p-5 space-y-3">
            <h2 className="font-semibold text-sm">Client</h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground text-xs mb-0.5">Name</p>
                <p className="font-medium">{booking.client_name}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs mb-0.5">Email</p>
                <p className="font-medium">{booking.client_email}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs mb-0.5">Phone</p>
                <p className="font-medium">{booking.client_phone || "—"}</p>
              </div>
            </div>
          </div>

          {/* Booking details */}
          <div className="border rounded-xl p-5 space-y-4">
            <h2 className="font-semibold text-sm">Booking Details</h2>

            {booking.type === "livestock" && booking.livestock && (
              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-muted-foreground text-xs mb-0.5">Event</p>
                    <p className="font-medium">{booking.livestock.event_title}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs mb-0.5">Product</p>
                    <p className="font-medium">{booking.livestock.product_name}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs mb-0.5">Quantity</p>
                    <p className="font-medium">{booking.livestock.quantity} units</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs mb-0.5">Unit Price</p>
                    <p className="font-medium">{centsToDollars(booking.livestock.unit_price)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs mb-0.5">Deposit</p>
                    <p className="font-bold text-orange-700">{centsToDollars(booking.livestock.deposit_amount)}</p>
                    <p className="text-xs text-muted-foreground">{booking.livestock.deposit_paid ? "Paid" : "Not paid"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs mb-0.5">Balance Due</p>
                    <p className="font-bold">{centsToDollars(booking.livestock.balance_due)}</p>
                  </div>
                </div>
              </div>
            )}

            {booking.type === "delivery" && booking.delivery && (
              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-muted-foreground text-xs mb-0.5">Drop-off Location</p>
                    <p className="font-medium">{booking.delivery.delivery_location_name}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs mb-0.5">Date</p>
                    <p className="font-medium">{formatDate(booking.booking_date)}</p>
                  </div>
                  {booking.time_slot && (
                    <div>
                      <p className="text-muted-foreground text-xs mb-0.5">Time Slot</p>
                      <p className="font-medium">{booking.time_slot}</p>
                    </div>
                  )}
                  {booking.delivery.approved_by_name && (
                    <div>
                      <p className="text-muted-foreground text-xs mb-0.5">Approved By</p>
                      <p className="font-medium">{booking.delivery.approved_by_name}</p>
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-muted-foreground text-xs mb-0.5">Goods</p>
                  <p className="font-medium">{booking.delivery.goods}</p>
                </div>
              </div>
            )}

            {booking.notes && (
              <div className="border-t pt-3 text-sm">
                <p className="text-muted-foreground text-xs mb-0.5">Client Notes</p>
                <p>{booking.notes}</p>
              </div>
            )}
          </div>

          {/* Status history */}
          {booking.status_history?.length > 0 && (
            <div className="border rounded-xl p-5">
              <h2 className="font-semibold text-sm mb-4">Status History</h2>
              <div className="space-y-3">
                {[...booking.status_history].reverse().map((h: any, i: number) => (
                  <div key={i} className="flex items-start gap-3 text-sm">
                    <Clock className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <p className="font-medium">{capitalize(h.to)}</p>
                      {h.note && <p className="text-xs text-muted-foreground">{h.note}</p>}
                      <p className="text-xs text-muted-foreground">{formatDateTime(h.timestamp)} · {h.changed_by}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right — actions */}
        <div className="space-y-4">
          {nextStatuses.length > 0 && (
            <div className="border rounded-xl p-5 space-y-4">
              <h2 className="font-semibold text-sm">Update Status</h2>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add a note (optional)"
                rows={3}
                className="w-full text-sm border rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-1 focus:ring-ring"
              />
              <div className="flex flex-col gap-2">
                {nextStatuses.map((s) => (
                  <button
                    key={s}
                    onClick={() => statusMutation.mutate(s)}
                    disabled={statusMutation.isPending}
                    className={`w-full py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
                      s === "cancelled"
                        ? "border border-red-200 text-red-600 hover:bg-red-50"
                        : "bg-primary text-primary-foreground hover:bg-primary/90"
                    }`}
                  >
                    {statusMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : `Mark as ${capitalize(s)}`}
                  </button>
                ))}
              </div>
            </div>
          )}

          <Link
            href="/dashboard/farmnport/orders/bookings"
            className="block text-center text-sm text-muted-foreground hover:text-foreground border rounded-xl py-2.5"
          >
            Back to Bookings
          </Link>
        </div>
      </div>
    </DashboardShell>
  )
}
