"use client"

import Link from "next/link"
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel"

const COLLECTION_LABELS: Record<string, string> = {
  buyers: "Buyers",
  bookings: "Pre-Order",
  agro_chemicals: "Agrochemical",
  guides: "Spray Program",
  documents: "Document",
  plant_nutrition: "Plant Nutrition",
  animal_health: "Animal Health",
  feed_products: "Animal Feed",
  seed_products: "Seeds",
  equipment: "Equipment",
  lots: "Lot",
  prices: "Prices",
}

// Direct pages only — no top-level categories. No overlap with Popular Pages section.
const TRENDING_ITEMS = [
  {
    collection: "bookings",
    name: "Alpha Chickens Eggs",
    description: "Bulk tray eggs — order directly from verified suppliers",
    price: "$3.80 per tray",
    href: "/bookings/alpha-chickens-eggs",
    image: "",
  },
  {
    collection: "documents",
    name: "Pig Sty Pen Design Plan",
    description: "Ready-made building plan for a pig sty pen",
    price: "$25.00",
    href: "/buy-documents/pig-sty-pen-design-plan",
    image: "",
  },
  {
    collection: "agro_chemicals",
    name: "Karate Zeon",
    description: "Broad-spectrum insecticide for crop protection",
    price: "",
    href: "/agrochemical-guides/insecticides/karate-zeon",
    image: "",
  },
  {
    collection: "agro_chemicals",
    name: "Bravo 720 SC",
    description: "Contact fungicide for broad-spectrum disease control",
    price: "",
    href: "/agrochemical-guides/fungicides/bravo-720-sc",
    image: "",
  },
  {
    collection: "agro_chemicals",
    name: "Score 250 EC",
    description: "Systemic fungicide for cereals, fruits and vegetables",
    price: "",
    href: "/agrochemical-guides/fungicides/score-250-ec",
    image: "",
  },
  {
    collection: "agro_chemicals",
    name: "Ampligo 150 ZC",
    description: "Dual-action insecticide for caterpillar and bollworm control",
    price: "",
    href: "/agrochemical-guides/insecticides/ampligo-150-zc",
    image: "",
  },
  {
    collection: "buyers",
    name: "Pork Buyers",
    description: "Find verified pork and pig buyers in Zimbabwe",
    price: "",
    href: "/buyers/pork",
    image: "",
  },
  {
    collection: "buyers",
    name: "Onion Buyers",
    description: "Find verified onion buyers in Zimbabwe",
    price: "",
    href: "/buyers/onions",
    image: "",
  },
  {
    collection: "buyers",
    name: "Goat Buyers",
    description: "Find verified goat buyers in Zimbabwe",
    price: "",
    href: "/buyers/goats",
    image: "",
  },
  {
    collection: "buyers",
    name: "Watermelon Buyers",
    description: "Find verified watermelon buyers in Zimbabwe",
    price: "",
    href: "/buyers/watermelons",
    image: "",
  },
  {
    collection: "guides",
    name: "Broccoli Spray Program",
    description: "Complete spray schedule for broccoli crop protection",
    price: "",
    href: "/spray-programs/broccoli-spray-program",
    image: "",
  },
  {
    collection: "guides",
    name: "Green Beans Spray Program",
    description: "Complete spray schedule for green beans crop protection",
    price: "",
    href: "/spray-programs/green-beans-spray-program",
    image: "",
  },
  {
    collection: "guides",
    name: "Beetroot Spray Program",
    description: "Complete spray schedule for beetroot crop protection",
    price: "",
    href: "/spray-programs/beetroot-spray-program",
    image: "",
  },
  {
    collection: "guides",
    name: "Potato Spray Program",
    description: "Complete spray schedule for potato crop protection",
    price: "",
    href: "/spray-programs/potato-spray-program",
    image: "",
  },
  {
    collection: "prices",
    name: "Beef Prices",
    description: "Latest beef market prices updated daily",
    price: "",
    href: "/prices/beef",
    image: "",
  },
]

export function TrendingSection() {
  return (
    <section className="py-8">
      <div className="container">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Trending on Farmnport</h2>
        </div>
        <Carousel opts={{ align: "start", slidesToScroll: 6 }}>
          <div className="relative">
            <CarouselContent>
              {TRENDING_ITEMS.map((item) => (
                <CarouselItem
                  key={item.href}
                  className="basis-1/2 sm:basis-1/3 lg:basis-1/6"
                >
                  <Link
                    href={item.href}
                    className="group flex flex-col rounded-lg border bg-card hover:border-primary/40 hover:shadow-md transition-all overflow-hidden h-full"
                  >
                    <div className="aspect-square bg-muted/30 relative">
                      <span className="absolute top-2 left-2 text-[10px] font-semibold bg-primary text-primary-foreground px-2 py-0.5 rounded">
                        {COLLECTION_LABELS[item.collection] ?? item.collection}
                      </span>
                    </div>
                    <div className="p-3 flex flex-col flex-1">
                      <h3 className="text-sm font-medium group-hover:text-primary transition-colors line-clamp-2">
                        {item.name}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {item.description}
                      </p>
                      <div className="mt-auto pt-2">
                        {item.price ? (
                          <span className="text-sm font-bold">{item.price}</span>
                        ) : (
                          <span className="text-xs text-muted-foreground">View details</span>
                        )}
                      </div>
                    </div>
                  </Link>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="-left-4" />
            <CarouselNext className="-right-4" />
          </div>
        </Carousel>
      </div>
    </section>
  )
}
