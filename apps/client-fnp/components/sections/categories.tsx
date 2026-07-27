import Link from "next/link"
import Image from "next/image"

const CATEGORIES = [
  { name: "Chicken Buyers", href: "/buyers/chicken", image: "" },
  { name: "Market Prices", href: "/prices", image: "/images/market-price.webp" },
  { name: "Agrochemicals", href: "/agrochemical-guides", image: "" },
  { name: "Spray Programs", href: "/spray-programs", image: "" },
  { name: "Feeding Programs", href: "/feeding-programs", image: "/images/feed.webp" },
  { name: "Maize Buyers", href: "/buyers/maize", image: "" },
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
              <div className="w-full aspect-square rounded-md overflow-hidden relative bg-muted/30 group-hover:shadow-md transition-all">
                {cat.image && (
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                  />
                )}
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors" />
                <span className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-white drop-shadow-md">
                  {cat.name}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
