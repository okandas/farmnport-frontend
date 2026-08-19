"use client"

import { useState, useRef } from "react"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react"
import { queryLots, listPreOrders } from "@/lib/query"
import { centsToDollars, DEFAULT_PLATFORM_FEE_RATE } from "@/lib/utilities"

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
}

function LotCard({ lot }: { lot: any }) {
  const price = lot.price_per_unit_cents ? centsToDollars(lot.price_per_unit_cents) : "Negotiable"
  const name = lot.farm_produce?.name ?? "Lot"
  const meta = [lot.breed?.name, lot.produce_condition?.name].filter(Boolean).join(" · ")

  return (
    <Link
      href={`/lots/${lot.slug}`}
      className="shrink-0 w-64 sm:w-72 bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg hover:border-primary/50 transition-all duration-200 group flex flex-col"
    >
      <div className="relative h-40 sm:h-48 bg-muted/30">
        {lot.main_image?.img?.src ? (
          <img src={lot.main_image.img.src} alt={name} className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-muted/30" />
        )}
        <span className={`absolute top-2 left-2 inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${lot.type === "sell" ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" : "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400"}`}>
          {lot.type === "sell" ? "Selling" : "Buying"}
        </span>
      </div>
      <div className="p-3 space-y-1 border-t flex-1">
        <h3 className="font-semibold text-sm leading-tight line-clamp-1 group-hover:text-primary transition-colors">{name}</h3>
        {meta && <p className="text-xs text-muted-foreground line-clamp-1">{meta}</p>}
        <div className="flex items-center justify-between pt-1">
          <span className="text-sm font-semibold">{price}</span>
          <span className="text-xs text-muted-foreground">{lot.quantity?.toLocaleString()} {lot.unit}</span>
        </div>
      </div>
    </Link>
  )
}

function PreOrderCard({ event }: { event: any }) {
  const available = event.total_available - event.total_booked
  const isBuying = event.market_side === "demand"

  return (
    <Link
      href={`/bookings/${event.slug}`}
      className="shrink-0 w-64 sm:w-72 bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg hover:border-primary/50 transition-all duration-200 group flex flex-col"
    >
      <div className="relative h-40 sm:h-48 bg-muted/30">
        {event.image_src ? (
          <img src={event.image_src} alt={event.name} className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-muted/30" />
        )}
        <span className={`absolute top-2 left-2 inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${isBuying ? "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"}`}>
          {isBuying ? "Buying" : "Selling"}
        </span>
      </div>
      <div className="p-3 space-y-1 border-t flex-1">
        <h3 className="font-semibold text-sm leading-tight line-clamp-1 group-hover:text-primary transition-colors">{event.produce_name || event.name}</h3>
        {event.description && <p className="text-xs text-muted-foreground line-clamp-2">{event.description}</p>}
        <div className="text-xs text-muted-foreground pt-1 space-y-0.5">
          {event.unit_price > 0 && (
            <div className="flex justify-between">
              <span>{isBuying ? "Buying at" : "Price"}</span>
              <span className="font-semibold text-foreground">${(event.unit_price / 100 * (event.fee_bearer === "seller" ? 1 : 1 + (event.platform_fee_rate || DEFAULT_PLATFORM_FEE_RATE))).toFixed(2)}/{event.unit}</span>
            </div>
          )}
          {event.min_quantity > 0 && (
            <div className="flex justify-between">
              <span>Minimum</span>
              <span className="font-medium text-foreground">{event.min_quantity.toLocaleString()} {event.unit}</span>
            </div>
          )}
          {event.total_available > 0 && (
            <div className="flex justify-between">
              <span>{isBuying ? "Needed" : "Available"}</span>
              <span className="font-medium text-foreground">{available.toLocaleString()} of {event.total_available.toLocaleString()} {event.unit}</span>
            </div>
          )}
          {event.frequency && (
            <div className="flex justify-between">
              <span>Frequency</span>
              <span className="font-medium text-foreground capitalize">{event.frequency}</span>
            </div>
          )}
        </div>
        <div className="pt-2">
          <span className="w-full h-7 rounded text-xs font-semibold bg-primary text-primary-foreground inline-flex items-center justify-center">
            {isBuying ? "Offer Supply" : "Enquire"}
          </span>
        </div>
      </div>
    </Link>
  )
}

function ScrollableRow({ children }: { children: React.ReactNode }) {
  const scrollRef = useRef<HTMLDivElement>(null)

  function scroll(dir: "left" | "right") {
    scrollRef.current?.scrollBy({ left: dir === "left" ? -240 : 240, behavior: "smooth" })
  }

  return (
    <div className="relative">
      <button
        onClick={() => scroll("left")}
        className="absolute -left-3 top-1/2 -translate-y-1/2 z-10 hidden sm:flex items-center justify-center h-8 w-8 rounded-full border bg-background shadow-sm hover:bg-muted transition-colors"
      >
        <ChevronLeft className="h-4 w-4 text-muted-foreground" />
      </button>
      <div ref={scrollRef} className="flex gap-3 overflow-x-auto scrollbar-hide py-1 px-1">
        {children}
      </div>
      <button
        onClick={() => scroll("right")}
        className="absolute -right-3 top-1/2 -translate-y-1/2 z-10 hidden sm:flex items-center justify-center h-8 w-8 rounded-full border bg-background shadow-sm hover:bg-muted transition-colors"
      >
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </button>
    </div>
  )
}

export function ClientActivity({ slug }: { slug: string }) {
  const [tab, setTab] = useState<"lots" | "preorders" | null>(null)

  const { data: lotsData } = useQuery({
    queryKey: ["client-lots", slug],
    queryFn: () => queryLots({ p: 1, owner_slug: slug }).then((r) => r.data),
  })

  const { data: preordersData } = useQuery({
    queryKey: ["client-preorders", slug],
    queryFn: () => listPreOrders({ client_slug: slug }).then((r) => r.data),
  })

  const lots: any[] = lotsData?.data ?? []
  const preorders: any[] = preordersData?.preorders ?? []

  if (lots.length === 0 && preorders.length === 0) return null

  const tabs = [
    ...(lots.length > 0 ? [{ key: "lots" as const, label: "Lots", count: lots.length }] : []),
    ...(preorders.length > 0 ? [{ key: "preorders" as const, label: "Bookings", count: preorders.length }] : []),
  ]

  const activeTab = tab ?? tabs[0]?.key ?? "lots"

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold">Activity</h2>
      </div>

      {tabs.length > 1 && (
        <div className="flex items-center gap-2 mb-4">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                activeTab === t.key
                  ? "bg-primary text-primary-foreground border-primary"
                  : "text-muted-foreground border-border hover:bg-muted"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      {activeTab === "lots" && lots.length > 0 && (
        <ScrollableRow>
          {lots.map((lot) => (
            <LotCard key={lot._id} lot={lot} />
          ))}
        </ScrollableRow>
      )}

      {activeTab === "preorders" && preorders.length > 0 && (
        <ScrollableRow>
          {preorders.map((event) => (
            <PreOrderCard key={event.id} event={event} />
          ))}
        </ScrollableRow>
      )}

      <div className="flex justify-center mt-4">
        <Link
          href={`/bookings?client=${slug}`}
          className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          Show all activity <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  )
}
