import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Resources — Learn How to Sell, Buy & Trade on Farmnport",
  description: "Step-by-step guides to help you list lots, create bookings, find buyers, and start selling your farm produce on farmnport.com.",
  alternates: { canonical: "/resources" },
}

const FEATURED = {
  title: "How to List a Lot & Get Bids",
  description: "Post your harvest, set your price, and let buyers come to you.",
  href: "/sell",
  image: "",
}

const RESOURCES = [
  {
    title: "How to Create a Booking",
    description: "Supply or buy produce on a regular schedule.",
    href: "/bookings/new",
    image: "",
  },
  {
    title: "How to Find Buyers",
    description: "Browse verified buyers by produce type.",
    href: "/buyers",
    image: "",
  },
  {
    title: "How to Use Spray Programs",
    description: "Follow crop protection schedules step by step.",
    href: "/spray-programs",
    image: "",
  },
  {
    title: "How to Use Feeding Programs",
    description: "Structured feeding schedules for your livestock.",
    href: "/feeding-programs",
    image: "",
  },
  {
    title: "How to Check Market Prices",
    description: "Compare prices from verified buyers before you sell.",
    href: "/prices",
    image: "",
  },
  {
    title: "How to Buy Farm Plans",
    description: "Download ready-made pig sty and poultry house plans.",
    href: "/buy-documents",
    image: "",
  },
]

export default function ResourcesPage() {
  return (
    <div className="min-h-screen">
      <div className="container py-6">
        <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-6">
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          <span>/</span>
          <span className="text-foreground font-medium">Resources</span>
        </nav>

        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">Resources</h1>
        <p className="text-sm text-muted-foreground mb-8">Everything you need to get started on Farmnport.</p>

        {/* Featured — large card */}
        <Link href={FEATURED.href} className="group block mb-8">
          <div className="relative rounded-xl overflow-hidden aspect-[21/9] bg-muted/30">
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent" />
            <div className="absolute bottom-0 left-0 p-6 sm:p-8">
              <h2 className="text-xl sm:text-2xl font-bold group-hover:text-primary transition-colors">{FEATURED.title}</h2>
              <p className="text-sm text-muted-foreground mt-1">{FEATURED.description}</p>
            </div>
          </div>
        </Link>

        {/* Grid — 3 columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {RESOURCES.map((resource) => (
            <Link key={resource.href} href={resource.href} className="group block">
              <div className="rounded-xl overflow-hidden border hover:border-primary/40 hover:shadow-md transition-all">
                <div className="aspect-[16/10] bg-muted/30" />
                <div className="p-4">
                  <h3 className="text-sm font-semibold group-hover:text-primary transition-colors">{resource.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{resource.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
