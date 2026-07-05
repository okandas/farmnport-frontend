"use client"

import { use } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Loader2, ArrowLeft, Package, Users, CalendarDays, CheckCircle2 } from "lucide-react"
import Link from "next/link"

import { queryAdminPreOrders, queryPreOrderBookings, approvePreOrderStock } from "@/lib/query"
import { centsToDollars } from "@/lib/utilities"
import { toast } from "@/components/ui/use-toast"
import { FormSkeleton } from "@/components/state/skeleton-table"
import { DashboardShell } from "@/components/state/dashboardShell"

const STATUS_STYLES: Record<string, string> = {
  pending:          "bg-yellow-100 text-yellow-800",
  confirmed:        "bg-blue-100 text-blue-800",
  pending_payment:  "bg-orange-100 text-orange-800",
  paid:             "bg-green-100 text-green-800",
  ready:            "bg-emerald-100 text-emerald-800",
  collected:        "bg-green-100 text-green-800",
  rejected:         "bg-red-100 text-red-800",
  expired:          "bg-muted text-muted-foreground",
  cancelled:        "bg-red-100 text-red-800",
}

const STATUS_LABELS: Record<string, string> = {
  pending:          "Pending",
  confirmed:        "Confirmed",
  pending_payment:  "Payment Processing",
  paid:             "Paid",
  ready:            "Ready",
  collected:        "Collected",
  rejected:         "Rejected",
  expired:          "Expired",
  cancelled:        "Cancelled",
}

const EVENT_STATUS_STYLES: Record<string, string> = {
  draft:                  "bg-muted text-muted-foreground",
  open:                   "bg-green-100 text-green-800",
  closed:                 "bg-yellow-100 text-yellow-800",
  pending_stock_approval: "bg-purple-100 text-purple-800",
  fulfilled:              "bg-blue-100 text-blue-800",
  cancelled:              "bg-red-100 text-red-800",
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
}

function formatDateTime(d: string) {
  return new Date(d).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, " ")
}

export default function PreOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const queryClient = useQueryClient()

  const { data: eventsData, isLoading: eventsLoading } = useQuery({
    queryKey: ["admin-preorders"],
    queryFn: () => queryAdminPreOrders(),
    refetchOnWindowFocus: false,
  })

  const { data: bookingsData, isLoading: bookingsLoading } = useQuery({
    queryKey: ["preorder-bookings", id],
    queryFn: () => queryPreOrderBookings(id),
    refetchOnWindowFocus: false,
  })

  const approveMutation = useMutation({
    mutationFn: () => approvePreOrderStock(id),
    onSuccess: (res: any) => {
      toast({ description: `${res.data?.stock_added ?? 0} units added to product stock` })
      queryClient.invalidateQueries({ queryKey: ["admin-preorders"] })
      queryClient.invalidateQueries({ queryKey: ["preorder-bookings", id] })
    },
    onError: (err: any) => toast({ description: err?.response?.data?.message || "Failed to approve stock", variant: "destructive" }),
  })

  if (eventsLoading || bookingsLoading) {
    return <DashboardShell><FormSkeleton /></DashboardShell>
  }

  const events: any[] = eventsData?.data?.preorders ?? []
  const event = events.find((e: any) => e.id === id)
  const bookings: any[] = bookingsData?.data?.bookings ?? []

  if (!event) {
    return <DashboardShell><p className="text-muted-foreground">Pre-order not found.</p></DashboardShell>
  }

  const remaining = event.total_available - event.total_booked
  const canApproveStock = event.status === "closed" || event.status === "pending_stock_approval"

  const totalRequested = bookings.filter((b: any) => b.status === "pending").reduce((sum: number, b: any) => sum + (b.pre_order?.quantity ?? 0), 0)
  const totalConfirmed = bookings.filter((b: any) => ["confirmed", "pending_payment"].includes(b.status)).reduce((sum: number, b: any) => sum + (b.pre_order?.quantity ?? 0), 0)
  const totalPaid = bookings.filter((b: any) => ["paid", "ready", "collected"].includes(b.status)).reduce((sum: number, b: any) => sum + (b.pre_order?.quantity ?? 0), 0)
  const totalDepositCollected = bookings.filter((b: any) => b.pre_order?.deposit_paid).reduce((sum: number, b: any) => sum + (b.pre_order?.deposit_amount ?? 0), 0)

  return (
    <DashboardShell>
      <div className="mb-8">
        <Link
          href="/dashboard/farmnport/orders/booking-preorders"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> All Pre-Orders
        </Link>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-lg font-bold">{event.title}</h1>
            <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${EVENT_STATUS_STYLES[event.status] ?? "bg-muted text-muted-foreground"}`}>
              {capitalize(event.status)}
            </span>
          </div>
          <Link
            href={`/dashboard/farmnport/orders/booking-preorders/${id}/edit`}
            className="text-sm text-primary hover:underline"
          >
            Edit
          </Link>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="border rounded-xl p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Available</p>
          <p className="text-2xl font-bold">{remaining.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">of {event.total_available.toLocaleString()} {event.unit}</p>
        </div>
        <div className="border rounded-xl p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Requested</p>
          <p className="text-2xl font-bold">{totalRequested.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">pending approval</p>
        </div>
        <div className="border rounded-xl p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Paid</p>
          <p className="text-2xl font-bold">{totalPaid.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">{event.unit} secured</p>
        </div>
        <div className="border rounded-xl p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Deposits Collected</p>
          <p className="text-2xl font-bold">{centsToDollars(totalDepositCollected)}</p>
          <p className="text-xs text-muted-foreground">total received</p>
        </div>
      </div>

      {/* Stock approval banner */}
      {canApproveStock && remaining > 0 && (
        <div className="border border-purple-200 bg-purple-50 rounded-xl p-5 mb-8 flex items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-purple-900">{remaining.toLocaleString()} {event.unit} remaining — approve to add to product stock</p>
            <p className="text-sm text-purple-700 mt-1">This will update the product listing and mark the event as fulfilled.</p>
          </div>
          <button
            onClick={() => {
              if (confirm(`Add ${remaining} ${event.unit} back to ${event.produce_name} stock?`)) {
                approveMutation.mutate()
              }
            }}
            disabled={approveMutation.isPending}
            className="shrink-0 inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            {approveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            Approve Stock
          </button>
        </div>
      )}

      {event.status === "fulfilled" && (
        <div className="border border-blue-200 bg-blue-50 rounded-xl p-4 mb-8">
          <p className="text-sm text-blue-800 font-medium">This pre-order has been fulfilled. Remaining stock was added to the product listing.</p>
        </div>
      )}

      {/* Bookings table */}
      <div className="border rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b bg-muted/30">
          <p className="text-sm font-semibold">Bookings ({bookings.length})</p>
        </div>
        {bookings.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No bookings yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-muted-foreground uppercase tracking-wide">
                  <th className="text-left px-5 py-3 font-medium">Ref</th>
                  <th className="text-left px-5 py-3 font-medium">Customer</th>
                  <th className="text-left px-5 py-3 font-medium">Quantity</th>
                  <th className="text-left px-5 py-3 font-medium">Amount Due</th>
                  <th className="text-left px-5 py-3 font-medium">Paid</th>
                  <th className="text-left px-5 py-3 font-medium">Status</th>
                  <th className="text-left px-5 py-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b: any) => (
                  <tr key={b.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-5 py-3">
                      <Link href={`/dashboard/farmnport/orders/bookings/${b.id}`} className="font-mono font-semibold text-primary hover:underline">
                        {b.booking_ref}
                      </Link>
                    </td>
                    <td className="px-5 py-3">
                      <p className="font-medium">{b.client_name}</p>
                      <p className="text-xs text-muted-foreground">{b.client_phone}</p>
                    </td>
                    <td className="px-5 py-3">{b.pre_order?.quantity?.toLocaleString()} {event.unit}</td>
                    <td className="px-5 py-3 font-medium">{centsToDollars(b.pre_order?.deposit_amount ?? 0)}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-medium ${b.pre_order?.deposit_paid ? "text-green-700" : "text-red-600"}`}>
                        {b.pre_order?.deposit_paid ? "Yes" : "No"}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[b.status] ?? "bg-muted text-muted-foreground"}`}>
                        {STATUS_LABELS[b.status] ?? b.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground text-xs">{formatDateTime(b.created)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardShell>
  )
}
