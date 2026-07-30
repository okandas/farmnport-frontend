import Link from "next/link"
import Image from "next/image"

const GUIDES = [
  {
    title: "How to Sell on Farmnport",
    description: "Create your farm profile, list your produce as a lot, and receive bids from verified buyers.",
    href: "/resources/article/how-to-list-a-lot",
    image: "/images/resources/how-to-list-a-lot.webp",
  },
  {
    title: "How to Create a Booking",
    description: "Set up a pre-order for eggs, chicks or harvests — buyers book directly from you on a schedule.",
    href: "/resources/article/how-to-create-a-booking",
    image: "/images/resources/how-to-create-a-booking.webp",
  },
  {
    title: "How to Find Buyers",
    description: "Browse buyer profiles by produce type and connect with verified buyers across Zimbabwe.",
    href: "/resources/article/how-to-find-buyers",
    image: "/images/resources/how-to-find-buyers.webp",
  },
]

export function HowToSection() {
  return (
    <section className="py-8 bg-muted/20">
      <div className="container">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">How To</h2>
          <Link href="/resources" className="text-sm font-medium text-primary hover:underline">View all resources</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {GUIDES.map((guide) => (
            <Link
              key={guide.href}
              href={guide.href}
              className="group flex flex-col rounded-lg border bg-card overflow-hidden hover:border-primary/40 hover:shadow-md transition-all"
            >
              <div className="aspect-[16/9] relative bg-muted/30">
                {guide.image && (
                  <Image
                    src={guide.image}
                    alt={guide.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 640px) 100vw, 33vw"
                  />
                )}
              </div>
              <div className="p-4">
                <h3 className="text-sm font-semibold group-hover:text-primary transition-colors">
                  {guide.title}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {guide.description}
                </p>
                <span className="inline-block mt-3 text-xs font-medium text-primary">
                  READ MORE
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
