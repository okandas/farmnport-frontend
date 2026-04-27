"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import Link from "next/link"
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react"

import { queryViewerDetail } from "@/lib/query"
import { formatDate } from "@/lib/utilities"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"

const PAGE_SIZE = 10

export default function ViewerDetailPage() {
  const params = useParams()
  const router = useRouter()
  const viewerId = params.id as string
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ["viewer-detail", viewerId, page],
    queryFn: () => queryViewerDetail(viewerId, page, PAGE_SIZE),
    refetchOnWindowFocus: false,
    enabled: !!viewerId,
  })

  const detail = data?.data
  const viewer = detail?.viewer
  const viewed = detail?.viewed || []
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

  if (!detail || !viewer) return null

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
        <h2 className="text-3xl font-bold tracking-tight capitalize">{viewer.name}</h2>
        <p className="text-muted-foreground capitalize">
          {viewer.type}{viewer.city ? ` · ${viewer.city}` : ""} &middot; viewed {total} contact{total !== 1 ? "s" : ""}
        </p>
      </div>

      <div>
        <p className="text-sm font-medium text-muted-foreground mb-2">Contacts this person viewed</p>

        {viewed.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">No contacts viewed yet</p>
        ) : (
          <div className="space-y-1">
            {viewed.map((contact: any, i: number) => (
              <Link
                key={`${contact.viewed_id}-${contact.date}-${i}`}
                href={`/dashboard/farmnport/contact-views/contact/${contact.viewed_id}`}
                className="flex items-center gap-4 rounded-lg px-4 py-3 hover:bg-muted/50 transition-colors"
              >
                <span className="text-xs text-muted-foreground w-5 shrink-0 text-right">
                  {(page - 1) * PAGE_SIZE + i + 1}
                </span>

                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm capitalize truncate">{contact.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {contact.type}{contact.city ? ` · ${contact.city}` : ""}
                  </p>
                </div>

                <p className="text-xs text-muted-foreground shrink-0">{formatDate(contact.date) || "—"}</p>
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
