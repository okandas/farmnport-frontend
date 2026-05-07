"use client"

import { useState, use } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Loader2, CalendarDays, Truck, ArrowLeft, CheckCircle2, Circle } from "lucide-react"
import Link from "next/link"

import { queryAdminBooking, updateBookingStatus } from "@/lib/query"
import { centsToDollars } from "@/lib/utilities"
import { toast } from "@/components/ui/use-toast"
import { DashboardShell } from "@/components/state/dashboardShell"

const STATUS_STYLES: Record<string, string> = {
  pending:   "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  approved:  "bg-purple-100 text-purple-800",
  ready:     "bg-orange-100 text-orange-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
}

const LIVESTOCK_STEPS = ["pending", "confirmed", "ready", "completed"]
const DELIVERY_STEPS  = ["pending", "approved", "completed"]

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
  if (booking.type === "delivery")  return DELIVERY_TRANSITIONS[booking.status] ?? []
  return []
}

function StatusSteps({ status, type }: { status: string; type: string }) {
  const steps = type === "delivery" ? DELIVERY_STEPS : LIVESTOCK_STEPS
  if (status === "cancelled") return (
    <span className="text-sm font-medium text-red-600">This booking was cancelled.</span>
  )
  const current = steps.indexOf(status)
  return (
    <div className="flex items-start gap-0">
      {steps.map((step, i) => {
        const done   = i <= current
        const isLast = i === steps.length - 1
        return (
          <div key={step} className="flex items-start flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              {done
                ? <CheckCircle2 className="w-4 h-4 text-primary" />
                : <Circle className="w-4 h-4 text-muted-foreground/30" />
              }
              <span className={`text-[11px] font-medium ${done ? "text-foreground" : "text-muted-foreground"}`}>
                {capitalize(step)}
              </span>
            </div>
            {!isLast && (
              <div className={`h-px flex-1 mt-2 mx-1.5 ${i < current ? "bg-primary" : "bg-border"}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium mt-0.5">{value || "—"}</p>
    </div>
  )
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
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardShell>
    )
  }

  const booking = data?.data?.booking
  if (!booking) {
    return (
      <DashboardShell>
        <p className="text-muted-foreground">Booking not found.</p>
      </DashboardShell>
    )
  }

  const nextStatuses = getTransitions(booking)

  return (
    <DashboardShell>

      {/* Back + header */}
      <div className="mb-8">
        <Link
          href="/dashboard/farmnport/orders/bookings"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> All Bookings
        </Link>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-lg font-bold font-mono tracking-tight">{booking.booking_ref}</h1>
            <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${STATUS_STYLES[booking.status] ?? "bg-muted text-muted-foreground"}`}>
              {capitalize(booking.status)}
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              {booking.type === "delivery" ? <Truck className="w-3.5 h-3.5" /> : <CalendarDays className="w-3.5 h-3.5" />}
              {capitalize(booking.type)}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">{formatDateTime(booking.created)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Left: main detail ── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Progress */}
          <div className="border rounded-xl p-5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-4">Status</p>
            <StatusSteps status={booking.status} type={booking.type} />
          </div>

          {/* Client */}
          <div className="border rounded-xl p-5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-4">Client</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <Field label="Name" value={booking.client_name} />
              <Field label="Phone" value={booking.client_phone} />
              <Field label="Email" value={booking.client_email} />
            </div>
          </div>

          {/* Booking details */}
          {booking.type === "livestock" && booking.livestock && (
            <div className="border rounded-xl p-5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-4">Pre-Order Details</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <Field label="Event" value={booking.livestock.event_title} />
                <Field label="Product" value={booking.livestock.product_name} />
                <Field label="Quantity" value={`${booking.livestock.quantity?.toLocaleString()} units`} />
                <Field label="Unit Price" value={String(centsToDollars(booking.livestock.unit_price))} />
              </div>
              {booking.notes && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-xs text-muted-foreground">Client Notes</p>
                  <p className="text-sm mt-0.5">{booking.notes}</p>
                </div>
              )}
            </div>
          )}

          {booking.type === "delivery" && booking.delivery && (
            <div className="border rounded-xl p-5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-4">Delivery Details</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <Field label="Drop-off Location" value={booking.delivery.delivery_location_name} />
                <Field label="Date" value={formatDate(booking.booking_date)} />
                {booking.time_slot && <Field label="Time Slot" value={booking.time_slot} />}
                {booking.delivery.approved_by_name && <Field label="Approved By" value={booking.delivery.approved_by_name} />}
              </div>
              <div className="mt-4">
                <Field label="Goods" value={booking.delivery.goods} />
              </div>
              {booking.notes && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-xs text-muted-foreground">Client Notes</p>
                  <p className="text-sm mt-0.5">{booking.notes}</p>
                </div>
              )}
            </div>
          )}

          {/* Payment summary — livestock only */}
          {booking.type === "livestock" && booking.livestock && (
            <div className="border rounded-xl p-5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-4">Payment</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Order Total ({booking.livestock.quantity?.toLocaleString()} units)</span>
                  <span className="font-medium">{centsToDollars((booking.livestock.unit_price ?? 0) * (booking.livestock.quantity ?? 0))}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Deposit</span>
                  <span className="font-semibold text-orange-700">{centsToDollars(booking.livestock.deposit_amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Deposit Status</span>
                  <span className={`font-medium ${booking.livestock.deposit_paid ? "text-green-700" : "text-red-600"}`}>
                    {booking.livestock.deposit_paid ? "Paid" : "Not yet paid"}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-2 mt-1">
                  <span className="font-semibold">Balance Due</span>
                  <span className="font-bold">{centsToDollars(booking.livestock.balance_due)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Right: actions + history ── */}
        <div className="space-y-5">
          {nextStatuses.length > 0 && (
            <div className="border rounded-xl p-5 space-y-3">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Update Status</p>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add a note (optional)"
                rows={2}
                className="w-full text-sm border rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-1 focus:ring-ring bg-transparent"
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
                    {statusMutation.isPending
                      ? <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                      : `Mark as ${capitalize(s)}`}
                  </button>
                ))}
              </div>
            </div>
          )}

          {booking.status_history?.length > 0 && (
            <div className="border rounded-xl p-5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-4">History</p>
              <div className="space-y-4">
                {[...booking.status_history].reverse().map((h: any, i: number) => (
                  <div key={i} className="flex gap-3 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 mt-1.5 shrink-0" />
                    <div>
                      <p className="font-medium text-sm">{capitalize(h.to)}</p>
                      {h.note && <p className="text-xs text-muted-foreground mt-0.5">{h.note}</p>}
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formatDateTime(h.timestamp)}{h.changed_by ? ` · ${h.changed_by}` : ""}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  )
}
