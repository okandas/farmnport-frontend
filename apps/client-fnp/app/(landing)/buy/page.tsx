import Link from "next/link"
import { BuyPageClient } from "./BuyPageClient"
import { serverFetch } from "@/lib/serverFetch"
import { documentsEnabled, bookingsEnabled } from "@/flags"
import { getBuyCategories } from "@/components/generic/BuyCategoriesNav"

async function fetchSection(path: string) {
  try {
    const json = await serverFetch(path)
    return { data: json.data || [], total: json.total || 0 }
  } catch {
    return { data: [], total: 0 }
  }
}

export default async function BuyPage() {
  const [showDocuments, showBookings, categories] = await Promise.all([documentsEnabled(), bookingsEnabled(), getBuyCategories()])

  const [agro, animalHealth, feeds, plantNutrition, seeds, documents, bookingsRes] = await Promise.all([
    fetchSection("/agrochemical/buy"),
    fetchSection("/animalhealth/buy"),
    fetchSection("/feed/buy"),
    fetchSection("/plantnutrition/buy"),
    fetchSection("/seed-products/buy"),
    showDocuments ? fetchSection("/documents/all") : Promise.resolve({ data: [], total: 0 }),
    showBookings ? serverFetch("/booking/preorders?status=open").catch(() => null) : Promise.resolve(null),
  ])
  const bookingEvents: any[] = bookingsRes?.preorders ?? []

  return (
    <main className="bg-gradient-to-b from-background to-muted/20 min-h-screen">
      {/* Hero */}
      <section className="py-6 lg:py-8">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <span>/</span>
            <span className="text-foreground font-medium">Buy</span>
          </nav>
          <div>
            <h1 className="text-2xl font-bold tracking-tight font-heading">
              Buy Farm Inputs
            </h1>
            <p className="text-sm text-muted-foreground">
              Agrochemicals, animal health, feed, plant nutrition & more.
            </p>
          </div>
        </div>
      </section>

      <BuyPageClient
        agrochemicals={agro.data}
        agrochemicalTotal={agro.total}
        animalHealth={animalHealth.data}
        animalHealthTotal={animalHealth.total}
        feeds={feeds.data}
        feedsTotal={feeds.total}
        plantNutrition={plantNutrition.data}
        plantNutritionTotal={plantNutrition.total}
        seeds={seeds.data}
        seedsTotal={seeds.total}
        documents={documents.data}
        documentsTotal={documents.total}
        bookingEvents={bookingEvents}
        showDocuments={showDocuments}
        showBookings={showBookings}
        categories={categories}
      />
    </main>
  )
}
