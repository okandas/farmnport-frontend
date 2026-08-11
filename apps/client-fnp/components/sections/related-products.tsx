"use client"

import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { BaseURL } from "@/lib/schemas"

interface RelatedItem {
  id: string
  name: string
  slug: string
  brand_name?: string
  category_name?: string
  image_src?: string
  min_price_cents?: number
  max_price_cents?: number
  available_for_sale?: boolean
  // guides
  type?: string
  farm_produce_name?: string
  description?: string
  // animal health
  target_animals?: string[]
}

const COLLECTION_LABELS: Record<string, string> = {
  agro_chemicals: "Agrochemical",
  animal_health: "Animal Health",
  plant_nutrition: "Plant Nutrition",
  feed_products: "Animal Feed",
  seed_products: "Seeds",
  equipment: "Equipment",
  guides: "Guide",
  bookings: "Pre-Order",
}

function getHref(collection: string, item: RelatedItem): string {
  switch (collection) {
    case "agro_chemicals": {
      const cat = item.category_name?.toLowerCase().replace(/\s+/g, "-").replace(/[&]/g, "").replace(/--+/g, "-") || ""
      return `/agrochemical-guides/${cat}/${item.slug}`
    }
    case "animal_health": {
      const cat = item.category_name?.toLowerCase().replace(/\s+/g, "-").replace(/[&]/g, "").replace(/--+/g, "-") || ""
      return `/animal-health-guides/${cat}/${item.slug}`
    }
    case "plant_nutrition": {
      const cat = item.category_name?.toLowerCase().replace(/\s+/g, "-").replace(/[&]/g, "").replace(/--+/g, "-") || ""
      return `/plant-nutrition-guides/${cat}/${item.slug}`
    }
    case "feed_products":
      return `/feed-guides/${item.slug}`
    case "seed_products":
      return `/buy-seed-products/${item.slug}`
    case "equipment":
      return `/equipment-guides/${item.slug}`
    case "guides": {
      if (item.type === "spray_program") return `/spray-programs/${item.slug}`
      if (item.type === "feeding_program") return `/feeding-programs/${item.slug}`
      return `/buy-documents/${item.slug}`
    }
    case "bookings":
      return `/bookings/${item.slug}`
    default:
      return "/"
  }
}

function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`
}

interface RelatedProductsProps {
  collection: string
  query: string
  excludeSlug: string
  title?: string
  limit?: number
  filterBy?: string
}

async function fetchRelated(collection: string, query: string, excludeSlug: string, limit: number, filterBy?: string): Promise<RelatedItem[]> {
  const params = new URLSearchParams({ collection, q: query, exclude: excludeSlug, limit: String(limit) })
  if (filterBy) params.set("filter_by", filterBy)
  const res = await fetch(`${BaseURL}/search/related?${params.toString()}`)
  if (!res.ok) return []
  const data = await res.json()
  return data.items ?? []
}

export function RelatedProducts({ collection, query, excludeSlug, title = "Related Products", limit = 5, filterBy }: RelatedProductsProps) {
  const { data: items } = useQuery({
    queryKey: ["related", collection, query, excludeSlug, filterBy],
    queryFn: () => fetchRelated(collection, query, excludeSlug, limit, filterBy),
    staleTime: 300000,
  })

  if (!items || items.length === 0) return null

  return (
    <section>
      <h2 className="text-lg font-semibold mb-4">{title}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {items.map((item) => (
          <Link
            key={item.id}
            href={getHref(collection, item)}
            className="group flex flex-col rounded-lg border bg-card hover:border-primary/40 hover:shadow-md transition-all overflow-hidden"
          >
            <div className="aspect-[4/3] bg-muted/30 dark:bg-white relative">
              {item.image_src && (
                <img src={item.image_src} alt="" className="absolute inset-0 w-full h-full object-contain p-3" />
              )}
            </div>
            <div className="p-3 flex flex-col flex-1 border-t">
              <p className="text-[11px] font-medium text-foreground mb-1">
                {COLLECTION_LABELS[collection] ?? collection}
              </p>
              <h3 className="text-sm font-semibold group-hover:text-primary transition-colors line-clamp-2">
                {item.name}
              </h3>
              {item.brand_name && (
                <p className="text-xs text-muted-foreground mt-1">{item.brand_name}</p>
              )}
              {item.description && !item.brand_name && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.description}</p>
              )}
              <div className="mt-auto pt-2">
                {item.min_price_cents && item.min_price_cents > 0 ? (
                  <p className="text-sm font-bold">
                    {formatPrice(item.min_price_cents)}
                    {item.max_price_cents && item.max_price_cents > item.min_price_cents && (
                      <span className="font-normal text-muted-foreground"> – {formatPrice(item.max_price_cents)}</span>
                    )}
                  </p>
                ) : (
                  <span className="text-xs text-muted-foreground">View details</span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
