"use client"

import { useState, use } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Loader2, CalendarDays, Truck, ArrowLeft, CheckCircle2, Circle } from "lucide-react"
import Link from "next/link"

import { queryAdminBooking, updateBookingStatus, confirmPreOrderBooking, rejectPreOrderBooking, markPreOrderReady, markPreOrderCollected } from "@/lib/query"
import { centsToDollars } from "@/lib/utilities"
import { toast } from "@/components/ui/use-toast"
import { FormSkeleton } from "@/components/state/skeleton-table"
import { DashboardShell } from "@/components/state/dashboardShell"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"

const STATUS_STYLES: Record<string, string> = {
  pending:          "bg-yellow-100 text-yellow-800",
  confirmed:        "bg-blue-100 text-blue-800",
  pending_payment:  "bg-orange-100 text-orange-800",
  paid:             "bg-green-100 text-green-800",
  approved:         "bg-purple-100 text-purple-800",
  ready:            "bg-emerald-100 text-emerald-800",
  collected:        "bg-green-100 text-green-800",
  completed:        "bg-green-100 text-green-800",
  rejected:         "bg-red-100 text-red-800",
  expired:          "bg-muted text-muted-foreground",
  cancelled:        "bg-red-100 text-red-800",
}

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
}

const PRE_ORDER_STEPS = ["pending", "confirmed", "paid", "ready", "collected"]
const DELIVERY_STEPS  = ["pending", "approved", "completed"]

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
}

function formatDateTime(d: string) {
  return new Date(d).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
}

function StatusSteps({ status, type }: { status: string; type: string }) {
  const steps = type === "delivery" || type === "pickup" ? DELIVERY_STEPS : PRE_ORDER_STEPS
  if (["cancelled", "rejected", "expired"].includes(status)) return (
    <span className="text-sm font-medium text-red-600">
      {status === "rejected" ? "This booking was rejected." : status === "expired" ? "This booking expired (payment deadline passed)." : "This booking was cancelled."}
    </span>
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
                ? <CheckCircle2 className={`w-4 h-4 ${current === steps.length - 1 ? "text-black dark:text-white" : "text-primary"}`} />
                : <Circle className="w-4 h-4 text-muted-foreground/30" />
              }
              <span className={`text-[11px] font-medium ${done ? "text-foreground" : "text-muted-foreground"}`}>
                {STATUS_LABELS[step] ?? capitalize(step)}
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
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmInput, setConfirmInput] = useState("")
  const [cancelOpen, setCancelOpen] = useState(false)
  const [cancelReason, setCancelReason] = useState("")
  const [cancelInput, setCancelInput] = useState("")
  const [rejectOpen, setRejectOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState("")
  const [rejectInput, setRejectInput] = useState("")

  const { data, isLoading } = useQuery({
    queryKey: ["admin-booking", id],
    queryFn: () => queryAdminBooking(id),
    refetchOnWindowFocus: false,
  })

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-booking", id] })
    queryClient.invalidateQueries({ queryKey: ["admin-bookings"] })
  }

  const statusMutation = useMutation({
    mutationFn: (status: string) => updateBookingStatus(id, status, status === "cancelled" ? cancelReason || undefined : note || undefined),
    onSuccess: (_, status) => {
      toast({ description: `Booking marked as ${STATUS_LABELS[status] ?? status}` })
      setNote("")
      invalidate()
    },
    onError: () => toast({ description: "Failed to update status", variant: "destructive" }),
  })

  const confirmMutation = useMutation({
    mutationFn: () => confirmPreOrderBooking(id),
    onSuccess: () => {
      toast({ description: "Booking confirmed — buyer notified to pay" })
      invalidate()
    },
    onError: (err: any) => toast({ description: err?.response?.data?.message || "Failed to confirm", variant: "destructive" }),
  })

  const rejectMutation = useMutation({
    mutationFn: () => rejectPreOrderBooking(id, rejectReason),
    onSuccess: () => {
      toast({ description: "Booking rejected — buyer notified" })
      setRejectOpen(false)
      setRejectReason("")
      invalidate()
    },
    onError: () => toast({ description: "Failed to reject", variant: "destructive" }),
  })

  const readyMutation = useMutation({
    mutationFn: () => markPreOrderReady(id),
    onSuccess: () => {
      toast({ description: "Marked as ready — buyer notified" })
      invalidate()
    },
    onError: (err: any) => toast({ description: err?.response?.data?.message || "Failed to update", variant: "destructive" }),
  })

  const collectedMutation = useMutation({
    mutationFn: () => markPreOrderCollected(id),
    onSuccess: () => {
      toast({ description: "Marked as collected — order complete" })
      invalidate()
    },
    onError: (err: any) => toast({ description: err?.response?.data?.message || "Failed to update", variant: "destructive" }),
  })

  if (isLoading) {
    return <DashboardShell><FormSkeleton /></DashboardShell>
  }

  const booking = data?.data?.booking
  if (!booking) {
    return <DashboardShell><p className="text-muted-foreground">Booking not found.</p></DashboardShell>
  }

  const isPreOrder = booking.type === "pre-order"
  const isTerminal = ["completed", "collected", "cancelled", "rejected", "expired"].includes(booking.status)

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
              {STATUS_LABELS[booking.status] ?? booking.status}
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              {booking.type === "delivery" ? <Truck className="w-3.5 h-3.5" /> : <CalendarDays className="w-3.5 h-3.5" />}
              {isPreOrder ? "Pre-Order" : capitalize(booking.type)}
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

          {/* Pre-order details */}
          {isPreOrder && booking.pre_order && (
            <div className="border rounded-xl p-5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-4">Pre-Order Details</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <Field label="Event" value={booking.pre_order.event_title} />
                <Field label="Produce" value={booking.pre_order.produce_name} />
                <Field label="Quantity" value={`${booking.pre_order.quantity?.toLocaleString()} units`} />
                <Field label="Unit Price" value={String(centsToDollars(booking.pre_order.unit_price))} />
              </div>
              {booking.pre_order.buyer_notes && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-xs text-muted-foreground">Buyer Notes</p>
                  <p className="text-sm mt-0.5">{booking.pre_order.buyer_notes}</p>
                </div>
              )}
              {booking.pre_order.reject_reason && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-xs text-red-600">Reject Reason</p>
                  <p className="text-sm mt-0.5 text-red-700">{booking.pre_order.reject_reason}</p>
                </div>
              )}
              {booking.notes && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-xs text-muted-foreground">Client Notes</p>
                  <p className="text-sm mt-0.5">{booking.notes}</p>
                </div>
              )}
            </div>
          )}

          {/* Delivery details */}
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
            </div>
          )}

          {/* Pickup details */}
          {booking.type === "pickup" && booking.pickup && (
            <div className="border rounded-xl p-5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-4">Pickup Details</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <Field label="Buyer" value={booking.pickup.buyer_name} />
                <Field label="Farm Address" value={booking.pickup.farm_address} />
                <Field label="Date" value={formatDate(booking.booking_date)} />
                {booking.time_slot && <Field label="Time Slot" value={booking.time_slot} />}
              </div>
              <div className="mt-4">
                <Field label="Goods" value={booking.pickup.goods} />
              </div>
            </div>
          )}

          {/* Payment summary — pre-order only */}
          {isPreOrder && booking.pre_order && (
            <div className="border rounded-xl p-5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-4">Payment</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Order Total ({booking.pre_order.quantity?.toLocaleString()} units)</span>
                  <span className="font-medium">{centsToDollars((booking.pre_order.unit_price ?? 0) * (booking.pre_order.quantity ?? 0))}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount Due</span>
                  <span className="font-semibold text-orange-700">{centsToDollars(booking.pre_order.deposit_amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Status</span>
                  <span className={`font-medium ${booking.pre_order.deposit_paid ? "text-green-700" : "text-red-600"}`}>
                    {booking.pre_order.deposit_paid ? "Paid" : "Not yet paid"}
                  </span>
                </div>
                {booking.pre_order.payment_deadline && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payment Deadline</span>
                    <span className="font-medium">{formatDateTime(booking.pre_order.payment_deadline)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t pt-2 mt-1">
                  <span className="font-semibold">Balance on Collection</span>
                  <span className="font-bold">{centsToDollars(booking.pre_order.balance_due)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Right: actions + history ── */}
        <div className="space-y-5">

          {/* Pre-order specific actions */}
          {isPreOrder && !isTerminal && (
            <div className="border rounded-xl p-5 space-y-3">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Actions</p>

              {booking.status === "pending" && (
                <>
                  <button
                    onClick={() => setConfirmOpen(true)}
                    className="w-full py-2 rounded-lg text-sm font-medium transition-colors bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    Confirm Booking
                  </button>
                  <button
                    onClick={() => setRejectOpen(true)}
                    className="w-full py-2 rounded-lg text-sm font-medium border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                  >
                    Reject Booking
                  </button>
                </>
              )}

              {booking.status === "paid" && (
                <button
                  onClick={() => readyMutation.mutate()}
                  disabled={readyMutation.isPending}
                  className="w-full py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {readyMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Mark Ready for Collection"}
                </button>
              )}

              {booking.status === "ready" && (
                <button
                  onClick={() => collectedMutation.mutate()}
                  disabled={collectedMutation.isPending}
                  className="w-full py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {collectedMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Mark as Collected"}
                </button>
              )}

              {["confirmed", "pending_payment"].includes(booking.status) && (
                <p className="text-xs text-muted-foreground text-center">Waiting for buyer to pay</p>
              )}
            </div>
          )}

          {/* Delivery/pickup actions */}
          {!isPreOrder && !isTerminal && (
            <div className="border rounded-xl p-5 space-y-3">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Update Status</p>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add a note (optional)"
                rows={2}
                className="w-full text-sm border rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-1 focus:ring-ring bg-transparent"
              />
              {booking.status === "pending" && (
                <button
                  onClick={() => statusMutation.mutate("approved")}
                  disabled={statusMutation.isPending}
                  className="w-full py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {statusMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Approve"}
                </button>
              )}
              {booking.status === "approved" && (
                <button
                  onClick={() => statusMutation.mutate("completed")}
                  disabled={statusMutation.isPending}
                  className="w-full py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {statusMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Mark Completed"}
                </button>
              )}
            </div>
          )}

          {/* History */}
          {booking.status_history?.length > 0 && (
            <div className="border rounded-xl p-5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-4">History</p>
              <div className="space-y-4">
                {[...booking.status_history].reverse().map((h: any, i: number) => (
                  <div key={i} className="flex gap-3 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 mt-1.5 shrink-0" />
                    <div>
                      <p className="font-medium text-sm">{STATUS_LABELS[h.to] ?? capitalize(h.to)}</p>
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

          {/* Cancel button */}
          {!isTerminal && (
            <button
              onClick={() => setCancelOpen(true)}
              className="w-full py-2 rounded-lg text-sm font-medium border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
            >
              Cancel Booking
            </button>
          )}
        </div>

        {/* Cancel dialog */}
        <Dialog open={cancelOpen} onOpenChange={(o) => { setCancelOpen(o); if (!o) { setCancelInput(""); setCancelReason("") } }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cancel Booking</DialogTitle>
            </DialogHeader>
            <div className="flex items-center justify-between bg-muted/50 rounded-lg px-3 py-2">
              <span className="text-sm font-mono font-semibold">{booking.booking_ref}</span>
              <button type="button" onClick={() => { navigator.clipboard.writeText(booking.booking_ref); toast({ description: "Copied" }) }} className="text-xs text-primary hover:underline">Copy</button>
            </div>
            <p className="text-sm text-muted-foreground">Please provide a reason and paste the booking reference to cancel.</p>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Reason for cancellation..."
              rows={2}
              className="w-full text-sm border rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-1 focus:ring-ring bg-transparent"
            />
            <input
              value={cancelInput}
              onChange={(e) => setCancelInput(e.target.value)}
              placeholder="Paste booking reference here"
              className="w-full text-sm border rounded-lg px-3 py-2 font-mono focus:outline-none focus:ring-1 focus:ring-ring bg-transparent"
            />
            <DialogFooter>
              <button onClick={() => { setCancelOpen(false); setCancelInput(""); setCancelReason("") }} className="px-4 py-2 text-sm rounded-lg border hover:bg-muted transition-colors">
                Go back
              </button>
              <button
                onClick={() => {
                  statusMutation.mutate("cancelled", { onSuccess: () => { setCancelOpen(false); setCancelInput(""); setCancelReason("") } })
                }}
                disabled={!cancelReason.trim() || cancelInput !== booking.booking_ref || statusMutation.isPending}
                className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {statusMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm Cancel"}
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reject dialog */}
        {/* Confirm dialog */}
        <Dialog open={confirmOpen} onOpenChange={(o) => { setConfirmOpen(o); if (!o) setConfirmInput("") }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Booking</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">The buyer will be notified to pay. Paste the booking reference to confirm.</p>
            <div className="flex items-center justify-between bg-muted/50 rounded-lg px-3 py-2">
              <span className="text-sm font-mono font-semibold">{booking.booking_ref}</span>
              <button type="button" onClick={() => { navigator.clipboard.writeText(booking.booking_ref); toast({ description: "Copied" }) }} className="text-xs text-primary hover:underline">Copy</button>
            </div>
            <input
              value={confirmInput}
              onChange={(e) => setConfirmInput(e.target.value)}
              placeholder="Paste booking reference here"
              className="w-full text-sm border rounded-lg px-3 py-2 font-mono focus:outline-none focus:ring-1 focus:ring-ring bg-transparent"
            />
            <DialogFooter>
              <button onClick={() => { setConfirmOpen(false); setConfirmInput("") }} className="px-4 py-2 text-sm rounded-lg border hover:bg-muted transition-colors">
                Go back
              </button>
              <button
                onClick={() => {
                  confirmMutation.mutate(undefined, { onSuccess: () => { setConfirmOpen(false); setConfirmInput("") } })
                }}
                disabled={confirmMutation.isPending || confirmInput !== booking.booking_ref}
                className="px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {confirmMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm"}
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reject dialog */}
        <Dialog open={rejectOpen} onOpenChange={(o) => { setRejectOpen(o); if (!o) { setRejectInput(""); setRejectReason("") } }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Booking</DialogTitle>
            </DialogHeader>
            <div className="flex items-center justify-between bg-muted/50 rounded-lg px-3 py-2">
              <span className="text-sm font-mono font-semibold">{booking.booking_ref}</span>
              <button type="button" onClick={() => { navigator.clipboard.writeText(booking.booking_ref); toast({ description: "Copied" }) }} className="text-xs text-primary hover:underline">Copy</button>
            </div>
            <p className="text-sm text-muted-foreground">Please provide a reason and paste the booking reference to reject.</p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Insufficient stock, quantity too high..."
              rows={2}
              className="w-full text-sm border rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-1 focus:ring-ring bg-transparent"
            />
            <input
              value={rejectInput}
              onChange={(e) => setRejectInput(e.target.value)}
              placeholder="Paste booking reference here"
              className="w-full text-sm border rounded-lg px-3 py-2 font-mono focus:outline-none focus:ring-1 focus:ring-ring bg-transparent"
            />
            <DialogFooter>
              <button onClick={() => { setRejectOpen(false); setRejectInput(""); setRejectReason("") }} className="px-4 py-2 text-sm rounded-lg border hover:bg-muted transition-colors">
                Go back
              </button>
              <button
                onClick={() => rejectMutation.mutate()}
                disabled={!rejectReason.trim() || rejectInput !== booking.booking_ref || rejectMutation.isPending}
                className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {rejectMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Reject"}
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardShell>
  )
}
