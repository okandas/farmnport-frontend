import Link from "next/link"
import { BookingsClient } from "./BookingsClient"
import { getBuyCategories } from "@/components/generic/BuyCategoriesNav"

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://farmnport.com" },
    { "@type": "ListItem", "position": 2, "name": "Market", "item": "https://farmnport.com/market" },
    { "@type": "ListItem", "position": 3, "name": "Bookings", "item": "https://farmnport.com/bookings" },
  ],
}

export default async function BookingEventsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-6">
        <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-6">
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          <span>/</span>
          <Link href="/market" className="hover:text-foreground transition-colors">Market</Link>
          <span>/</span>
          <span className="text-foreground font-medium">Bookings</span>
        </nav>

        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight font-heading mb-2">Forward Booking Batches</h1>
          <p className="text-lg text-muted-foreground">Reserve livestock and farm produce from upcoming supplier batches.</p>
        </div>

        <BookingsClient categories={await getBuyCategories()} />
      </div>
    </div>
  )
}
