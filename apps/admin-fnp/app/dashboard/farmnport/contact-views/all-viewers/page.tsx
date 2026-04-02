"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import Link from "next/link"
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react"

import { queryTopViewers } from "@/lib/query"
import { formatDate } from "@/lib/utilities"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"

const PAGE_SIZE = 10

export default function AllViewersPage() {
  const router = useRouter()
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ["top-viewers", page],
    queryFn: () => queryTopViewers(page, PAGE_SIZE),
    refetchOnWindowFocus: false,
  })

  const viewers = data?.data?.viewers || []
  const total: number = data?.data?.total || 0
  const totalPages: number = data?.data?.total_pages || 1

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-9 w-64" />
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-3">
              {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

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
        <h2 className="text-3xl font-bold tracking-tight">Active Viewers</h2>
        <p className="text-muted-foreground">
          {total} viewers sorted by contacts viewed
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          {viewers.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No data yet</p>
          ) : (
            <div className="space-y-2">
              <div className="grid grid-cols-[2rem_1fr_5rem_5rem_9rem_4rem] gap-2 text-xs font-medium text-muted-foreground pb-1 border-b">
                <span>#</span>
                <span>Name</span>
                <span>Type</span>
                <span>Channel</span>
                <span>Last View</span>
                <span className="text-right">Viewed</span>
              </div>
              {viewers.map((viewer: any, i: number) => (
                <Link
                  key={viewer.user_id || i}
                  href={`/dashboard/farmnport/contact-views/viewer/${viewer.user_id}`}
                  className="grid grid-cols-[2rem_1fr_5rem_5rem_9rem_4rem] gap-2 items-center rounded-lg p-2 text-sm hover:bg-muted/50 transition-colors"
                >
                  <span className="text-muted-foreground text-xs">{(page - 1) * PAGE_SIZE + i + 1}</span>
                  <span className="font-medium truncate capitalize">{viewer.name}</span>
                  <Badge variant="secondary" className="text-xs w-fit capitalize">
                    {viewer.type}
                  </Badge>
                  <Badge variant="outline" className="text-xs w-fit capitalize">
                    {viewer.contact_type || "—"}
                  </Badge>
                  <span className="text-muted-foreground text-xs">{formatDate(viewer.last_date) || "—"}</span>
                  <span className="text-right font-semibold">{viewer.contacts_viewed}</span>
                </Link>
              ))}

              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-3 border-t">
                  <span className="text-xs text-muted-foreground">
                    Page {page} of {totalPages} ({total} total)
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
