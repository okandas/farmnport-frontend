"use client"

import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { Skeleton } from "@/components/ui/skeleton"
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel"

const BASE = (process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3744") + "/v1"

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
  feeding_programs: "Feeding Program",
}

interface TrendingItem {
  id: string
  collection: string
  name: string
  description: string
  price: string
  href: string
  image: string
}

async function fetchTrending(): Promise<TrendingItem[]> {
  const res = await fetch(`${BASE}/trending/`, { cache: "no-store" })
  if (!res.ok) return []
  const data = await res.json()
  return data.items ?? []
}

function TrendingSkeleton() {
  return (
    <section className="py-8">
      <div className="container">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Trending on Farmnport</h2>
        </div>
        <div className="flex gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex-shrink-0 basis-1/2 sm:basis-1/3 lg:basis-1/6">
              <div className="rounded-lg border bg-card overflow-hidden">
                <Skeleton className="aspect-square w-full" />
                <div className="p-3 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-1/2 mt-2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function TrendingSection() {
  const { data: items, isLoading } = useQuery({
    queryKey: ["trending-items"],
    queryFn: fetchTrending,
    staleTime: 300000,
  })

  if (isLoading) return <TrendingSkeleton />
  if (!items || items.length === 0) return null

  return (
    <section className="py-8">
      <div className="container">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Trending on Farmnport</h2>
        </div>
        <Carousel opts={{ align: "start", slidesToScroll: 6 }}>
          <div className="relative">
            <CarouselContent>
              {items.map((item) => (
                <CarouselItem
                  key={item.href}
                  className="basis-1/2 sm:basis-1/3 lg:basis-1/6"
                >
                  <Link
                    href={item.href}
                    className="group flex flex-col rounded-lg border bg-card hover:border-primary/40 hover:shadow-md transition-all overflow-hidden h-full cursor-pointer"
                  >
                    <div className="aspect-square bg-muted/30 dark:bg-white relative">
                      {item.image && (
                        <img src={item.image} alt="" className="absolute inset-0 w-full h-full object-contain" />
                      )}
                    </div>
                    <div className="p-3 flex flex-col flex-1 border-t">
                      <p className="text-[11px] font-medium text-foreground mb-1">
                        {COLLECTION_LABELS[item.collection] ?? item.collection}
                      </p>
                      <h3 className="text-sm font-semibold group-hover:text-primary transition-colors line-clamp-2">
                        {item.name}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {item.description}
                      </p>
                      <div className="mt-auto pt-3">
                        {item.price ? (
                          <p className="text-base font-bold">{item.price}</p>
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
