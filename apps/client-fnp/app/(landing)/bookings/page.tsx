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
    { "@type": "ListItem", "position": 2, "name": "Buy", "item": "https://farmnport.com/buy" },
    { "@type": "ListItem", "position": 3, "name": "Pre-Orders", "item": "https://farmnport.com/bookings" },
  ],
}

export const metadata = {
    title: "Farm Bookings & Pre-Orders Zimbabwe – Prices & Availability | farmnport.com",
    description: "Book day-old chicks, livestock and seasonal farm produce in advance. View prices and secure your order with a deposit.",
    alternates: { canonical: "https://farmnport.com/bookings" },
    openGraph: {
        title: "Farm Bookings & Pre-Orders Zimbabwe – Prices & Availability",
        description: "Book day-old chicks, livestock and seasonal farm produce in advance. View prices and secure your order with a deposit.",
        siteName: "farmnport",
        type: "website" as const,
        url: "https://farmnport.com/bookings",
    },
    twitter: {
        card: "summary_large_image" as const,
        title: "Farm Bookings & Pre-Orders Zimbabwe – Prices & Availability",
        description: "Book day-old chicks, livestock and seasonal farm produce in advance. View prices and secure your order with a deposit.",
    },
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
          <Link href="/buy" className="hover:text-foreground transition-colors">Buy</Link>
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
