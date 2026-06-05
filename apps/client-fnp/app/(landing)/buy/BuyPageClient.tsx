"use client"

import Link from "next/link"
import Image from "next/image"
import { ArrowRight } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { listBookingEvents } from "@/lib/query"
import { ProductCard } from "@/components/shared/ProductCard"

const CATEGORIES = [
  { id: "pre-orders", label: "Pre-Orders", href: "/bookings" },
  { id: "agrochemicals", label: "Agrochemicals", href: "/buy-agrochemicals" },
  { id: "animal-health", label: "Animal Health", href: "/buy-animal-health" },
  { id: "animal-feed", label: "Animal Feed", href: "/buy-feeds" },
  { id: "plant-nutrition", label: "Plant Nutrition", href: "/buy-plant-nutrition" },
  { id: "seeds", label: "Seeds", href: "/buy-seed-products" },
]

// ── Document card ─────────────────────────────────────────────────────────────

function DocumentCard({ doc }: { doc: any }) {
  const price = doc.price_cents ? `$${(doc.price_cents / 100).toFixed(2)}` : "Free"
  const preview = doc.preview_images?.[0]
  const href = `/buy-documents/${doc.slug}`
  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden transition-all duration-200 hover:shadow-lg hover:border-primary/50 group">
      <Link href={href} className="block">
        <div className="relative aspect-square bg-muted/20">
          {preview ? (
            <Image src={preview} alt={doc.title} fill className="object-cover" sizes="25vw" />
          ) : (
            <div className="absolute inset-0 bg-muted/30" />
          )}
        </div>
      </Link>
      <div className="p-4 space-y-3 border-t">
        <Link href={href}>
          <h3 className="font-semibold text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors">{doc.title}</h3>
        </Link>
        <div className="flex items-center gap-4 text-xs pt-2 border-t">
          <span className="font-semibold text-primary">{price}</span>
        </div>
        <Link href={href} className="block">
          <Button variant="outline" className="w-full" size="sm">View Document</Button>
        </Link>
      </div>
    </div>
  )
}

// ── Pre-orders section ────────────────────────────────────────────────────────

function PreOrdersSection() {
  const { data, isLoading } = useQuery({
    queryKey: ["booking-events-buy-page"],
    queryFn: () => listBookingEvents({ status: "open" }),
  })
  const events: any[] = data?.data?.events ?? []

  if (isLoading || events.length === 0) return null

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold">Pre-Orders</h2>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{events.length} open</span>
        </div>
        <Link href="/bookings" className="flex items-center gap-1 text-sm font-medium text-primary hover:underline">
          View all <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {events.slice(0, 4).map((event: any) => (
          <ProductCard
            key={event.id}
            href={`/bookings/${event.slug}`}
            name={event.title}
            brand={event.product_name}
            meta={event.unit_price > 0 ? `$${(event.unit_price / 100).toFixed(2)}` : undefined}
            mode="guide"
            buttonLabel="Pre-order"
          />
        ))}
      </div>
    </section>
  )
}

// ── Section wrapper ───────────────────────────────────────────────────────────

function Section({ label, href, children, count }: {
  label: string
  href: string
  children: React.ReactNode
  count?: number
}) {
  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold">{label}</h2>
          {count !== undefined && (
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{count.toLocaleString()} products</span>
          )}
        </div>
        <Link href={href} className="flex items-center gap-1 text-sm font-medium text-primary hover:underline">
          View all <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {children}
      </div>
    </section>
  )
}

// ── Main client component ─────────────────────────────────────────────────────

interface BuyPageClientProps {
  agrochemicals?: any[]
  agrochemicalTotal?: number
  animalHealth?: any[]
  animalHealthTotal?: number
  feeds?: any[]
  feedsTotal?: number
  plantNutrition?: any[]
  plantNutritionTotal?: number
  seeds?: any[]
  seedsTotal?: number
  documents?: any[]
  documentsTotal?: number
  bookingEvents?: any[]
}

export function BuyPageClient({
  agrochemicals = [], agrochemicalTotal = 0,
  animalHealth = [], animalHealthTotal = 0,
  feeds = [], feedsTotal = 0,
  plantNutrition = [], plantNutritionTotal = 0,
  seeds = [], seedsTotal = 0,
  documents = [], documentsTotal = 0,
  bookingEvents = [],
}: BuyPageClientProps) {
  const categoryTotals: Record<string, number> = {
    "agrochemicals": agrochemicalTotal,
    "animal-health": animalHealthTotal,
    "animal-feed": feedsTotal,
    "plant-nutrition": plantNutritionTotal,
    "seeds": seedsTotal,
  }

  const visibleCategories = CATEGORIES.filter(
    ({ id }) => (id === "pre-orders" && bookingEvents.length > 0) || (categoryTotals[id] ?? 0) > 0
  )

  return (
    <div className="mx-auto max-w-7xl px-4 lg:px-8 py-8">
      <div className="flex gap-8">

        {/* ── Sidebar ── */}
        <aside className="hidden lg:flex flex-col w-56 flex-shrink-0">
          <div>
            <nav className="flex flex-col gap-0.5">
              {visibleCategories.map(({ label, href }) => (
                <Link
                  key={href}
                  href={href}
                  className="px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>
        </aside>

        {/* ── Main content ── */}
        <main className="flex-1 min-w-0 flex flex-col gap-12">

          <PreOrdersSection />

          {agrochemicalTotal > 0 && (
            <Section label="Agrochemicals" href="/buy-agrochemicals" count={agrochemicalTotal}>
              {agrochemicals.slice(0, 4).map((p) => (
                <ProductCard key={p.id} mode="buy" href={`/buy-agrochemicals/${p.slug}`} imageSrc={p.images?.[0]?.img?.src} name={p.name} brand={p.brand?.name} meta={p.agrochemical_category?.name} productId={p.id} productType="agrochemical" productSlug={p.slug} salePrice={p.sale_price} wasPrice={p.was_price} showWasPrice={p.show_was_price} availableForSale={p.available_for_sale} stockLevel={p.stock_level} hasVariants={p.variants?.length > 0} variantPriceRange={p.variant_price_range} pickupOnly={p.pickup_location_ids?.length > 0 && !p.delivery_available && !(p.delivery_location_ids?.length > 0)} />
              ))}
            </Section>
          )}

          {animalHealthTotal > 0 && (
            <Section label="Animal Health" href="/buy-animal-health" count={animalHealthTotal}>
              {animalHealth.slice(0, 4).map((p) => (
                <ProductCard key={p.id} mode="buy" href={`/buy-animal-health/${p.slug}`} imageSrc={p.images?.[0]?.img?.src} name={p.name} brand={p.brand?.name} meta={p.animal_health_category?.name} productId={p.id} productType="animal_health" productSlug={p.slug} salePrice={p.sale_price} wasPrice={p.was_price} showWasPrice={p.show_was_price} availableForSale={p.available_for_sale} stockLevel={p.stock_level} hasVariants={p.variants?.length > 0} variantPriceRange={p.variant_price_range} pickupOnly={p.pickup_location_ids?.length > 0 && !p.delivery_available && !(p.delivery_location_ids?.length > 0)} />
              ))}
            </Section>
          )}

          {feedsTotal > 0 && (
            <Section label="Animal Feed" href="/buy-feeds" count={feedsTotal}>
              {feeds.slice(0, 4).map((p) => (
                <ProductCard key={p.id} mode="buy" href={`/buy-feeds/${p.slug}`} imageSrc={p.images?.[0]?.img?.src} name={p.name} brand={p.brand?.name} meta={p.animal ? `${p.animal}${p.phase ? ` · ${p.phase}` : ""}` : undefined} productId={p.id} productType="feed" productSlug={p.slug} salePrice={p.sale_price} wasPrice={p.was_price} showWasPrice={p.show_was_price} availableForSale={p.available_for_sale} stockLevel={p.stock_level} hasVariants={p.variants?.length > 0} variantPriceRange={p.variant_price_range} pickupOnly={p.pickup_location_ids?.length > 0 && !p.delivery_available && !(p.delivery_location_ids?.length > 0)} />
              ))}
            </Section>
          )}

          {plantNutritionTotal > 0 && (
            <Section label="Plant Nutrition" href="/buy-plant-nutrition" count={plantNutritionTotal}>
              {plantNutrition.slice(0, 4).map((p) => (
                <ProductCard key={p.id} mode="buy" href={`/buy-plant-nutrition/${p.slug}`} imageSrc={p.images?.[0]?.img?.src} name={p.name} brand={p.brand?.name} meta={p.plant_nutrition_category?.name} productId={p.id} productType="plant_nutrition" productSlug={p.slug} salePrice={p.sale_price} wasPrice={p.was_price} showWasPrice={p.show_was_price} availableForSale={p.available_for_sale} stockLevel={p.stock_level} hasVariants={p.variants?.length > 0} variantPriceRange={p.variant_price_range} pickupOnly={p.pickup_location_ids?.length > 0 && !p.delivery_available && !(p.delivery_location_ids?.length > 0)} />
              ))}
            </Section>
          )}

          {seedsTotal > 0 && (
            <Section label="Seeds" href="/buy-seed-products" count={seedsTotal}>
              {seeds.slice(0, 4).map((p) => {
                const bookingEvent = bookingEvents.find((e: any) => e.product_id === p.id)
                return (
                  <ProductCard key={p.id} mode="buy" href={`/buy-seed-products/${p.slug}`} imageSrc={p.images?.[0]?.img?.src} name={p.name} brand={p.brand?.name} meta={p.variety ? `${p.variety}${p.type ? ` · ${p.type.replace("_", " ")}` : ""}` : undefined} productId={p.id} productType="seed_product" productSlug={p.slug} salePrice={p.sale_price} wasPrice={p.was_price} showWasPrice={p.show_was_price} availableForSale={p.available_for_sale} stockLevel={p.stock_level} hasVariants={p.variants && p.variants.length > 0} variantPriceRange={p.variant_price_range} preorderHref={bookingEvent ? `/bookings/${bookingEvent.slug}` : undefined} />
                )
              })}
            </Section>
          )}

          {documents.length > 0 && (
            <Section label="Plans & Documents" href="/buy-documents" count={documentsTotal}>
              {documents.slice(0, 4).map((doc) => (
                <DocumentCard key={doc.id} doc={doc} />
              ))}
            </Section>
          )}

          {agrochemicalTotal === 0 && animalHealthTotal === 0 && feedsTotal === 0 && plantNutritionTotal === 0 && seedsTotal === 0 && documents.length === 0 && bookingEvents.length === 0 && (
            <div className="py-16 text-center">
              <p className="text-lg font-semibold">Products Coming Soon</p>
              <p className="text-sm text-muted-foreground mt-1">We&apos;re stocking up. Check back shortly.</p>
            </div>
          )}

        </main>
      </div>
    </div>
  )
}
