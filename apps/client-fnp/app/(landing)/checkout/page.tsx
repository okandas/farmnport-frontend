"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { Check, Loader2, ShoppingCart, CreditCard, Smartphone, Globe, Truck, Store, Minus, Plus, Trash2, Shield, MapPin, ChevronDown } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

import { getCart, checkout, pollOrderStatus, queryClient as fetchClient, updateCartItem, removeFromCart, queryTumira } from "@/lib/query"
import { AuthenticatedUser } from "@/lib/schemas"
import { centsToDollars } from "@/lib/utilities"

const PAYMENT_METHODS = [
  { value: "ecocash", label: "EcoCash",          description: "Mobile money prompt to your phone",  icon: Smartphone },
  { value: "vmc",     label: "Visa / Mastercard", description: "Pay securely online with your card", icon: CreditCard },
  { value: "",        label: "PayNow Web",         description: "Choose your method on PayNow",       icon: Globe },
]

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
  address_line: string
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
  fulfillment?: {
    delivery_available: boolean
    pickup_available: boolean
    pickup_locations?: { id: string; name: string; address: string; city: string; time_slots?: string[] }[]
  }
}

interface Tumira {
  id: string
  name: string
  address: string
  city: string
  time_slots?: string[]
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
  const [tumiraOpen, setTumiraOpen] = useState(false)
  const [fulfillment, setFulfillment] = useState<"click_collect" | "delivery">("click_collect")

  const TUMIRA_FEE = 500 // cents — replace with real Tumira rate when API is integrated
  const [step, setStep] = useState<"form" | "waiting" | "success">("form")

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
  }, [profileData, user, setValue])

  const method = watch("method")

  const { data: cartData, isLoading: cartLoading } = useQuery({
    queryKey: ["cart"],
    queryFn: () => getCart().then((r) => r.data as Cart),
    enabled: !!session,
  })

  const items: CartItem[] = cartData?.items ?? []
  const pickupLocations = items
    .flatMap((i) => i.fulfillment?.pickup_locations ?? [])
    .filter((loc, idx, arr) => arr.findIndex((l) => l.id === loc.id) === idx)
  const deliveryAvailable = items.every((i) => i.fulfillment?.delivery_available)
  const subtotalCents = items.reduce((s, i) => s + (i.unit_price * i.quantity), 0)

  // Tumira hubs — shown when cart has pickup_available items but no static pickup locations
  const needsTumira = items.some((i) => i.fulfillment?.pickup_available) && pickupLocations.length === 0
  const { data: tumiraData } = useQuery({
    queryKey: ["tumira-locations"],
    queryFn: () => queryTumira().then((r) => r.data?.locations as Tumira[]),
    enabled: needsTumira,
  })
  const tumiraLocations: Tumira[] = tumiraData ?? []

  useEffect(() => {
    if (pickupLocations.length === 1 && !selectedLocationId) {
      setSelectedLocationId(pickupLocations[0].id)
    }
  }, [pickupLocations.length])

  const checkoutMutation = useMutation({
    mutationFn: checkout,
    onSuccess: (res) => {
      const data = res.data as CheckoutResponse
      setOrderNumber(data.order_number)
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
          setStep("success")
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
      collection_location_id: fulfillment === "click_collect" ? selectedLocationId || undefined : undefined,
      address: fulfillment === "delivery" ? {
        name: data.address_name,
        phone: data.phone,
        address: data.address_line,
        city: data.city,
        province: data.province,
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
                <section className="border rounded-xl p-5 space-y-3">
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
                          onClick={() => setFulfillment(opt.value)}
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
              {fulfillment === "click_collect" && needsTumira && tumiraLocations.length > 0 && (() => {
                const selected = tumiraLocations.find((l) => l.id === selectedLocationId)
                const filtered = tumiraLocations.filter((l) =>
                  tumiraSearch === "" ||
                  l.name.toLowerCase().includes(tumiraSearch.toLowerCase()) ||
                  l.city.toLowerCase().includes(tumiraSearch.toLowerCase())
                )
                return (
                  <section className="border rounded-xl p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <h2 className="font-semibold">Collection Point</h2>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Shield className="w-3 h-3" /> Powered by Tumira
                      </span>
                    </div>

                    {/* Badge */}
                    <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2">
                      <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
                      <span className="text-sm">
                        {selected
                          ? <span className="font-medium">{selected.name} — {selected.city}</span>
                          : <span className="text-muted-foreground">{tumiraLocations.length} pickup locations available</span>
                        }
                      </span>
                      {selected && (
                        <button
                          type="button"
                          onClick={() => { setSelectedLocationId(""); setTumiraSearch(""); setTumiraOpen(false) }}
                          className="ml-auto text-xs text-muted-foreground hover:text-foreground"
                        >
                          Change
                        </button>
                      )}
                    </div>

                    {/* Searchable dropdown */}
                    {!selected && (
                      <div className="relative">
                        <div className="flex items-center border rounded-lg px-3 py-2 gap-2 focus-within:ring-2 focus-within:ring-ring">
                          <input
                            type="text"
                            placeholder="Search locations..."
                            value={tumiraSearch}
                            onChange={(e) => { setTumiraSearch(e.target.value); setTumiraOpen(true) }}
                            onFocus={() => setTumiraOpen(true)}
                            className="flex-1 text-sm bg-transparent outline-none"
                          />
                          <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                        </div>
                        {tumiraOpen && (
                          <div className="absolute z-10 mt-1 w-full border rounded-lg bg-background shadow-md overflow-hidden">
                            {filtered.length === 0 ? (
                              <p className="px-4 py-3 text-sm text-muted-foreground">No locations found</p>
                            ) : (
                              filtered.map((loc) => (
                                <button
                                  key={loc.id}
                                  type="button"
                                  onClick={() => { setSelectedLocationId(loc.id); setTumiraOpen(false); setTumiraSearch("") }}
                                  className="w-full text-left px-4 py-3 hover:bg-muted/50 transition-colors border-b last:border-b-0"
                                >
                                  <p className="text-sm font-medium">{loc.name}</p>
                                  <p className="text-xs text-muted-foreground">{loc.address}, {loc.city}</p>
                                  {loc.time_slots && loc.time_slots.length > 0 && (
                                    <p className="text-xs text-muted-foreground">{loc.time_slots.join(" · ")}</p>
                                  )}
                                </button>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </section>
                )
              })()}

              {/* Static Collection Points */}
              {fulfillment === "click_collect" && pickupLocations.length > 0 && (
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
                <section className="border rounded-xl p-5 space-y-4">
                  <h2 className="font-semibold">Delivery Address</h2>
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
                      <label className="text-sm font-medium block mb-1">Street Address</label>
                      <input
                        {...register("address_line", { required: fulfillment === "delivery" ? "Address is required" : false })}
                        placeholder="123 Main Street"
                        className="w-full border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                      {errors.address_line && <p className="text-xs text-destructive mt-1">{errors.address_line.message}</p>}
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
                        <select
                          {...register("province", { required: fulfillment === "delivery" ? "Province is required" : false })}
                          className="w-full border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                        >
                          <option value="">Select...</option>
                          {PROVINCES.map((p) => (
                            <option key={p} value={p}>{p}</option>
                          ))}
                        </select>
                        {errors.province && <p className="text-xs text-destructive mt-1">{errors.province.message}</p>}
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {/* Contact */}
              <section className="border rounded-xl p-5 space-y-4">
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
              <section className="border rounded-xl p-5 space-y-4">
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
                  {needsTumira && (
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> Tumira pickup fee</span>
                      <span>{centsToDollars(TUMIRA_FEE)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-base pt-1 border-t">
                    <span>Total</span>
                    <span>{centsToDollars(subtotalCents + (needsTumira ? TUMIRA_FEE : 0))}</span>
                  </div>
                </div>
                <div className="px-5 pb-5">
                  <button
                    type="submit"
                    disabled={checkoutMutation.isPending || items.length === 0 || (fulfillment === "click_collect" && (pickupLocations.length > 0 || needsTumira) && !selectedLocationId)}
                    className="flex items-center justify-center gap-2 w-full bg-primary hover:bg-primary/90 disabled:opacity-60 text-primary-foreground font-semibold text-sm py-3 rounded-full transition-colors"
                  >
                    {checkoutMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
                    Place Order · {centsToDollars(subtotalCents + (needsTumira ? TUMIRA_FEE : 0))}
                  </button>
                </div>
              </div>
            </div>

          </div>
        </form>
      </div>
    </div>
  )
}
