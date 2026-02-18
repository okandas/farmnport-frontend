"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Check, ShoppingCart, Package, Truck, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AuthenticatedUser } from "@/lib/schemas"
import { sendGTMEvent } from '@next/third-parties/google'
import { updateUserWantToPay } from "@/lib/query"

interface WaitingListShopProps {
  user: AuthenticatedUser | null
}

export function WaitingListShop({ user }: WaitingListShopProps) {
  const router = useRouter()
  const [submitted, setSubmitted] = useState(user?.want_to_pay || false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleJoinWaitingList = async () => {
    if (!user) {
      router.push('/login?redirect=/waiting-list-shop')
      return
    }

    setIsLoading(true)
    setError("")

    try {
      await updateUserWantToPay(true)

      sendGTMEvent({ event: 'action', value: 'JoinedShopWaitingList' })
      setSubmitted(true)
    } catch (err) {
      setError('Something went wrong. Please try again.')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="max-w-md text-center space-y-6">
        <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
          <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
        </div>
        <h1 className="text-3xl font-bold font-heading">You&apos;re on the list!</h1>
        <p className="text-muted-foreground">
          We&apos;ve added you to our shop waiting list. We&apos;ll notify you as soon as online shopping becomes available.
        </p>
        <Button onClick={() => router.push('/buy-agrochemicals')} variant="outline">
          Back to Products
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-lg w-full space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
          <ShoppingCart className="w-4 h-4" />
          Online Shopping Coming Soon
        </div>
        <h1 className="text-4xl md:text-5xl font-bold font-heading tracking-tight">
          Shop Agrochemicals Online
        </h1>
        <p className="text-lg text-muted-foreground max-w-md mx-auto">
          We&apos;re building an online store for agrochemicals. Join the waiting list to be notified when we launch.
        </p>
      </div>

      {/* Benefits */}
      <div className="bg-card border rounded-lg p-6 space-y-3">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center flex-shrink-0">
            <Package className="w-3 h-3 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p className="font-medium">Wide Product Selection</p>
            <p className="text-sm text-muted-foreground">Access to thousands of agrochemical products</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <div className="mt-0.5 w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center flex-shrink-0">
            <Truck className="w-3 h-3 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p className="font-medium">Fast Delivery</p>
            <p className="text-sm text-muted-foreground">Quick shipping directly to your farm</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <div className="mt-0.5 w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center flex-shrink-0">
            <CreditCard className="w-3 h-3 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p className="font-medium">Secure Payment</p>
            <p className="text-sm text-muted-foreground">Safe and convenient payment options</p>
          </div>
        </div>
      </div>

      {/* CTA Button */}
      <div className="space-y-3">
        {error && (
          <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
            {error}
          </div>
        )}
        <Button
          onClick={handleJoinWaitingList}
          size="lg"
          className="w-full h-12 text-base font-medium"
          disabled={isLoading}
        >
          {isLoading ? 'Joining...' : 'Join the Waiting List'}
        </Button>
      </div>

      {/* Footer */}
      <p className="text-center text-xs text-muted-foreground">
        We&apos;ll notify you when online shopping is ready. No commitment required.
      </p>
    </div>
  )
}
