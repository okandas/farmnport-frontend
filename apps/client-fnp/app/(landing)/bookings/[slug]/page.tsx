"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter, useParams } from "next/navigation"
import { Loader2, CalendarDays, Package, Users, Clock } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { toast } from "sonner"

import { getBookingEvent, createBooking, queryClient as queryClientProfile } from "@/lib/query"

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
}

export default function BookingEventDetailPage() {
  const params = useParams()
  const slug = params.slug as string
  const { data: session } = useSession()
  const user = session?.user as any
  const router = useRouter()
  const queryClient = useQueryClient()

  const [quantity, setQuantity] = useState("")
  const [notes, setNotes] = useState("")

  const { data, isLoading } = useQuery({
    queryKey: ["booking-event", slug],
    queryFn: () => getBookingEvent(slug).then((r) => r.data),
  })

  const { data: profileData } = useQuery({
    queryKey: ["my-profile", user?.username],
    queryFn: () => queryClientProfile(user.username.replace(/ /g, "-")).then((r) => r.data),
    enabled: !!user?.username,
  })

  const phone: string = profileData?.phone ?? ""

  const event = data?.event

  const mutation = useMutation({
    mutationFn: () =>
      createBooking({
        type: "livestock",
        event_id: event?.id,
        quantity: parseInt(quantity),
        phone,
        notes: notes || undefined,
      }),
    onSuccess: () => {
      toast.success("Booking placed successfully")
      queryClient.invalidateQueries({ queryKey: ["my-bookings"] })
      router.push("/account/bookings")
    },
    onError: () => {
      toast.error("Failed to place booking. Please try again.")
    },
  })

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

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
  const available = event.total_available - event.total_booked
  const minQty = event.min_quantity || 1

  const canSubmit =
    !!session &&
    qty >= minQty &&
    qty <= available &&
    (event.max_quantity === 0 || qty <= event.max_quantity) &&
    !!phone

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
            <Link href="/bookings" className="hover:text-foreground">Pre-Orders</Link>
            <span className="mx-2">/</span>
            <span className="text-foreground line-clamp-1">{event.title}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-[400px_1fr_320px] gap-8 items-start">

          {/* ── Column 1: Image ── */}
          <div>
            {event.image_src ? (
              <div className="relative aspect-square w-full rounded-2xl overflow-hidden border bg-muted">
                <Image src={event.image_src} alt={event.title} fill className="object-cover" />
              </div>
            ) : (
              <div className="aspect-square w-full rounded-2xl border bg-muted/40 flex items-center justify-center">
                <CalendarDays className="w-24 h-24 text-muted-foreground/20" />
              </div>
            )}

            <div className="mt-4 flex gap-3 flex-wrap">
              <span className="text-xs px-3 py-1 rounded-full bg-green-100 text-green-800 font-medium">Open for bookings</span>
              <span className="text-xs px-3 py-1 rounded-full bg-muted text-muted-foreground font-medium">
                {available.toLocaleString()} of {event.total_available.toLocaleString()} left
              </span>
            </div>
          </div>

          {/* ── Column 2: Details ── */}
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold leading-tight">{event.title}</h1>
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground flex-wrap">
                <span className="flex items-center gap-1.5">
                  <Users className="w-4 h-4" />
                  {event.client_name}
                </span>
                {event.product_name && (
                  <span className="flex items-center gap-1.5">
                    <Package className="w-4 h-4" />
                    {event.product_name}
                  </span>
                )}
              </div>
            </div>

            {event.description && (
              <p className="text-sm text-muted-foreground leading-relaxed">{event.description}</p>
            )}

            {/* Pricing & capacity */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border bg-muted/30 p-4">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Unit Price</p>
                <p className="text-2xl font-bold">${(event.unit_price / 100).toFixed(2)}</p>
                <p className="text-xs text-muted-foreground mt-1">per unit · full price</p>
              </div>
              <div className="rounded-xl border border-orange-200 bg-orange-50 p-4">
                <p className="text-xs font-medium text-orange-700 uppercase tracking-wide mb-2">Deposit per Unit</p>
                <p className="text-2xl font-bold text-orange-700">${(event.deposit_per_unit / 100).toFixed(2)}</p>
                <p className="text-xs text-orange-600 mt-1">to secure your booking</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl border bg-muted/30 p-4">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Available</p>
                <p className="text-lg font-bold">{available.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">of {event.total_available.toLocaleString()} total</p>
              </div>
              <div className="rounded-xl border bg-muted/30 p-4">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Min Order</p>
                <p className="text-lg font-bold">{minQty.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {event.max_quantity > 0 ? `max ${event.max_quantity.toLocaleString()} units` : "units minimum"}
                </p>
              </div>
              <div className="rounded-xl border bg-muted/30 p-4">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Closes
                </p>
                <p className="text-lg font-bold">{formatDate(event.close_date)}</p>
                <p className="text-xs text-muted-foreground mt-1">booking deadline</p>
              </div>
            </div>

            {/* How it works */}
            <div className="bg-muted/40 rounded-xl p-5 space-y-3">
              <h3 className="font-semibold text-sm">How Pre-Orders Work</h3>
              <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
                <li>Enter your desired quantity and collection date</li>
                <li>Pay the deposit to secure your reservation</li>
                <li>We confirm your booking and notify you</li>
                <li>Pay the balance and collect your order on the agreed date</li>
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
                    Quantity *{event.max_quantity > 0 ? ` (${minQty}–${event.max_quantity})` : ` (min ${minQty})`}
                  </label>
                  <input
                    type="number"
                    min={minQty}
                    max={event.max_quantity > 0 ? event.max_quantity : available}
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder={`e.g. ${minQty}`}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    readOnly
                    className="flex h-9 w-full rounded-md border border-input bg-muted px-3 py-1 text-sm shadow-sm text-muted-foreground cursor-not-allowed"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Notes</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    placeholder="Any special requirements..."
                    className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
                  />
                </div>

                {qty >= minQty && (
                  <div className="bg-muted/50 rounded-lg p-3 text-sm space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Order total ({qty.toLocaleString()} units)</span>
                      <span className="font-medium">${orderTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Deposit due now</span>
                      <span className="font-semibold text-orange-700">${depositTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between border-t pt-1.5">
                      <span className="text-muted-foreground">Balance on collection</span>
                      <span className="font-medium">${balanceDue.toFixed(2)}</span>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => mutation.mutate()}
                  disabled={mutation.isPending || !canSubmit}
                  className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold py-2.5 rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 text-sm"
                >
                  {mutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                  Confirm Booking
                </button>

                <p className="text-xs text-muted-foreground text-center">
                  By booking you agree to pay the deposit to secure your reservation
                </p>
              </div>
            )}

            {/* Booking window */}
            <div className="border rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground flex items-center gap-1"><CalendarDays className="w-3.5 h-3.5" /> Opens</span>
                <span className="font-medium">{formatDate(event.open_date)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground flex items-center gap-1"><CalendarDays className="w-3.5 h-3.5" /> Closes</span>
                <span className="font-medium">{formatDate(event.close_date)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
