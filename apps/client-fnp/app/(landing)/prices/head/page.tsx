import { PricesHeadBoard } from "@/components/structures/prices-head-board"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Livestock Prices Per Head Zimbabwe – Breed Cattle Market Rates | farmnport.com",
  description: "Current per-head prices for Boran, Brahman, Simbra, Tuli, Heifer, Steer and more from verified buyers across Zimbabwe. Updated weekly.",
  keywords: "livestock prices per head zimbabwe, boran cattle price, brahman price, simbra price, tuli cattle, heifer price, steer price, breed cattle zimbabwe",
  alternates: { canonical: "/prices/head" },
  openGraph: {
    title: "Livestock Prices Per Head Zimbabwe",
    description: "Current per-head prices for Boran, Brahman, Simbra, Tuli and more from verified buyers across Zimbabwe.",
    url: "/prices/head",
    siteName: "farmnport",
    type: "website",
  },
}

export default function PricesHeadPage() {
  return (
    <>
      <h1 className="sr-only">Livestock Prices Per Head Zimbabwe</h1>
      <PricesHeadBoard />
    </>
  )
}
