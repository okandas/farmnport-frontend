import { notFound } from "next/navigation"
import Link from "next/link"
import { bookingsEnabled } from "@/flags"
import { serverFetch } from "@/lib/serverFetch"
import { BookingsClient } from "./BookingsClient"
import { getBuyCategories } from "@/components/generic/BuyCategoriesNav"

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://farmnport.com" },
    { "@type": "ListItem", "position": 2, "name": "Market", "item": "https://farmnport.com/market" },
    { "@type": "ListItem", "position": 3, "name": "Pre-Orders", "item": "https://farmnport.com/bookings" },
  ],
}

export default async function PreOrdersPage() {
  const showBookings = await bookingsEnabled()
  if (!showBookings) notFound()

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-6">
        <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-6">
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          <span>/</span>
          <Link href="/market" className="hover:text-foreground transition-colors">Market</Link>
          <span>/</span>
          <span className="text-foreground font-medium">Pre-Orders</span>
        </nav>

        <div id="bookings-heading" className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight font-heading mb-2">Pre-Orders</h1>
          <p className="text-lg text-muted-foreground">Book and reserve produce directly from suppliers. Confirm availability, pay, and collect.</p>
        </div>

        <BookingsClient
          categories={await getBuyCategories()}
          initialPreOrders={await serverFetch("/booking/preorders?status=open").then((r: any) => r?.preorders ?? []).catch(() => [])}
        />
      </div>
    </div>
  )
}
