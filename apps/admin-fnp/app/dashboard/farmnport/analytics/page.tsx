"use client"

import { useQuery } from "@tanstack/react-query"
import Link from "next/link"
import { Eye, Users, UserCheck, TrendingUp, ChevronRight } from "lucide-react"

import { queryContactViewsStats } from "@/lib/query"
import { formatDate } from "@/lib/utilities"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

// Shared component for the sub-pages
export function FullViewTable({ title, subtitle, items, countLabel, idKey, linkPrefix }: {
  title: string; subtitle: string; items: any[]; countLabel: string; idKey: string; linkPrefix: string
}) {
  return (
    <div className="rounded-lg border bg-white shadow-sm overflow-hidden">
      <div className="px-5 py-3.5 border-b">
        <h3 className="text-sm font-semibold">{title}</h3>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
      {items.length === 0 ? (
        <p className="py-16 text-center text-sm text-muted-foreground">No data yet</p>
      ) : (
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-muted/20 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              <th className="px-5 py-2.5 text-left w-10">#</th>
              <th className="px-5 py-2.5 text-left">Name</th>
              <th className="px-5 py-2.5 text-left">City</th>
              <th className="px-5 py-2.5 text-left">Last</th>
              <th className="px-5 py-2.5 text-right">{countLabel}</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {items.map((item: any, i: number) => (
              <tr key={item[idKey] || i} className="hover:bg-muted/50">
                <td className="px-5 py-2.5 text-muted-foreground">{i + 1}</td>
                <td className="px-5 py-2.5">
                  <Link href={`/dashboard/farmnport/contact-views/${linkPrefix}/${item[idKey]}`} className="font-medium capitalize hover:text-primary transition-colors">
                    {item.name}
                  </Link>
                </td>
                <td className="px-5 py-2.5 text-muted-foreground capitalize">{item.city || "—"}</td>
                <td className="px-5 py-2.5 text-muted-foreground">{formatDate(item.last_date) || "—"}</td>
                <td className="px-5 py-2.5 text-right font-semibold">{item.view_count ?? item.contacts_viewed}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

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

function PreviewTable({ title, subtitle, href, items, countLabel, idKey }: {
  title: string; subtitle: string; href: string; items: any[]; countLabel: string; idKey: string
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base">{title}</CardTitle>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
        <Link href={href} className="text-xs text-primary hover:underline flex items-center gap-0.5">
          View all <ChevronRight className="h-3 w-3" />
        </Link>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">No data yet</p>
        ) : (
          <div className="space-y-1">
            <div className="grid grid-cols-[2rem_1fr_5rem_6rem_3.5rem] gap-2 text-xs font-medium text-muted-foreground pb-1 border-b">
              <span>#</span>
              <span>Name</span>
              <span>City</span>
              <span>Last</span>
              <span className="text-right">{countLabel}</span>
            </div>
            {items.slice(0, 5).map((item: any, i: number) => (
              <div key={item[idKey] || i} className="grid grid-cols-[2rem_1fr_5rem_6rem_3.5rem] gap-2 items-center p-2 text-sm">
                <span className="text-muted-foreground text-xs">{i + 1}</span>
                <span className="font-medium truncate capitalize">{item.name}</span>
                <span className="text-xs text-muted-foreground truncate capitalize">{item.city || "—"}</span>
                <span className="text-xs text-muted-foreground">{formatDate(item.last_date) || "—"}</span>
                <span className="text-right font-semibold">{item.view_count ?? item.contacts_viewed}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function AnalyticsPage() {
  const { data: statsData, isLoading } = useQuery({
    queryKey: ["contact-views-stats"],
    queryFn: () => queryContactViewsStats(),
    refetchOnWindowFocus: false,
  })

  const stats = statsData?.data

  if (isLoading) {
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

  const viewedFarmers = topViewed.filter((c: any) => c.type === "farmer")
  const viewedBuyers = topViewed.filter((c: any) => c.type === "buyer")
  const activeFarmers = topViewers.filter((v: any) => v.type === "farmer")
  const activeBuyers = topViewers.filter((v: any) => v.type === "buyer")

  const farmerViews = viewsByType.find((v: any) => v.type === "farmer")?.count ?? 0
  const buyerViews = viewsByType.find((v: any) => v.type === "buyer")?.count ?? 0
  const totalViews = farmerViews + buyerViews

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
        <p className="text-muted-foreground">Platform activity and engagement overview</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Contact Views" value={summary?.total_views ?? 0} icon={Eye} subtitle="All-time contact reveals" />
        <StatCard title="Unique Viewers" value={summary?.unique_viewers ?? 0} icon={Users} subtitle="People who viewed contacts" />
        <StatCard title="Profiles Viewed" value={summary?.unique_viewed ?? 0} icon={UserCheck} subtitle="Unique contacts viewed" />
        <StatCard title="Avg Views Per Profile" value={summary?.avg_views_per_profile?.toFixed(1) ?? "0"} icon={TrendingUp} subtitle="Average views per contact" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex items-center justify-between rounded-lg border p-3">
          <div>
            <p className="text-sm font-medium">Buyer profiles viewed</p>
            <p className="text-xs text-muted-foreground">{totalViews > 0 ? ((buyerViews / totalViews) * 100).toFixed(0) : 0}% of views</p>
          </div>
          <span className="text-lg font-bold">{buyerViews}</span>
        </div>
        <div className="flex items-center justify-between rounded-lg border p-3">
          <div>
            <p className="text-sm font-medium">Farmer profiles viewed</p>
            <p className="text-xs text-muted-foreground">{totalViews > 0 ? ((farmerViews / totalViews) * 100).toFixed(0) : 0}% of views</p>
          </div>
          <span className="text-lg font-bold">{farmerViews}</span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <PreviewTable title="Most Viewed Farmers" subtitle="Farmer profiles getting attention" href="/dashboard/farmnport/analytics/viewed-farmers" items={viewedFarmers} countLabel="Views" idKey="viewed_id" />
        <PreviewTable title="Most Viewed Buyers" subtitle="Buyer profiles getting attention" href="/dashboard/farmnport/analytics/viewed-buyers" items={viewedBuyers} countLabel="Views" idKey="viewed_id" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <PreviewTable title="Most Active Farmers" subtitle="Farmers looking at profiles" href="/dashboard/farmnport/analytics/active-farmers" items={activeFarmers} countLabel="Viewed" idKey="user_id" />
        <PreviewTable title="Most Active Buyers" subtitle="Buyers sourcing from the platform" href="/dashboard/farmnport/analytics/active-buyers" items={activeBuyers} countLabel="Viewed" idKey="user_id" />
      </div>
    </div>
  )
}
