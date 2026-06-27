import Link from "next/link"
import { ArrowRight, Package, Users, Banknote } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Sell Your Farm Produce Directly to Buyers | farmnport.com",
  description:
    "List your farm produce on Farmnport and connect directly with buyers across Zimbabwe. Sell chillies, maize, cattle and more — no middlemen, fairer prices.",
  alternates: { canonical: "/sell" },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://farmnport.com/sell",
    siteName: "Farmnport",
    title: "Sell Your Farm Produce Directly to Buyers | farmnport.com",
    description:
      "List your farm produce on Farmnport and connect directly with buyers across Zimbabwe. Sell chillies, maize, cattle and more — no middlemen, fairer prices.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Sell Farm Produce on Farmnport" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sell Your Farm Produce Directly to Buyers | farmnport.com",
    description:
      "List your farm produce on Farmnport and connect directly with buyers across Zimbabwe. Sell chillies, maize, cattle and more — no middlemen, fairer prices.",
    images: ["/og-image.png"],
  },
}

const STEPS = [
  {
    icon: Package,
    title: "List Your Lot",
    description:
      "Choose your produce, variety, form, quantity and price. Your listing goes live once reviewed — usually within 24 hours.",
  },
  {
    icon: Users,
    title: "Buyers Find You",
    description:
      "Verified buyers across Zimbabwe browse active lots and make bookings directly. No cold calls, no middlemen.",
  },
  {
    icon: Banknote,
    title: "Close the Sale",
    description:
      "Agree on delivery or pickup terms with the buyer and complete the transaction on your own terms.",
  },
]

const ENABLED_COMMODITIES = [
  {
    slug: "chillies",
    name: "Chillies",
    description: "Bird's Eye, Black Dombo, Cayenne, Scotch Bonnet and more varieties.",
    badge: "Now Open",
    badgeVariant: "default" as const,
  },
]

const COMING_SOON = [
  { name: "Maize", slug: "maize" },
  { name: "Cattle", slug: "cattle" },
  { name: "Soya Beans", slug: "soybeans" },
  { name: "Chicken", slug: "chicken" },
]

export default function SellPage() {
  return (
    <main>
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-12 space-y-16">

        {/* Hero */}
        <div className="max-w-2xl">
          <h1 className="text-3xl font-bold tracking-tight">
            Sell Your Farm Produce Directly to Buyers in Zimbabwe
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Skip the middlemen. List your produce as a lot, get found by verified buyers, and close sales on your own
            terms.
          </p>
          <div className="mt-6">
            <Link
              href="/lots/new"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              List a Lot Now
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* How it works */}
        <div>
          <h2 className="text-xl font-semibold mb-8">How It Works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {STEPS.map((step, i) => (
              <div key={i} className="rounded-xl border bg-card p-6 space-y-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-bold">
                    {i + 1}
                  </span>
                  <step.icon className="h-5 w-5 text-muted-foreground" />
                </div>
                <h3 className="font-semibold">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Enabled commodities */}
        <div>
          <h2 className="text-xl font-semibold mb-2">Commodities Open for Lots</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Read the seller guide for each commodity — what buyers want, varieties, and how to price your lot.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {ENABLED_COMMODITIES.map((c) => (
              <Link
                key={c.slug}
                href={`/sell/${c.slug}`}
                className="group rounded-xl border bg-card p-6 hover:shadow-md hover:border-primary/40 transition-all space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">{c.name}</h3>
                  <Badge>{c.badge}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{c.description}</p>
                <div className="flex items-center gap-1 text-sm font-medium text-primary">
                  View seller guide
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </Link>
            ))}

            {COMING_SOON.map((c) => (
              <div
                key={c.slug}
                className="rounded-xl border bg-muted/30 p-6 space-y-3 opacity-60"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-lg font-semibold text-muted-foreground">{c.name}</h3>
                  <Badge variant="secondary">Coming Soon</Badge>
                </div>
                <p className="text-sm text-muted-foreground">Lot listings for {c.name.toLowerCase()} are coming soon.</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="rounded-xl border bg-primary/5 border-primary/20 p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <h3 className="text-lg font-semibold">Ready to sell?</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Create your lot in minutes. Reviewed and listed within 24 hours.
            </p>
          </div>
          <Link
            href="/lots/new"
            className="flex-shrink-0 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            List a Lot
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Also useful */}
        <div className="text-sm text-muted-foreground space-y-1">
          <p>
            Looking to find buyers directly?{" "}
            <Link href="/buyers" className="text-primary hover:underline">
              Browse all buyers on Farmnport →
            </Link>
          </p>
          <p>
            Want to see what lots are available to buy?{" "}
            <Link href="/lots" className="text-primary hover:underline">
              Browse active lots →
            </Link>
          </p>
        </div>

      </div>
    </main>
  )
}
