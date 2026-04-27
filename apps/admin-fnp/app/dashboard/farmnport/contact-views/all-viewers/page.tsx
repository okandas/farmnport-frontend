"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import Link from "next/link"
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react"

import { queryTopViewers } from "@/lib/query"
import { formatDate } from "@/lib/utilities"
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

  const maxViewed = viewers.reduce((m: number, v: any) => Math.max(m, v.contacts_viewed), 0)

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
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
        <h2 className="text-3xl font-bold tracking-tight">Most Active Viewers</h2>
        <p className="text-muted-foreground">{total} users sorted by contacts viewed — click any to see their history</p>
      </div>

      {viewers.length === 0 ? (
        <p className="text-sm text-muted-foreground py-8 text-center">No data yet</p>
      ) : (
        <div className="space-y-1">
          {viewers.map((viewer: any, i: number) => {
            const pct = maxViewed > 0 ? (viewer.contacts_viewed / maxViewed) * 100 : 0
            return (
              <Link
                key={viewer.user_id || i}
                href={`/dashboard/farmnport/contact-views/viewer/${viewer.user_id}`}
                className="flex items-center gap-4 rounded-lg px-4 py-3 hover:bg-muted/50 transition-colors"
              >
                <span className="text-xs text-muted-foreground w-5 shrink-0 text-right">
                  {(page - 1) * PAGE_SIZE + i + 1}
                </span>

                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm capitalize truncate">{viewer.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="h-1 rounded-full bg-muted flex-1 max-w-32">
                      <div className="h-1 rounded-full bg-orange-400" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs text-muted-foreground capitalize shrink-0">{viewer.type}</span>
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  <p className="text-sm font-bold">{viewer.contacts_viewed} viewed</p>
                  <p className="text-xs text-muted-foreground">{formatDate(viewer.last_date) || "—"}</p>
                </div>
              </Link>
            )
          })}

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
  )
}
