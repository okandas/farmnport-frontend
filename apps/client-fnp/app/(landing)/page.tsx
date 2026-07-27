import { HeroSection } from "@/components/sections/hero"
import { SponsorsSection } from "@/components/sections/sponsors"
import { CategoriesSection } from "@/components/sections/categories"
import { TrendingSection } from "@/components/sections/trending"

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

export default function LandingPage() {
  return <main>
    <HeroSection />
    <SponsorsSection />
    <CategoriesSection />
    <TrendingSection />
  </main>
}
