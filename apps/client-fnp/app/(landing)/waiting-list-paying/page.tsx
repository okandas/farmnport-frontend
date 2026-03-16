import { WaitingListPayingClient } from "@/components/structures/waiting-list-paying-client"
import { retrieveUser, retrieveToken } from "@/lib/actions"
import { BaseURL } from "@/lib/schemas"

export const metadata = {
  title: 'Join the Waiting List – Premium Access Coming Soon | farmnport.com',
  description: `Be the first to know when premium features launch. Join our waiting list to access buyer contact information and unlock exclusive farming marketplace benefits.`,
  alternates: {
    canonical: `/waiting-list-paying`,
  },
  robots: {
    index: false,
    follow: false,
  },
}

export default async function WaitingListPayingPage() {
  const user = await retrieveUser()
  let wantToPay = user?.want_to_pay || false

  if (user) {
    try {
      const token = await retrieveToken()
      const res = await fetch(`${BaseURL}/client/aggregates/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      })
      if (res.ok) {
        const data = await res.json()
        wantToPay = data.want_to_pay || false
      }
    } catch {}
  }

  return (
    <main className="min-h-[70lvh] flex items-center justify-center px-6 py-12">
      <WaitingListPayingClient user={user} wantToPay={wantToPay} />
    </main>
  )
}
