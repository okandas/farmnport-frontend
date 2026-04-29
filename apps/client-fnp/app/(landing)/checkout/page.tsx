"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { Check, Loader2, ShoppingCart, Truck, Store, CreditCard } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

import { getCart, checkout, pollOrderStatus } from "@/lib/query"
import { AuthenticatedUser } from "@/lib/schemas"

const PROVINCES = [
  "Harare", "Bulawayo", "Manicaland", "Mashonaland Central",
  "Mashonaland East", "Mashonaland West", "Masvingo",
  "Matabeleland North", "Matabeleland South", "Midlands",
]

interface CheckoutForm {
  fulfillment: "delivery" | "click_collect"
  phone: string
  email: string
  address_name: string
  address_line: string
  city: string
  province: string
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
  const [billPayInstructions, setBillPayInstructions] = useState("")
  const [step, setStep] = useState<"form" | "waiting" | "success">("form")

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<CheckoutForm>({
    defaultValues: {
      fulfillment: "delivery",
      provider: "billpay",
      method: "ecocash",
    },
  })

  const fulfillment = watch("fulfillment")
  const provider = watch("provider")

  const { data: cartData, isLoading: cartLoading } = useQuery({
    queryKey: ["cart"],
    queryFn: () => getCart().then((r) => r.data as Cart),
    enabled: !!session,
  })

  const items: CartItem[] = cartData?.items ?? []
  const subtotal = items.reduce((s, i) => s + i.unit_price * i.quantity, 0)
  const deliveryFee = fulfillment === "click_collect" ? 0 : subtotal >= 50 ? 0 : items.length > 0 ? 5 : 0
  const total = subtotal + deliveryFee

  const checkoutMutation = useMutation({
    mutationFn: checkout,
    onSuccess: (res) => {
      const data = res.data as CheckoutResponse
      setOrderNumber(data.order_number)
      setPollRef(data.reference)
      qc.invalidateQueries({ queryKey: ["cart"] })

      if (data.redirect_url && data.redirect_url.startsWith("http")) {
        // Paynow web — open in new tab and poll
        window.open(data.redirect_url, "_blank")
        setStep("waiting")
        setPolling(true)
      } else {
        // BillPay — show instructions
        setBillPayInstructions(data.instructions || "Visit a BillPay kiosk and use the reference number below.")
        setStep("waiting")
        setPolling(true)
      }
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Checkout failed. Please try again.")
    },
  })

  // Poll for payment status
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
    const payload: any = {
      provider: data.provider,
      method: data.method,
      phone: data.phone,
      email: data.email || user?.email || "",
      fulfillment: data.fulfillment,
      order_type: "retail",
    }
    if (data.fulfillment === "delivery") {
      payload.address = {
        name: data.address_name,
        phone: data.phone,
        address: data.address_line,
        city: data.city,
        province: data.province,
      }
    }
    checkoutMutation.mutate(payload)
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <ShoppingCart className="w-12 h-12 mx-auto text-muted-foreground/40" />
          <p className="font-semibold">Sign in to checkout</p>
          <Link
            href="/login?next=/checkout"
            className="inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold px-6 py-2.5 hover:bg-primary/90 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    )
  }

  if (items.length === 0 && step === "form") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <ShoppingCart className="w-12 h-12 mx-auto text-muted-foreground/40" />
          <p className="font-semibold">Your cart is empty</p>
          <Link
            href="/buy-agrochemicals"
            className="inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold px-6 py-2.5 hover:bg-primary/90 transition-colors"
          >
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
          <p className="text-sm text-muted-foreground">
            We&apos;ll prepare your order and be in touch with delivery details.
          </p>
          <div className="flex flex-col gap-3">
            <Link
              href="/account/orders"
              className="block w-full text-center bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm py-3 rounded-full transition-colors"
            >
              View My Orders
            </Link>
            <Link
              href="/buy-agrochemicals"
              className="block w-full text-center border hover:bg-muted text-sm font-medium py-3 rounded-full transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (step === "waiting") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-6">
          {polling && (
            <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" />
          )}
          <div>
            <h1 className="text-xl font-bold">Complete Your Payment</h1>
            <p className="text-muted-foreground mt-1 text-sm">Order <span className="font-semibold text-foreground">{orderNumber}</span></p>
          </div>
          {billPayInstructions && (
            <div className="bg-muted rounded-xl p-4 text-left text-sm space-y-2">
              <p className="font-semibold">BillPay Instructions</p>
              <p className="text-muted-foreground">{billPayInstructions}</p>
              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground">Reference</p>
                <p className="font-mono font-bold text-base">{pollRef}</p>
              </div>
              <div className="border-t pt-2">
                <p className="font-semibold text-lg">${total.toFixed(2)}</p>
              </div>
            </div>
          )}
          <p className="text-xs text-muted-foreground">Waiting for payment confirmation{polling ? "..." : ""}</p>
          <button
            onClick={() => router.push("/orders")}
            className="block w-full text-center border hover:bg-muted text-sm font-medium py-3 rounded-full transition-colors"
          >
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
            <Link href="/" className="hover:text-foreground">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-foreground">Checkout</span>
          </nav>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-8">Checkout</h1>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid lg:grid-cols-[1fr_360px] gap-8 items-start">

            {/* ── Left: Form ── */}
            <div className="space-y-6">

              {/* Fulfillment */}
              <section className="border rounded-xl p-5 space-y-4">
                <h2 className="font-semibold">Delivery Method</h2>
                <div className="grid grid-cols-2 gap-3">
                  {(["delivery", "click_collect"] as const).map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setValue("fulfillment", opt)}
                      className={`relative rounded-xl border-2 p-4 text-left transition-colors ${
                        fulfillment === opt ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                      }`}
                    >
                      {fulfillment === opt && (
                        <span className="absolute top-2 right-2 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 text-white" />
                        </span>
                      )}
                      {opt === "delivery" ? (
                        <>
                          <Truck className="w-5 h-5 mb-2 text-muted-foreground" />
                          <p className="font-semibold text-sm">Delivery</p>
                          <p className="text-xs text-muted-foreground">To your address</p>
                        </>
                      ) : (
                        <>
                          <Store className="w-5 h-5 mb-2 text-muted-foreground" />
                          <p className="font-semibold text-sm">Pickup</p>
                          <p className="text-xs text-muted-foreground">Collect in person</p>
                        </>
                      )}
                    </button>
                  ))}
                </div>
              </section>

              {/* Delivery address */}
              {fulfillment === "delivery" && (
                <section className="border rounded-xl p-5 space-y-4">
                  <h2 className="font-semibold">Delivery Address</h2>
                  <div className="grid gap-4">
                    <div>
                      <label className="text-sm font-medium block mb-1">Full Name</label>
                      <input
                        {...register("address_name", { required: "Name is required" })}
                        placeholder="Your name"
                        className="w-full border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                      {errors.address_name && <p className="text-xs text-destructive mt-1">{errors.address_name.message}</p>}
                    </div>
                    <div>
                      <label className="text-sm font-medium block mb-1">Street Address</label>
                      <input
                        {...register("address_line", { required: "Address is required" })}
                        placeholder="123 Main Street"
                        className="w-full border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                      {errors.address_line && <p className="text-xs text-destructive mt-1">{errors.address_line.message}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm font-medium block mb-1">City / Town</label>
                        <input
                          {...register("city", { required: "City is required" })}
                          placeholder="Harare"
                          className="w-full border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                        {errors.city && <p className="text-xs text-destructive mt-1">{errors.city.message}</p>}
                      </div>
                      <div>
                        <label className="text-sm font-medium block mb-1">Province</label>
                        <select
                          {...register("province", { required: "Province is required" })}
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
                      defaultValue={user?.email ?? ""}
                      className="w-full border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                </div>
              </section>

              {/* Payment */}
              <section className="border rounded-xl p-5 space-y-4">
                <h2 className="font-semibold">Payment Method</h2>
                <div className="flex items-center gap-3 rounded-xl border-2 border-primary bg-primary/5 p-4">
                  <span className="text-2xl shrink-0">🏧</span>
                  <div>
                    <p className="font-semibold text-sm">BillPay Kiosk</p>
                    <p className="text-xs text-muted-foreground">Pay at any BillPay kiosk using your reference number</p>
                  </div>
                </div>
              </section>
            </div>

            {/* ── Right: Order summary ── */}
            <div className="sticky top-20">
              <div className="border rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b bg-muted/30">
                  <h2 className="font-semibold">Order Summary</h2>
                </div>

                {/* Items */}
                <div className="divide-y max-h-64 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.product_id} className="flex gap-3 p-4">
                      <div className="relative w-12 h-12 rounded-lg border bg-white overflow-hidden shrink-0">
                        {item.image_src ? (
                          <Image src={item.image_src} alt={item.product_name} fill sizes="48px" className="object-contain p-1" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground/20 text-lg">📦</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium capitalize truncate">{item.product_name}</p>
                        <p className="text-xs text-muted-foreground">Qty {item.quantity}</p>
                      </div>
                      <p className="text-sm font-semibold shrink-0">${(item.unit_price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="px-5 py-4 border-t space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Delivery</span>
                    <span>
                      {deliveryFee === 0 ? (
                        <span className="text-green-700 dark:text-green-400">
                          {fulfillment === "click_collect" ? "Pickup" : "Free"}
                        </span>
                      ) : (
                        `$${deliveryFee.toFixed(2)}`
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold text-base border-t pt-2">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>

                {/* CTA */}
                <div className="px-5 pb-5">
                  <button
                    type="submit"
                    disabled={checkoutMutation.isPending || items.length === 0}
                    className="flex items-center justify-center gap-2 w-full bg-primary hover:bg-primary/90 disabled:opacity-60 text-primary-foreground font-semibold text-sm py-3 rounded-full transition-colors"
                  >
                    {checkoutMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CreditCard className="w-4 h-4" />
                    )}
                    Place Order · ${total.toFixed(2)}
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
