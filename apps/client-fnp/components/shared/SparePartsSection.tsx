"use client"

import Link from "next/link"
import Image from "next/image"
import { useQuery } from "@tanstack/react-query"
import { BaseURL } from "@/lib/schemas"
import { centsToDollars } from "@/lib/utilities"

async function fetchSpareParts(slug: string) {
  const res = await fetch(`${BaseURL}/equipment/${slug}/spare-parts`, { cache: "no-store" })
  if (!res.ok) return []
  const data = await res.json()
  return data.parts ?? []
}

export function SparePartsSection({ slug }: { slug: string }) {
  const { data: parts } = useQuery({
    queryKey: ["equipment-spare-parts", slug],
    queryFn: () => fetchSpareParts(slug),
    staleTime: 60000,
  })

  if (!parts || parts.length === 0) return null

  return (
    <div className="rounded-xl border bg-card p-4">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400 mb-3">Spare Parts & Accessories</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {parts.map((part: any) => (
          <div key={part.id} className="rounded-lg border p-3 hover:border-primary/40 hover:shadow-sm transition-all">
            {part.images?.[0]?.img?.src ? (
              <div className="relative aspect-square bg-muted/30 dark:bg-white rounded-md overflow-hidden mb-2">
                <Image src={part.images[0].img.src} alt={part.name} fill className="object-contain p-2" sizes="150px" />
              </div>
            ) : (
              <div className="aspect-square bg-muted/30 rounded-md mb-2" />
            )}
            <p className="text-xs font-semibold line-clamp-2">{part.name}</p>
            {part.part_number && (
              <p className="text-[10px] text-muted-foreground mt-0.5">Part #: {part.part_number}</p>
            )}
            <div className="flex items-center justify-between mt-2">
              {part.price_cents > 0 ? (
                <span className="text-sm font-bold">{centsToDollars(part.price_cents)}</span>
              ) : (
                <span className="text-xs text-muted-foreground">Contact for price</span>
              )}
              <span className={`text-[10px] font-medium ${part.in_stock ? "text-green-600" : "text-red-500"}`}>
                {part.in_stock ? "In Stock" : "Out of Stock"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
