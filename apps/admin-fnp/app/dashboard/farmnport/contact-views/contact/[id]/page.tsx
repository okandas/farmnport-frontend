"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import Link from "next/link"
import { ArrowLeft, Eye, ChevronLeft, ChevronRight } from "lucide-react"

import { queryContactViewDetail } from "@/lib/query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"

const PAGE_SIZE = 20

export default function ContactDetailPage() {
  const params = useParams()
  const router = useRouter()
  const contactId = params.id as string
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ["contact-view-detail", contactId],
    queryFn: () => queryContactViewDetail(contactId),
    refetchOnWindowFocus: false,
    enabled: !!contactId,
  })

  const detail = data?.data

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-5 w-32" />
        <div>
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-4 w-48 mt-2" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!detail) return null

  const contact = detail.contact
  const viewers = detail.viewers || []
  const totalPages = Math.ceil(viewers.length / PAGE_SIZE)
  const paged = viewers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

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
        <div className="flex items-center gap-2 mt-1">
          <Badge variant="secondary" className="capitalize">{contact.type}</Badge>
          {contact.city && <span className="text-sm text-muted-foreground">{contact.city}</span>}
          <span className="text-sm text-muted-foreground">
            &middot; {detail.total} viewer{detail.total !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Who viewed this contact
          </CardTitle>
        </CardHeader>
        <CardContent>
          {viewers.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No viewers yet</p>
          ) : (
            <div className="space-y-2">
              <div className="grid grid-cols-[2rem_1fr_5rem_5rem_7rem] gap-2 text-xs font-medium text-muted-foreground pb-1 border-b">
                <span>#</span>
                <span>Viewer</span>
                <span>Type</span>
                <span>Via</span>
                <span className="text-right">Date</span>
              </div>
              {paged.map((viewer: any, i: number) => (
                <Link
                  key={`${viewer.user_id}-${viewer.date}-${i}`}
                  href={`/dashboard/farmnport/contact-views/viewer/${viewer.user_id}`}
                  className="grid grid-cols-[2rem_1fr_5rem_5rem_7rem] gap-2 items-center rounded-lg p-2 text-sm hover:bg-muted/50 transition-colors"
                >
                  <span className="text-muted-foreground text-xs">{(page - 1) * PAGE_SIZE + i + 1}</span>
                  <span className="font-medium truncate capitalize">{viewer.name}</span>
                  <Badge variant="secondary" className="text-xs w-fit capitalize">
                    {viewer.client_type || viewer.type}
                  </Badge>
                  <span className="text-muted-foreground text-xs capitalize">{viewer.type}</span>
                  <span className="text-right text-muted-foreground text-xs">{viewer.date || "—"}</span>
                </Link>
              ))}

              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-3 border-t">
                  <span className="text-xs text-muted-foreground">
                    Page {page} of {totalPages} ({viewers.length} total)
                  </span>
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 px-2"
                      disabled={page <= 1}
                      onClick={() => setPage(page - 1)}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 px-2"
                      disabled={page >= totalPages}
                      onClick={() => setPage(page + 1)}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
