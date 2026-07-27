import Link from "next/link"

const GUIDES = [
  {
    title: "How to Sell on Farmnport",
    description: "Create your farm profile, list your produce as a lot, and receive bids from verified buyers.",
    href: "/sell",
  },
  {
    title: "How to Create a Booking",
    description: "Set up a pre-order for eggs, chicks or harvests — buyers book directly from you on a schedule.",
    href: "/bookings/new",
  },
  {
    title: "How to Find Buyers",
    description: "Browse buyer profiles by produce type and connect with verified buyers across Zimbabwe.",
    href: "/buyers",
  },
]

export function HowToSection() {
  return (
    <section className="py-8 bg-muted/20">
      <div className="container">
        <h2 className="text-2xl font-bold text-center mb-8">How To</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {GUIDES.map((guide) => (
            <Link
              key={guide.href}
              href={guide.href}
              className="group flex flex-col rounded-lg border bg-card overflow-hidden hover:border-primary/40 hover:shadow-md transition-all"
            >
              <div className="aspect-[16/9] bg-muted/30" />
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
