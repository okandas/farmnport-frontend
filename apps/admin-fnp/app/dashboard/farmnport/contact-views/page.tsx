"use client"

import { useQuery } from "@tanstack/react-query"
import Link from "next/link"
import { Eye, Users, UserCheck, TrendingUp } from "lucide-react"

import { queryContactViewsStats } from "@/lib/query"
import { formatDate } from "@/lib/utilities"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

const PREVIEW_COUNT = 5

export default function ContactViewsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["contact-views-stats"],
    queryFn: () => queryContactViewsStats(),
    refetchOnWindowFocus: false,
  })

  const stats = data?.data

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-7 w-16 mb-1" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-48" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Skeleton key={j} className="h-10 w-full" />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!stats) return null

  const summary = stats.summary
  const totalByType = stats.views_by_type?.reduce((sum: number, v: any) => sum + v.count, 0) || 0

  const topViewed = stats.top_viewed || []
  const topViewers = stats.top_viewers || []
  const visibleViewed = topViewed.slice(0, PREVIEW_COUNT)
  const visibleViewers = topViewers.slice(0, PREVIEW_COUNT)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Contact Views</h2>
        <p className="text-muted-foreground">
          Track which profiles are being viewed and which users are viewing them
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Contact Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.total_views ?? 0}</div>
            <p className="text-xs text-muted-foreground">All-time contact views</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Viewers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.unique_viewers ?? 0}</div>
            <p className="text-xs text-muted-foreground">People who viewed contacts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profiles Viewed</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.unique_viewed ?? 0}</div>
            <p className="text-xs text-muted-foreground">Unique contacts viewed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Views Per Profile</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary?.avg_views_per_profile?.toFixed(1) ?? "0"}
            </div>
            <p className="text-xs text-muted-foreground">Average views per contact</p>
          </CardContent>
        </Card>
      </div>

      {/* Tables */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Most Viewed Contacts */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Most Viewed Contacts</CardTitle>
            <p className="text-xs text-muted-foreground">Profiles whose contact info was viewed most often</p>
          </CardHeader>
          <CardContent>
            {topViewed.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No data yet</p>
            ) : (
              <div className="space-y-2">
                <div className="grid grid-cols-[2rem_1fr_5rem_5rem_9rem_3.5rem] gap-2 text-xs font-medium text-muted-foreground pb-1 border-b">
                  <span>#</span>
                  <span>Name</span>
                  <span>Type</span>
                  <span>City</span>
                  <span>Last Viewed</span>
                  <span className="text-right">Views</span>
                </div>
                {visibleViewed.map((contact: any, i: number) => (
                  <Link
                    key={contact.viewed_id || i}
                    href={`/dashboard/farmnport/contact-views/contact/${contact.viewed_id}`}
                    className="grid grid-cols-[2rem_1fr_5rem_5rem_9rem_3.5rem] gap-2 items-center rounded-lg p-2 text-sm hover:bg-muted/50 transition-colors"
                  >
                    <span className="text-muted-foreground text-xs">{i + 1}</span>
                    <span className="font-medium truncate capitalize">{contact.name}</span>
                    <Badge variant="secondary" className="text-xs w-fit capitalize">
                      {contact.type}
                    </Badge>
                    <span className="text-muted-foreground text-xs truncate">{contact.city || "—"}</span>
                    <span className="text-muted-foreground text-xs">{formatDate(contact.last_date) || "—"}</span>
                    <span className="text-right font-semibold">{contact.view_count}</span>
                  </Link>
                ))}
                <Link
                  href="/dashboard/farmnport/contact-views/all-contacts"
                  className="block w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors pt-2"
                >
                  View all →
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Most Active Viewers */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Most Active Viewers</CardTitle>
            <p className="text-xs text-muted-foreground">Users who have viewed the most contact profiles</p>
          </CardHeader>
          <CardContent>
            {topViewers.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No data yet</p>
            ) : (
              <div className="space-y-2">
                <div className="grid grid-cols-[2rem_1fr_5rem_9rem_4rem] gap-2 text-xs font-medium text-muted-foreground pb-1 border-b">
                  <span>#</span>
                  <span>Name</span>
                  <span>Type</span>
                  <span>Last Active</span>
                  <span className="text-right">Viewed</span>
                </div>
                {visibleViewers.map((viewer: any, i: number) => (
                  <Link
                    key={viewer.user_id || i}
                    href={`/dashboard/farmnport/contact-views/viewer/${viewer.user_id}`}
                    className="grid grid-cols-[2rem_1fr_5rem_9rem_4rem] gap-2 items-center rounded-lg p-2 text-sm hover:bg-muted/50 transition-colors"
                  >
                    <span className="text-muted-foreground text-xs">{i + 1}</span>
                    <span className="font-medium truncate capitalize">{viewer.name}</span>
                    <Badge variant="secondary" className="text-xs w-fit capitalize">
                      {viewer.type}
                    </Badge>
                    <span className="text-muted-foreground text-xs">{formatDate(viewer.last_date) || "—"}</span>
                    <span className="text-right font-semibold">{viewer.contacts_viewed}</span>
                  </Link>
                ))}
                <Link
                  href="/dashboard/farmnport/contact-views/all-viewers"
                  className="block w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors pt-2"
                >
                  View all →
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Views by Type */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Views by User Type</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.views_by_type?.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No data yet</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {stats.views_by_type?.map((vt: any) => {
                const pct = totalByType > 0 ? ((vt.count / totalByType) * 100).toFixed(0) : "0"
                return (
                  <div
                    key={vt.type}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div>
                      <p className="text-sm font-medium capitalize">{vt.type}</p>
                      <p className="text-xs text-muted-foreground">{pct}% of views</p>
                    </div>
                    <span className="text-lg font-bold">{vt.count}</span>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
