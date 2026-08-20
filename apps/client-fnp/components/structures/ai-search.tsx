'use client'

import * as React from "react"
import { useRouter } from "next/navigation"
import { sendGTMEvent } from "@next/third-parties/google"
import { Sparkles, ArrowUp, Loader2 } from "lucide-react"
import { BaseURL } from "@/lib/schemas"

interface AISearchProduct {
  id: string
  name: string
  slug: string
  _collection: string
  type?: string
  brand_name?: string
  category_name?: string
  image_src?: string
}

interface AISearchResponse {
  message: string
  language: string
  products: AISearchProduct[]
  cached: boolean
  session_id: string
  fallback?: string
  error?: string
  error_type?: string
}

const COLLECTION_URL_PREFIX: Record<string, string> = {
  agro_chemicals: "/buy-agrochemicals/",
  animal_health: "/buy-animal-health/",
  plant_nutrition: "/buy-plant-nutrition/",
  feed_products: "/buy-feeds/",
  seed_products: "/buy-seed-products/",
  equipment: "/buy-equipment/",
  guides: "/buy-documents/",
  farm_produce: "/farm-produce/",
  clients: "/buyer/",
  prices: "/prices",
  bookings: "/bookings/",
  lots: "/lots/",
}

const COLLECTION_LABELS: Record<string, string> = {
  agro_chemicals: "Agrochemical",
  animal_health: "Animal Health",
  plant_nutrition: "Plant Nutrition",
  feed_products: "Animal Feed",
  seed_products: "Seeds",
  equipment: "Equipment",
  guides: "Guide",
  farm_produce: "Farm Produce",
  clients: "Client",
  prices: "Prices",
  bookings: "Pre-Order",
  lots: "Lot",
}

function getProductUrl(product: AISearchProduct): string {
  const prefix = COLLECTION_URL_PREFIX[product._collection]
  if (!prefix) return "/"
  if (product._collection === "prices") return "/prices"
  if (product._collection === "clients") {
    const clientPrefix = product.type === "farmer" ? "/farmer/" : "/buyer/"
    return `${clientPrefix}${product.slug}`
  }
  if (product._collection === "guides") {
    if (product.type === "spray_program") return `/spray-programs/${product.slug}`
    if (product.type === "feeding_program") return `/feeding-programs/${product.slug}`
    return `/buy-documents/${product.slug}`
  }
  return `${prefix}${product.slug}`
}

/** Button-triggered AI search section for the /search page */
export function AISearchSection({ query }: { query: string }) {
  const router = useRouter()
  const [active, setActive] = React.useState(false)
  const [message, setMessage] = React.useState("")
  const [products, setProducts] = React.useState<AISearchProduct[]>([])
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [sessionId] = React.useState(() => crypto.randomUUID())
  const [followUp, setFollowUp] = React.useState("")
  const [followUpLoading, setFollowUpLoading] = React.useState(false)

  function handleAskAI() {
    setActive(true)
    fetchAISearch(query)
    sendGTMEvent({ event: "ai_search_session_start", query })
  }

  async function fetchAISearch(q: string, isFollowUp = false) {
    if (isFollowUp) {
      setFollowUpLoading(true)
    } else {
      setLoading(true)
    }
    setError(null)

    sendGTMEvent({
      event: isFollowUp ? "ai_search_followup" : "ai_search_query",
      query: q,
      session_id: sessionId,
    })

    try {
      const res = await fetch(`${BaseURL}/ai-search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q, session_id: sessionId }),
      })

      const data: AISearchResponse = await res.json()

      if (!res.ok || data.error) {
        setError("AI search is temporarily unavailable.")
        return
      }

      setMessage(data.message)
      setProducts(data.products)

      sendGTMEvent({
        event: data.cached ? "ai_search_cache_hit" : "ai_search_claude_call",
        query: q,
        language: data.language,
      })

      if (data.products.length === 0) {
        sendGTMEvent({ event: "ai_search_no_results", query: q, language: data.language })
      }
    } catch {
      setError("AI search is temporarily unavailable.")
    } finally {
      setLoading(false)
      setFollowUpLoading(false)
    }
  }

  function handleFollowUp(e: React.FormEvent) {
    e.preventDefault()
    const q = followUp.trim()
    if (!q || followUpLoading) return
    setFollowUp("")
    fetchAISearch(q, true)
  }

  function handleProductClick(product: AISearchProduct, position: number) {
    sendGTMEvent({
      event: "ai_search_result_click",
      product_id: product.id,
      collection: product._collection,
      position: position + 1,
    })
    router.push(getProductUrl(product))
  }

  // Not activated yet — show the "Ask AI" button
  if (!active) {
    return (
      <button
        onClick={handleAskAI}
        className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors mb-6"
      >
        <Sparkles className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium">Ask AI about &quot;{query}&quot;</span>
      </button>
    )
  }

  // Loading state
  if (loading) {
    return (
      <div className="rounded-lg border bg-card p-4 mb-6">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Sparkles className="h-4 w-4 text-primary" />
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">AI is searching...</span>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="rounded-lg border border-orange-200 bg-orange-50 p-4 mb-6">
        <p className="text-sm text-orange-800">{error}</p>
      </div>
    )
  }

  // No response yet
  if (!message) return null

  return (
    <div className="rounded-lg border bg-card p-4 mb-6 space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-primary shrink-0" />
        <span className="text-xs font-medium text-primary">farmnport assistant</span>
      </div>

      {/* AI message */}
      <p className="text-sm whitespace-pre-line">{message}</p>

      {/* Product cards */}
      {products.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {products.map((product, pi) => (
            <button
              key={product.id || pi}
              className="flex items-center gap-3 rounded-lg border p-2.5 text-left hover:bg-muted/50 transition-colors"
              onClick={() => handleProductClick(product, pi)}
            >
              {product.image_src ? (
                <img src={product.image_src} alt="" className="h-10 w-10 rounded object-cover shrink-0" />
              ) : (
                <div className="h-10 w-10 rounded bg-muted/30 shrink-0" />
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate capitalize">{product.name}</p>
                <div className="flex items-center gap-1.5">
                  {product.brand_name && (
                    <span className="text-xs text-muted-foreground truncate">{product.brand_name}</span>
                  )}
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                    {product._collection === "clients" ? (product.type === "farmer" ? "Farmer" : "Buyer") : (COLLECTION_LABELS[product._collection] || product._collection)}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Follow-up input */}
      <form onSubmit={handleFollowUp} className="flex items-center gap-2 pt-1">
        <div className="relative flex-1 flex items-center rounded-lg border bg-background">
          <input
            value={followUp}
            onChange={(e) => setFollowUp(e.target.value)}
            placeholder="Ask a follow-up..."
            className="flex-1 h-9 pl-3 pr-9 text-sm bg-transparent outline-none placeholder:text-muted-foreground/60 rounded-lg"
            disabled={followUpLoading}
          />
          <button
            type="submit"
            disabled={!followUp.trim() || followUpLoading}
            className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 flex items-center justify-center rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-40"
          >
            {followUpLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <ArrowUp className="h-3 w-3" />}
          </button>
        </div>
      </form>
    </div>
  )
}
