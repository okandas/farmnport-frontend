"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { sendGTMEvent } from "@next/third-parties/google"
import { BaseURL } from "@/lib/schemas"

interface SearchResult {
  collection: string
  found: number
  hits: { document: Record<string, any> }[]
}

const COLLECTION_LABELS: Record<string, string> = {
  agro_chemicals: "Agrochemical",
  animal_health: "Animal Health",
  plant_nutrition: "Plant Nutrition",
  feed_products: "Animal Feed",
  seed_products: "Seeds",
  equipment: "Equipment",
  guides: "Guide",
  buyers: "Buyer",
  prices: "Market Prices",
  bookings: "Pre-Order",
  lots: "Lot",
}

function getUrls(collection: string, doc: Record<string, any>): { guide?: string; buy?: string; view?: string } {
  const GUIDE_BASE: Record<string, string> = {
    agro_chemicals: "/agrochemical-guides",
    animal_health: "/animal-health-guides",
    plant_nutrition: "/plant-nutrition-guides",
    feed_products: "/feed-guides",
    seed_products: "/seed-guides",
    equipment: "/equipment-guides",
  }
  const BUY_BASE: Record<string, string> = {
    agro_chemicals: "/buy-agrochemicals",
    animal_health: "/buy-animal-health",
    plant_nutrition: "/buy-plant-nutrition",
    feed_products: "/buy-feeds",
    seed_products: "/buy-seed-products",
    equipment: "/buy-equipment",
  }

  if (collection === "guides") {
    if (doc.type === "spray_program") return { view: `/spray-programs/${doc.slug}` }
    if (doc.type === "feeding_program") return { view: `/feeding-programs/${doc.slug}` }
    return { view: `/buy-documents/${doc.slug}` }
  }
  if (collection === "prices") return { view: "/prices" }
  if (collection === "buyers") return { view: `/buyer/${doc.slug}` }
  if (collection === "bookings") return { view: `/bookings/${doc.slug}` }
  if (collection === "lots") return { view: `/lots/${doc.slug}` }

  const result: { guide?: string; buy?: string } = {}
  const guideBase = GUIDE_BASE[collection]
  const buyBase = BUY_BASE[collection]
  if (guideBase) {
    const category = doc.category_name ? doc.category_name.toLowerCase().replace(/\s+/g, "-").replace(/[&]/g, "").replace(/--+/g, "-") : ""
    result.guide = category ? `${guideBase}/${category}/${doc.slug}` : `${guideBase}/${doc.slug}`
  }
  if (buyBase) result.buy = `${buyBase}/${doc.slug}`
  return result
}

function getName(collection: string, doc: Record<string, any>): string {
  if (collection === "prices") return doc.client_name || "Price Sheet"
  if (collection === "lots") return doc.farm_produce_name || "Lot"
  if (collection === "bookings") return doc.name || "Booking"
  return doc.name || ""
}

function getDescription(collection: string, doc: Record<string, any>): string {
  if (collection === "prices") {
    const commodities = doc.commodities?.join(", ") || ""
    const date = doc.effective_date ? new Date(doc.effective_date * 1000).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : ""
    return [commodities, date].filter(Boolean).join(" · ")
  }
  if (collection === "lots") {
    const qty = doc.quantity && doc.unit ? `${doc.quantity} ${doc.unit}` : ""
    const location = [doc.city, doc.province].filter(Boolean).join(", ")
    return [doc.breed_name, qty, location].filter(Boolean).join(" · ")
  }
  if (collection === "buyers") return [doc.short_description, doc.city, doc.province].filter(Boolean).join(" · ")
  if (collection === "bookings") return [doc.produce_name, doc.breed_name, doc.client_name].filter(Boolean).join(" · ")
  if (collection === "guides") return doc.description || ""
  return [doc.brand_name, doc.category_name].filter(Boolean).join(" · ")
}

function getPrice(doc: Record<string, any>): string | null {
  if (doc.min_price_cents && doc.min_price_cents > 0) {
    const min = `$${(doc.min_price_cents / 100).toFixed(2)}`
    if (doc.max_price_cents && doc.max_price_cents > doc.min_price_cents) {
      return `${min} – $${(doc.max_price_cents / 100).toFixed(2)}`
    }
    return min
  }
  if (doc.unit_price_cents && doc.unit_price_cents > 0) {
    return `$${(doc.unit_price_cents / 100).toFixed(2)}${doc.unit ? ` per ${doc.unit}` : ""}`
  }
  if (doc.price_per_unit_cents && doc.price_per_unit_cents > 0) {
    return `$${(doc.price_per_unit_cents / 100).toFixed(2)}${doc.unit ? `/${doc.unit}` : ""}`
  }
  return null
}

export function SearchResults() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const q = searchParams.get("q") || ""
  const categoryParam = searchParams.get("category") || "all"
  const pageParam = parseInt(searchParams.get("page") || "1", 10)
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [filter, setFilter] = useState(categoryParam)
  const [page, setPage] = useState(pageParam)

  useEffect(() => {
    setFilter(categoryParam)
  }, [categoryParam])

  useEffect(() => {
    setPage(pageParam)
  }, [pageParam])

  const flatItems = results
    .filter(group => group.collection !== "farm_produce")
    .filter(group => filter === "all" || group.collection === filter)
    .flatMap(group =>
      (group.hits ?? []).map(hit => ({ collection: group.collection, doc: hit.document }))
    )
  const totalFound = results.filter(r => r.collection !== "farm_produce").reduce((sum, r) => sum + r.found, 0)
  const hasMore = results.some(r => r.collection !== "farm_produce" && (filter === "all" || r.collection === filter) && r.found > page * 5)

  useEffect(() => {
    if (!q.trim()) return
    doSearch(q, page)
  }, [q, page])

  async function doSearch(term: string, p: number) {
    if (!term.trim()) return
    setLoading(true)
    setSearched(true)
    try {
      const res = await fetch(`${BaseURL}/search?q=${encodeURIComponent(term.trim())}&page=${p}`)
      if (res.ok) {
        const data = await res.json()
        setResults(data.results || [])
        if (p === 1) {
          sendGTMEvent({
            event: "search",
            search_term: term.trim(),
            search_results_count: (data.results || []).reduce((s: number, r: any) => s + r.found, 0),
          })
        }
      }
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }

  function goToPage(p: number) {
    const params = new URLSearchParams()
    params.set("q", q)
    if (filter !== "all") params.set("category", filter)
    if (p > 1) params.set("page", String(p))
    router.push(`/search?${params.toString()}`)
  }

  return (
    <div className="min-h-screen">
      <div className="container py-6">

        {/* Results count */}
        {searched && !loading && (
          <p className="text-sm text-muted-foreground mb-4">
            {flatItems.length > 0
              ? `${flatItems.length} result${flatItems.length !== 1 ? "s" : ""} for "${q}"${filter !== "all" ? ` in ${COLLECTION_LABELS[filter] || filter}` : ""}`
              : `No results for "${q}"${filter !== "all" ? ` in ${COLLECTION_LABELS[filter] || filter}` : ""}`}
          </p>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="rounded-lg border bg-card overflow-hidden">
                <div className="aspect-square bg-muted/40 animate-pulse" />
                <div className="p-3 space-y-2">
                  <div className="h-4 bg-muted/40 rounded animate-pulse w-3/4" />
                  <div className="h-3 bg-muted/40 rounded animate-pulse w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Results grid — same card style as trending */}
        {!loading && flatItems.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {flatItems.map((item, i) => {
              const name = getName(item.collection, item.doc)
              const description = getDescription(item.collection, item.doc)
              const price = getPrice(item.doc)
              const urls = getUrls(item.collection, item.doc)
              const image = item.doc.image_src
              return (
                <div
                  key={`${item.collection}-${item.doc.id}-${i}`}
                  className="group flex flex-col rounded-lg border bg-card hover:border-primary/40 hover:shadow-md transition-all overflow-hidden"
                >
                  {/* Image */}
                  <div className="aspect-square bg-muted/30 dark:bg-white relative">
                    {image && (
                      <img src={image} alt="" className="absolute inset-0 w-full h-full object-contain p-3" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-3 flex flex-col flex-1 border-t">
                    <p className="text-[11px] font-medium text-foreground mb-1">{COLLECTION_LABELS[item.collection] ?? item.collection}</p>
                    <h3 className="text-sm font-semibold group-hover:text-primary transition-colors line-clamp-2 capitalize">
                      {name}
                    </h3>
                    {description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2 capitalize">{description}</p>
                    )}

                    <div className="mt-auto pt-3">
                      {price && <p className="text-base font-bold mb-2">{price}</p>}

                      {/* Action buttons */}
                      <div className="flex items-center gap-1.5">
                        {urls.buy && (
                          <Link
                            href={urls.buy}
                            className="flex-1 h-7 rounded text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors inline-flex items-center justify-center"
                          >
                            Buy
                          </Link>
                        )}
                        {urls.guide && (
                          <Link
                            href={urls.guide}
                            className="flex-1 h-7 rounded text-xs font-medium border text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors inline-flex items-center justify-center"
                          >
                            Guide
                          </Link>
                        )}
                        {urls.view && !urls.buy && (
                          <Link
                            href={urls.view}
                            className="flex-1 h-7 rounded text-xs font-medium border text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors inline-flex items-center justify-center"
                          >
                            View
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Pagination */}
        {!loading && flatItems.length > 0 && (
          <div className="flex items-center justify-center gap-1 mt-8">
            {(() => {
              const maxFound = results
                .filter(r => r.collection !== "farm_produce")
                .filter(r => filter === "all" || r.collection === filter)
                .reduce((max, r) => Math.max(max, r.found), 0)
              const totalPages = Math.max(1, Math.ceil(maxFound / 5))
              const pages: number[] = []
              for (let i = 1; i <= totalPages; i++) {
                if (i <= 3 || i >= totalPages - 1 || Math.abs(i - page) <= 1) {
                  pages.push(i)
                } else if (pages[pages.length - 1] !== -1) {
                  pages.push(-1)
                }
              }
              return pages.map((p, i) =>
                p === -1 ? (
                  <span key={`dot-${i}`} className="w-9 h-9 flex items-center justify-center text-sm text-muted-foreground">...</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => goToPage(p)}
                    className={`w-9 h-9 rounded-md text-sm font-medium transition-colors ${
                      p === page
                        ? "bg-foreground text-background"
                        : "border hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {p}
                  </button>
                )
              )
            })()}
          </div>
        )}

        {/* Empty state */}
        {searched && !loading && flatItems.length === 0 && (
          <div className="text-center py-16">
            <p className="text-sm text-muted-foreground">Try a different search term or browse our categories</p>
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              <Link href="/buy" className="text-xs px-3 py-1.5 rounded-full border hover:bg-muted transition-colors">Browse Products</Link>
              <Link href="/guides" className="text-xs px-3 py-1.5 rounded-full border hover:bg-muted transition-colors">Guides</Link>
              <Link href="/prices" className="text-xs px-3 py-1.5 rounded-full border hover:bg-muted transition-colors">Prices</Link>
              <Link href="/buyers" className="text-xs px-3 py-1.5 rounded-full border hover:bg-muted transition-colors">Buyers</Link>
            </div>
          </div>
        )}

        {/* Initial state */}
        {!searched && !loading && (
          <div className="text-center py-16">
            <p className="text-sm text-muted-foreground">Search across all products, guides, buyers, prices, and more</p>
          </div>
        )}
      </div>
    </div>
  )
}
