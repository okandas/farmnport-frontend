"use client"

import { useCallback } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { sendGTMEvent } from '@next/third-parties/google'
import { Button } from "@/components/ui/button"
import { Mail } from "lucide-react"
import { AuthenticatedUser } from "@/lib/schemas"

interface ContactBuyerButtonProps {
  user: AuthenticatedUser | null
  clientName: string
  clientId: string
}

export function ContactBuyerButton({ user, clientName, clientId }: ContactBuyerButtonProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Create query string
  const createQueryString = useCallback(
    (params: Record<string, string | number | null>) => {
      const newSearchParams = new URLSearchParams(searchParams?.toString())

      for (const [key, value] of Object.entries(params)) {
        if (value === null) {
          newSearchParams.delete(key)
        } else {
          newSearchParams.set(key, String(value))
        }
      }

      return newSearchParams.toString()
    },
    [searchParams]
  )

  const handleContactClick = () => {
    if (!user) {
      // User not logged in - redirect to login
      const queryString = createQueryString({
        'entity': 'buyer',
        'wantToContact': clientId
      })
      sendGTMEvent({ event: 'action', value: 'LoggedOutContactBuyer' })
      router.push(`/login?${queryString}`)
    } else {
      // User is logged in - check if paid (implement your paid user check logic)
      // For now, we'll assume user needs to be paid to contact
      // TODO: Add actual paid user check
      const isPaidUser = false // Replace with actual check from user object

      if (!isPaidUser) {
        sendGTMEvent({ event: 'action', value: 'UnpaidUserContactAttempt' })
        router.push('/pricing') // Redirect to pricing/subscription page
      } else {
        sendGTMEvent({ event: 'action', value: 'PaidUserContactBuyer' })
        // Show contact information or open contact modal
        // TODO: Implement contact functionality
        alert(`Contact information for ${clientName} will be shown here.`)
      }
    }
  }

  return (
    <Button
      onClick={handleContactClick}
      variant="default"
      size="sm"
      className="flex items-center gap-2"
    >
      <Mail className="h-4 w-4" />
      Contact Buyer
    </Button>
  )
}
