"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter, useParams } from "next/navigation"
import { Loader2, CalendarDays, Package, Users, Clock } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { toast } from "sonner"

import { createBooking, queryClient as queryClientProfile } from "@/lib/query"
import { ShareBar } from "@/components/shared/ShareBar"
import { Calendar } from "@/components/ui/calendar"

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
}

export default function PreOrderDetailPage({ preorder, depositEnabled = false }: { preorder: any; depositEnabled?: boolean }) {
  const params = useParams()
  const slug = params.slug as string
  const { data: session } = useSession()
  const user = session?.user as any
  const router = useRouter()
  const queryClient = useQueryClient()

  const [quantity, setQuantity] = useState(String(preorder.min_quantity || 1))
  const [notes, setNotes] = useState("")
  const [fulfillment, setFulfillment] = useState<"collection" | "delivery" | "">("")
  const [selectedCollectionPoint, setSelectedCollectionPoint] = useState<{ id: string; name: string } | null>(null)
  const [selectedDeliveryDate, setSelectedDeliveryDate] = useState<Date | undefined>()

  const { data: profileData } = useQuery({
    queryKey: ["my-profile", user?.username],
    queryFn: () => queryClientProfile(user.username.replace(/ /g, "-")).then((r) => r.data),
    enabled: !!user?.username,
  })

  const phone: string = profileData?.phone ?? ""

  const event = preorder

  const mutation = useMutation({
    mutationFn: () =>
      createBooking({
        type: "pre-order",
        event_id: event?.id,
        quantity: parseInt(quantity),
        phone,
        notes: notes || undefined,
        fulfillment_type: fulfillment || undefined,
        collection_point_id: selectedCollectionPoint?.id || undefined,
        collection_point_name: selectedCollectionPoint?.name || undefined,
        delivery_date: selectedDeliveryDate ? selectedDeliveryDate.toISOString() : undefined,
      }),
    onSuccess: () => {
      toast.success("Booking request submitted! We'll confirm availability and notify you.")
      queryClient.invalidateQueries({ queryKey: ["my-bookings"] })
      router.push("/account/bookings")
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to submit booking request. Please try again.")
    },
  })

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center">
        <div>
          <p className="font-semibold text-lg mb-2">Pre-order not found</p>
          <Link href="/bookings" className="text-sm text-primary underline">Back to pre-orders</Link>
        </div>
      </div>
    )
  }

  const qty = parseInt(quantity) || 0
  const depositTotal = qty * (event.deposit_per_unit / 100)
  const orderTotal = qty * (event.unit_price / 100)
  const balanceDue = orderTotal - depositTotal
  const available = event.total_available - (event.total_booked ?? 0)
  const minQty = event.min_quantity || 1
  const step = event.quantity_step || 1
  const isOpenEnded = !event.close_date || event.close_date === "0001-01-01T00:00:00Z"
  const hasDeliveryDates = event.delivery_dates && event.delivery_dates.length > 0
  const needsDeliveryDate = isOpenEnded && hasDeliveryDates

  const canSubmit =
    !!session &&
    qty >= minQty &&
    qty <= available &&
    (step <= 1 || qty % step === 0) &&
    (event.max_quantity === 0 || qty <= event.max_quantity) &&
    !!phone &&
    (fulfillment === "collection" ? !!selectedCollectionPoint : true) &&
    (fulfillment === "delivery" ? !!selectedDeliveryDate : true)

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb bar */}
      <div className="border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/buy" className="hover:text-foreground">Buy</Link>
            <span className="mx-2">/</span>
            <Link href="/bookings" className="hover:text-foreground">Pre-Order Bookings</Link>
            <span className="mx-2">/</span>
            <span className="text-foreground line-clamp-1">{event.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-[400px_1fr_320px] gap-8 items-start">

          {/* ── Column 1: Image ── */}
          <div>
            {event.image_src ? (
              <div className="relative aspect-square w-full rounded-2xl overflow-hidden border bg-muted">
                <Image src={event.image_src} alt={event.name} fill className="object-cover" />
                {event.is_test && <span className="absolute top-3 right-3 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded">TEST</span>}
              </div>
            ) : (
              <div className="relative aspect-square w-full rounded-2xl border bg-muted/40">
                {event.is_test && <span className="absolute top-3 right-3 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded">TEST</span>}
              </div>
            )}

            <div className="mt-4 space-y-3">
              <div className="flex gap-3 flex-wrap">
                {isOpenEnded ? (
                  available > 0 ? (
                    <span className="text-xs px-3 py-1 rounded-full bg-green-100 text-green-800 font-medium">Always Available</span>
                  ) : (
                    <span className="text-xs px-3 py-1 rounded-full bg-orange-100 text-orange-800 font-medium">Pre-order for Next Batch</span>
                  )
                ) : (
                  <span className="text-xs px-3 py-1 rounded-full bg-green-100 text-green-800 font-medium">Open for bookings</span>
                )}
                {available <= 20 && available > 0 && (
                  <span className="text-xs px-3 py-1 rounded-full bg-red-100 text-red-800 font-medium">Only {available} left!</span>
                )}
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{event.total_booked?.toLocaleString() ?? 0} of {event.total_available.toLocaleString()} {event.unit} booked</span>
                  <span className="font-medium">{available.toLocaleString()} remaining</span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      available <= 20 ? "bg-red-500" : available <= event.total_available * 0.3 ? "bg-orange-500" : "bg-primary"
                    }`}
                    style={{ width: `${Math.min(100, ((event.total_booked ?? 0) / event.total_available) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ── Column 2: Details ── */}
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold leading-tight">{event.name}</h1>
              {event.subtitle && <p className="text-sm text-muted-foreground mt-1">{event.subtitle}</p>}
              <div className="mt-3"><ShareBar name={event.name} /></div>
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground flex-wrap">
                <span className="flex items-center gap-1.5">
                  <Users className="w-4 h-4" />
                  {event.client_name}
                </span>
                {event.produce_name && (
                  <span className="flex items-center gap-1.5">
                    <Package className="w-4 h-4" />
                    {event.produce_name}
                  </span>
                )}
              </div>
            </div>

            {event.description && (
              <p className="text-sm text-muted-foreground leading-relaxed">{event.description}</p>
            )}

            {/* Pricing & capacity */}
            <div className={`grid gap-3 ${depositEnabled && event.deposit_per_unit > 0 ? "grid-cols-2" : "grid-cols-1"}`}>
              <div className="rounded-xl border bg-muted/30 p-4">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Unit Price</p>
                <p className="text-2xl font-bold">${(event.unit_price / 100 * 1.069).toFixed(2)}</p>
                <p className="text-xs text-muted-foreground mt-1">per {event.unit || "unit"} incl. fees</p>
              </div>
              {depositEnabled && event.deposit_per_unit > 0 && (
                <div className="rounded-xl border border-orange-200 bg-orange-50 p-4">
                  <p className="text-xs font-medium text-orange-700 uppercase tracking-wide mb-2">Deposit per Unit</p>
                  <p className="text-2xl font-bold text-orange-700">${(event.deposit_per_unit / 100).toFixed(2)}</p>
                  <p className="text-xs text-orange-600 mt-1">to secure your booking</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl border bg-muted/30 p-4">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Available</p>
                <p className="text-lg font-bold">{available.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">of {event.total_available.toLocaleString()} {event.unit} total</p>
              </div>
              <div className="rounded-xl border bg-muted/30 p-4">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Min Order</p>
                <p className="text-lg font-bold">{minQty.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {event.max_quantity > 0 ? `max ${event.max_quantity.toLocaleString()} ${event.unit}` : `${event.unit} minimum`}
                </p>
              </div>
              <div className="rounded-xl border bg-muted/30 p-4">
                {isOpenEnded ? (
                  <>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Availability
                    </p>
                    <p className="text-lg font-bold">Always Open</p>
                    <p className="text-xs text-muted-foreground mt-1">recurring supply</p>
                  </>
                ) : (
                  <>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Closes
                    </p>
                    <p className="text-lg font-bold">{formatDate(event.close_date)}</p>
                    <p className="text-xs text-muted-foreground mt-1">booking deadline</p>
                  </>
                )}
              </div>
            </div>

            {/* Collection points */}
            {(() => {
              const locs = [...(event.delivery_locations || []), ...(event.collection_locations || [])]
              if (locs.length === 0) return null
              return (
                <div className="rounded-xl border bg-muted/30 p-4 space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Collection Points</p>
                  {locs.map((loc: any, i: number) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                      <span>{loc.name}</span>
                    </div>
                  ))}
                </div>
              )
            })()}

            {/* How it works */}
            <div className="bg-muted/40 rounded-xl p-5 space-y-3">
              <h3 className="font-semibold text-sm">How Pre-Orders Work</h3>
              <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
                <li>Submit your booking request with your desired quantity</li>
                <li>We confirm availability and notify you</li>
                <li>Pay to secure your allocation{event.payment_deadline_hours ? ` (within ${event.payment_deadline_hours} hours)` : ""}</li>
                <li>Collect your order when ready — balance due on collection</li>
              </ol>
            </div>
          </div>

          {/* ── Column 3: Booking widget ── */}
          <div className="lg:sticky lg:top-6 space-y-4">
            {!session ? (
              <div className="border rounded-xl p-6 text-center space-y-4">
                <CalendarDays className="w-10 h-10 mx-auto text-muted-foreground/40" />
                <div>
                  <p className="font-semibold">Sign in to place a booking</p>
                  <p className="text-xs text-muted-foreground mt-1">Create a free account to reserve your batch</p>
                </div>
                <Link
                  href={`/login?next=/bookings/${slug}`}
                  className="block w-full text-center bg-primary text-primary-foreground text-sm font-semibold px-6 py-2.5 rounded-xl hover:bg-primary/90 transition-colors"
                >
                  Sign In to Book
                </Link>
                <Link href="/register" className="block text-xs text-primary hover:underline">
                  Don&apos;t have an account? Register free
                </Link>
              </div>
            ) : (
              <div className="border rounded-xl p-5 space-y-4">
                <h2 className="font-semibold">Place Your Booking</h2>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    Quantity *{step > 1 ? ` (multiples of ${step})` : event.max_quantity > 0 ? ` (${minQty}–${event.max_quantity})` : ` (min ${minQty})`}
                  </label>
                  <div className="flex items-center gap-0 border border-input rounded-md overflow-hidden">
                    <button
                      type="button"
                      onClick={() => {
                        const next = qty - (step > 1 ? step : 1)
                        if (next >= minQty) setQuantity(String(next))
                      }}
                      disabled={qty <= minQty}
                      className="h-9 w-10 flex items-center justify-center text-lg font-medium hover:bg-muted transition-colors disabled:opacity-30 shrink-0 border-r"
                    >
                      −
                    </button>
                    <span className="flex-1 h-9 flex items-center justify-center text-sm font-semibold">
                      {qty.toLocaleString()} {event.unit}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const max = event.max_quantity > 0 ? Math.min(event.max_quantity, available) : available
                        const next = qty + (step > 1 ? step : 1)
                        if (next <= max) setQuantity(String(next))
                      }}
                      disabled={qty >= (event.max_quantity > 0 ? Math.min(event.max_quantity, available) : available)}
                      className="h-9 w-10 flex items-center justify-center text-lg font-medium hover:bg-muted transition-colors disabled:opacity-30 shrink-0 border-l"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Fulfillment */}
                {(() => {
                  const locs = [...(event.delivery_locations || []), ...(event.collection_locations || [])]
                  const hasCollection = locs.length > 0
                  const hasDelivery = hasDeliveryDates
                  if (!hasCollection && !hasDelivery) return null

                  // Auto-select if only one option
                  if (hasCollection && !hasDelivery && fulfillment !== "collection") setFulfillment("collection")
                  if (hasDelivery && !hasCollection && fulfillment !== "delivery") setFulfillment("delivery")

                  const showToggle = hasCollection && hasDelivery
                  return (
                    <div className="space-y-2">
                      {showToggle && (
                        <>
                          <label className="text-xs font-medium text-muted-foreground">How would you like to receive your order? *</label>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => { setFulfillment("collection"); setSelectedDeliveryDate(undefined) }}
                              className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${fulfillment === "collection" ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-foreground text-muted-foreground"}`}
                            >
                              Collection
                            </button>
                            <button
                              type="button"
                              onClick={() => { setFulfillment("delivery"); setSelectedCollectionPoint(null) }}
                              className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${fulfillment === "delivery" ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-foreground text-muted-foreground"}`}
                            >
                              Delivery
                            </button>
                          </div>
                        </>
                      )}
                      {fulfillment === "collection" && locs.length > 0 && (
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-muted-foreground">Collection Point *</label>
                          {selectedCollectionPoint ? (
                            <div className="flex items-center justify-between bg-muted/50 rounded-lg px-3 py-2">
                              <span className="text-sm font-medium">{selectedCollectionPoint.name}</span>
                              <button type="button" onClick={() => setSelectedCollectionPoint(null)} className="text-xs text-muted-foreground hover:text-foreground">Change</button>
                            </div>
                          ) : (
                            <div className="border rounded-lg overflow-y-auto max-h-40">
                              {locs.map((loc: any) => (
                                <button
                                  key={loc.id}
                                  type="button"
                                  onClick={() => setSelectedCollectionPoint({ id: loc.id, name: loc.name })}
                                  className="w-full text-left px-3 py-2.5 hover:bg-muted/50 transition-colors border-b last:border-b-0 text-sm"
                                >
                                  {loc.name}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })()}

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    readOnly
                    className="flex h-9 w-full rounded-md border border-input bg-muted px-3 py-1 text-sm shadow-sm text-muted-foreground cursor-not-allowed"
                  />
                </div>

                {event.buyer_notes && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Notes / Preferences (optional)</label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="e.g. preferred seed size, delivery preferences..."
                      rows={2}
                      className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
                    />
                  </div>
                )}

                {fulfillment === "delivery" && hasDeliveryDates && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Select Delivery Date *</label>
                    <Calendar
                      mode="single"
                      selected={selectedDeliveryDate}
                      onSelect={setSelectedDeliveryDate}
                      disabled={(date) => {
                        const dateStr = date.toISOString().split("T")[0]
                        return !event.delivery_dates.includes(dateStr) || date < new Date()
                      }}
                      className="rounded-md border"
                    />
                    {selectedDeliveryDate && (
                      <p className="text-xs text-primary font-medium">
                        Delivery: {formatDate(selectedDeliveryDate.toISOString())}
                      </p>
                    )}
                  </div>
                )}

                {qty >= minQty && (
                  <div className="bg-muted/50 rounded-lg p-3 text-sm space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Order total ({qty.toLocaleString()} units)</span>
                      <span className="font-medium">${orderTotal.toFixed(2)}</span>
                    </div>
                    {depositEnabled && event.deposit_per_unit > 0 ? (
                      <>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Deposit due now</span>
                          <span className="font-semibold text-orange-700">${depositTotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between border-t pt-1.5">
                          <span className="text-muted-foreground">Balance on collection</span>
                          <span className="font-medium">${balanceDue.toFixed(2)}</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Platform fee (6.9%)</span>
                          <span className="font-medium">${(orderTotal * 0.069).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between border-t pt-1.5">
                          <span className="font-semibold">Total</span>
                          <span className="font-bold">${(orderTotal * 1.069).toFixed(2)}</span>
                        </div>
                      </>
                    )}
                  </div>
                )}

                <button
                  onClick={() => mutation.mutate()}
                  disabled={mutation.isPending || !canSubmit}
                  className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold py-2.5 rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 text-sm"
                >
                  {mutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                  Submit Booking Request
                </button>

                <p className="text-xs text-muted-foreground text-center">
                  We&apos;ll confirm availability and notify you to pay
                </p>
              </div>
            )}

            {/* Booking window */}
            <div className="border rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground flex items-center gap-1"><CalendarDays className="w-3.5 h-3.5" /> Opens</span>
                <span className="font-medium">{formatDate(event.open_date)}</span>
              </div>
              {isOpenEnded ? (
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground flex items-center gap-1"><CalendarDays className="w-3.5 h-3.5" /> Closes</span>
                  <span className="font-medium text-green-700">Always open</span>
                </div>
              ) : (
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground flex items-center gap-1"><CalendarDays className="w-3.5 h-3.5" /> Closes</span>
                  <span className="font-medium">{formatDate(event.close_date)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
