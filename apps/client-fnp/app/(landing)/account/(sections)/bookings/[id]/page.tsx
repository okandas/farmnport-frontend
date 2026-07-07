"use client"

import { useState, use } from "react"
import { useSession } from "next-auth/react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Loader2, CalendarDays, Truck, Package, CheckCircle, XCircle, Clock, AlertTriangle, CreditCard, Timer } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

import { getBooking, cancelBooking, initiatePreOrderPayment, pollPreOrderPayment } from "@/lib/query"
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
  confirmed:        "Confirmed — Pay Now",
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

const STATUS_ICONS: Record<string, React.ReactNode> = {
  pending:          <Clock className="w-4 h-4" />,
  confirmed:        <CreditCard className="w-4 h-4" />,
  pending_payment:  <Timer className="w-4 h-4" />,
  paid:             <CheckCircle className="w-4 h-4" />,
  approved:         <CheckCircle className="w-4 h-4" />,
  ready:            <Package className="w-4 h-4" />,
  collected:        <CheckCircle className="w-4 h-4" />,
  completed:        <CheckCircle className="w-4 h-4" />,
  rejected:         <XCircle className="w-4 h-4" />,
  expired:          <AlertTriangle className="w-4 h-4" />,
  cancelled:        <XCircle className="w-4 h-4" />,
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
}

function formatDateTime(d: string) {
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
}

function PaymentDeadlineCountdown({ deadline }: { deadline: string }) {
  const deadlineDate = new Date(deadline)
  const now = new Date()
  const diff = deadlineDate.getTime() - now.getTime()

  if (diff <= 0) return <span className="text-red-600 font-medium">Deadline passed</span>

  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

  return (
    <span className="text-orange-700 font-medium">
      {hours}h {minutes}m remaining
    </span>
  )
}

export default function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: session, status } = useSession()
  const queryClient = useQueryClient()
  const [cancelOpen, setCancelOpen] = useState(false)
  const [cancelInput, setCancelInput] = useState("")
  const [paying, setPaying] = useState(false)
  const [checking, setChecking] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ["booking", id],
    queryFn: () => getBooking(id).then((r: any) => r.data),
    enabled: !!session,
  })

  const cancelMutation = useMutation({
    mutationFn: () => cancelBooking(id),
    onSuccess: () => {
      toast.success("Booking cancelled")
      queryClient.invalidateQueries({ queryKey: ["booking", id] })
      queryClient.invalidateQueries({ queryKey: ["my-bookings"] })
    },
    onError: () => {
      toast.error("Failed to cancel booking. Please try again.")
    },
  })


  if (status === "loading" || isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (status === "unauthenticated") {
    if (typeof window !== "undefined") window.location.href = `/login?next=/account/bookings/${id}`
    return null
  }

  const booking = (data as any)?.booking
  if (!booking) {
    return (
      <div className="py-20 text-center space-y-2">
        <p className="font-semibold">Booking not found</p>
        <Link href="/account/bookings" className="text-sm text-primary underline">Back to bookings</Link>
      </div>
    )
  }

  const canCancel = !["completed", "collected", "cancelled", "rejected", "expired", "paid"].includes(booking.status)
  const canPay = booking.status === "confirmed" && booking.type === "pre-order" && (booking.pre_order?.unit_price ?? 0) > 0

  return (
    <div>
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-4">
        <Link href="/account" className="hover:text-foreground transition-colors">Account</Link>
        <span>/</span>
        <Link href="/account/bookings" className="hover:text-foreground transition-colors">My Booking Orders</Link>
        <span>/</span>
        <span className="text-foreground font-medium">{booking.booking_ref}</span>
      </nav>

      <div className="space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold">{booking.booking_ref}</h1>
            <p className="text-sm text-muted-foreground mt-1">Submitted {formatDateTime(booking.created)}</p>
          </div>
          <span className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-medium ${STATUS_STYLES[booking.status] ?? "bg-muted text-muted-foreground"}`}>
            {STATUS_ICONS[booking.status]}
            {STATUS_LABELS[booking.status] ?? booking.status}
          </span>
        </div>

        {/* Pay Now banner for confirmed bookings */}
        {canPay && (() => {
          const subtotal = booking.pre_order.deposit_amount / 100
          const fee = Math.round(booking.pre_order.deposit_amount * 0.069) / 100
          const total = subtotal + fee
          return (
          <div className="border border-orange-200 bg-orange-50 rounded-xl p-5 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-orange-900">Your booking is confirmed — pay to secure</p>
                <p className="text-sm text-orange-700 mt-1">
                  Pay ${total.toFixed(2)} to secure your {booking.pre_order.quantity} {booking.pre_order.produce_name}
                </p>
              </div>
              {booking.pre_order?.payment_deadline && (
                <div className="text-right shrink-0">
                  <p className="text-xs text-muted-foreground">Deadline</p>
                  <PaymentDeadlineCountdown deadline={booking.pre_order.payment_deadline} />
                </div>
              )}
            </div>
            <div className="bg-white/60 rounded-lg p-3 text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-orange-700">Subtotal</span>
                <span className="font-medium">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-orange-700">Platform fee (6.9%)</span>
                <span className="font-medium">${fee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t pt-1">
                <span className="font-semibold text-orange-900">Total</span>
                <span className="font-bold text-orange-900">${total.toFixed(2)}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={paying}
                onClick={async () => {
                  setPaying(true)
                  try {
                    const res = await initiatePreOrderPayment(id, { phone: (session?.user as any)?.phone ?? "" })
                    const redirectUrl = res.data?.redirect_url
                    if (redirectUrl) window.open(redirectUrl, "_blank")
                  } catch {
                    // silent
                  } finally {
                    setPaying(false)
                  }
                }}
                className="inline-flex items-center gap-2 rounded-md bg-primary text-primary-foreground text-sm font-semibold px-4 py-1.5 hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {paying ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Pay Now
              </button>
              <button
                disabled={checking}
                onClick={async () => {
                  setChecking(true)
                  try {
                    await pollPreOrderPayment(id)
                    queryClient.invalidateQueries({ queryKey: ["booking", id] })
                  } catch {
                    // silent
                  } finally {
                    setChecking(false)
                  }
                }}
                className="inline-flex items-center gap-2 rounded-md border text-sm font-semibold px-4 py-1.5 hover:bg-muted transition-colors disabled:opacity-50"
              >
                {checking ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                I have paid
              </button>
            </div>
          </div>
          )
        })()}

        {/* Rejected reason */}
        {booking.status === "rejected" && booking.pre_order?.reject_reason && (
          <div className="border border-red-200 bg-red-50 rounded-xl p-4">
            <p className="text-sm font-medium text-red-800">Reason: {booking.pre_order.reject_reason}</p>
          </div>
        )}

        {/* Expired notice */}
        {booking.status === "expired" && (
          <div className="border border-muted bg-muted/30 rounded-xl p-4">
            <p className="text-sm text-muted-foreground">This booking expired because the payment was not received within the deadline.</p>
          </div>
        )}

        {/* Booking type card */}
        <div className="border rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold capitalize">
            {booking.type === "delivery" || booking.type === "pickup" ? <Truck className="w-4 h-4" /> : <CalendarDays className="w-4 h-4" />}
            {booking.type === "pre-order" ? "Pre-Order" : booking.type} Booking
          </div>

          {booking.type === "pre-order" && booking.pre_order && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs mb-0.5">Event</p>
                  <p className="font-medium">{booking.pre_order.event_title}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs mb-0.5">Produce</p>
                  <p className="font-medium">{booking.pre_order.produce_name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs mb-0.5">Quantity</p>
                  <p className="font-medium">{booking.pre_order.quantity} {booking.pre_order.unit || "units"}</p>
                </div>
                {booking.pre_order.unit_price > 0 && (
                <div>
                  <p className="text-muted-foreground text-xs mb-0.5">Unit Price</p>
                  <p className="font-medium">${(booking.pre_order.unit_price / 100 * 1.069).toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">incl. fees</p>
                </div>
                )}
              </div>

              {booking.pre_order.fulfillment_type && (
                <div className="border-t pt-3 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs mb-0.5">Fulfillment</p>
                    <p className="font-medium">{booking.pre_order.fulfillment_type === "delivery" ? "Delivery" : "Collection"}</p>
                  </div>
                  {booking.pre_order.collection_point_name && (
                    <div>
                      <p className="text-muted-foreground text-xs mb-0.5">Collection Point</p>
                      <p className="font-medium">{booking.pre_order.collection_point_name}</p>
                    </div>
                  )}
                  {booking.pre_order.delivery_date && (
                    <div>
                      <p className="text-muted-foreground text-xs mb-0.5">Delivery Date</p>
                      <p className="font-medium">{new Date(booking.pre_order.delivery_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</p>
                    </div>
                  )}
                </div>
              )}
              {booking.pre_order.buyer_notes && (
                <div className="border-t pt-3 text-sm">
                  <p className="text-muted-foreground text-xs mb-0.5">Your Notes</p>
                  <p>{booking.pre_order.buyer_notes}</p>
                </div>
              )}

              {booking.pre_order.unit_price > 0 && <div className="border-t pt-3 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs mb-0.5">Subtotal</p>
                  <p className="font-medium">${(booking.pre_order.deposit_amount / 100).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs mb-0.5">Platform Fee (6.9%)</p>
                  <p className="font-medium">${(Math.round(booking.pre_order.deposit_amount * 0.069) / 100).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs mb-0.5">Total Due</p>
                  <p className="font-bold text-orange-700">${(Math.round(booking.pre_order.deposit_amount * 1.069) / 100).toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">{booking.pre_order.deposit_paid ? "Paid" : "Not yet paid"}</p>
                </div>
                {booking.pre_order.balance_due > 0 && (
                  <div>
                    <p className="text-muted-foreground text-xs mb-0.5">Balance on Collection</p>
                    <p className="font-bold">${(booking.pre_order.balance_due / 100).toFixed(2)}</p>
                  </div>
                )}
              </div>}
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
              </div>
              <div>
                <p className="text-muted-foreground text-xs mb-0.5">Goods</p>
                <p className="font-medium">{booking.delivery.goods}</p>
              </div>
            </div>
          )}

          {booking.notes && (
            <div className="border-t pt-3 text-sm">
              <p className="text-muted-foreground text-xs mb-0.5">Notes</p>
              <p>{booking.notes}</p>
            </div>
          )}
        </div>

        {/* Status history */}
        {booking.status_history?.length > 0 && (
          <div className="border rounded-xl p-5">
            <h2 className="text-sm font-semibold mb-4">Status History</h2>
            <div className="space-y-3">
              {[...booking.status_history].reverse().map((h: any, i: number) => (
                <div key={i} className="flex items-start gap-3 text-sm">
                  <div className="mt-0.5 shrink-0">
                    {STATUS_ICONS[h.to] ?? <Clock className="w-4 h-4 text-muted-foreground" />}
                  </div>
                  <div>
                    <p className="font-medium">{STATUS_LABELS[h.to] ?? h.to}</p>
                    {h.note && <p className="text-xs text-muted-foreground">{h.note}</p>}
                    <p className="text-xs text-muted-foreground">{formatDateTime(h.timestamp)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        {canCancel && (
          <button
            onClick={() => setCancelOpen(true)}
            className="w-full flex items-center justify-center gap-2 border border-red-200 text-red-600 rounded-xl py-2.5 text-sm font-medium hover:bg-red-50 transition-colors"
          >
            <XCircle className="w-4 h-4" />
            Cancel Booking
          </button>
        )}

        <Link
          href="/account/bookings"
          className="block text-center text-sm text-muted-foreground hover:text-foreground"
        >
          Back to all bookings
        </Link>

        {/* Cancel dialog */}
        <Dialog open={cancelOpen} onOpenChange={(o) => { setCancelOpen(o); if (!o) setCancelInput("") }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cancel Booking</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">This action cannot be undone. Paste the booking reference to confirm cancellation.</p>
            <div className="flex items-center justify-between bg-muted/50 rounded-lg px-3 py-2">
              <span className="text-sm font-mono font-semibold">{booking.booking_ref}</span>
              <button type="button" onClick={() => { navigator.clipboard.writeText(booking.booking_ref) }} className="text-xs text-primary hover:underline">Copy</button>
            </div>
            <input
              value={cancelInput}
              onChange={(e) => setCancelInput(e.target.value)}
              placeholder="Paste booking reference here"
              className="w-full text-sm border rounded-lg px-3 py-2 font-mono focus:outline-none focus:ring-1 focus:ring-ring bg-transparent"
            />
            <DialogFooter>
              <button onClick={() => { setCancelOpen(false); setCancelInput("") }} className="px-4 py-2 text-sm rounded-lg border hover:bg-muted transition-colors">
                Go back
              </button>
              <button
                onClick={() => {
                  cancelMutation.mutate(undefined, { onSuccess: () => { setCancelOpen(false); setCancelInput("") } })
                }}
                disabled={cancelInput !== booking.booking_ref || cancelMutation.isPending}
                className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {cancelMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Cancel Booking"}
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
