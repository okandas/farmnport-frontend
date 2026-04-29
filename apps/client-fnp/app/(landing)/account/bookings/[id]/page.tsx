"use client"

import { useSession } from "next-auth/react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Loader2, CalendarDays, Truck, Package, CheckCircle, XCircle, Clock } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import { use } from "react"

import { getBooking, cancelBooking } from "@/lib/query"

const STATUS_STYLES: Record<string, string> = {
  pending:   "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  approved:  "bg-purple-100 text-purple-800",
  ready:     "bg-orange-100 text-orange-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
}

const STATUS_ICONS: Record<string, React.ReactNode> = {
  pending:   <Clock className="w-4 h-4" />,
  confirmed: <CheckCircle className="w-4 h-4" />,
  approved:  <CheckCircle className="w-4 h-4" />,
  ready:     <Package className="w-4 h-4" />,
  completed: <CheckCircle className="w-4 h-4" />,
  cancelled: <XCircle className="w-4 h-4" />,
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })
}

function formatDateTime(d: string) {
  return new Date(d).toLocaleString("en-US", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
}

export default function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: session } = useSession()
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ["booking", id],
    queryFn: () => getBooking(id).then((r) => r.data),
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const booking = (data as any)?.booking
  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-2">
          <p className="font-semibold">Booking not found</p>
          <Link href="/account/bookings" className="text-sm text-primary underline">Back to bookings</Link>
        </div>
      </div>
    )
  }

  const canCancel = !["completed", "cancelled"].includes(booking.status)

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <nav className="flex text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/account/bookings" className="hover:text-foreground">My Bookings</Link>
            <span className="mx-2">/</span>
            <span className="text-foreground">{booking.booking_ref}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold">{booking.booking_ref}</h1>
            <p className="text-sm text-muted-foreground mt-1">Booked on {formatDateTime(booking.created)}</p>
          </div>
          <span className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full font-medium ${STATUS_STYLES[booking.status] ?? "bg-muted text-muted-foreground"}`}>
            {STATUS_ICONS[booking.status]}
            {capitalize(booking.status)}
          </span>
        </div>

        {/* Booking type card */}
        <div className="border rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold capitalize">
            {booking.type === "delivery" ? <Truck className="w-4 h-4" /> : <CalendarDays className="w-4 h-4" />}
            {booking.type} Booking
          </div>

          {booking.type === "livestock" && booking.livestock && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
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
                  <p className="font-medium">${(booking.livestock.unit_price / 100).toFixed(2)}</p>
                </div>
              </div>

              <div className="border-t pt-3 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs mb-0.5">Deposit</p>
                  <p className="font-bold text-orange-700">${(booking.livestock.deposit_amount / 100).toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">{booking.livestock.deposit_paid ? "Paid" : "Not yet paid"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs mb-0.5">Balance Due</p>
                  <p className="font-bold">${(booking.livestock.balance_due / 100).toFixed(2)}</p>
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
                    <p className="font-medium">{capitalize(h.to)}</p>
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
            onClick={() => {
              if (confirm("Are you sure you want to cancel this booking?")) {
                cancelMutation.mutate()
              }
            }}
            disabled={cancelMutation.isPending}
            className="w-full flex items-center justify-center gap-2 border border-red-200 text-red-600 rounded-xl py-2.5 text-sm font-medium hover:bg-red-50 transition-colors disabled:opacity-50"
          >
            {cancelMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
            Cancel Booking
          </button>
        )}

        <Link
          href="/account/bookings"
          className="block text-center text-sm text-muted-foreground hover:text-foreground"
        >
          Back to all bookings
        </Link>
      </div>
    </div>
  )
}
