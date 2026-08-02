import Link from "next/link"
import { PricesHeadBoard } from "@/components/structures/prices-head-board"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Livestock Prices Per Head Zimbabwe – Breed Cattle Market Rates | farmnport.com",
  description: "Current per-head prices for Boran, Brahman, Simbra, Tuli, Nkone, Heifer, Steer and more from verified buyers across Zimbabwe. Compare breed cattle prices updated weekly in USD.",
  keywords: "livestock prices per head zimbabwe, boran cattle price, brahman price, simbra price, tuli cattle price, nkone cattle price, heifer price, steer price, breed cattle zimbabwe, cattle prices per head",
  alternates: { canonical: "/prices/head" },
  openGraph: {
    title: "Livestock Prices Per Head Zimbabwe – Breed Cattle Market Rates",
    description: "Current per-head prices for Boran, Brahman, Simbra, Tuli, Nkone and more from verified buyers across Zimbabwe. Updated weekly.",
    url: "https://farmnport.com/prices/head",
    siteName: "farmnport",
    type: "website",
  },
}

export default function PricesHeadPage() {
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://farmnport.com" },
      { "@type": "ListItem", "position": 2, "name": "Prices", "item": "https://farmnport.com/prices" },
      { "@type": "ListItem", "position": 3, "name": "Per Head Prices", "item": "https://farmnport.com/prices/head" },
    ],
  }

  const webPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Livestock Prices Per Head Zimbabwe",
    "description": "Current per-head prices for Boran, Brahman, Simbra, Tuli, Nkone, Heifer, Steer and more from verified buyers across Zimbabwe.",
    "url": "https://farmnport.com/prices/head",
    "isPartOf": { "@type": "WebSite", "name": "farmnport", "url": "https://farmnport.com" },
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }} />
      <div className="mx-auto max-w-7xl px-6 lg:px-8 pt-4">
        <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4">
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          <span>/</span>
          <Link href="/prices" className="hover:text-foreground transition-colors">Prices</Link>
          <span>/</span>
          <span className="text-foreground font-medium">Per Head</span>
        </nav>
      </div>
      <h1 className="sr-only">Livestock Prices Per Head Zimbabwe – Breed Cattle Market Rates</h1>
      <PricesHeadBoard />
    </>
  )
}
