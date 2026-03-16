import { redirect } from "next/navigation"
import { SubscriptionCallback } from "@/components/structures/subscription-callback"
import { retrieveUser } from "@/lib/actions"

export const metadata = {
  title: 'Subscription Status | farmnport.com',
  description: 'Check your subscription payment status.',
}

export default async function SubscriptionCallbackPage() {
  if (process.env.NEXT_PUBLIC_ENABLE_PAYWALL !== "true") {
    redirect("/buyers")
  }

  const user = await retrieveUser()

  return (
    <main className="min-h-[70lvh] flex items-center justify-center px-6 py-12">
      <SubscriptionCallback user={user} />
    </main>
  )
}
