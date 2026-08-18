'use client'

import * as React from "react"
import { useRouter } from "next/navigation"
import { sendGTMEvent } from "@next/third-parties/google"
import { Sparkles, Search, ArrowUp, Loader2, X } from "lucide-react"
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

interface ChatMessage {
  role: "user" | "assistant"
  content: string
  products?: AISearchProduct[]
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

export function AISearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter()
  const [query, setQuery] = React.useState("")
  const [messages, setMessages] = React.useState<ChatMessage[]>([])
  const [loading, setLoading] = React.useState(false)
  const [sessionId] = React.useState(() => crypto.randomUUID())
  const [error, setError] = React.useState<string | null>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const messagesEndRef = React.useRef<HTMLDivElement>(null)

  // Auto-focus input when opened
  React.useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100)
      sendGTMEvent({ event: "ai_search_session_start" })
    }
  }, [open])

  // Scroll to bottom on new messages
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Reset on close
  React.useEffect(() => {
    if (!open) {
      setQuery("")
      setMessages([])
      setError(null)
    }
  }, [open])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const q = query.trim()
    if (!q || loading) return

    setError(null)

    // Add user message
    const userMsg: ChatMessage = { role: "user", content: q }
    setMessages((prev) => [...prev, userMsg])
    setQuery("")
    setLoading(true)

    const turnNumber = messages.filter((m) => m.role === "user").length + 1

    sendGTMEvent({
      event: turnNumber > 1 ? "ai_search_followup" : "ai_search_query",
      query: q,
      session_id: sessionId,
      turn_number: turnNumber,
    })

    try {
      const res = await fetch(`${BaseURL}/ai-search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q, session_id: sessionId }),
      })

      const data: AISearchResponse = await res.json()

      if (!res.ok || data.error) {
        if (data.fallback === "search") {
          setError("AI search is temporarily unavailable. Use normal search instead.")
          sendGTMEvent({ event: "ai_search_off_topic", query: q })
        } else {
          setError(data.error || "Something went wrong")
        }
        setLoading(false)
        return
      }

      const assistantMsg: ChatMessage = {
        role: "assistant",
        content: data.message,
        products: data.products,
      }
      setMessages((prev) => [...prev, assistantMsg])

      sendGTMEvent({
        event: data.cached ? "ai_search_cache_hit" : "ai_search_claude_call",
        query: q,
        language: data.language,
      })

      if (data.products.length === 0) {
        sendGTMEvent({ event: "ai_search_no_results", query: q, language: data.language })
      }
    } catch {
      setError("AI search is temporarily unavailable. Use normal search instead.")
    } finally {
      setLoading(false)
    }
  }

  function handleProductClick(product: AISearchProduct, position: number) {
    sendGTMEvent({
      event: "ai_search_result_click",
      product_id: product.id,
      collection: product._collection,
      position: position + 1,
    })
    onClose()
    router.push(getProductUrl(product))
  }

  function handleViewAll() {
    const lastUserMsg = [...messages].reverse().find((m) => m.role === "user")
    if (lastUserMsg) {
      sendGTMEvent({ event: "ai_search_view_all", query: lastUserMsg.content })
      onClose()
      router.push(`/search?q=${encodeURIComponent(lastUserMsg.content)}`)
    }
  }

  function handleFallbackSearch() {
    const lastUserMsg = [...messages].reverse().find((m) => m.role === "user")
    const searchQuery = lastUserMsg?.content || query
    if (searchQuery) {
      onClose()
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60] bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 h-14 border-b shrink-0">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">Ask AI</span>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-muted transition-colors"
          aria-label="Close AI search"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {messages.length === 0 && !loading && (
            <div className="text-center py-16 space-y-3">
              <Sparkles className="h-8 w-8 mx-auto text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">
                Ask me anything about farming products in English, Shona, or Ndebele
              </p>
              <div className="flex flex-wrap justify-center gap-2 pt-2">
                {["mushonga wemadomasi", "chicken feed", "hybrid maize seed", "fertilizer yechibage"].map((example) => (
                  <button
                    key={example}
                    className="text-xs px-3 py-1.5 rounded-full border hover:bg-muted transition-colors text-muted-foreground"
                    onClick={() => {
                      setQuery(example)
                      inputRef.current?.focus()
                    }}
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={msg.role === "user" ? "flex justify-end" : ""}>
              {msg.role === "user" ? (
                <div className="bg-primary text-primary-foreground rounded-2xl rounded-br-sm px-4 py-2 max-w-[80%]">
                  <p className="text-sm">{msg.content}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm">{msg.content}</p>
                  {msg.products && msg.products.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {msg.products.map((product, pi) => (
                        <button
                          key={product.id || pi}
                          className="flex items-center gap-3 rounded-lg border p-3 text-left hover:bg-muted/50 transition-colors"
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
                  {msg.products && msg.products.length > 0 && (
                    <button
                      onClick={handleViewAll}
                      className="text-xs text-primary hover:underline flex items-center gap-1"
                    >
                      <Search className="h-3 w-3" />
                      View all results
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Searching...</span>
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-orange-200 bg-orange-50 p-3 space-y-2">
              <p className="text-sm text-orange-800">{error}</p>
              <button
                onClick={handleFallbackSearch}
                className="text-xs font-medium text-primary hover:underline flex items-center gap-1"
              >
                <Search className="h-3 w-3" />
                Switch to normal search
              </button>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t px-4 py-3 shrink-0">
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
          <div className="relative flex items-center rounded-xl border bg-background">
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask about farming products..."
              className="flex-1 h-11 pl-4 pr-12 text-sm bg-transparent outline-none placeholder:text-muted-foreground/60 rounded-xl"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={!query.trim() || loading}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 h-8 w-8 flex items-center justify-center rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-40"
            >
              <ArrowUp className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
