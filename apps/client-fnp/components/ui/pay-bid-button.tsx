"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"
import { initiateBidPayment } from "@/lib/query"

export function PayBidButton({ bidId }: { bidId: string }) {
  const [paying, setPaying] = useState(false)

  return (
    <button
      disabled={paying}
      onClick={async () => {
        setPaying(true)
        try {
          const res = await initiateBidPayment(bidId, {})
          const redirectUrl = res.data?.redirect_url
          if (redirectUrl) window.open(redirectUrl, "_blank")
        } catch {
          // silent
        } finally {
          setPaying(false)
        }
      }}
      className="inline-flex items-center justify-center w-full rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
    >
      {paying ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
      Pay Now
    </button>
  )
}
