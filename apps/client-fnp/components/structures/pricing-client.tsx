"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useMutation } from "@tanstack/react-query"
import { sendGTMEvent } from "@next/third-parties/google"

import { initiateSubscription } from "@/lib/query"
import { AuthenticatedUser } from "@/lib/schemas"
import { Icons } from "@/components/icons/lucide"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface PricingClientProps {
  user: AuthenticatedUser
}

export function PricingClient({ user }: PricingClientProps) {
  const router = useRouter()
  const [method, setMethod] = useState<"ecocash" | "onemoney">("ecocash")
  const [phone, setPhone] = useState("")
  const [error, setError] = useState("")

  const { mutate, isPending } = useMutation({
    mutationFn: initiateSubscription,
    onSuccess: (response) => {
      const data = response.data
      sendGTMEvent({ event: 'action', value: 'SubscriptionInitiated' })

      if (data.redirect_url) {
        // Web checkout - redirect to Paynow
        window.location.href = data.redirect_url
      } else if (data.instructions) {
        // Mobile money - redirect to callback page to poll
        router.push(`/subscription/callback?ref=${data.reference}`)
      } else {
        router.push(`/subscription/callback?ref=${data.reference}`)
      }
    },
    onError: (err: any) => {
      const message = err?.response?.data?.message || "Payment initiation failed. Please try again."
      setError(message)
    },
  })

  function handleSubscribe() {
    setError("")

    if (!user) {
      sendGTMEvent({ event: 'action', value: 'SubscribeRedirectToLogin' })
      router.push("/login?redirect=/pricing")
      return
    }

    if (!phone || phone.length < 10) {
      setError("Please enter a valid phone number (e.g. 0771234567)")
      return
    }

    mutate({
      method,
      phone,
      email: user.email || "",
    })
  }

  if (user?.subscription_active) {
    return (
      <div className="max-w-md w-full">
        <div className="bg-card border rounded-xl p-8 shadow-sm text-center">
          <Icons.check className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">You're Subscribed</h2>
          <p className="text-muted-foreground">
            You have full access to buyer contact information.
          </p>
          <Button className="mt-6" onClick={() => router.push("/buyers")}>
            Browse Buyers
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-md w-full">
      <div className="bg-card border rounded-xl p-8 shadow-sm">
        <div className="text-center mb-6">
          <Icons.lock className="h-10 w-10 text-primary mx-auto mb-3" />
          <h1 className="text-2xl font-bold">Buyer Contacts Access</h1>
          <p className="text-muted-foreground mt-2">
            View buyer contact phone numbers and emails to connect directly with buyers.
          </p>
        </div>

        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-6 text-center">
          <p className="text-3xl font-bold text-primary">$23</p>
          <p className="text-sm text-muted-foreground">per month</p>
        </div>

        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-2">
            <Icons.check className="h-4 w-4 text-green-500 shrink-0" />
            <span className="text-sm">View buyer contact phone numbers</span>
          </div>
          <div className="flex items-center gap-2">
            <Icons.check className="h-4 w-4 text-green-500 shrink-0" />
            <span className="text-sm">View buyer contact email addresses</span>
          </div>
          <div className="flex items-center gap-2">
            <Icons.check className="h-4 w-4 text-green-500 shrink-0" />
            <span className="text-sm">Access all buyer contacts across the platform</span>
          </div>
          <div className="flex items-center gap-2">
            <Icons.check className="h-4 w-4 text-green-500 shrink-0" />
            <span className="text-sm">30 days of unlimited access</span>
          </div>
        </div>

        {user ? (
          <>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">Payment Method</p>
                <div className="flex gap-2">
                  <Button
                    variant={method === "ecocash" ? "default" : "outline"}
                    className="flex-1"
                    onClick={() => setMethod("ecocash")}
                    type="button"
                  >
                    EcoCash
                  </Button>
                  <Button
                    variant={method === "onemoney" ? "default" : "outline"}
                    className="flex-1"
                    onClick={() => setMethod("onemoney")}
                    type="button"
                  >
                    OneMoney
                  </Button>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-2">Phone Number</p>
                <Input
                  type="tel"
                  placeholder="0771234567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  maxLength={15}
                />
              </div>

              {error && (
                <p className="text-sm text-red-500">{error}</p>
              )}

              <Button
                className="w-full"
                onClick={handleSubscribe}
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <Icons.spinner className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Subscribe — $23/month"
                )}
              </Button>
            </div>
          </>
        ) : (
          <Button
            className="w-full"
            onClick={() => {
              sendGTMEvent({ event: 'action', value: 'SubscribeRedirectToLogin' })
              router.push("/login?redirect=/pricing")
            }}
          >
            Login to Subscribe
          </Button>
        )}
      </div>
    </div>
  )
}
