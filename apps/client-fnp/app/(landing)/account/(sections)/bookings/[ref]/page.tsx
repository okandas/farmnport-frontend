"use client"

import { useState, use } from "react"
import { useSession } from "next-auth/react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Loader2, CalendarDays, Truck, Package, CheckCircle, XCircle, Clock, AlertTriangle, CreditCard, Timer } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

import { getBooking, cancelBooking, initiatePreOrderPayment, pollPreOrderPayment, respondToBooking } from "@/lib/query"
import { centsToDollars, plural, DEFAULT_PLATFORM_FEE_RATE, feePercentLabel } from "@/lib/utilities"
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
  countered:        "bg-purple-100 text-purple-800",
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
  countered:        "Counter-Offer",
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

export default function BookingDetailPage({ params }: { params: Promise<{ ref: string }> }) {
  const { ref: id } = use(params)
  const { data: session, status } = useSession()
  const queryClient = useQueryClient()
  const [cancelOpen, setCancelOpen] = useState(false)
  const [cancelInput, setCancelInput] = useState("")
  const [cancelReason, setCancelReason] = useState("")
  const [paying, setPaying] = useState(false)
  const [checking, setChecking] = useState(false)
  const [counterOpen, setCounterOpen] = useState(false)
  const [counterPrice, setCounterPrice] = useState("")

  const { data, isLoading } = useQuery({
    queryKey: ["booking", id],
    queryFn: () => getBooking(id).then((r: any) => r.data),
    enabled: !!session,
  })

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["booking", id] })
    queryClient.invalidateQueries({ queryKey: ["my-bookings"] })
  }

  const cancelMutation = useMutation({
    mutationFn: (reason: string) => cancelBooking(id, reason),
    onSuccess: () => { toast.success("Booking cancelled"); invalidate() },
    onError: (err: any) => toast.error(err?.response?.data?.message || "Failed to cancel booking."),
  })

  const counterMutation = useMutation({
    mutationFn: (cents: number) => respondToBooking(id, { action: "counter", price_per_unit_cents: cents }),
    onSuccess: () => { toast.success("Counter-offer sent"); setCounterOpen(false); setCounterPrice(""); invalidate() },
    onError: (err: any) => toast.error(err?.response?.data?.message || "Failed to send counter-offer"),
  })

  const acceptMutation = useMutation({
    mutationFn: () => respondToBooking(id, { action: "accept" }),
    onSuccess: () => { toast.success("Offer accepted"); invalidate() },
    onError: (err: any) => toast.error(err?.response?.data?.message || "Failed to accept"),
  })

  const rejectMutation = useMutation({
    mutationFn: () => respondToBooking(id, { action: "reject", notes: "Buyer declined the counter-offer" }),
    onSuccess: () => { toast.success("Offer rejected"); invalidate() },
    onError: (err: any) => toast.error(err?.response?.data?.message || "Failed to reject"),
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
            {booking.status === "confirmed" && booking.pre_order?.market_side === "demand" ? "Confirmed" : STATUS_LABELS[booking.status] ?? booking.status}
          </span>
        </div>

        {/* Pay Now banner for confirmed bookings */}
        {canPay && (() => {
          const sellerPaysFee = booking.pre_order?.market_side === "demand"
          const subtotal = booking.pre_order.deposit_amount / 100
          const rate = DEFAULT_PLATFORM_FEE_RATE
          const fee = sellerPaysFee ? 0 : Math.round(booking.pre_order.deposit_amount * rate) / 100
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
              {!sellerPaysFee && (
              <div className="flex justify-between">
                <span className="text-orange-700">Platform fee ({feePercentLabel(rate)})</span>
                <span className="font-medium">${fee.toFixed(2)}</span>
              </div>
              )}
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

        {/* Counter-offer response — buyer's turn */}
        {booking.status === "countered" && booking.countered_by === "seller" && booking.pre_order && (
          <div className="border border-purple-200 bg-purple-50 rounded-xl p-5 space-y-3">
            <p className="font-semibold text-purple-900">The seller made a counter-offer</p>
            <p className="text-sm text-purple-700">
              New price: <span className="font-bold">${(booking.pre_order.offer_price / 100).toFixed(2)}</span> per {booking.pre_order.unit || "unit"}
              {" "}({booking.pre_order.quantity} {booking.pre_order.unit || "units"} = ${((booking.pre_order.offer_price / 100) * booking.pre_order.quantity).toFixed(2)})
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => acceptMutation.mutate()}
                disabled={acceptMutation.isPending}
                className="inline-flex items-center gap-2 rounded-md bg-primary text-primary-foreground text-sm font-semibold px-4 py-1.5 hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {acceptMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Accept Offer
              </button>
              <button
                onClick={() => setCounterOpen(true)}
                className="inline-flex items-center gap-2 rounded-md border border-purple-200 text-purple-700 text-sm font-semibold px-4 py-1.5 hover:bg-purple-50 transition-colors"
              >
                Counter-Offer
              </button>
              <button
                onClick={() => rejectMutation.mutate()}
                disabled={rejectMutation.isPending}
                className="inline-flex items-center gap-2 rounded-md border border-red-200 text-red-600 text-sm font-semibold px-4 py-1.5 hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                {rejectMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Decline
              </button>
            </div>
          </div>
        )}

        {/* Waiting for seller response */}
        {booking.status === "countered" && booking.countered_by === "buyer" && (
          <div className="border border-purple-200 bg-purple-50 rounded-xl p-4">
            <p className="text-sm text-purple-700">Waiting for the seller to respond to your counter-offer.</p>
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
                  {booking.pre_order.market_side === "demand" ? (
                    <p className="font-medium">{centsToDollars(booking.pre_order.unit_price)}</p>
                  ) : (
                    <>
                      <p className="font-medium">${(booking.pre_order.unit_price / 100 * (1 + DEFAULT_PLATFORM_FEE_RATE)).toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">incl. fees</p>
                    </>
                  )}
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
                      {booking.pre_order.collection_point_address && <p className="text-xs text-muted-foreground">{booking.pre_order.collection_point_address}</p>}
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
              {booking.pre_order.offer_price > 0 && (
                <div className="border-t pt-3 text-sm">
                  <p className="text-muted-foreground text-xs mb-0.5">Your Offered Price</p>
                  <p className="font-medium">{centsToDollars(booking.pre_order.offer_price)} per {plural(booking.pre_order.unit || "unit", 1)}</p>
                </div>
              )}
              {booking.pre_order.buyer_notes && (
                <div className="border-t pt-3 text-sm">
                  <p className="text-muted-foreground text-xs mb-0.5">Your Notes</p>
                  <p>{booking.pre_order.buyer_notes}</p>
                </div>
              )}

              {booking.pre_order.unit_price > 0 && (() => {
                const isDemand = booking.pre_order.market_side === "demand"
                const depositCents = booking.pre_order.deposit_amount
                const feeCents = isDemand ? 0 : Math.round(depositCents * DEFAULT_PLATFORM_FEE_RATE)
                const totalCents = depositCents + feeCents
                return <div className="border-t pt-3 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs mb-0.5">Subtotal</p>
                  <p className="font-medium">{centsToDollars(depositCents)}</p>
                </div>
                {!isDemand && (
                <div>
                  <p className="text-muted-foreground text-xs mb-0.5">Platform Fee ({feePercentLabel()})</p>
                  <p className="font-medium">{centsToDollars(feeCents)}</p>
                </div>
                )}
                <div>
                  <p className="text-muted-foreground text-xs mb-0.5">Total Due</p>
                  <p className="font-bold text-orange-700">{centsToDollars(totalCents)}</p>
                  <p className="text-xs text-muted-foreground">
                    {booking.pre_order.deposit_paid
                      ? booking.payment_method === "cash" ? "Paid (Cash)" : "Paid (Online)"
                      : "Not yet paid"}
                  </p>
                </div>
                {booking.pre_order.balance_due > 0 && (
                  <div>
                    <p className="text-muted-foreground text-xs mb-0.5">Balance on Collection</p>
                    <p className="font-bold">${(booking.pre_order.balance_due / 100).toFixed(2)}</p>
                  </div>
                )}
              </div>
              })()}
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

        {/* Negotiation history */}
        {booking.counter_offers?.length > 0 && (
          <div className="border border-purple-200 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-purple-700 mb-4">Negotiation</h2>
            <div className="space-y-3">
              {[...booking.counter_offers].reverse().map((co: any, i: number) => (
                <div key={i} className="flex gap-3 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 shrink-0" />
                  <div>
                    <p className="font-medium">${(co.price_per_unit_cents / 100).toFixed(2)} per {booking.pre_order?.unit || "unit"}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {co.by_name} ({co.by_role}) · {formatDateTime(co.created_at)}
                    </p>
                    {co.notes && <p className="text-xs text-muted-foreground mt-0.5">{co.notes}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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
        <Dialog open={cancelOpen} onOpenChange={(o) => { setCancelOpen(o); if (!o) { setCancelInput(""); setCancelReason("") } }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cancel Booking</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">This action cannot be undone. The seller will be notified with your reason.</p>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Provide a reason (minimum 10 characters)..."
              rows={3}
              className="w-full text-sm border rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-1 focus:ring-ring bg-transparent"
            />
            <p className="text-xs text-muted-foreground">{cancelReason.trim().length}/10 characters minimum</p>
            <p className="text-xs text-muted-foreground mt-2">Paste the booking reference to confirm.</p>
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
              <button onClick={() => { setCancelOpen(false); setCancelInput(""); setCancelReason("") }} className="px-4 py-2 text-sm rounded-lg border hover:bg-muted transition-colors">
                Go back
              </button>
              <button
                onClick={() => {
                  cancelMutation.mutate(cancelReason, { onSuccess: () => { setCancelOpen(false); setCancelInput(""); setCancelReason("") } })
                }}
                disabled={cancelInput !== booking.booking_ref || cancelReason.trim().length < 10 || cancelMutation.isPending}
                className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {cancelMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Cancel Booking"}
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Counter-offer dialog */}
        <Dialog open={counterOpen} onOpenChange={(o) => { setCounterOpen(o); if (!o) setCounterPrice("") }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Make a Counter-Offer</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">
              Propose a different price per {booking.pre_order?.unit || "unit"}. The seller can accept, reject, or counter back.
            </p>
            {booking.pre_order?.offer_price > 0 && (
              <div className="bg-muted/50 rounded-lg px-3 py-2 text-sm">
                Current offered price: <span className="font-semibold">${(booking.pre_order.offer_price / 100).toFixed(2)}</span> per {booking.pre_order.unit || "unit"}
              </div>
            )}
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={counterPrice}
                onChange={(e) => setCounterPrice(e.target.value)}
                placeholder="0.00"
                className="w-full text-sm border rounded-lg pl-7 pr-3 py-2 focus:outline-none focus:ring-1 focus:ring-ring bg-transparent"
              />
            </div>
            {counterPrice && (
              <p className="text-xs text-muted-foreground">
                Total: ${(parseFloat(counterPrice) * (booking.pre_order?.quantity || 0)).toFixed(2)} for {booking.pre_order?.quantity} {booking.pre_order?.unit || "units"}
              </p>
            )}
            <DialogFooter>
              <button onClick={() => { setCounterOpen(false); setCounterPrice("") }} className="px-4 py-2 text-sm rounded-lg border hover:bg-muted transition-colors">
                Go back
              </button>
              <button
                onClick={() => {
                  const cents = Math.round(parseFloat(counterPrice) * 100)
                  if (cents > 0) counterMutation.mutate(cents)
                }}
                disabled={!counterPrice || parseFloat(counterPrice) <= 0 || counterMutation.isPending}
                className="px-4 py-2 text-sm rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                {counterMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send Counter-Offer"}
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
