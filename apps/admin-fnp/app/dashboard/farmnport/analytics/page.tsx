"use client"

import { useQuery } from "@tanstack/react-query"
import Link from "next/link"
import { Eye, Users, UserCheck, TrendingUp, Phone, Mail, MessageCircle } from "lucide-react"

import { queryContactViewsStats, queryRecentViewedContacts } from "@/lib/query"
import { formatDate } from "@/lib/utilities"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

function StatCard({ title, value, icon: Icon, subtitle }: { title: string; value: string | number; icon: any; subtitle?: string }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </CardContent>
    </Card>
  )
}

const TYPE_BADGE: Record<string, string> = {
  farmer: "bg-green-100 text-green-800",
  buyer: "bg-blue-100 text-blue-800",
}

const ACTION_ICON: Record<string, any> = {
  phone: Phone,
  email: Mail,
  whatsapp: MessageCircle,
}

export default function AnalyticsPage() {
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ["contact-views-stats"],
    queryFn: () => queryContactViewsStats(),
    refetchOnWindowFocus: false,
  })

  const { data: recentData } = useQuery({
    queryKey: ["recent-viewed-contacts", 1],
    queryFn: () => queryRecentViewedContacts(1, 10),
    refetchOnWindowFocus: false,
  })

  const stats = statsData?.data
  const recentContacts = recentData?.data?.contacts ?? []

  if (statsLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2"><Skeleton className="h-4 w-24" /></CardHeader>
              <CardContent><Skeleton className="h-7 w-16" /></CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  const summary = stats?.summary
  const topViewed = stats?.top_viewed ?? []
  const topViewers = stats?.top_viewers ?? []
  const viewsByType = stats?.views_by_type ?? []

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
        <p className="text-muted-foreground">Platform activity and engagement overview</p>
      </div>

      {/* Key Numbers */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Contact Views" value={summary?.total_views ?? 0} icon={Eye} subtitle="All-time contact reveals" />
        <StatCard title="Unique Viewers" value={summary?.unique_viewers ?? 0} icon={Users} subtitle="People who viewed contacts" />
        <StatCard title="Profiles Viewed" value={summary?.unique_viewed ?? 0} icon={UserCheck} subtitle="Unique contacts viewed" />
        <StatCard title="Avg Views Per Profile" value={summary?.avg_views_per_profile?.toFixed(1) ?? "0"} icon={TrendingUp} subtitle="Average views per contact" />
      </div>

      {/* Views by Type */}
      {viewsByType.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {viewsByType.map((vt: any) => {
            const total = viewsByType.reduce((sum: number, v: any) => sum + v.count, 0)
            const pct = total > 0 ? ((vt.count / total) * 100).toFixed(0) : "0"
            return (
              <div key={vt.type} className="flex items-center justify-between rounded-lg border p-3">
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

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Most Viewed — Who's being looked at */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Most Viewed — Buyers Getting Attention</CardTitle>
            <p className="text-xs text-muted-foreground">Profiles whose contact info was viewed most often</p>
          </CardHeader>
          <CardContent>
            {topViewed.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No data yet</p>
            ) : (
              <div className="space-y-2">
                <div className="grid grid-cols-[2rem_1fr_5rem_5rem_3.5rem] gap-2 text-xs font-medium text-muted-foreground pb-1 border-b">
                  <span>#</span>
                  <span>Name</span>
                  <span>Type</span>
                  <span>Last</span>
                  <span className="text-right">Views</span>
                </div>
                {topViewed.slice(0, 10).map((contact: any, i: number) => (
                  <Link
                    key={contact.viewed_id || i}
                    href={`/dashboard/farmnport/contact-views/contact/${contact.viewed_id}`}
                    className="grid grid-cols-[2rem_1fr_5rem_5rem_3.5rem] gap-2 items-center rounded-lg p-2 text-sm hover:bg-muted/50 transition-colors"
                  >
                    <span className="text-muted-foreground text-xs">{i + 1}</span>
                    <span className="font-medium truncate capitalize">{contact.name}</span>
                    <Badge variant="secondary" className="text-xs w-fit capitalize">{contact.type}</Badge>
                    <span className="text-muted-foreground text-xs">{formatDate(contact.last_date) || "—"}</span>
                    <span className="text-right font-semibold">{contact.view_count}</span>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Most Active Viewers — Who's looking */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Most Active — Farmers Looking for Buyers</CardTitle>
            <p className="text-xs text-muted-foreground">Users who have viewed the most contact profiles</p>
          </CardHeader>
          <CardContent>
            {topViewers.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No data yet</p>
            ) : (
              <div className="space-y-2">
                <div className="grid grid-cols-[2rem_1fr_5rem_5rem_4rem] gap-2 text-xs font-medium text-muted-foreground pb-1 border-b">
                  <span>#</span>
                  <span>Name</span>
                  <span>Type</span>
                  <span>Last</span>
                  <span className="text-right">Viewed</span>
                </div>
                {topViewers.slice(0, 10).map((viewer: any, i: number) => (
                  <Link
                    key={viewer.user_id || i}
                    href={`/dashboard/farmnport/contact-views/viewer/${viewer.user_id}`}
                    className="grid grid-cols-[2rem_1fr_5rem_5rem_4rem] gap-2 items-center rounded-lg p-2 text-sm hover:bg-muted/50 transition-colors"
                  >
                    <span className="text-muted-foreground text-xs">{i + 1}</span>
                    <span className="font-medium truncate capitalize">{viewer.name}</span>
                    <Badge variant="secondary" className="text-xs w-fit capitalize">{viewer.type}</Badge>
                    <span className="text-muted-foreground text-xs">{formatDate(viewer.last_date) || "—"}</span>
                    <span className="text-right font-semibold">{viewer.contacts_viewed}</span>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Contact Views</CardTitle>
          <p className="text-xs text-muted-foreground">Latest contact reveal activity</p>
        </CardHeader>
        <CardContent>
          {recentContacts.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No recent activity</p>
          ) : (
            <div className="space-y-2">
              <div className="grid grid-cols-[1fr_5rem_5rem_5rem_6rem] gap-2 text-xs font-medium text-muted-foreground pb-1 border-b">
                <span>Contact</span>
                <span>Type</span>
                <span>Category</span>
                <span>Produce</span>
                <span className="text-right">Last Viewed</span>
              </div>
              {recentContacts.slice(0, 10).map((c: any, i: number) => (
                <div key={i} className="grid grid-cols-[1fr_5rem_5rem_5rem_6rem] gap-2 items-center p-2 text-sm rounded-lg hover:bg-muted/50">
                  <span className="font-medium capitalize truncate">{c.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize w-fit ${TYPE_BADGE[c.type] ?? "bg-muted text-muted-foreground"}`}>{c.type || "—"}</span>
                  <span className="text-xs text-muted-foreground capitalize truncate">{c.primary_category || "—"}</span>
                  <span className="text-xs text-muted-foreground capitalize truncate">{c.main_produce || "—"}</span>
                  <span className="text-xs text-muted-foreground text-right">{formatDate(c.last_date) || "—"}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
