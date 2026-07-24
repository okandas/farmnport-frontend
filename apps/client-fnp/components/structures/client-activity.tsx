"use client"

import { useState, useRef } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { useQuery } from "@tanstack/react-query"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { queryLots, listPreOrders } from "@/lib/query"
import { centsToDollars } from "@/lib/utilities"

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
      className="shrink-0 w-80 bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg hover:border-primary/50 transition-all duration-200 group flex flex-col"
    >
      <div className="relative h-64 bg-muted/30">
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

  return (
    <Link
      href={`/bookings/${event.slug}`}
      className="shrink-0 w-80 bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg hover:border-primary/50 transition-all duration-200 group flex flex-col"
    >
      <div className="relative h-64 bg-muted/30">
        {event.image_src && (
          <img src={event.image_src} alt={event.name} className="absolute inset-0 w-full h-full object-cover" />
        )}
      </div>
      <div className="p-3 space-y-1 border-t flex-1">
        <h3 className="font-semibold text-sm leading-tight line-clamp-1 group-hover:text-primary transition-colors">{event.name}</h3>
        {event.subtitle && <p className="text-xs text-muted-foreground line-clamp-1">{event.subtitle}</p>}
        <div className="text-xs text-muted-foreground pt-1 space-y-0.5">
          {event.unit_price > 0 && (
            <div className="flex justify-between">
              <span>Price</span>
              <span className="font-semibold text-foreground">${(event.unit_price / 100 * 1.069).toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Available</span>
            <span className="font-medium text-foreground">{available} of {event.total_available}</span>
          </div>
          <div className="flex justify-between">
            <span>Closes</span>
            <span className="font-medium text-foreground">
              {!event.close_date || event.close_date === "0001-01-01T00:00:00Z" ? "Always open" : formatDate(event.close_date)}
            </span>
          </div>
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
        className="absolute -left-3 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center h-8 w-8 rounded-full border bg-background shadow-sm hover:bg-muted transition-colors"
      >
        <ChevronLeft className="h-4 w-4 text-muted-foreground" />
      </button>
      <div ref={scrollRef} className="flex gap-3 overflow-x-auto scrollbar-hide py-1 px-1">
        {children}
      </div>
      <button
        onClick={() => scroll("right")}
        className="absolute -right-3 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center h-8 w-8 rounded-full border bg-background shadow-sm hover:bg-muted transition-colors"
      >
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </button>
    </div>
  )
}

export function ClientActivity({ slug }: { slug: string }) {
  const { data: session } = useSession()
  const [tab, setTab] = useState<"lots" | "preorders">("lots")

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
    ...(preorders.length > 0 ? [{ key: "preorders" as const, label: "Pre-Orders", count: preorders.length }] : []),
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-semibold">Activity</h2>
        </div>
        <div className="flex items-center gap-4">
          {session && (
            <div className="flex items-center gap-2">
              <Link href="/lots/new" className="text-xs font-medium text-primary hover:underline">
                New Lot
              </Link>
              <Link href="/bookings/new" className="text-xs font-medium text-primary hover:underline">
                New Booking
              </Link>
            </div>
          )}
          <Link href={tab === "lots" ? "/lots" : "/bookings"} className="text-sm text-muted-foreground hover:text-foreground">
            Show all
          </Link>
        </div>
      </div>

      {tabs.length > 1 && (
        <div className="flex items-center gap-1 mb-4">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                tab === t.key
                  ? "text-primary border-primary"
                  : "text-muted-foreground border-border hover:text-foreground hover:border-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      {tab === "lots" && lots.length > 0 && (
        <ScrollableRow>
          {lots.map((lot) => (
            <LotCard key={lot._id} lot={lot} />
          ))}
        </ScrollableRow>
      )}

      {tab === "preorders" && preorders.length > 0 && (
        <ScrollableRow>
          {preorders.map((event) => (
            <PreOrderCard key={event.id} event={event} />
          ))}
        </ScrollableRow>
      )}
    </div>
  )
}
