"use client"

import { useState, use } from "react"
import { useSession } from "next-auth/react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Loader2, CalendarCheck, Users, Package, ChevronDown, ChevronUp } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

import { getPreOrder, clientPreOrderBookings, clientResetPreOrderCapacity, clientUpdatePreOrderCapacity } from "@/lib/query"
import { centsToDollars } from "@/lib/utilities"

const STATUS_STYLES: Record<string, string> = {
  draft:                  "bg-muted text-muted-foreground",
  open:                   "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  closed:                 "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  pending_stock_approval: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  fulfilled:              "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  cancelled:              "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
}

const STATUS_LABELS: Record<string, string> = {
  draft:                  "Draft",
  open:                   "Open",
  closed:                 "Closed",
  pending_stock_approval: "Stock Approval",
  fulfilled:              "Fulfilled",
  cancelled:              "Cancelled",
}

const BOOKING_STATUS_STYLES: Record<string, string> = {
  pending:         "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  confirmed:       "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  pending_payment: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  paid:            "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  ready:           "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  collected:       "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  rejected:        "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  expired:         "bg-muted text-muted-foreground",
  cancelled:       "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
}

const BOOKING_STATUS_LABELS: Record<string, string> = {
  pending:         "Pending",
  confirmed:       "Confirmed",
  pending_payment: "Payment Processing",
  paid:            "Paid",
  ready:           "Ready",
  collected:       "Collected",
  rejected:        "Rejected",
  expired:         "Expired",
  cancelled:       "Cancelled",
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
}

function formatDateTime(d: string) {
  return new Date(d).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
}

function Field({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium mt-0.5">{value ?? "—"}</p>
    </div>
  )
}

export default function BookingPreOrderDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const { data: session } = useSession()
  const qc = useQueryClient()
  const [showBookings, setShowBookings] = useState(true)
  const [capacityOpen, setCapacityOpen] = useState(false)
  const [newCapacity, setNewCapacity] = useState("")

  const { data, isLoading } = useQuery({
    queryKey: ["booking-preorder", slug],
    queryFn: () => getPreOrder(slug).then((r) => r.data),
    enabled: !!session,
  })

  const event = (data as any)?.preorder
  const eventId = event?.id

  const { data: bookingsData, isLoading: bookingsLoading } = useQuery({
    queryKey: ["booking-preorder-bookings", eventId],
    queryFn: () => clientPreOrderBookings(eventId).then((r) => r.data),
    enabled: !!session && !!eventId,
  })

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["booking-preorder", slug] })
    qc.invalidateQueries({ queryKey: ["booking-preorder-bookings", eventId] })
    qc.invalidateQueries({ queryKey: ["my-booking-events"] })
  }

  const resetMutation = useMutation({
    mutationFn: () => clientResetPreOrderCapacity(eventId),
    onSuccess: () => { toast.success("Capacity reset — booked count recalculated"); invalidate() },
    onError: (err: any) => toast.error(err?.response?.data?.message || "Failed to reset"),
  })

  const updateCapacityMutation = useMutation({
    mutationFn: (total: number) => clientUpdatePreOrderCapacity(eventId, total),
    onSuccess: () => { toast.success("Capacity updated"); setCapacityOpen(false); setNewCapacity(""); invalidate() },
    onError: (err: any) => toast.error(err?.response?.data?.message || "Failed to update"),
  })

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!event) {
    return <p className="text-muted-foreground text-sm">Booking event not found.</p>
  }

  const booked = event.total_booked ?? 0
  const available = event.total_available ?? 0
  const percentage = available > 0 ? Math.round((booked / available) * 100) : 0
  const bookings: any[] = (bookingsData as any)?.bookings ?? []
  const totalBookings = (bookingsData as any)?.total ?? 0
  const statusLabel = STATUS_LABELS[event.status] ?? event.status ?? "Draft"

  return (
    <div>
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-4">
        <Link href="/account" className="hover:text-foreground transition-colors">Account</Link>
        <span>/</span>
        <Link href="/account/booking-preorders" className="hover:text-foreground transition-colors">My Bookings</Link>
        <span>/</span>
        <span className="text-foreground font-medium">{event.short_id}</span>
      </nav>

      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-lg font-bold">{event.name || event.produce_name}</h1>
          <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${STATUS_STYLES[event.status] ?? "bg-muted text-muted-foreground"}`}>
            {statusLabel}
          </span>
          <span className="text-xs font-mono text-muted-foreground">{event.short_id}</span>
        </div>
        <p className="text-xs text-muted-foreground">{formatDateTime(event.created)}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left: event details */}
        <div className="lg:col-span-2 space-y-5">

          {/* Capacity */}
          <div className="border rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Capacity</p>
              <p className="text-sm font-semibold">{booked}/{available} {event.unit} ({percentage}%)</p>
            </div>
            <div className="w-full bg-muted rounded-full h-2.5">
              <div className="bg-primary h-2.5 rounded-full transition-all" style={{ width: `${Math.min(percentage, 100)}%` }} />
            </div>
          </div>

          {/* Details */}
          <div className="border rounded-xl p-5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-4">Details</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <Field label="Produce" value={event.produce_name} />
              {event.breed_name && <Field label="Breed / Variety" value={event.breed_name} />}
              <Field label="Unit Price" value={centsToDollars(event.unit_price)} />
              {event.deposit_per_unit > 0 && <Field label="Deposit per Unit" value={centsToDollars(event.deposit_per_unit)} />}
              <Field label="Min Quantity" value={event.min_quantity || "No minimum"} />
              <Field label="Max Quantity" value={event.max_quantity || "No maximum"} />
              {event.quantity_step > 1 && <Field label="Step" value={`Multiples of ${event.quantity_step}`} />}
              <Field label="Opens" value={formatDate(event.open_date)} />
              <Field label="Closes" value={formatDate(event.close_date)} />
              <Field label="Market Side" value={event.market_side === "demand" ? "Buyer Request" : "Supply Offer"} />
            </div>
            {event.description && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-xs text-muted-foreground">Description</p>
                <p className="text-sm mt-0.5">{event.description}</p>
              </div>
            )}
          </div>

          {/* Delivery / Collection locations */}
          {(event.delivery_locations?.length > 0 || event.collection_locations?.length > 0) && (
            <div className="border rounded-xl p-5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-4">Locations</p>
              {event.collection_locations?.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs text-muted-foreground mb-1">Collection Points</p>
                  {event.collection_locations.map((loc: any) => (
                    <p key={loc.id} className="text-sm">{loc.name}{loc.address ? ` — ${loc.address}` : ""}</p>
                  ))}
                </div>
              )}
              {event.delivery_locations?.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Delivery Points</p>
                  {event.delivery_locations.map((loc: any) => (
                    <p key={loc.id} className="text-sm">{loc.name}{loc.address ? ` — ${loc.address}` : ""}</p>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Bookings list */}
          <div className="border rounded-xl p-5">
            <button
              onClick={() => setShowBookings(!showBookings)}
              className="w-full flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Bookings ({totalBookings})</p>
              </div>
              {showBookings ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </button>

            {showBookings && (
              <div className="mt-4">
                {bookingsLoading ? (
                  <div className="flex justify-center py-6">
                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                  </div>
                ) : bookings.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">No bookings yet.</p>
                ) : (
                  <div className="space-y-3">
                    {bookings.map((b: any) => (
                      <Link
                        key={b.id}
                        href={`/account/incoming-bookings/${b.id}`}
                        className="block border rounded-lg p-3 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-sm font-medium">{b.booking_ref}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {b.buyer_name || "Anonymous"} — {b.pre_order?.quantity?.toLocaleString()} {b.pre_order?.unit || event.unit}
                            </p>
                          </div>
                          <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${BOOKING_STATUS_STYLES[b.status] ?? "bg-muted text-muted-foreground"}`}>
                            {BOOKING_STATUS_LABELS[b.status] ?? b.status}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{formatDateTime(b.created)}</p>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right: actions */}
        <div className="space-y-5">

          {/* Quick stats */}
          <div className="border rounded-xl p-5 space-y-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Summary</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <p className="text-lg font-bold">{totalBookings}</p>
                <p className="text-xs text-muted-foreground">Bookings</p>
              </div>
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <p className="text-lg font-bold">{booked}</p>
                <p className="text-xs text-muted-foreground">{event.unit} Booked</p>
              </div>
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <p className="text-lg font-bold">{available - booked}</p>
                <p className="text-xs text-muted-foreground">{event.unit} Left</p>
              </div>
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <p className="text-lg font-bold">{centsToDollars(booked * event.unit_price)}</p>
                <p className="text-xs text-muted-foreground">Revenue</p>
              </div>
            </div>
          </div>

          {/* Management actions */}
          {!["cancelled", "fulfilled"].includes(event.status) && (
            <div className="border rounded-xl p-5 space-y-3">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Manage</p>

              <button
                onClick={() => resetMutation.mutate()}
                disabled={resetMutation.isPending}
                className="w-full py-2 rounded-lg text-sm font-medium border hover:bg-muted transition-colors disabled:opacity-50"
              >
                {resetMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Recalculate Booked Count"}
              </button>

              {!capacityOpen ? (
                <button
                  onClick={() => { setCapacityOpen(true); setNewCapacity(String(available)) }}
                  className="w-full py-2 rounded-lg text-sm font-medium border hover:bg-muted transition-colors"
                >
                  Update Capacity
                </button>
              ) : (
                <div className="space-y-2">
                  <input
                    type="number"
                    value={newCapacity}
                    onChange={(e) => setNewCapacity(e.target.value)}
                    min={booked}
                    className="w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-ring bg-transparent"
                    placeholder="New total available"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setCapacityOpen(false); setNewCapacity("") }}
                      className="flex-1 py-2 text-sm rounded-lg border hover:bg-muted transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => updateCapacityMutation.mutate(Number(newCapacity))}
                      disabled={!newCapacity || Number(newCapacity) < booked || updateCapacityMutation.isPending}
                      className="flex-1 py-2 text-sm rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                      {updateCapacityMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Save"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Status history */}
          {event.status_history?.length > 0 && (
            <div className="border rounded-xl p-5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-4">History</p>
              <div className="space-y-4">
                {[...event.status_history].reverse().map((h: any, i: number) => (
                  <div key={i} className="flex gap-3 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 mt-1.5 shrink-0" />
                    <div>
                      <p className="font-medium text-sm capitalize">{h.to}</p>
                      {h.note && <p className="text-xs text-muted-foreground mt-0.5">{h.note}</p>}
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formatDateTime(h.timestamp)}
                        {h.changed_by ? ` · ${h.changed_by}` : ""}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
