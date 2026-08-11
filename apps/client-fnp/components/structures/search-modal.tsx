'use client'

import * as React from "react"
import { useRouter } from "next/navigation"
import { sendGTMEvent } from "@next/third-parties/google"
import { Search, FileText, Leaf, Bug, Pill, Wheat, Tractor, ShoppingBag, Users, DollarSign, CalendarCheck, Gavel } from "lucide-react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import { BaseURL } from "@/lib/schemas"

interface SearchResult {
  collection: string
  found: number
  hits: { document: Record<string, any> }[]
}

interface SearchResponse {
  results: SearchResult[]
}

const COLLECTION_META: Record<string, { label: string; icon: React.ElementType; urlPrefix: string }> = {
  agro_chemicals: { label: "Agrochemicals", icon: Bug, urlPrefix: "/buy-agrochemicals/" },
  animal_health: { label: "Animal Health", icon: Pill, urlPrefix: "/buy-animal-health/" },
  plant_nutrition: { label: "Plant Nutrition", icon: Leaf, urlPrefix: "/buy-plant-nutrition/" },
  feed_products: { label: "Animal Feed", icon: Wheat, urlPrefix: "/buy-feeds/" },
  seed_products: { label: "Seeds", icon: Wheat, urlPrefix: "/buy-seed-products/" },
  equipment: { label: "Equipment", icon: Tractor, urlPrefix: "/buy-equipment/" },
  guides: { label: "Guides & Programs", icon: FileText, urlPrefix: "" },
  farm_produce: { label: "Farm Produce", icon: ShoppingBag, urlPrefix: "/farm-produce/" },
  buyers: { label: "Buyers", icon: Users, urlPrefix: "/buyers/" },
  prices: { label: "Market Prices", icon: DollarSign, urlPrefix: "/prices" },
  bookings: { label: "Bookings", icon: CalendarCheck, urlPrefix: "/bookings/" },
  lots: { label: "Lots & Auctions", icon: Gavel, urlPrefix: "/lots/" },
}

function getResultUrl(collection: string, doc: Record<string, any>): string {
  const meta = COLLECTION_META[collection]
  if (!meta) return "/"

  if (collection === "guides") {
    const type = doc.type
    if (type === "spray_program") return `/spray-programs/${doc.slug}`
    if (type === "feeding_program") return `/feeding-programs/${doc.slug}`
    return `/buy-documents/${doc.slug}`
  }

  if (collection === "prices") return "/prices"
  if (collection === "buyers") return `/buyers/${doc.slug}`

  return `${meta.urlPrefix}${doc.slug}`
}

function getDisplayName(collection: string, doc: Record<string, any>): string {
  if (collection === "prices") return doc.client_name || "Price Sheet"
  if (collection === "lots") return doc.farm_produce_name || "Lot"
  if (collection === "bookings") return doc.name || "Booking"
  return doc.name || ""
}

function getStatusPill(collection: string, doc: Record<string, any>): { label: string; className: string } | null {
  if (collection === "lots") {
    const expired = doc.expires_at && doc.expires_at * 1000 < Date.now()
    if (doc.has_accepted_bid) return { label: "Sold", className: "bg-blue-100 text-blue-700" }
    if (expired) return { label: "Expired", className: "bg-zinc-100 text-zinc-500" }
    return { label: "Open", className: "bg-green-100 text-green-700" }
  }
  if (collection === "bookings") {
    if (doc.status === "open") return { label: "Open", className: "bg-green-100 text-green-700" }
    if (doc.status === "closed") return { label: "Closed", className: "bg-zinc-100 text-zinc-500" }
    return { label: doc.status, className: "bg-zinc-100 text-zinc-500" }
  }
  return null
}

function getDisplaySub(collection: string, doc: Record<string, any>): string {
  if (collection === "prices") {
    const commodities = doc.commodities?.join(", ") || ""
    const date = doc.effective_date ? new Date(doc.effective_date * 1000).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : ""
    return [commodities, date].filter(Boolean).join(" · ")
  }
  if (collection === "lots") {
    const qty = doc.quantity && doc.unit ? `${doc.quantity} ${doc.unit}` : ""
    const price = doc.price_per_unit_cents ? `$${(doc.price_per_unit_cents / 100).toFixed(2)}/${doc.unit || "unit"}` : ""
    const location = [doc.city, doc.province].filter(Boolean).join(", ")
    return [doc.breed_name, qty, price, location].filter(Boolean).join(" · ")
  }
  if (collection === "buyers") {
    return [doc.city, doc.province].filter(Boolean).join(", ")
  }
  if (collection === "farm_produce") {
    return doc.category_name || ""
  }
  const parts = [doc.brand_name, doc.category_name].filter(Boolean)
  return parts.join(" · ")
}

export function SearchModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const router = useRouter()
  const [query, setQuery] = React.useState("")
  const [results, setResults] = React.useState<SearchResult[]>([])
  const [loading, setLoading] = React.useState(false)
  const [activeIndex, setActiveIndex] = React.useState(0)
  const inputRef = React.useRef<HTMLInputElement>(null)

  // Flatten results for keyboard navigation
  const flatItems = React.useMemo(() => {
    const items: { collection: string; doc: Record<string, any> }[] = []
    for (const group of results) {
      for (const hit of group.hits) {
        items.push({ collection: group.collection, doc: hit.document })
      }
    }
    return items
  }, [results])

  // Debounced search
  React.useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }

    const timeout = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(`${BaseURL}/search?q=${encodeURIComponent(query.trim())}`)
        if (res.ok) {
          const data: SearchResponse = await res.json()
          setResults(data.results)
          setActiveIndex(0)
          const totalFound = data.results.reduce((sum, r) => sum + r.found, 0)
          sendGTMEvent({
            event: "search",
            search_term: query.trim(),
            search_results_count: totalFound,
          })
        }
      } catch {
        // silent fail
      } finally {
        setLoading(false)
      }
    }, 200)

    return () => clearTimeout(timeout)
  }, [query])

  // Reset on close
  React.useEffect(() => {
    if (!open) {
      setQuery("")
      setResults([])
      setActiveIndex(0)
    }
  }, [open])

  function navigate(index: number) {
    const item = flatItems[index]
    if (!item) return
    const url = getResultUrl(item.collection, item.doc)
    sendGTMEvent({
      event: "search_result_click",
      search_term: query,
      result_collection: item.collection,
      result_name: item.doc.name,
      result_position: index + 1,
    })
    onOpenChange(false)
    router.push(url)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, flatItems.length - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === "Enter") {
      e.preventDefault()
      if (query.trim().length >= 1 && flatItems.length > 0) {
        navigate(activeIndex)
      }
    }
  }

  let flatIndex = -1

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden p-0 max-w-[640px] top-[20%] translate-y-0 gap-0">
        <VisuallyHidden><DialogTitle>Search</DialogTitle></VisuallyHidden>
        {/* Search input */}
        <div className="flex items-center border-b px-4">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search products, guides, buyers, prices..."
            className="flex h-12 w-full bg-transparent px-3 text-sm outline-none placeholder:text-muted-foreground"
            autoFocus
          />
          {query && (
            <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
              ESC
            </kbd>
          )}
        </div>

        {/* Results */}
        <div className="max-h-[400px] overflow-y-auto p-2">
          {!query.trim() && (
            <div className="py-12 text-center text-sm text-muted-foreground">
              Start typing to search across all products, guides, and buyers
            </div>
          )}

          {query.trim() && !loading && results.length === 0 && (
            <div className="py-12 text-center text-sm text-muted-foreground">
              No results for &ldquo;{query}&rdquo;
            </div>
          )}

          {loading && results.length === 0 && (
            <div className="py-12 text-center text-sm text-muted-foreground">
              Searching...
            </div>
          )}

          {results.map((group) => {
            const meta = COLLECTION_META[group.collection]
            if (!meta) return null
            const Icon = meta.icon

            return (
              <div key={group.collection} className="mb-2">
                <div className="flex items-center gap-2 px-2 py-1.5">
                  <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs font-medium text-muted-foreground">{meta.label}</span>
                  <span className="text-xs text-muted-foreground/60">({group.found})</span>
                </div>
                {group.hits.map((hit) => {
                  flatIndex++
                  const idx = flatIndex
                  const doc = hit.document
                  const isActive = idx === activeIndex

                  return (
                    <button
                      key={doc.id}
                      className={`w-full flex items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors ${
                        isActive ? "bg-accent text-accent-foreground" : "hover:bg-muted/50"
                      }`}
                      onClick={() => navigate(idx)}
                      onMouseEnter={() => setActiveIndex(idx)}
                    >
                      {doc.image_src ? (
                        <img src={doc.image_src} alt="" className="h-8 w-8 rounded object-cover shrink-0" />
                      ) : (
                        <div className="h-8 w-8 rounded bg-muted/30 shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium truncate capitalize">{getDisplayName(group.collection, doc)}</p>
                          {(() => {
                            const pill = getStatusPill(group.collection, doc)
                            if (!pill) return null
                            return <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${pill.className}`}>{pill.label}</span>
                          })()}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{getDisplaySub(group.collection, doc)}</p>
                      </div>
                    </button>
                  )
                })}
              </div>
            )
          })}
        </div>

        {/* Footer */}
        {flatItems.length > 0 && (
          <div className="flex items-center justify-between border-t px-4 py-2 text-xs text-muted-foreground">
            <span>{flatItems.length} results</span>
            <div className="flex items-center gap-2">
              <span>↑↓ navigate</span>
              <span>↵ open</span>
              <span>esc close</span>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export function useSearchModal() {
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setOpen(true)
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  return { open, setOpen }
}
