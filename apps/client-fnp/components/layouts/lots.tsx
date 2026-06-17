"use client"

import { useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import Link from "next/link"
import { Package } from "lucide-react"

import { Pagination } from "@/components/generic/pagination"
import { Badge } from "@/components/ui/badge"
import { queryLots } from "@/lib/query"
import { capitalizeFirstLetter, formatDate, centsToDollars } from "@/lib/utilities"

interface FarmLot {
  _id: string
  slug: string
  type: string
  form: string
  quantity: number
  unit: string
  price_per_unit_cents: number
  province: string
  city: string
  notes: string
  expires_at: string
  created: string
  farm_produce?: { name: string; slug: string }
  breed?: { name: string }
}

interface LotsResponse {
  total: number
  pending: number
  data: FarmLot[]
}

const LIMIT = 20

interface LotsProps {
  mode?: "selling" | "buying" | "pending"
}

export function Lots({ mode }: LotsProps) {
  const searchParams = useSearchParams()
  const page = Number(searchParams?.get("page")) || 1

  const createQueryString = useCallback(
    (params: Record<string, string | number | null>) => {
      const newSearchParams = new URLSearchParams(searchParams?.toString())
      for (const [key, value] of Object.entries(params)) {
        if (value === null) {
          newSearchParams.delete(key)
        } else {
          newSearchParams.set(key, String(value))
        }
      }
      return newSearchParams.toString()
    },
    [searchParams]
  )

  const isPendingView = mode === "pending"
  const typeFilter = mode === "selling" ? "sell" : mode === "buying" ? "request" : undefined

  const { data, isError, isFetching } = useQuery({
    queryKey: ["lots", { p: page, mode }],
    queryFn: () => isPendingView
      ? queryLots({ p: page, pending: true })
      : queryLots({ p: page, type: typeFilter }),
    refetchOnWindowFocus: false,
  })

  const lotsData = data?.data as LotsResponse | undefined
  const lots = lotsData?.data ?? []
  const total = lotsData?.total ?? 0
  const pageCount = Math.ceil(total / LIMIT)

  if (isError) return null

  return (
    <section className="space-y-6">
      {/* Header */}
      <div>
        {isPendingView ? (
          <>
            <h1 className="text-2xl font-semibold">{total === 0 ? "No Pending Lots" : `${total} ${total === 1 ? "Lot" : "Lots"} Awaiting Review`}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">These lots have been submitted and are waiting for approval before going live.</p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-semibold">{total === 0 ? "No Lots Available" : `${total} ${total === 1 ? "Lot" : "Lots"} Available`}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {mode === "selling"
                ? "Farmers selling produce directly across Zimbabwe."
                : mode === "buying"
                  ? "Buyers looking to purchase farm produce across Zimbabwe."
                  : "Browse farm produce lots listed by sellers across Zimbabwe."}
            </p>
          </>
        )}
      </div>

      {/* Loading */}
      {isFetching && (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 rounded-lg bg-muted/30 animate-pulse" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isFetching && lots.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 px-6 text-center border rounded-lg bg-muted/30">
          <Package className="h-12 w-12 text-muted-foreground/40 mb-4" />
          <h3 className="text-lg font-semibold mb-1">{isPendingView ? "No Pending Lots" : "No Lots Available"}</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            {isPendingView
              ? "All submitted lots have been reviewed."
              : mode === "selling"
                ? "No selling lots active right now. Check back soon."
                : mode === "buying"
                  ? "No buying lots active right now. Check back soon."
                  : "No active lots right now. Check back soon or be the first to list."}
          </p>
          {!isPendingView && (
            <Link href="/sell" className="mt-4 text-sm text-primary hover:underline">
              List your produce
            </Link>
          )}
        </div>
      )}

      {/* Pending lot cards — dimmed, not clickable */}
      {!isFetching && isPendingView && lots.length > 0 && (
        <div className="space-y-3">
          {lots.map((lot) => (
            <div
              key={lot._id}
              className="bg-card border border-dashed rounded-lg p-5 opacity-60 cursor-default"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-base font-semibold text-foreground">
                      {lot.farm_produce?.name ?? "Produce"}
                    </span>
                    <Badge variant={lot.type === "sell" ? "default" : "secondary"} className="text-xs capitalize">
                      {lot.type === "sell" ? "Selling" : "Buying"}
                    </Badge>
                    <Badge variant="outline" className="text-xs text-amber-700 border-amber-300 bg-amber-50">
                      Pending
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap text-sm text-muted-foreground">
                    {lot.breed && <span>Variety: {lot.breed.name}</span>}
                    {lot.breed && lot.form && <span>·</span>}
                    {lot.form && <span>State: {capitalizeFirstLetter(lot.form)}</span>}
                  </div>
                  <div className="flex items-center gap-3 flex-wrap text-sm text-muted-foreground">
                    <span>{lot.quantity.toLocaleString()} {lot.unit}</span>
                    {lot.province && (
                      <>
                        <span>·</span>
                        <span className="capitalize">{capitalizeFirstLetter(lot.province)}</span>
                      </>
                    )}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground flex-shrink-0">
                  {formatDate(lot.created)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Active lot cards */}
      {!isFetching && !isPendingView && lots.length > 0 && (
        <div className="space-y-3">
          {lots.map((lot) => (
            <Link
              key={lot._id}
              href={`/lots/${lot.slug}`}
              className="block bg-card border rounded-lg p-5 hover:shadow-md hover:border-primary/40 transition-all group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-base font-semibold text-foreground">
                      {lot.farm_produce?.name ?? "Produce"}
                    </span>
                    <Badge variant={lot.type === "sell" ? "default" : "secondary"} className="text-xs capitalize">
                      {lot.type === "sell" ? "Selling" : "Buying"}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-3 flex-wrap text-sm text-muted-foreground">
                    {lot.breed && <span>Variety: {lot.breed.name}</span>}
                    {lot.breed && lot.form && <span>·</span>}
                    {lot.form && <span>State: {capitalizeFirstLetter(lot.form)}</span>}
                  </div>

                  <div className="flex items-center gap-3 flex-wrap text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">
                      {centsToDollars(lot.price_per_unit_cents)}/{lot.unit}
                    </span>
                    <span>·</span>
                    <span>{lot.quantity.toLocaleString()} {lot.unit}</span>
                    {lot.province && (
                      <>
                        <span>·</span>
                        <span className="capitalize">{capitalizeFirstLetter(lot.province)}{lot.city ? `, ${capitalizeFirstLetter(lot.city)}` : ""}</span>
                      </>
                    )}
                  </div>

                  {lot.notes && (
                    <p className="text-sm text-muted-foreground line-clamp-1">{lot.notes}</p>
                  )}
                </div>

                <div className="text-right flex-shrink-0">
                  <p className="text-xs text-muted-foreground">
                    {formatDate(lot.created)}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pageCount > 1 && (
        <div className="pt-4">
          <Pagination
            pageCount={pageCount}
            page={page}
            createQueryString={createQueryString}
          />
        </div>
      )}
    </section>
  )
}
