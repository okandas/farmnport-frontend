"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter, useParams } from "next/navigation"
import { Loader2, MapPin, Clock, CalendarDays, ChevronDown } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"
import { toast } from "sonner"

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { GoodsPicker, EMPTY_GOODS_ITEM, type GoodsItem } from "@/components/booking/goods-picker"
import { queryClient as fetchClient, createBooking } from "@/lib/query"
import { capitalizeFirstLetter } from "@/lib/utilities"

export default function RequestPickupPage() {
  const params = useParams()
  const slug = params.slug as string
  const buyerName = slug.replace(/-/g, " ")

  const { data: session } = useSession()
  const user = session?.user as any
  const router = useRouter()
  const qc = useQueryClient()

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

  // Pre-fill farm address from profile if available
  const profileAddress: string = profileData?.address ?? ""

  // Fetch buyer profile
  const { data: buyerData, isLoading: buyerLoading } = useQuery({
    queryKey: ["buyer-profile", slug],
    queryFn: () => fetchClient(slug).then((r) => r.data),
  })
  const buyerId: string = buyerData?.id ?? ""

  // Common time slots for pickup
  const timeSlots = ["06:00 - 09:00", "09:00 - 12:00", "12:00 - 15:00", "15:00 - 18:00"]

  const validItems = goodsItems.filter((g) => g.produce_name && g.quantity > 0)
  const effectiveFarmAddress = farmAddress || profileAddress

  const mutation = useMutation({
    mutationFn: () =>
      createBooking({
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
      toast.success("Pickup request submitted successfully")
      qc.invalidateQueries({ queryKey: ["my-bookings"] })
      router.push("/account/bookings")
    },
    onError: () => {
      toast.error("Failed to submit pickup request. Please try again.")
    },
  })

  const canSubmit = !!session && !!buyerId && !!date && validItems.length > 0 && !!phone && !!effectiveFarmAddress

  if (buyerLoading) {
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
            <span className="text-foreground">Request Pickup</span>
          </nav>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Request Pickup from {capitalizeFirstLetter(buyerName)}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Request {capitalizeFirstLetter(buyerName)} to collect goods directly from your farm.
          </p>
        </div>

        {!session ? (
          <div className="border rounded-xl p-8 text-center space-y-4">
            <CalendarDays className="w-10 h-10 mx-auto text-muted-foreground/40" />
            <div>
              <p className="font-semibold">Sign in to request a pickup</p>
              <p className="text-xs text-muted-foreground mt-1">You need an account to submit a pickup request</p>
            </div>
            <Link
              href={`/login?next=/request-pickup/${slug}`}
              className="inline-block bg-primary text-primary-foreground text-sm font-semibold px-6 py-2.5 rounded-xl hover:bg-primary/90 transition-colors"
            >
              Sign In
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            <div className="border rounded-xl divide-y">

              {/* Date + time slot */}
              <div className="p-5">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-1.5">
                  <CalendarDays className="w-3.5 h-3.5" /> Pickup Date & Time
                </p>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Pickup Date *</label>
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
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Preferred Time</label>
                    <Select value={timeSlot} onValueChange={setTimeSlot}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a time" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeSlots.map((s) => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Farm address */}
              <div className="p-5">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" /> Farm Address
                </p>
                <input
                  type="text"
                  value={farmAddress || profileAddress}
                  onChange={(e) => setFarmAddress(e.target.value)}
                  placeholder="Enter your farm address"
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>

              {/* Goods + notes */}
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
                  Request Pickup
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
