"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import Link from "next/link"
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react"

import { queryContactViewDetail } from "@/lib/query"
import { formatDate } from "@/lib/utilities"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"

const PAGE_SIZE = 10

export default function ContactDetailPage() {
  const params = useParams()
  const router = useRouter()
  const contactId = params.id as string
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ["contact-view-detail", contactId, page],
    queryFn: () => queryContactViewDetail(contactId, page, PAGE_SIZE),
    refetchOnWindowFocus: false,
    enabled: !!contactId,
  })

  const detail = data?.data
  const contact = detail?.contact
  const viewers = detail?.viewers || []
  const total: number = detail?.total || 0
  const totalPages: number = detail?.total_pages || 1

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-9 w-64" />
        <div className="space-y-2">
          {Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  if (!detail || !contact) return null

  return (
    <div className="flex flex-col gap-6">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <div>
        <h2 className="text-3xl font-bold tracking-tight capitalize">{contact.name}</h2>
        <p className="text-muted-foreground capitalize">
          {contact.type}{contact.city ? ` · ${contact.city}` : ""} &middot; {total} viewer{total !== 1 ? "s" : ""}
        </p>
      </div>

      <div>
        <p className="text-sm font-medium text-muted-foreground mb-2">Who viewed this contact</p>

        {viewers.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">No viewers yet</p>
        ) : (
          <div className="space-y-1">
            {viewers.map((viewer: any, i: number) => (
              <Link
                key={`${viewer.user_id}-${viewer.date}-${i}`}
                href={`/dashboard/farmnport/contact-views/viewer/${viewer.user_id}`}
                className="flex items-center gap-4 rounded-lg px-4 py-3 hover:bg-muted/50 transition-colors"
              >
                <span className="text-xs text-muted-foreground w-5 shrink-0 text-right">
                  {(page - 1) * PAGE_SIZE + i + 1}
                </span>

                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm capitalize truncate">{viewer.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {viewer.client_type}{viewer.city ? ` · ${viewer.city}` : ""}
                  </p>
                </div>

                <div className="shrink-0 text-right">
                  {viewer.type && (
                    <Badge variant="outline" className="text-xs capitalize mb-1">
                      {viewer.type}
                    </Badge>
                  )}
                  <p className="text-xs text-muted-foreground">{formatDate(viewer.date) || "—"}</p>
                </div>
              </Link>
            ))}

            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 border-t">
                <span className="text-xs text-muted-foreground">
                  Page {page} of {totalPages} ({total} total)
                </span>
                <div className="flex gap-1">
                  <Button variant="outline" size="sm" className="h-7 px-2" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="h-7 px-2" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
