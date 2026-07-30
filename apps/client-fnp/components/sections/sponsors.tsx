import Link from "next/link"
import Image from "next/image"

const WHATSAPP_NUMBER = "263789888837"
const WHATSAPP_MESSAGE = encodeURIComponent("Hi, I want to become a sponsor on farmnport.com for $116/month to show my logo across all my products on the farmnport.com platform and on the Featured Brands section of the homepage.")

const SPONSORS = [
  { name: "BaRa", logo: "/logos/bara.png", href: "/" },
  // Add sponsors as they sign up:
  // { name: "Syngenta", logo: "/logos/syngenta.svg", href: "https://syngenta.com" },
]

export function SponsorsSection() {
  return (
    <section className="py-6 border-y border-border/50">
      <div className="container">
        <p className="text-xs text-muted-foreground mb-4">Featured Brands</p>
        <div className="flex flex-wrap items-center justify-center gap-8">
          {SPONSORS.map((sponsor) => (
            <Link
              key={sponsor.name}
              href={sponsor.href}
              className="flex items-center justify-center h-12 grayscale hover:grayscale-0 transition-all opacity-70 hover:opacity-100"
            >
              <Image
                src={sponsor.logo}
                alt={sponsor.name}
                width={120}
                height={48}
                className="max-h-10 w-auto object-contain dark:invert"
              />
            </Link>
          ))}
          <Link
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`}
            target="_blank"
            className="flex items-center justify-center h-12 px-4 text-sm font-medium text-foreground hover:text-primary transition-colors"
          >
            Become a Sponsor
          </Link>
        </div>
      </div>
    </section>
  )
}
