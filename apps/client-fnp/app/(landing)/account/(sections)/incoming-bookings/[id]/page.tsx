"use client"

import { useState, use } from "react"
import { useSession } from "next-auth/react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Loader2, CheckCircle2, Circle, Truck } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

import { getIncomingBooking, buyerUpdateBookingStatus } from "@/lib/query"

const STATUS_STYLES: Record<string, string> = {
  pending:   "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  confirmed: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  approved:  "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  ready:     "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  completed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
}

// Buyer-facing step labels for delivery bookings
const DELIVERY_STEPS = [
  { status: "pending",   label: "Received" },
  { status: "confirmed", label: "Processing" },
  { status: "completed", label: "Completed" },
]

// What action buttons to show per current status
const BUYER_TRANSITIONS: Record<string, { label: string; status: string }[]> = {
  pending:   [{ label: "Mark as Received",    status: "confirmed"  }],
  confirmed: [{ label: "Processing Complete", status: "completed"  }],
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
}

function formatDateTime(d: string) {
  return new Date(d).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
}

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium mt-0.5">{value || "—"}</p>
    </div>
  )
}

function StatusSteps({ status }: { status: string }) {
  if (status === "cancelled") {
    return <span className="text-sm font-medium text-red-600">This booking was cancelled.</span>
  }
  const currentIdx = DELIVERY_STEPS.findIndex((s) => s.status === status)
  return (
    <div className="flex items-start gap-0">
      {DELIVERY_STEPS.map((step, i) => {
        const done   = i <= currentIdx
        const isLast = i === DELIVERY_STEPS.length - 1
        return (
          <div key={step.status} className="flex items-start flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              {done
                ? <CheckCircle2 className="w-4 h-4 text-primary" />
                : <Circle className="w-4 h-4 text-muted-foreground/30" />}
              <span className={`text-[11px] font-medium text-center ${done ? "text-foreground" : "text-muted-foreground"}`}>
                {step.label}
              </span>
            </div>
            {!isLast && (
              <div className={`h-px flex-1 mt-2 mx-1.5 ${i < currentIdx ? "bg-primary" : "bg-border"}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

export default function IncomingBookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: session } = useSession()
  const qc = useQueryClient()
  const [note, setNote] = useState("")
  const [cancelOpen, setCancelOpen] = useState(false)
  const [cancelReason, setCancelReason] = useState("")

  const { data, isLoading } = useQuery({
    queryKey: ["incoming-booking", id],
    queryFn: () => getIncomingBooking(id).then((r) => r.data),
    enabled: !!session,
  })

  const mutation = useMutation({
    mutationFn: (status: string) => buyerUpdateBookingStatus(id, status, status === "cancelled" ? cancelReason || undefined : note || undefined),
    onSuccess: (_, status) => {
      toast.success(`Booking marked as ${status}`)
      setNote("")
      setCancelOpen(false)
      setCancelReason("")
      qc.invalidateQueries({ queryKey: ["incoming-booking", id] })
      qc.invalidateQueries({ queryKey: ["incoming-bookings"] })
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? "Failed to update booking")
    },
  })

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const booking = (data as any)?.booking
  if (!booking) {
    return <p className="text-muted-foreground text-sm">Booking not found.</p>
  }

  const actions = BUYER_TRANSITIONS[booking.status] ?? []
  const canCancel = !["completed", "cancelled"].includes(booking.status)

  return (
    <div>
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-4">
        <Link href="/account" className="hover:text-foreground transition-colors">Account</Link>
        <span>/</span>
        <Link href="/account/incoming-bookings" className="hover:text-foreground transition-colors">Incoming Bookings</Link>
        <span>/</span>
        <span className="text-foreground font-medium font-mono">{booking.booking_ref}</span>
      </nav>

      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-lg font-bold font-mono tracking-tight">{booking.booking_ref}</h1>
          <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${STATUS_STYLES[booking.status] ?? "bg-muted text-muted-foreground"}`}>
            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
          </span>
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <Truck className="w-3.5 h-3.5" /> Delivery
          </span>
        </div>
        <p className="text-xs text-muted-foreground">{formatDateTime(booking.created)}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Left: details ── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Progress steps */}
          <div className="border rounded-xl p-5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-4">Progress</p>
            <StatusSteps status={booking.status} />
          </div>

          {/* Farmer details */}
          <div className="border rounded-xl p-5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-4">Farmer</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <Field label="Name"  value={booking.client_name} />
              <Field label="Phone" value={booking.client_phone} />
              <Field label="Email" value={booking.client_email} />
            </div>
          </div>

          {/* Delivery details */}
          {booking.delivery && (
            <div className="border rounded-xl p-5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-4">Delivery Details</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                <Field label="Drop-off Location" value={booking.delivery.delivery_location_name} />
                <Field label="Date"               value={formatDate(booking.booking_date)} />
                {booking.time_slot && <Field label="Time Slot" value={booking.time_slot} />}
              </div>
              {booking.delivery.goods_items?.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Goods</p>
                  <div className="space-y-1">
                    {booking.delivery.goods_items.map((item: any, i: number) => (
                      <p key={i} className="text-sm">{item.quantity} {item.unit} — {item.produce_name}</p>
                    ))}
                  </div>
                </div>
              )}
              {booking.notes && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-xs text-muted-foreground">Farmer Notes</p>
                  <p className="text-sm mt-0.5">{booking.notes}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Right: actions + history ── */}
        <div className="space-y-5">

          {actions.length > 0 && (
            <div className="border rounded-xl p-5 space-y-3">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Update Status</p>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add a note (optional)"
                rows={2}
                className="w-full text-sm border rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-1 focus:ring-ring bg-transparent"
              />
              {actions.map((action) => (
                <button
                  key={action.status}
                  onClick={() => mutation.mutate(action.status)}
                  disabled={mutation.isPending}
                  className="w-full py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {mutation.isPending
                    ? <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                    : action.label}
                </button>
              ))}
            </div>
          )}

          {/* Status history */}
          {booking.status_history?.length > 0 && (
            <div className="border rounded-xl p-5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-4">History</p>
              <div className="space-y-4">
                {[...booking.status_history].reverse().map((h: any, i: number) => (
                  <div key={i} className="flex gap-3 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 mt-1.5 shrink-0" />
                    <div>
                      <p className="font-medium text-sm capitalize">{h.to}</p>
                      {h.note && <p className="text-xs text-muted-foreground mt-0.5">{h.note}</p>}
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formatDateTime(h.timestamp)}
                        {h.changed_by ? ` · ${h.changed_by}` : ""}
                        {h.role ? ` (${h.role})` : ""}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {canCancel && !cancelOpen && (
            <button
              onClick={() => setCancelOpen(true)}
              className="w-full py-2 rounded-lg text-sm font-medium border border-red-200 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
            >
              Cancel Booking
            </button>
          )}

          {cancelOpen && (
            <div className="border border-red-200 rounded-xl p-4 space-y-3">
              <p className="text-sm font-medium text-red-600">Confirm Cancellation</p>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Reason for cancellation..."
                rows={2}
                className="w-full text-sm border rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-1 focus:ring-ring bg-transparent"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => { setCancelOpen(false); setCancelReason("") }}
                  className="flex-1 py-2 text-sm rounded-lg border hover:bg-muted transition-colors"
                >
                  Go back
                </button>
                <button
                  onClick={() => mutation.mutate("cancelled")}
                  disabled={!cancelReason.trim() || mutation.isPending}
                  className="flex-1 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Cancel Booking"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
