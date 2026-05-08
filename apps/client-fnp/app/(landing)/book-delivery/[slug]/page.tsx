"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter, useParams } from "next/navigation"
import { Loader2, MapPin, Clock, CalendarDays } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

import { queryClient as fetchClient, listDeliveryLocations, createBooking } from "@/lib/query"
import { capitalizeFirstLetter } from "@/lib/utilities"

export default function BookDeliveryPage() {
  const params = useParams()
  const slug = params.slug as string
  const buyerName = slug.replace(/-/g, " ")

  const { data: session } = useSession()
  const user = session?.user as any
  const router = useRouter()
  const qc = useQueryClient()

  const [locationId, setLocationId] = useState("")
  const [date, setDate] = useState("")
  const [timeSlot, setTimeSlot] = useState("")
  const [goods, setGoods] = useState("")
  const [notes, setNotes] = useState("")

  // Fetch logged-in user profile for phone
  const { data: profileData } = useQuery({
    queryKey: ["my-profile", user?.username],
    queryFn: () => fetchClient(user.username.replace(/ /g, "-")).then((r) => r.data),
    enabled: !!user?.username,
  })
  const phone: string = profileData?.phone ?? ""

  // Fetch buyer profile to get their ID
  const { data: buyerData } = useQuery({
    queryKey: ["buyer-profile", slug],
    queryFn: () => fetchClient(slug).then((r) => r.data),
  })
  const buyerId: string = buyerData?.id ?? ""

  // Fetch delivery locations belonging to this buyer
  const { data: locationsData, isLoading: locationsLoading } = useQuery({
    queryKey: ["delivery-locations", buyerId],
    queryFn: () => listDeliveryLocations(buyerId).then((r) => {
      const locs = r.data?.locations ?? []
      if (locs.length > 0 && !locationId) {
        setLocationId(locs[0].id)
      }
      return r.data
    }),
    enabled: !!buyerId,
  })

  const locations: any[] = locationsData?.locations ?? []

  // Selected location's time slots
  const selectedLocation = locations.find((l: any) => l.id === locationId)
  const timeSlots: string[] = selectedLocation?.time_slots ?? []

  const mutation = useMutation({
    mutationFn: () =>
      createBooking({
        type: "delivery",
        delivery_location_id: locationId,
        booking_date: new Date(date).toISOString(),
        time_slot: timeSlot || undefined,
        goods,
        phone,
        notes: notes || undefined,
      }),
    onSuccess: () => {
      toast.success("Delivery booking submitted successfully")
      qc.invalidateQueries({ queryKey: ["my-bookings"] })
      router.push("/account/bookings")
    },
    onError: () => {
      toast.error("Failed to submit booking. Please try again.")
    },
  })

  const canSubmit = !!session && !!locationId && !!date && !!goods && !!phone

  if (locationsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="border-b">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground">Home</Link>
            <span className="mx-2">/</span>
            <Link href={`/buy/${buyerName.replace(/\s+/g, '-')}`} className="hover:text-foreground capitalize">{buyerName}</Link>
            <span className="mx-2">/</span>
            <span className="text-foreground">Book a Sale</span>
          </nav>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Book a Sale to {capitalizeFirstLetter(buyerName)}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Select a drop-off location and date to reserve your delivery slot.
          </p>
        </div>

        {!session ? (
          <div className="border rounded-xl p-8 text-center space-y-4">
            <CalendarDays className="w-10 h-10 mx-auto text-muted-foreground/40" />
            <div>
              <p className="font-semibold">Sign in to book a delivery slot</p>
              <p className="text-xs text-muted-foreground mt-1">You need an account to submit a booking</p>
            </div>
            <Link
              href={`/login?next=/book-delivery/${slug}`}
              className="inline-block bg-primary text-primary-foreground text-sm font-semibold px-6 py-2.5 rounded-xl hover:bg-primary/90 transition-colors"
            >
              Sign In
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {/* Location picker */}
            <div className="border rounded-xl divide-y">
              <div className="p-5">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" /> Drop-off Location
                </p>
                <div className="space-y-2">
                  {locations.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No active drop-off locations available.</p>
                  ) : (
                    locations.map((loc: any) => (
                      <label
                        key={loc.id}
                        className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                          locationId === loc.id ? "border-primary bg-primary/5" : "hover:bg-muted/30"
                        }`}
                      >
                        <input
                          type="radio"
                          name="location"
                          value={loc.id}
                          checked={locationId === loc.id}
                          onChange={() => { setLocationId(loc.id); setTimeSlot("") }}
                          className="mt-0.5"
                        />
                        <div>
                          <p className="text-sm font-medium">{loc.name}</p>
                          <p className="text-xs text-muted-foreground">{loc.address}, {loc.city}</p>
                          {loc.time_slots?.length > 0 && (
                            <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {loc.time_slots.join(" · ")}
                            </p>
                          )}
                        </div>
                      </label>
                    ))
                  )}
                </div>
              </div>

              {/* Date + time slot */}
              <div className="p-5 grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Delivery Date *</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                </div>

                {timeSlots.length > 0 && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Time Slot</label>
                    <select
                      value={timeSlot}
                      onChange={(e) => setTimeSlot(e.target.value)}
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                      <option value="">Select a slot</option>
                      {timeSlots.map((s: string) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Goods + notes */}
              <div className="p-5 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Goods Description *</label>
                  <textarea
                    value={goods}
                    onChange={(e) => setGoods(e.target.value)}
                    rows={2}
                    placeholder="e.g. 80 broilers, 30kg tomatoes"
                    className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
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
              </div>

              {/* Submit */}
              <div className="p-5 flex items-center justify-between">
                <Link href={`/buy/${slug}`} className="text-sm text-muted-foreground hover:text-foreground">
                  Cancel
                </Link>
                <button
                  onClick={() => mutation.mutate()}
                  disabled={mutation.isPending || !canSubmit}
                  className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold py-2.5 px-6 rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 text-sm"
                >
                  {mutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                  Submit Booking
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
