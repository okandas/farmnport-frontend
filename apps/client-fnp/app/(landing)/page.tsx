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

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL

async function getMarketplaceCounts() {
  try {
    const [buyerRes, farmerRes] = await Promise.all([
      fetch(`${baseUrl}/v1/buyer/count`, { next: { revalidate: 3600 } }),
      fetch(`${baseUrl}/v1/farmer/count`, { next: { revalidate: 3600 } }),
    ])

    const buyers = buyerRes.ok ? await buyerRes.json() : { total: 0 }
    const farmers = farmerRes.ok ? await farmerRes.json() : { total: 0 }

    return {
      buyers: buyers.total || 0,
      farmers: farmers.total || 0,
    }
  } catch {
    return { buyers: 0, farmers: 0 }
  }
}

export default async function LandingPage() {
  const [session, counts] = await Promise.all([
    auth(),
    getMarketplaceCounts(),
  ])
  const user = session?.user

  // Show dashboard for logged-in users, landing page for visitors
  if (user) {
    return <LoggedInDashboard user={user} />
  }

  return <LoggedOutLanding counts={counts} />
}
