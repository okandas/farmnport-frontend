"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { Check, Loader2, ShoppingCart, CreditCard, Smartphone, Globe, Truck, Store, Minus, Plus, Trash2, Shield, MapPin, Info } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

import { getCart, checkout, pollOrderStatus, queryClient as fetchClient, updateCartItem, removeFromCart, queryTumira, queryTumiraDeliveryRates, queryTumiraCheckAddress, queryTumiraConfirmPin } from "@/lib/query"
import { trackPurchase } from "@/lib/analytics"
import { AuthenticatedUser } from "@/lib/schemas"
import { centsToDollars } from "@/lib/utilities"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const PAYMENT_METHODS = [
  { value: "ecocash", label: "EcoCash",          description: "Mobile money prompt to your phone",  icon: Smartphone },
  { value: "vmc",     label: "Visa / Mastercard", description: "Pay securely online with your card", icon: CreditCard },
  { value: "",        label: "PayNow Web",         description: "Choose your method on PayNow",       icon: Globe },
]

const SERVICE_TYPE_LABELS: Record<string, string> = {
  door_to_door: "Delivered to your address",
  ship_to_door: "Delivered to your address",
  hub_to_hub: "Collect at a hub near you",
  door_to_hub: "Collect at a hub near you",
}

const PROVINCES = [
  "Harare", "Bulawayo", "Manicaland", "Mashonaland Central",
  "Mashonaland East", "Mashonaland West", "Masvingo",
  "Matabeleland North", "Matabeleland South", "Midlands",
]

interface CheckoutForm {
  phone: string
  email: string
  provider: string
  method: string
  address_name: string
  house_number: string
  street: string
  suburb: string
  city: string
  province: string
}

interface CartItem {
  product_id: string
  product_type: string
  product_name: string
  product_slug: string
  image_src: string
  unit_price: number
  quantity: number
  sku: string
  weight_grams?: number
  is_test?: boolean
  fulfillment?: {
    delivery_available: boolean
    pickup_available: boolean
    pickup_locations?: { id: string; name: string; address: string; city: string; time_slots?: string[] }[]
  }
}

interface DeliveryCourier {
  courier_id: string
  courier_name: string
  service_type: "door_to_door" | "ship_to_door" | "hub_to_hub" | "door_to_hub"
  price_cents: number
  estimated_days: number
  estimated_hours: number
  weight_limit_grams: number
  distance_km?: number
  distance_source?: string
}

interface Tumira {
  id: string
  name: string
  address: string
  city: string
  time_slots?: string[]
  courier_name: string
  rate: number // cents
}

interface Cart {
  items: CartItem[]
}

interface CheckoutResponse {
  success: boolean
  order_id: string
  order_number: string
  reference: string
  redirect_url: string
  poll_url: string
  instructions: string
}

export default function CheckoutPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const qc = useQueryClient()
  const user = session?.user as AuthenticatedUser | undefined

  const [polling, setPolling] = useState(false)
  const [pollRef, setPollRef] = useState("")
  const [orderNumber, setOrderNumber] = useState("")
  const [redirectUrl, setRedirectUrl] = useState("")
  const [selectedMethod, setSelectedMethod] = useState("")
  const [selectedLocationId, setSelectedLocationId] = useState("")
  const [tumiraSearch, setTumiraSearch] = useState("")
  const [tumiraVisible, setTumiraVisible] = useState(4)
  const [fulfillment, setFulfillment] = useState<"click_collect" | "delivery">("click_collect")
  const [selectedCourierId, setSelectedCourierId] = useState("")
  const [courierSearch, setCourierSearch] = useState("")
  const [addressConfirmed, setAddressConfirmed] = useState(false)
  const [geochecking, setGeochecking] = useState(false)
  const [confirmingPin, setConfirmingPin] = useState(false)
  const [pinLat, setPinLat] = useState<number | null>(null)
  const [pinLng, setPinLng] = useState<number | null>(null)
  const [pinModalOpen, setPinModalOpen] = useState(false)
  const mapRef = useRef<HTMLDivElement>(null)
  const markerRef = useRef<any>(null)
  const pendingPinRef = useRef<{ lat: number; lng: number } | null>(null)
  const preCentreRef = useRef<{ lat: number; lng: number } | null>(null)

  const [step, setStep] = useState<"form" | "waiting" | "success" | "cancelled">("form")
  const [orderId, setOrderId] = useState("")

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<CheckoutForm>({
    defaultValues: { provider: "paynow", method: "ecocash" },
  })

  const { data: profileData } = useQuery({
    queryKey: ["my-profile", user?.username],
    queryFn: () => fetchClient((user!.username as string).replace(/ /g, "-")).then((r) => r.data),
    enabled: !!user?.username,
  })

  useEffect(() => {
    if (profileData?.phone) setValue("phone", profileData.phone)
    const email = profileData?.email || user?.email
    if (email) setValue("email", email as string)
    if (profileData?.name) setValue("address_name", profileData.name)
  }, [profileData, user, setValue])

  const method = watch("method")
  const [watchedName, watchedHouseNumber, watchedStreet, watchedSuburb, watchedCity, watchedProvince] = watch(["address_name", "house_number", "street", "suburb", "city", "province"])
  const watchedAddress = [watchedHouseNumber, watchedStreet, watchedSuburb].filter(Boolean).join(", ")
  const deliveryAddressComplete = fulfillment === "delivery" && !!(watchedName && watchedHouseNumber && watchedStreet && watchedSuburb && watchedCity && watchedProvince)

  const { data: cartData, isLoading: cartLoading } = useQuery({
    queryKey: ["cart"],
    queryFn: () => getCart().then((r) => r.data as Cart),
    enabled: !!session,
  })

  const items: CartItem[] = cartData?.items ?? []
  const totalWeightGrams = items.reduce((sum, item) => sum + item.quantity * (item.weight_grams || 5000), 0)

  // reset confirmation + pin when address changes
  useEffect(() => {
    setAddressConfirmed(false)
    setPinLat(null)
    setPinLng(null)
    preCentreRef.current = null
  }, [watchedName, watchedHouseNumber, watchedStreet, watchedSuburb, watchedCity, watchedProvince])

  // initialise Google Maps inside the modal when it opens
  useEffect(() => {
    if (!pinModalOpen || !mapRef.current) return
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    if (!apiKey) return

    const initMap = () => {
      const google = (window as any).google
      const defaultCenter = preCentreRef.current ?? { lat: -17.8292, lng: 31.0522 } // pre-centred from check response or Harare CBD
      const map = new google.maps.Map(mapRef.current, {
        center: defaultCenter,
        zoom: 13,
        disableDefaultUI: true,
        zoomControl: true,
      })
      const marker = new google.maps.Marker({
        position: defaultCenter,
        map,
        draggable: true,
        title: "Your delivery location",
      })
      markerRef.current = marker
      pendingPinRef.current = defaultCenter

      const onPositionChange = () => {
        const pos = marker.getPosition()
        if (pos) pendingPinRef.current = { lat: pos.lat(), lng: pos.lng() }
      }
      google.maps.event.addListener(marker, "dragend", onPositionChange)
      map.addListener("click", (e: any) => {
        marker.setPosition(e.latLng)
        pendingPinRef.current = { lat: e.latLng.lat(), lng: e.latLng.lng() }
      })
    }

    if ((window as any).google?.maps) {
      initMap()
    } else {
      const existing = document.getElementById("google-maps-sdk")
      if (!existing) {
        const script = document.createElement("script")
        script.id = "google-maps-sdk"
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`
        script.async = true
        script.onload = initMap
        document.head.appendChild(script)
      } else {
        existing.addEventListener("load", initMap)
      }
    }
  }, [pinModalOpen])

  const { data: deliveryRatesData, isFetching: ratesFetching, isError: ratesError } = useQuery({
    queryKey: ["tumira-delivery-rates", watchedName, watchedAddress, watchedCity, watchedProvince, totalWeightGrams, pinLat, pinLng],
    queryFn: () => queryTumiraDeliveryRates({
      from: { name: "Farmnport", address: "Harare CBD", city: "Harare", province: "Harare" },
      to: {
        name: watchedName,
        address: watchedAddress,
        city: watchedCity,
        province: watchedProvince,
        ...(pinLat !== null && pinLng !== null ? { lat: pinLat, lng: pinLng } : {}),
      },
      parcel: { weight_grams: totalWeightGrams || 5000 },
    }).then((r) => r.data?.couriers as DeliveryCourier[]),
    enabled: deliveryAddressComplete && addressConfirmed,
    staleTime: 60_000,
    retry: 2,
  })
  const pickupLocations = items
    .flatMap((i) => i.fulfillment?.pickup_locations ?? [])
    .filter((loc, idx, arr) => arr.findIndex((l) => l.id === loc.id) === idx)
  const deliveryAvailable = items.every((i) => i.fulfillment?.delivery_available)
  const subtotalCents = items.reduce((s, i) => s + (i.unit_price * i.quantity), 0)

  const needsTumira = fulfillment === "click_collect" || items.some((i) => i.fulfillment?.pickup_available)

  const [debouncedSearch, setDebouncedSearch] = useState("")
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(tumiraSearch), 300)
    return () => clearTimeout(t)
  }, [tumiraSearch])

  const { data: tumiraData } = useQuery({
    queryKey: ["tumira-locations", debouncedSearch],
    queryFn: () => queryTumira(debouncedSearch).then((r) => r.data?.locations as Tumira[]),
    enabled: needsTumira,
    placeholderData: (prev: Tumira[] | undefined) => prev,
  })
  const isTestOrder = items.some((i) => i.is_test)

  const tumiraLocations: Tumira[] = tumiraData ?? []
  const selectedTumira = tumiraLocations.find((l) => l.id === selectedLocationId)
  const tumiraFee = isTestOrder && selectedTumira ? 5 : (selectedTumira?.rate ?? 0)

  const deliveryCouriers: DeliveryCourier[] = deliveryRatesData ?? []
  const selectedCourier = deliveryCouriers.find((c) => c.courier_id === selectedCourierId)
  const deliveryFee = isTestOrder ? 5 : (selectedCourier?.price_cents ?? 0)
  const doorToDoorCouriers = deliveryCouriers.filter((c) => c.service_type === "door_to_door" || c.service_type === "ship_to_door")
  const noDoorToDoor = deliveryAddressComplete && !ratesFetching && deliveryCouriers.length > 0 && doorToDoorCouriers.length === 0
  const nearbyHubs = watchedCity ? tumiraLocations.filter((l) =>
    l.city.toLowerCase() === watchedCity.toLowerCase() ||
    l.city.toLowerCase().includes(watchedCity.toLowerCase()) ||
    watchedCity.toLowerCase().includes(l.city.toLowerCase())
  ) : []


  const checkoutMutation = useMutation({
    mutationFn: checkout,
    onSuccess: (res) => {
      const data = res.data as CheckoutResponse
      setOrderNumber(data.order_number)
      setOrderId(data.order_id)
      setPollRef(data.reference)
      setSelectedMethod(method)
      qc.invalidateQueries({ queryKey: ["cart"] })
      if (data.redirect_url && data.redirect_url.startsWith("http")) {
        setRedirectUrl(data.redirect_url)
        window.open(data.redirect_url, "_blank")
      }
      setStep("waiting")
      setPolling(true)
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Checkout failed. Please try again.")
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ product_id, quantity, sku }: { product_id: string; quantity: number; sku?: string }) =>
      updateCartItem(product_id, quantity, sku),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cart"] }),
  })

  const removeMutation = useMutation({
    mutationFn: ({ product_id, sku }: { product_id: string; sku?: string }) =>
      removeFromCart(product_id, sku),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cart"] }),
  })


  useEffect(() => {
    if (!polling || !pollRef) return
    const interval = setInterval(async () => {
      try {
        const res = await pollOrderStatus(pollRef)
        if (res.data?.paid) {
          setPolling(false)
          const totalCents = subtotalCents + (needsTumira ? tumiraFee : 0) + (fulfillment === "delivery" ? deliveryFee : 0)
          trackPurchase({
            transaction_id: orderNumber,
            value: totalCents / 100,
            items: items.map((item) => ({
              item_id: item.product_id,
              item_name: item.product_name,
              item_category: item.product_type,
              price: item.unit_price / 100,
              quantity: item.quantity,
            })),
          })
          setStep("success")
        } else if (["Cancelled", "Disputed", "Refunded"].includes(res.data?.status)) {
          setPolling(false)
          setStep("cancelled")
        }
      } catch {}
    }, 4000)
    return () => clearInterval(interval)
  }, [polling, pollRef])

function onSubmit(data: CheckoutForm) {
    checkoutMutation.mutate({
      provider: data.provider,
      method: data.method,
      phone: data.phone,
      email: data.email || user?.email || "",
      fulfillment,
      ...(selectedTumira ? { collection_location: {
        name: selectedTumira.name,
        address: selectedTumira.address,
        city: selectedTumira.city,
        courier_name: selectedTumira.courier_name,
        rate: selectedTumira.rate,
      } } : {}),
      fulfillment_fee: fulfillment === "delivery" ? deliveryFee : tumiraFee,
      address: fulfillment === "delivery" ? {
        name: data.address_name,
        phone: data.phone,
        address: [data.house_number, data.street, data.suburb].filter(Boolean).join(", "),
        city: data.city,
        province: data.province,
        ...(pinLat !== null && pinLng !== null ? { lat: pinLat, lng: pinLng } : {}),
        ...(selectedCourier ? { courier_id: selectedCourier.courier_id, courier_name: selectedCourier.courier_name, service_type: selectedCourier.service_type, distance_km: selectedCourier.distance_km, distance_source: selectedCourier.distance_source } : {}),
      } : undefined,
      order_type: "retail",
    })
  }

  if (status === "loading" || cartLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <ShoppingCart className="w-12 h-12 mx-auto text-muted-foreground/40" />
          <p className="font-semibold">Sign in to checkout</p>
          <Link href="/login?next=/checkout" className="inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold px-6 py-2.5 hover:bg-primary/90 transition-colors">
            Sign In
          </Link>
        </div>
      </div>
    )
  }

  if (items.length === 0 && step === "form") {
    return (
      <div className="min-h-[75vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <ShoppingCart className="w-12 h-12 mx-auto text-muted-foreground/40" />
          <p className="font-semibold">Your cart is empty</p>
          <Link href="/buy-agrochemicals" className="inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold px-6 py-2.5 hover:bg-primary/90 transition-colors">
            Shop Now
          </Link>
        </div>
      </div>
    )
  }

  if (step === "cancelled") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto">
            <span className="text-2xl">✕</span>
          </div>
          <div>
            <h1 className="text-xl font-bold">Payment Cancelled</h1>
            <p className="text-muted-foreground mt-1 text-sm">Order <span className="font-semibold text-foreground">{orderNumber}</span></p>
          </div>
          <div className="bg-muted rounded-xl p-5 text-sm text-muted-foreground">
            Your payment was cancelled or declined by your payment provider. You can retry payment from your order.
          </div>
          <Link href={`/account/orders/${orderId}`} className="block w-full text-center bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm py-3 rounded-full transition-colors">
            Retry Payment
          </Link>
        </div>
      </div>
    )
  }

  if (step === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto">
            <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Payment Confirmed!</h1>
            <p className="text-muted-foreground mt-1">Your order <span className="font-semibold text-foreground">{orderNumber}</span> has been placed.</p>
          </div>
          <p className="text-sm text-muted-foreground">{fulfillment === "delivery" ? "We'll be in touch with your delivery details." : "Bring your QR code to the collection point to pick up your order."}</p>
          <div className="flex flex-col gap-3">
            <Link href="/account/orders" className="block w-full text-center bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm py-3 rounded-full transition-colors">
              View My Orders
            </Link>
            <Link href="/buy-agrochemicals" className="block w-full text-center border hover:bg-muted text-sm font-medium py-3 rounded-full transition-colors">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (step === "waiting") {
    const isExpress = selectedMethod === "ecocash"
    const methodLabel = PAYMENT_METHODS.find(m => m.value === selectedMethod)?.label || "PayNow"
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-6">
          <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" />
          <div>
            <h1 className="text-xl font-bold">Complete Your Payment</h1>
            <p className="text-muted-foreground mt-1 text-sm">Order <span className="font-semibold text-foreground">{orderNumber}</span></p>
          </div>
          {isExpress ? (
            <div className="bg-muted rounded-xl p-5 text-sm space-y-2">
              <p className="font-medium">Check your phone</p>
              <p className="text-muted-foreground text-xs">An {methodLabel} payment prompt has been sent to your phone. Approve it to confirm your order.</p>
            </div>
          ) : (
            <div className="bg-muted rounded-xl p-5 text-sm space-y-2">
              <p className="font-medium">Payment window opened</p>
              <p className="text-muted-foreground text-xs">Complete your payment in the PayNow window, then return here — this page updates automatically.</p>
            </div>
          )}
          <p className="text-xs text-muted-foreground">Waiting for payment confirmation...</p>
          {!isExpress && redirectUrl && (
            <a href={redirectUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm px-8 py-3 rounded-full transition-colors">
              Re-open Payment Window
            </a>
          )}
          <button onClick={() => router.push("/account/orders")} className="block w-full text-center border hover:bg-muted text-sm font-medium py-3 rounded-full transition-colors">
            Go to My Orders
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="max-w-5xl mx-auto px-4 py-3">
          <nav className="flex text-sm text-muted-foreground">
            <Link href="/buy" className="hover:text-foreground">Buy</Link>
            <span className="mx-2">/</span>
            <span className="text-foreground">Checkout</span>
          </nav>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-8">Checkout</h1>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid lg:grid-cols-[1fr_480px] gap-8 items-start">

            {/* ── Left: Form ── */}
            <div className="space-y-6">

              {/* Fulfillment selector — only show if delivery is available */}
              {deliveryAvailable && (
                <section className="rounded-xl p-5 space-y-3">
                  <h2 className="font-semibold">Fulfillment Method</h2>
                  <div className="grid grid-cols-2 gap-3">
                    {([
                      { value: "click_collect", label: "Click & Collect", description: "Pick up from a collection point", icon: Store },
                      { value: "delivery",      label: "Delivery",         description: "Delivered to your address",       icon: Truck },
                    ] as const).map((opt) => {
                      const Icon = opt.icon
                      const active = fulfillment === opt.value
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => { setFulfillment(opt.value); setSelectedLocationId("") }}
                          className={`relative rounded-xl border-2 p-4 text-left transition-colors ${active ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"}`}
                        >
                          {active && (
                            <span className="absolute top-2 right-2 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                              <Check className="w-2.5 h-2.5 text-white" />
                            </span>
                          )}
                          <Icon className="w-5 h-5 mb-2 text-muted-foreground" />
                          <p className="font-semibold text-sm">{opt.label}</p>
                          <p className="text-xs text-muted-foreground">{opt.description}</p>
                        </button>
                      )
                    })}
                  </div>
                </section>
              )}

              {/* Tumira Pickup Points */}
              {needsTumira && (() => {
                const selected = tumiraLocations.find((l) => l.id === selectedLocationId)
                const filtered = tumiraLocations
                return (
                  <section className="border rounded-xl p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <h2 className="font-semibold">Collection Point</h2>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Shield className="w-3 h-3" /> Powered by Tumira
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">Select a Tumira hub near you. Your order will be delivered to that hub and held for collection.</p>

                    {/* Badge */}
                    <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2">
                      <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
                      <span className="text-sm">
                        {selected
                          ? <span className="flex flex-col"><span className="font-medium text-sm">{selected.name}</span><span className="text-xs text-muted-foreground">{selected.address}, {selected.city}</span></span>
                          : <span className="text-muted-foreground">{tumiraSearch ? `${tumiraLocations.length} result${tumiraLocations.length !== 1 ? "s" : ""}` : "Search for a pickup hub"}</span>
                        }
                      </span>
                      {selected && (
                        <button
                          type="button"
                          onClick={() => { setSelectedLocationId(""); setTumiraSearch("") }}
                          className="ml-auto text-xs text-muted-foreground hover:text-foreground"
                        >
                          Change
                        </button>
                      )}
                    </div>

                    {/* Searchable list with infinite scroll */}
                    {!selected && (
                      <div className="space-y-2">
                        <div className="flex items-center border rounded-lg px-3 py-2 gap-2 focus-within:ring-2 focus-within:ring-ring">
                          <input
                            type="text"
                            placeholder="Search by city, hub or courier..."
                            value={tumiraSearch}
                            onChange={(e) => { setTumiraSearch(e.target.value); setTumiraVisible(4) }}
                            className="flex-1 text-sm bg-transparent outline-none"
                          />
                        </div>
                        <div
                          className="border rounded-lg overflow-y-auto max-h-64"
                          onScroll={(e) => {
                            const el = e.currentTarget
                            if (el.scrollTop + el.clientHeight >= el.scrollHeight - 40) {
                              setTumiraVisible((v) => Math.min(v + 4, filtered.length))
                            }
                          }}
                        >
                          {filtered.length === 0 ? (
                            <p className="px-4 py-3 text-sm text-muted-foreground">No locations found</p>
                          ) : (
                            filtered.slice(0, tumiraVisible).map((loc) => (
                              <button
                                key={loc.id}
                                type="button"
                                onClick={() => { setSelectedLocationId(loc.id); setTumiraSearch("") }}
                                className="w-full text-left px-4 py-3 hover:bg-muted/50 transition-colors border-b last:border-b-0 flex items-center justify-between gap-3"
                              >
                                <div className="min-w-0">
                                  <p className="text-sm font-medium">{loc.name}</p>
                                  <p className="text-xs text-muted-foreground">{loc.address}, {loc.city}</p>
                                  <p className="text-xs"><span className="text-primary font-medium">{loc.courier_name}</span> <span className="text-muted-foreground">hub</span></p>
                                </div>
                                <span className="text-xs font-semibold shrink-0">{centsToDollars(loc.rate ?? 0)}</span>
                              </button>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </section>
                )
              })()}

              {/* Static Collection Points */}
              {needsTumira && pickupLocations.length > 0 && (
                <section className="border rounded-xl p-5 space-y-3">
                  <h2 className="font-semibold">Collection Point</h2>
                  {pickupLocations.map((loc) => (
                    <button
                      key={loc.id}
                      type="button"
                      onClick={() => setSelectedLocationId(loc.id)}
                      className={`w-full text-left rounded-xl border-2 p-4 transition-colors ${
                        selectedLocationId === loc.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold text-sm">{loc.name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{loc.address}, {loc.city}</p>
                          {loc.time_slots && loc.time_slots.length > 0 && (
                            <p className="text-xs text-muted-foreground mt-0.5">{loc.time_slots.join(" · ")}</p>
                          )}
                        </div>
                        {selectedLocationId === loc.id && (
                          <span className="shrink-0 w-4 h-4 bg-primary rounded-full flex items-center justify-center mt-0.5">
                            <Check className="w-2.5 h-2.5 text-white" />
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </section>
              )}

              {/* Delivery Address */}
              {fulfillment === "delivery" && (
                <section className="rounded-xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <h2 className="font-semibold">Delivery Address</h2>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="w-3.5 h-3.5 text-muted-foreground cursor-pointer translate-y-px" />
                          </TooltipTrigger>
                          <TooltipContent side="right" className="rounded-md text-[10px] max-w-[140px]">Please enter your correct address for accurate delivery</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    {(selectedCourier || (deliveryAddressComplete && deliveryCouriers.length > 0)) && (
                      <button type="button" onClick={() => { setSelectedCourierId(""); setValue("house_number", ""); setValue("street", ""); setValue("suburb", ""); setValue("city", ""); setValue("province", "") }} className="text-xs text-muted-foreground hover:text-foreground">
                        Change
                      </button>
                    )}
                  </div>
                  {(selectedCourier || (deliveryAddressComplete && deliveryCouriers.length > 0)) ? (
                    <div className="text-sm space-y-0.5">
                      <p className="font-medium capitalize">{watchedName}</p>
                      <p className="text-muted-foreground">{watchedAddress}</p>
                      <p className="text-muted-foreground">{watchedCity}{watchedProvince ? `, ${watchedProvince}` : ""}</p>
                    </div>
                  ) : (
                  <div className="grid gap-4">
                    <div>
                      <label className="text-sm font-medium block mb-1">Full Name</label>
                      <input
                        {...register("address_name", { required: fulfillment === "delivery" ? "Name is required" : false })}
                        placeholder="Your name"
                        className="w-full border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                      {errors.address_name && <p className="text-xs text-destructive mt-1">{errors.address_name.message}</p>}
                    </div>
                    <div>
                      <label className="text-sm font-medium block mb-1">House / Flat No. / Building</label>
                      <input
                        {...register("house_number", { required: fulfillment === "delivery" ? "House / flat number is required" : false })}
                        placeholder="Flat 24, Block 24"
                        className="w-full border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                      {errors.house_number && <p className="text-xs text-destructive mt-1">{errors.house_number.message}</p>}
                    </div>
                    <div>
                      <label className="text-sm font-medium block mb-1">Street / Complex</label>
                      <input
                        {...register("street", { required: fulfillment === "delivery" ? "Street is required" : false })}
                        placeholder="Zambezi Flats, Quendon Road"
                        className="w-full border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                      {errors.street && <p className="text-xs text-destructive mt-1">{errors.street.message}</p>}
                    </div>
                    <div>
                      <label className="text-sm font-medium block mb-1">Suburb</label>
                      <input
                        {...register("suburb", { required: fulfillment === "delivery" ? "Suburb is required" : false })}
                        placeholder="Malbereign"
                        className="w-full border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                      {errors.suburb && <p className="text-xs text-destructive mt-1">{errors.suburb.message}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm font-medium block mb-1">City / Town</label>
                        <input
                          {...register("city", { required: fulfillment === "delivery" ? "City is required" : false })}
                          placeholder="Harare"
                          className="w-full border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                        {errors.city && <p className="text-xs text-destructive mt-1">{errors.city.message}</p>}
                      </div>
                      <div>
                        <label className="text-sm font-medium block mb-1">Province</label>
                        <Select
                          value={watchedProvince}
                          onValueChange={(val) => setValue("province", val, { shouldValidate: true })}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select..." />
                          </SelectTrigger>
                          <SelectContent className="max-h-48 overflow-y-auto">
                            {PROVINCES.map((p) => (
                              <SelectItem key={p} value={p}>{p}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.province && <p className="text-xs text-destructive mt-1">{errors.province.message}</p>}
                      </div>
                    </div>
                    {deliveryAddressComplete && !addressConfirmed && (
                      <button
                        type="button"
                        disabled={geochecking}
                        onClick={async () => {
                          setGeochecking(true)
                          try {
                            const res = await queryTumiraCheckAddress(watchedAddress, watchedCity)
                            const result = res.data
                            if (!result.needs_pin_drop) {
                              setPinLat(result.lat)
                              setPinLng(result.lng)
                              setAddressConfirmed(true)
                            } else {
                              if (result.lat && result.lng) {
                                preCentreRef.current = { lat: result.lat, lng: result.lng }
                              }
                              setPinModalOpen(true)
                            }
                          } catch {
                            setPinModalOpen(true)
                          } finally {
                            setGeochecking(false)
                          }
                        }}
                        className="mt-2 w-full rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 disabled:opacity-60 flex items-center justify-center gap-2"
                      >
                        {geochecking ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Checking...</> : "Confirm your delivery location →"}
                      </button>
                    )}
                  </div>
                  )}
                </section>
              )}

              {/* Delivery Courier — fires when all address fields filled */}
              {fulfillment === "delivery" && (
                <section className="rounded-xl p-5 space-y-3">
                  {!selectedCourier && (
                    <div className="flex items-center justify-between">
                      <h2 className="font-semibold">Delivery Options {doorToDoorCouriers.length > 0 && <span className="text-muted-foreground font-normal text-sm">({doorToDoorCouriers.length})</span>}</h2>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Shield className="w-3 h-3" /> Powered by Tumira
                      </span>
                    </div>
                  )}
                  {!deliveryAddressComplete ? (
                    <p className="text-xs text-muted-foreground">Fill in your address above to see delivery options.</p>
                  ) : !addressConfirmed ? (
                    <p className="text-xs text-muted-foreground">Confirm your delivery location above to see options.</p>
                  ) : ratesFetching ? (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Getting rates...
                    </div>
                  ) : ratesError ? (
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground">Could not fetch delivery rates. Please try again.</p>
                      <button
                        type="button"
                        onClick={() => setAddressConfirmed(false)}
                        className="text-xs font-medium text-primary hover:underline"
                      >
                        Try Again
                      </button>
                    </div>
                  ) : noDoorToDoor ? (
                    <div className="space-y-3">
                      <p className="text-xs text-muted-foreground">
                        No door-to-door delivery available for <span className="font-medium text-foreground">{watchedCity}</span>.
                        {nearbyHubs.length > 0
                          ? ` Select a nearby pickup hub to collect your order.`
                          : ` No pickup hubs available near you at this time.`}
                      </p>
                      {nearbyHubs.length > 0 && (
                        <div className="space-y-1">
                          {nearbyHubs.map((hub) => (
                            <button
                              key={hub.id}
                              type="button"
                              onClick={() => {
                                setSelectedLocationId(hub.id)
                                setFulfillment("click_collect")
                                setSelectedCourierId("")
                              }}
                              className="w-full text-left rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <div>
                                  <p className="text-sm font-medium">{hub.name}</p>
                                  <p className="text-xs text-muted-foreground">{hub.address}, {hub.city}</p>
                                  <p className="text-xs text-primary font-medium">{hub.courier_name}</p>
                                </div>
                                <span className="text-sm font-semibold shrink-0">{centsToDollars(hub.rate)}</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : addressConfirmed && deliveryCouriers.length === 0 ? (
                    <div className="space-y-3">
                      <p className="text-xs text-muted-foreground">No delivery options available for your area.</p>
                      <button
                        type="button"
                        onClick={() => setAddressConfirmed(false)}
                        className="text-xs font-medium text-primary hover:underline"
                      >
                        Try Again
                      </button>
                      <div className="rounded-lg border border-dashed p-3 space-y-1.5">
                        <p className="text-xs font-medium">Try Click &amp; Collect instead</p>
                        <p className="text-xs text-muted-foreground">Pick up your order from a Tumira hub near you.</p>
                        <button
                          type="button"
                          onClick={() => { setFulfillment("click_collect"); setSelectedCourierId("") }}
                          className="text-xs font-medium text-primary hover:underline"
                        >
                          Select a pickup point →
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {/* Search — hidden when courier selected */}
                      {!selectedCourier && (
                        <input
                          type="text"
                          placeholder="Search couriers..."
                          value={courierSearch}
                          onChange={(e) => setCourierSearch(e.target.value)}
                          className="w-full border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                      )}
                      {/* Selected badge */}
                      {selectedCourier && (() => {
                        return (
                          <div className="rounded-lg bg-primary/5 border border-primary px-3 py-3 space-y-1">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium">{selectedCourier.courier_name}</p>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold">{centsToDollars(selectedCourier.price_cents)}</span>
                                <button type="button" onClick={() => setSelectedCourierId("")} className="text-xs text-muted-foreground hover:text-foreground">Change</button>
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground">{SERVICE_TYPE_LABELS[selectedCourier.service_type] ?? ""}</p>
                          </div>
                        )
                      })()}
                      {/* Scrollable list — hidden once selected */}
                      {!selectedCourier && (
                        <div className="space-y-1 pr-1">
                          {(() => {
                            const filtered = doorToDoorCouriers.filter((c) =>
                              courierSearch === "" || c.courier_name.toLowerCase().includes(courierSearch.toLowerCase())
                            )
                            if (filtered.length === 0) {
                              return (
                                <div className="flex items-center justify-center py-6 text-sm text-muted-foreground">
                                  No couriers match &ldquo;{courierSearch}&rdquo;
                                </div>
                              )
                            }
                            return filtered.map((courier) => (
                                <button
                                  key={courier.courier_id}
                                  type="button"
                                  onClick={() => { setSelectedCourierId(courier.courier_id); setCourierSearch("") }}
                                  className={`w-full text-left rounded-lg p-3 transition-colors border ${selectedCourierId === courier.courier_id ? "border-primary bg-primary/5" : "border-transparent hover:bg-muted/50 hover:border-border"}`}
                                >
                                  <div className="flex items-start justify-between gap-2">
                                    <div>
                                      <p className="font-semibold text-sm">{courier.courier_name}</p>
                                      <p className="text-xs text-muted-foreground">{SERVICE_TYPE_LABELS[courier.service_type] ?? ""}</p>
                                    </div>
                                    <span className="text-sm font-semibold shrink-0">{centsToDollars(courier.price_cents)}</span>
                                  </div>
                                </button>
                              ))
                          })()}
                        </div>
                      )}
                    </div>
                  )}
                </section>
              )}

              {/* Contact */}
              <section className="rounded-xl p-5 space-y-4">
                <h2 className="font-semibold">Contact Details</h2>
                <div className="grid gap-4">
                  <div>
                    <label className="text-sm font-medium block mb-1">Phone Number</label>
                    <input
                      {...register("phone", {
                        required: "Phone is required",
                        pattern: { value: /^[\d+\s-]{7,18}$/, message: "Enter a valid phone number" },
                      })}
                      placeholder="+263 77 123 4567"
                      className="w-full border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                    {errors.phone && <p className="text-xs text-destructive mt-1">{errors.phone.message}</p>}
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-1">Email <span className="text-muted-foreground">(for receipt)</span></label>
                    <input
                      {...register("email")}
                      type="email"
                      placeholder="you@example.com"
                      className="w-full border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                </div>
              </section>

              {/* Payment Method */}
              <section className="rounded-xl p-5 space-y-4">
                <h2 className="font-semibold">Payment Method</h2>
                <div className="grid grid-cols-3 gap-3">
                  {PAYMENT_METHODS.map((pm) => {
                    const Icon = pm.icon
                    const active = method === pm.value
                    return (
                      <button
                        key={pm.value || "web"}
                        type="button"
                        onClick={() => setValue("method", pm.value)}
                        className={`relative rounded-xl border-2 p-4 text-left transition-colors ${
                          active ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                        }`}
                      >
                        {active && (
                          <span className="absolute top-2 right-2 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                            <Check className="w-2.5 h-2.5 text-white" />
                          </span>
                        )}
                        <Icon className="w-5 h-5 mb-2 text-muted-foreground" />
                        <p className="font-semibold text-sm">{pm.label}</p>
                        <p className="text-xs text-muted-foreground">{pm.description}</p>
                      </button>
                    )
                  })}
                </div>
                {method === "ecocash" && (
                  <p className="text-xs text-muted-foreground">A payment prompt will be sent to the phone number you entered above.</p>
                )}
              </section>

            </div>

            {/* ── Right: Order Summary ── */}
            <div className="sticky top-20">
              <div className="border rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b bg-muted/30">
                  <h2 className="font-semibold">Order Summary</h2>
                </div>
                <div className="divide-y max-h-96 overflow-y-auto">
                  {items.map((item) => (
                    <div key={`${item.product_id}-${item.sku}`} className="flex gap-3 p-4">
                      <div className="relative w-12 h-12 rounded-lg border bg-white overflow-hidden shrink-0">
                        {item.image_src ? (
                          <Image src={item.image_src} alt={item.product_name} fill sizes="48px" className="object-contain p-1" />
                        ) : (
                          <div className="w-full h-full bg-muted/30" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0 space-y-1">
                        <p className="text-sm font-medium capitalize truncate">{item.product_name}</p>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => item.quantity > 1
                              ? updateMutation.mutate({ product_id: item.product_id, quantity: item.quantity - 1, sku: item.sku })
                              : removeMutation.mutate({ product_id: item.product_id, sku: item.sku })
                            }
                            className="w-6 h-6 rounded-full border flex items-center justify-center hover:bg-muted transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-medium w-4 text-center">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateMutation.mutate({ product_id: item.product_id, quantity: item.quantity + 1, sku: item.sku })}
                            className="w-6 h-6 rounded-full border flex items-center justify-center hover:bg-muted transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeMutation.mutate({ product_id: item.product_id, sku: item.sku })}
                            className="ml-1 text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm font-semibold shrink-0">{centsToDollars(item.unit_price * item.quantity)}</p>
                    </div>
                  ))}
                </div>
                <div className="px-5 py-4 border-t space-y-2">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Subtotal</span>
                    <span>{centsToDollars(subtotalCents)}</span>
                  </div>
                  {needsTumira && tumiraFee > 0 && (
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Shield className="w-3 h-3" />
                        {selectedTumira ? `${selectedTumira.courier_name} pickup fee` : "Tumira pickup fee"}
                      </span>
                      <span>{centsToDollars(tumiraFee)}</span>
                    </div>
                  )}
                  {fulfillment === "delivery" && deliveryFee > 0 && (
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Shield className="w-3 h-3" />
                        {selectedCourier ? `${selectedCourier.courier_name} delivery fee` : "Delivery fee"}
                      </span>
                      <span>{centsToDollars(deliveryFee)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-base pt-1 border-t">
                    <span>Total</span>
                    <span>{centsToDollars(subtotalCents + (needsTumira ? tumiraFee : 0) + (fulfillment === "delivery" ? deliveryFee : 0))}</span>
                  </div>
                </div>
                <div className="px-5 pb-5">
                  <button
                    type="submit"
                    disabled={checkoutMutation.isPending || items.length === 0 || (needsTumira && (pickupLocations.length > 0 || needsTumira) && !selectedLocationId) || (fulfillment === "delivery" && !selectedCourierId)}
                    className="flex items-center justify-center gap-2 w-full bg-primary hover:bg-primary/90 disabled:opacity-60 text-primary-foreground font-semibold text-sm py-3 rounded-full transition-colors"
                  >
                    {checkoutMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
                    Place Order · {centsToDollars(subtotalCents + (needsTumira ? tumiraFee : 0) + (fulfillment === "delivery" ? deliveryFee : 0))}
                  </button>
                </div>
              </div>
            </div>

          </div>
        </form>
      </div>

      {/* ── Pin Drop Modal ── */}
      {pinModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-background rounded-xl w-full max-w-lg shadow-xl overflow-hidden">
            <div className="px-5 py-4 border-b flex items-center justify-between">
              <div>
                <p className="font-semibold text-sm">Confirm your delivery location</p>
                <p className="text-xs text-muted-foreground mt-0.5">Move the pin to your exact address, then confirm</p>
              </div>
              <button type="button" onClick={() => setPinModalOpen(false)} className="text-muted-foreground hover:text-foreground text-lg leading-none">✕</button>
            </div>
            <div ref={mapRef} className="w-full h-72 bg-muted/30" />
            <div className="px-5 py-4 flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setPinModalOpen(false)}
                className="text-sm px-4 py-2 rounded-lg border hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={confirmingPin}
                onClick={async () => {
                  if (!pendingPinRef.current) return
                  const { lat, lng } = pendingPinRef.current
                  setConfirmingPin(true)
                  try {
                    await queryTumiraConfirmPin({ address: watchedAddress, city: watchedCity, lat, lng })
                  } catch {
                    // save failed — still proceed with rates using confirmed coords
                  } finally {
                    setConfirmingPin(false)
                  }
                  setPinLat(lat)
                  setPinLng(lng)
                  setAddressConfirmed(true)
                  setPinModalOpen(false)
                }}
                className="text-sm px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium disabled:opacity-60 flex items-center gap-2"
              >
                {confirmingPin ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...</> : "Confirm Location"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
