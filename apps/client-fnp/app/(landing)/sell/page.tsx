import Link from "next/link"
import { ArrowRight, Package, Users, Banknote, CalendarCheck, Repeat } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Sell Your Farm Produce Directly to Buyers | farmnport.com",
  description:
    "List lots, create bookings, and connect directly with buyers across Zimbabwe. Sell chillies, maize, cattle, eggs, chicks and more — fairer prices.",
  alternates: { canonical: "/sell" },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://farmnport.com/sell",
    siteName: "Farmnport",
    title: "Sell Your Farm Produce Directly to Buyers | farmnport.com",
    description:
      "List lots, create bookings, and connect directly with buyers across Zimbabwe.",
    images: [{ url: "/api/og", width: 1200, height: 630, alt: "Sell Farm Produce on Farmnport" }],
  },
}

export default function SellPage() {
  return (
    <main>
      <div className="container py-12 space-y-16">

        {/* Hero */}
        <div className="max-w-2xl">
          <h1 className="text-3xl font-bold tracking-tight">
            Two Ways to Sell on Farmnport
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            List a lot for immediate sale, or create a booking for regular supply. Both connect you directly with verified buyers.
          </p>
        </div>

        {/* Two paths */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* List a Lot */}
          <div className="rounded-xl border bg-card p-8 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-xl font-bold">List a Lot</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              Have stock ready now? Post your harvest, set your price, and let buyers bid. Accept when you are ready.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold shrink-0 mt-0.5">1</span>
                <span>Set your price and bidding deadline</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold shrink-0 mt-0.5">2</span>
                <span>Buyers browse and place offers</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold shrink-0 mt-0.5">3</span>
                <span>Accept the offer that works for you</span>
              </div>
            </div>
            <Link
              href="/lots/new"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              List a Lot Now
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Create a Booking */}
          <div className="rounded-xl border bg-card p-8 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                <CalendarCheck className="h-5 w-5 text-blue-700" />
              </div>
              <h2 className="text-xl font-bold">Create a Booking</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              Supply or buy on a regular basis? Set up recurring pre-orders for eggs, chicks, seeds, harvests and more.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white text-xs font-bold shrink-0 mt-0.5">1</span>
                <span>Choose if you supply or buy</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white text-xs font-bold shrink-0 mt-0.5">2</span>
                <span>Set your produce, quantity and schedule</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white text-xs font-bold shrink-0 mt-0.5">3</span>
                <span>Customers book directly from you</span>
              </div>
            </div>
            <Link
              href="/bookings/new"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
            >
              Create a Booking
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Commodities open */}
        <div>
          <h2 className="text-xl font-semibold mb-2">Commodities Open for Lots</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Read the seller guide for each commodity — what buyers want, varieties, and how to price your lot.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { slug: "chillies", name: "Chillies", description: "Bird's Eye, Black Dombo, Cayenne, Scotch Bonnet and more." },
              { slug: "maize", name: "Maize", description: "White and yellow maize — grain, green mealies, and stockfeed." },
              { slug: "cattle", name: "Cattle", description: "Bulls, heifers, cows, and calves — all breeds." },
              { slug: "chicken", name: "Chicken", description: "Broilers, layers, road runners, and day-old chicks." },
            ].map((c) => (
              <Link
                key={c.slug}
                href={`/sell/${c.slug}`}
                className="group rounded-xl border bg-card p-5 hover:shadow-md hover:border-primary/40 transition-all"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="text-sm font-semibold group-hover:text-primary transition-colors">{c.name}</h3>
                  <Badge className="text-[10px]">Open</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{c.description}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="rounded-xl border bg-primary/5 border-primary/20 p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <h3 className="text-lg font-semibold">Ready to start?</h3>
            <p className="text-sm text-muted-foreground mt-1">
              List a lot for immediate sale or create a booking for regular supply.
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/lots/new"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              List a Lot
            </Link>
            <Link
              href="/bookings/new"
              className="inline-flex items-center gap-2 rounded-lg border border-border px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-muted/50 transition-colors"
            >
              Create Booking
            </Link>
          </div>
        </div>

        {/* Links */}
        <div className="text-sm text-muted-foreground space-y-1">
          <p>
            Looking to find buyers directly?{" "}
            <Link href="/buyers" className="text-primary hover:underline">Browse all buyers →</Link>
          </p>
          <p>
            Want to see what lots are available?{" "}
            <Link href="/lots" className="text-primary hover:underline">Browse active lots →</Link>
          </p>
          <p>
            Need help getting started?{" "}
            <Link href="/resources" className="text-primary hover:underline">View resources →</Link>
          </p>
        </div>

      </div>
    </main>
  )
}
