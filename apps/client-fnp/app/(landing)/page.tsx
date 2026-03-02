import { auth } from "@/auth"
import { LoggedOutLanding } from "@/components/layouts/logged-out-landing"
import { LoggedInDashboard } from "@/components/layouts/logged-in-dashboard"

export const metadata = {
  title: 'Farmnport — Buy & Sell Farm Produce Directly in Zimbabwe',
  description: 'Connect farmers and buyers across Zimbabwe. Browse agricultural produce prices, find buyers and sellers, and access agrochemical guides. Join the largest farming marketplace.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Farmnport — Buy & Sell Farm Produce Directly in Zimbabwe',
    description: 'Connect farmers and buyers across Zimbabwe. Browse produce prices, find buyers and sellers, and access agrochemical guides.',
    siteName: 'farmnport',
    type: 'website',
  },
}

export default async function LandingPage() {
  const session = await auth()
  const user = session?.user

  // Show dashboard for logged-in users, landing page for visitors
  if (user) {
    return <LoggedInDashboard user={user} />
  }

  return <LoggedOutLanding />
}
