import { WaitingListPayingClient } from "@/components/structures/waiting-list-paying-client"
import { retrieveUser } from "@/lib/actions"

export const metadata = {
  title: 'Join the Waiting List – Premium Access Coming Soon | farmnport.com',
  description: `Be the first to know when premium features launch. Join our waiting list to access buyer contact information and unlock exclusive farming marketplace benefits.`,
  alternates: {
    canonical: `/waiting-list-paying`,
  }
}

export default async function WaitingListPayingPage() {
  const user = await retrieveUser()

  return (
    <main className="min-h-[70lvh] flex items-center justify-center px-6 py-12">
      <WaitingListPayingClient user={user} />
    </main>
  )
}
