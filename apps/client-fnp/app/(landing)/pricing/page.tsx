import { PricingClient } from "@/components/structures/pricing-client"
import { retrieveUser } from "@/lib/actions"

export const metadata = {
  title: 'Subscribe to Access Buyer Contacts | farmnport.com',
  description: 'Subscribe for $23/month to view buyer contact phone numbers and emails. Connect directly with buyers across Zimbabwe.',
  alternates: {
    canonical: `/pricing`,
  }
}

export default async function PricingPage() {
  const user = await retrieveUser()

  return (
    <main className="min-h-[70lvh] flex items-center justify-center px-6 py-12">
      <PricingClient user={user} />
    </main>
  )
}
