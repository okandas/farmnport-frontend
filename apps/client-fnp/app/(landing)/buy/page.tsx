import Link from "next/link"
import { BuyPageClient } from "./BuyPageClient"

const BASE = (process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3744") + "/v1"

async function fetchSection(url: string) {
  try {
    const res = await fetch(url, { cache: "no-store" })
    if (!res.ok) return { data: [], total: 0 }
    const json = await res.json()
    return { data: json.data || [], total: json.total || 0 }
  } catch {
    return { data: [], total: 0 }
  }
}

export default async function BuyPage() {
  const [agro, animalHealth, feeds, plantNutrition, seeds, documents, bookingsRes] = await Promise.all([
    fetchSection(`${BASE}/agrochemical/buy`),
    fetchSection(`${BASE}/animalhealth/buy`),
    fetchSection(`${BASE}/feed/buy`),
    fetchSection(`${BASE}/plantnutrition/buy`),
    fetchSection(`${BASE}/seed-products/buy`),
    fetchSection(`${BASE}/documents`),
    fetch(`${BASE}/booking/events?status=open`, { cache: "no-store" }).then(r => r.ok ? r.json() : null).catch(() => null),
  ])
  const bookingEvents: any[] = bookingsRes?.events ?? []

  return (
    <main className="bg-gradient-to-b from-background to-muted/20 min-h-screen">
      {/* Hero */}
      <section className="py-6 lg:py-8 border-b border-border">
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
      />
    </main>
  )
}
