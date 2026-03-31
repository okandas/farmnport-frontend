"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import Link from "next/link"
import { ArrowLeft, Users, ChevronLeft, ChevronRight } from "lucide-react"

import { queryViewerDetail } from "@/lib/query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"

const PAGE_SIZE = 20

export default function ViewerDetailPage() {
  const params = useParams()
  const router = useRouter()
  const viewerId = params.id as string
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ["viewer-detail", viewerId],
    queryFn: () => queryViewerDetail(viewerId),
    refetchOnWindowFocus: false,
    enabled: !!viewerId,
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

  const viewer = detail.viewer
  const viewed = detail.viewed || []
  const totalPages = Math.ceil(viewed.length / PAGE_SIZE)
  const paged = viewed.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

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
        <div className="flex items-center gap-2 mt-1">
          <Badge variant="secondary" className="capitalize">{viewer.type}</Badge>
          {viewer.city && <span className="text-sm text-muted-foreground">{viewer.city}</span>}
          <span className="text-sm text-muted-foreground">
            &middot; Viewed {detail.total} contact{detail.total !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4" />
            Contacts viewed by this person
          </CardTitle>
        </CardHeader>
        <CardContent>
          {viewed.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No contacts viewed yet</p>
          ) : (
            <div className="space-y-2">
              <div className="grid grid-cols-[2rem_1fr_5rem_7rem] gap-2 text-xs font-medium text-muted-foreground pb-1 border-b">
                <span>#</span>
                <span>Contact</span>
                <span>Type</span>
                <span className="text-right">Date</span>
              </div>
              {paged.map((contact: any, i: number) => (
                <Link
                  key={`${contact.viewed_id}-${contact.date}-${i}`}
                  href={`/dashboard/farmnport/contact-views/contact/${contact.viewed_id}`}
                  className="grid grid-cols-[2rem_1fr_5rem_7rem] gap-2 items-center rounded-lg p-2 text-sm hover:bg-muted/50 transition-colors"
                >
                  <span className="text-muted-foreground text-xs">{(page - 1) * PAGE_SIZE + i + 1}</span>
                  <span className="font-medium truncate capitalize">{contact.name}</span>
                  <Badge variant="secondary" className="text-xs w-fit capitalize">
                    {contact.type}
                  </Badge>
                  <span className="text-right text-muted-foreground text-xs">{contact.date || "—"}</span>
                </Link>
              ))}

              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-3 border-t">
                  <span className="text-xs text-muted-foreground">
                    Page {page} of {totalPages} ({viewed.length} total)
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
