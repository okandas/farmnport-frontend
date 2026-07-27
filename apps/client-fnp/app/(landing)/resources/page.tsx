import Link from "next/link"
import Image from "next/image"
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

function ResourceCard({ title, description, href, image }: { title: string; description: string; href: string; image: string }) {
  return (
    <Link href={href} className="group block">
      <div className="rounded-2xl overflow-hidden">
        <div className="aspect-[4/3] relative bg-muted/30 overflow-hidden">
          {image ? (
            <Image
              src={image}
              alt={title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : null}
        </div>
      </div>
      <div className="pt-3">
        <h3 className="text-base font-semibold group-hover:text-primary transition-colors">{title}</h3>
        <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
      </div>
    </Link>
  )
}

export default function ResourcesPage() {
  return (
    <div className="min-h-screen">
      <div className="container py-8">
        <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-8">
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          <span>/</span>
          <span className="text-foreground font-medium">Resources</span>
        </nav>

        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">Resources</h1>
        <p className="text-base text-muted-foreground mb-10">Everything you need to get started on Farmnport.</p>

        {/* Featured — full width hero */}
        <Link href={FEATURED.href} className="group block mb-12">
          <div className="rounded-2xl overflow-hidden">
            <div className="relative aspect-[21/9] sm:aspect-[3/1] bg-muted/30 overflow-hidden">
              {FEATURED.image ? (
                <Image
                  src={FEATURED.image}
                  alt={FEATURED.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="100vw"
                />
              ) : null}
            </div>
          </div>
          <div className="pt-4">
            <h2 className="text-xl sm:text-2xl font-bold group-hover:text-primary transition-colors">{FEATURED.title}</h2>
            <p className="text-sm text-muted-foreground mt-1">{FEATURED.description}</p>
          </div>
        </Link>

        {/* Grid — 3 columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
          {RESOURCES.map((resource) => (
            <ResourceCard key={resource.href} {...resource} />
          ))}
        </div>
      </div>
    </div>
  )
}
