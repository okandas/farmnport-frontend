"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useMutation } from "@tanstack/react-query"

import { pollSubscription } from "@/lib/query"
import { AuthenticatedUser } from "@/lib/schemas"
import { Icons } from "@/components/icons/lucide"
import { Button } from "@/components/ui/button"

interface SubscriptionCallbackProps {
  user: AuthenticatedUser
}

export function SubscriptionCallback({ user }: SubscriptionCallbackProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const reference = searchParams?.get("ref") || ""

  const [status, setStatus] = useState<"polling" | "success" | "pending" | "failed">("polling")
  const [pollCount, setPollCount] = useState(0)

  const { mutate: poll } = useMutation({
    mutationFn: () => pollSubscription(reference),
    onSuccess: (response) => {
      const data = response.data
      if (data.paid || data.subscription_active) {
        setStatus("success")
      } else if (pollCount >= 12) {
        // After ~60 seconds of polling, show pending
        setStatus("pending")
      } else {
        setStatus("polling")
        setPollCount(prev => prev + 1)
      }
    },
    onError: () => {
      setStatus("failed")
    },
  })

  useEffect(() => {
    if (!reference) {
      setStatus("failed")
      return
    }

    // Start polling
    poll()
  }, [reference])

  // Auto-poll every 5 seconds while in polling state
  useEffect(() => {
    if (status !== "polling" || pollCount === 0) return

    const timer = setTimeout(() => {
      poll()
    }, 5000)

    return () => clearTimeout(timer)
  }, [status, pollCount])

  if (status === "success") {
    return (
      <div className="max-w-md w-full">
        <div className="bg-card border rounded-xl p-8 shadow-sm text-center">
          <Icons.check className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Payment Successful</h2>
          <p className="text-muted-foreground mb-6">
            You now have access to buyer contact information for 30 days.
          </p>
          <Button onClick={() => router.push("/buyers")}>
            Browse Buyers
          </Button>
        </div>
      </div>
    )
  }

  if (status === "pending") {
    return (
      <div className="max-w-md w-full">
        <div className="bg-card border rounded-xl p-8 shadow-sm text-center">
          <Icons.spinner className="h-12 w-12 text-yellow-500 mx-auto mb-4 animate-spin" />
          <h2 className="text-2xl font-bold mb-2">Payment Processing</h2>
          <p className="text-muted-foreground mb-4">
            Your payment is still being processed. This can take a few minutes with mobile money.
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            Please check your phone for the EcoCash/OneMoney prompt and approve the payment.
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => { setStatus("polling"); setPollCount(0); poll() }}>
              Check Again
            </Button>
            <Button onClick={() => router.push("/buyers")}>
              Continue Browsing
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (status === "failed") {
    return (
      <div className="max-w-md w-full">
        <div className="bg-card border rounded-xl p-8 shadow-sm text-center">
          <Icons.warning className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Payment Failed</h2>
          <p className="text-muted-foreground mb-6">
            Something went wrong with your payment. Please try again.
          </p>
          <Button onClick={() => router.push("/pricing")}>
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  // Polling state
  return (
    <div className="max-w-md w-full">
      <div className="bg-card border rounded-xl p-8 shadow-sm text-center">
        <Icons.spinner className="h-12 w-12 text-primary mx-auto mb-4 animate-spin" />
        <h2 className="text-2xl font-bold mb-2">Checking Payment</h2>
        <p className="text-muted-foreground">
          Please approve the payment on your phone if prompted...
        </p>
      </div>
    </div>
  )
}
