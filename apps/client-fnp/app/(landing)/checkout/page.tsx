"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { Check, Loader2, ShoppingCart, CreditCard, Smartphone, Globe } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

import { getCart, checkout, pollOrderStatus, queryClient as fetchClient } from "@/lib/query"
import { AuthenticatedUser } from "@/lib/schemas"
import { centsToDollars } from "@/lib/utilities"

const PAYMENT_METHODS = [
  { value: "ecocash", label: "EcoCash",          description: "Mobile money prompt to your phone",  icon: Smartphone },
  { value: "vmc",     label: "Visa / Mastercard", description: "Pay securely online with your card", icon: CreditCard },
  { value: "",        label: "PayNow Web",         description: "Choose your method on PayNow",       icon: Globe },
]

interface CheckoutForm {
  phone: string
  email: string
  provider: string
  method: string
}

interface CartItem {
  product_id: string
  product_type: string
  product_name: string
  product_slug: string
  image_src: string
  unit_price: number
  quantity: number
  fulfillment?: {
    delivery_available: boolean
    pickup_locations?: { id: string; name: string; address: string; city: string; time_slots?: string[] }[]
  }
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
  const subtotalCents = items.reduce((s, i) => s + (i.unit_price * i.quantity), 0)

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
      fulfillment: "click_collect",
      collection_location_id: selectedLocationId || undefined,
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
          <p className="text-sm text-muted-foreground">Bring your QR code to the collection point to pick up your order.</p>
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

              {/* Collection Points */}
              {pickupLocations.length > 0 && (
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
                <div className="divide-y max-h-64 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.product_id} className="flex gap-3 p-4">
                      <div className="relative w-12 h-12 rounded-lg border bg-white overflow-hidden shrink-0">
                        {item.image_src ? (
                          <Image src={item.image_src} alt={item.product_name} fill sizes="48px" className="object-contain p-1" />
                        ) : (
                          <div className="w-full h-full bg-muted/30" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium capitalize truncate">{item.product_name}</p>
                        <p className="text-xs text-muted-foreground">Qty {item.quantity}</p>
                      </div>
                      <p className="text-sm font-semibold shrink-0">{centsToDollars(item.unit_price * item.quantity)}</p>
                    </div>
                  ))}
                </div>
                <div className="px-5 py-4 border-t">
                  <div className="flex justify-between font-bold text-base">
                    <span>Total</span>
                    <span>{centsToDollars(subtotalCents)}</span>
                  </div>
                </div>
                <div className="px-5 pb-5">
                  <button
                    type="submit"
                    disabled={checkoutMutation.isPending || items.length === 0 || (pickupLocations.length > 0 && !selectedLocationId)}
                    className="flex items-center justify-center gap-2 w-full bg-primary hover:bg-primary/90 disabled:opacity-60 text-primary-foreground font-semibold text-sm py-3 rounded-full transition-colors"
                  >
                    {checkoutMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
                    Place Order · {centsToDollars(subtotalCents)}
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
