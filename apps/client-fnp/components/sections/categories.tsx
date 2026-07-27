import Link from "next/link"

const CATEGORIES = [
  { name: "Chicken Buyers", href: "/buyers/chicken" },
  { name: "Market Prices", href: "/prices" },
  { name: "Agrochemicals", href: "/agrochemical-guides" },
  { name: "Spray Programs", href: "/spray-programs" },
  { name: "Feeding Programs", href: "/feeding-programs" },
  { name: "Maize Buyers", href: "/buyers/maize" },
]

export function CategoriesSection() {
  return (
    <section className="py-8">
      <div className="container">
        <h2 className="text-center text-2xl font-bold mb-8">Explore Popular Pages</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.name}
              href={cat.href}
              className="group flex flex-col items-center gap-3"
            >
              <div className="w-full aspect-square bg-muted/30 group-hover:bg-muted/50 transition-colors" />
              <span className="text-sm font-medium text-center group-hover:text-primary transition-colors">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
