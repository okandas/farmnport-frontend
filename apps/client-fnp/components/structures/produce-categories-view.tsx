"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { ProducePriceCardsView } from "@/components/structures/produce-price-cards-view"

const produceCategories = [
  { name: "Beef", slug: "beef", color: "bg-red-500" },
  { name: "Lamb", slug: "lamb", color: "bg-amber-500" },
  { name: "Mutton", slug: "mutton", color: "bg-orange-500" },
  { name: "Goat", slug: "goat", color: "bg-lime-600" },
  { name: "Chicken", slug: "chicken", color: "bg-yellow-500" },
  { name: "Pork", slug: "pork", color: "bg-pink-500" },
]

export function ProduceCategoriesView() {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {produceCategories.map((produce) => (
        <div
          key={produce.slug}
          className="group rounded-xl border bg-card shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-200"
        >
          <div className="flex items-center justify-between px-4 pt-4 pb-2">
            <div className="flex items-center gap-2">
              <div className={`h-2.5 w-2.5 rounded-full ${produce.color}`} />
              <h3 className="text-sm font-bold tracking-tight">{produce.name} Prices</h3>
            </div>
            <Link
              href={`/prices/produce/${produce.slug}`}
              className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              View all
              <ArrowRight className="h-3 w-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
            </Link>
          </div>
          <div className="px-3 pb-1">
            <ProducePriceCardsView produceSlug={produce.slug} limit={3} />
          </div>
        </div>
      ))}
    </div>
  )
}
