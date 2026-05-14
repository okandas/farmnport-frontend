"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter, useParams } from "next/navigation"
import { Loader2, MapPin, Clock, CalendarDays, ChevronDown, Truck, PackageSearch } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"
import { toast } from "sonner"

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { GoodsPicker, EMPTY_GOODS_ITEM, type GoodsItem } from "@/components/booking/goods-picker"
import { queryClient as fetchClient, listDeliveryLocations, createBooking } from "@/lib/query"
import { capitalizeFirstLetter } from "@/lib/utilities"

type BookingType = "delivery" | "pickup"

const PICKUP_TIME_SLOTS = ["06:00 - 09:00", "09:00 - 12:00", "12:00 - 15:00", "15:00 - 18:00"]

export default function BookPage() {
  const params = useParams()
  const slug = params.slug as string
  const buyerName = slug.replace(/-/g, " ")

  const { data: session } = useSession()
  const user = session?.user as any
  const router = useRouter()
  const qc = useQueryClient()

  const [type, setType] = useState<BookingType>("delivery")
  const [locationId, setLocationId] = useState("")
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [calOpen, setCalOpen] = useState(false)
  const [timeSlot, setTimeSlot] = useState("")
  const [farmAddress, setFarmAddress] = useState("")
  const [goodsItems, setGoodsItems] = useState<GoodsItem[]>([EMPTY_GOODS_ITEM()])
  const [notes, setNotes] = useState("")

  // Fetch logged-in user profile for phone + address
  const { data: profileData } = useQuery({
    queryKey: ["my-profile", user?.username],
    queryFn: () => fetchClient(user.username.replace(/ /g, "-")).then((r) => r.data),
    enabled: !!user?.username,
  })
  const phone: string = profileData?.phone ?? ""
  const profileAddress: string = profileData?.address ?? ""

  // Fetch buyer profile
  const { data: buyerData, isLoading: buyerLoading } = useQuery({
    queryKey: ["buyer-profile", slug],
    queryFn: () => fetchClient(slug).then((r) => r.data),
  })
  const buyerId: string = buyerData?.id ?? ""
  const hasDelivery: boolean = buyerData?.has_booking ?? false
  const hasPickup: boolean = buyerData?.has_pickup ?? false

  // Fetch delivery locations (delivery mode only)
  const { data: locationsData, isLoading: locationsLoading } = useQuery({
    queryKey: ["delivery-locations", buyerId],
    queryFn: () => listDeliveryLocations(buyerId).then((r) => {
      const locs = r.data?.locations ?? []
      if (locs.length > 0 && !locationId) setLocationId(locs[0].id)
      return r.data
    }),
    enabled: !!buyerId && type === "delivery",
  })
  const locations: any[] = locationsData?.locations ?? []
  const selectedLocation = locations.find((l: any) => l.id === locationId)
  const deliveryTimeSlots: string[] = selectedLocation?.time_slots ?? []

  const validItems = goodsItems.filter((g) => g.produce_name && g.quantity > 0)
  const effectiveFarmAddress = farmAddress || profileAddress

  const canSubmit = !!session && !!date && validItems.length > 0 && !!phone && (
    type === "delivery" ? !!locationId : !!effectiveFarmAddress
  )

  const mutation = useMutation({
    mutationFn: () =>
      type === "delivery"
        ? createBooking({
            type: "delivery",
            delivery_location_id: locationId,
            booking_date: date!.toISOString(),
            time_slot: timeSlot || undefined,
            goods_items: validItems,
            phone,
            notes: notes || undefined,
          })
        : createBooking({
            type: "pickup",
            buyer_id: buyerId,
            farm_address: effectiveFarmAddress,
            booking_date: date!.toISOString(),
            time_slot: timeSlot || undefined,
            goods_items: validItems,
            phone,
            notes: notes || undefined,
          }),
    onSuccess: () => {
      toast.success(type === "delivery" ? "Delivery booking submitted" : "Pickup request submitted")
      qc.invalidateQueries({ queryKey: ["my-bookings"] })
      router.push("/account/bookings")
    },
    onError: () => {
      toast.error("Failed to submit. Please try again.")
    },
  })

  function handleTypeChange(next: BookingType) {
    setType(next)
    setTimeSlot("")
    setDate(undefined)
  }

  if (buyerLoading || (type === "delivery" && locationsLoading)) {
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
            <Link href={`/buy/${slug}`} className="hover:text-foreground capitalize">{buyerName}</Link>
            <span className="mx-2">/</span>
            <span className="text-foreground">Book a Sale</span>
          </nav>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Book a Sale to {capitalizeFirstLetter(buyerName)}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Select a drop-off location or request pickup, and pick a date to reserve your slot.
          </p>
        </div>

        {/* Booking type toggle */}
        {(hasDelivery || hasPickup) && (
          <div className="flex rounded-xl border overflow-hidden mb-6">
            {hasDelivery && (
              <button
                type="button"
                onClick={() => handleTypeChange("delivery")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-colors ${
                  type === "delivery"
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-muted-foreground hover:bg-muted/50"
                }`}
              >
                <Truck className="w-4 h-4" />
                Drop-off Delivery
              </button>
            )}
            {hasPickup && (
              <button
                type="button"
                onClick={() => handleTypeChange("pickup")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-colors ${
                  type === "pickup"
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-muted-foreground hover:bg-muted/50"
                }`}
              >
                <PackageSearch className="w-4 h-4" />
                Request Pickup
              </button>
            )}
          </div>
        )}

        {/* Type description */}
        <p className="text-xs text-muted-foreground mb-6">
          {type === "delivery"
            ? `You drop off your goods at one of ${capitalizeFirstLetter(buyerName)}'s locations on the selected date.`
            : `${capitalizeFirstLetter(buyerName)} sends a vehicle to collect goods directly from your farm.`}
        </p>

        {!session ? (
          <div className="border rounded-xl p-8 text-center space-y-4">
            <CalendarDays className="w-10 h-10 mx-auto text-muted-foreground/40" />
            <div>
              <p className="font-semibold">Sign in to book a slot</p>
              <p className="text-xs text-muted-foreground mt-1">You need an account to submit a booking</p>
            </div>
            <Link
              href={`/login?next=/book/${slug}`}
              className="inline-block bg-primary text-primary-foreground text-sm font-semibold px-6 py-2.5 rounded-xl hover:bg-primary/90 transition-colors"
            >
              Sign In
            </Link>
          </div>
        ) : (
          <div className="border rounded-xl divide-y">

            {/* Delivery: location picker */}
            {type === "delivery" && (
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
            )}

            {/* Pickup: farm address */}
            {type === "pickup" && (
              <div className="p-5">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" /> Your Farm Address
                </p>
                <input
                  type="text"
                  value={farmAddress || profileAddress}
                  onChange={(e) => setFarmAddress(e.target.value)}
                  placeholder="Enter your farm address"
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>
            )}

            {/* Date + time slot */}
            <div className="p-5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-1.5">
                <CalendarDays className="w-3.5 h-3.5" /> {type === "delivery" ? "Delivery" : "Pickup"} Date & Time
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Date *</label>
                  <Popover open={calOpen} onOpenChange={setCalOpen}>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className={`flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring ${!date ? "text-muted-foreground" : ""}`}
                      >
                        <span>{date ? format(date, "d/M/yyyy") : "Pick a date"}</span>
                        <ChevronDown className="w-4 h-4 opacity-50" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={(d) => { setDate(d); setCalOpen(false) }}
                        disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {(type === "pickup" ? PICKUP_TIME_SLOTS : deliveryTimeSlots).length > 0 && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Preferred Time</label>
                    <Select value={timeSlot} onValueChange={setTimeSlot}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a time" />
                      </SelectTrigger>
                      <SelectContent>
                        {(type === "pickup" ? PICKUP_TIME_SLOTS : deliveryTimeSlots).map((s: string) => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>

            {/* Goods + phone + notes */}
            <div className="p-5 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Goods *</label>
                <GoodsPicker items={goodsItems} onChange={setGoodsItems} />
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
                  placeholder="Any special requirements or directions..."
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
                {type === "delivery" ? "Submit Booking" : "Request Pickup"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
