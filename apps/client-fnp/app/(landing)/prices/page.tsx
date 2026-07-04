import Link from "next/link"
import { PricesBoard } from "@/components/structures/prices-board"

export const metadata = {
  title: 'Agricultural Market Prices Zimbabwe – Livestock, Produce & More | farmnport.com',
  description: 'Compare current agricultural prices from verified buyers across Zimbabwe. Liveweight cattle, cold dress mass, beef, lamb, mutton, goat, chicken, pork — updated weekly in USD and ZiG.',
  alternates: { canonical: '/prices' },
  openGraph: {
    title: 'Agricultural Market Prices Zimbabwe',
    description: 'Compare current agricultural prices from verified buyers across Zimbabwe.',
    url: '/prices',
    siteName: 'farmnport',
    type: 'website',
  },
}

export default function PricesPage() {
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://farmnport.com" },
      { "@type": "ListItem", "position": 2, "name": "Market", "item": "https://farmnport.com/market" },
      { "@type": "ListItem", "position": 3, "name": "Prices", "item": "https://farmnport.com/prices" },
    ],
  }
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <h1 className="sr-only">Agricultural Market Prices Zimbabwe – Livestock, Produce &amp; More</h1>
      <div className="mx-auto max-w-7xl px-6 lg:px-8 pt-4">
        <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4">
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          <span>/</span>
          <Link href="/market" className="hover:text-foreground transition-colors">Market</Link>
          <span>/</span>
          <span className="text-foreground font-medium">Prices</span>
        </nav>
      </div>
      <PricesBoard />
    </>
  )
}
