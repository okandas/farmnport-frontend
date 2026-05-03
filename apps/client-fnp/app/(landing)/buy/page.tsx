import { ShoppingCart } from "lucide-react"
import {
  queryAllAgroChemicals,
  queryAllAnimalHealthProducts,
  queryAllFeedProducts,
  queryAllPlantNutritionProducts,
  queryAllDocuments,
} from "@/lib/query"
import { BuyPageClient } from "./BuyPageClient"

async function fetchSection(fn: () => Promise<any>) {
  try {
    const res = await fn()
    return { data: res?.data?.data || [], total: res?.data?.total || 0 }
  } catch {
    return { data: [], total: 0 }
  }
}

export default async function BuyPage() {
  const [agro, animalHealth, feeds, plantNutrition, documents] = await Promise.all([
    fetchSection(() => queryAllAgroChemicals({ p: 1, brand: [], target: [], active_ingredient: [] })),
    fetchSection(() => queryAllAnimalHealthProducts({ p: 1, brand: [], target: [], active_ingredient: [], used_on: [] })),
    fetchSection(() => queryAllFeedProducts({ p: 1 })),
    fetchSection(() => queryAllPlantNutritionProducts({ p: 1, brand: [], category: [], active_ingredient: [], used_on: [] })),
    fetchSection(() => queryAllDocuments({ p: 1 })),
  ])

  return (
    <main className="bg-gradient-to-b from-background to-muted/20 min-h-screen">
      {/* Hero */}
      <section className="py-6 lg:py-8 border-b border-border">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="flex items-center gap-3">
            <ShoppingCart className="h-5 w-5 text-primary" />
            <div>
              <h1 className="text-2xl font-bold tracking-tight font-heading">
                Buy Farm Inputs
              </h1>
              <p className="text-sm text-muted-foreground">
                Agrochemicals, animal health, feed, plant nutrition & more.
              </p>
            </div>
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
        documents={documents.data}
        documentsTotal={documents.total}
      />
    </main>
  )
}
